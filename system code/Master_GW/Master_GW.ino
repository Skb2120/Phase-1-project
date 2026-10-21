/*
  PROJECT:
  CAN-Based Multi-Node ESP32 System for Fault Detection
  and Autonomous Task Reallocation to a Backup Node.

  MASTER ESP32 FEATURES:
  - CAN/TWAI receiver
  - Node heartbeat monitoring
  - DHT11 decoding
  - Vibration ADC decoding
  - MPU6050 decoding
  - Backup recovery command and acknowledgment
  - Recovery data verification
  - SSD1306 OLED
  - Wi-Fi connectivity
  - Supabase REST upload
  - FreeRTOS tasks

  TARGET:
  Classic ESP32 development board
  Arduino-ESP32 core with TWAI support
*/

#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "driver/twai.h"

// =====================================================
// 1. HARDWARE CONFIGURATION
// =====================================================

#define CAN_TX_PIN       5
#define CAN_RX_PIN       4
#define STATUS_LED       2

#define OLED_SDA_PIN     21
#define OLED_SCL_PIN     22
#define OLED_WIDTH       128
#define OLED_HEIGHT      64
#define OLED_RESET       -1

Adafruit_SSD1306 display(
  OLED_WIDTH,
  OLED_HEIGHT,
  &Wire,
  OLED_RESET
);

// =====================================================
// 2. WI-FI CONFIGURATION
// =====================================================

const char* WIFI_SSID = "SKB";
const char* WIFI_PASSWORD = "12345678";

// =====================================================
// 3. SUPABASE CONFIGURATION
// =====================================================

// Example:
// https://abcdefghijk.supabase.co

const char* SUPABASE_URL =
  "https://cnjglvovkpdxohxmxsob.supabase.co";

const char* SUPABASE_KEY =
  "sb_publishable_HHFdoBKOHhEs_BvyqUboBg_cmmGxUJm";

const char* SUPABASE_TABLE_URL =
  "https://supabase.com/dashboard/project/cnjglvovkpdxohxmxsob/database/tables";

// =====================================================
// 4. CAN MESSAGE IDS
// =====================================================

#define HB_NODE1        0x101
#define HB_NODE2        0x102
#define HB_NODE3        0x103
#define HB_NODE4        0x104

#define DATA_NODE1      0x201
#define DATA_NODE2      0x202
#define DATA_NODE3      0x203
#define DATA_NODE4      0x204

#define RECOVERY_CMD    0x310
#define RECOVERY_ACK    0x311

// =====================================================
// 5. TIMING CONFIGURATION
// =====================================================

const uint32_t HEARTBEAT_TIMEOUT_MS = 2000;
const uint32_t STARTUP_GRACE_MS = 5000;

const uint32_t RECOVERY_TIMEOUT_MS = 5000;
const uint32_t RECOVERY_RETRY_MS = 1000;
const uint8_t MAX_RECOVERY_RETRIES = 3;

const uint32_t CLOUD_INTERVAL_MS = 5000;
const uint32_t OLED_INTERVAL_MS = 1000;
const uint32_t STATUS_INTERVAL_MS = 2000;

const uint32_t SENSOR_DATA_TIMEOUT_MS = 5000;

// =====================================================
// 6. RECOVERY TASK TYPES
// =====================================================

#define TASK_DHT11       1
#define TASK_VIBRATION   2
#define TASK_MPU6050     3

// =====================================================
// 7. NODE DATA STRUCTURE
// =====================================================

struct NodeState {
  bool online = false;
  bool everSeen = false;

  uint32_t lastHeartbeat = 0;
  uint32_t lastData = 0;

  uint32_t framesReceived = 0;
  uint32_t badFrames = 0;

  bool sensorDataValid = false;

  float temperature = NAN;
  float humidity = NAN;

  uint16_t vibrationRaw = 0;
  bool vibrationDetected = false;

  float ax = NAN;
  float ay = NAN;
  float az = NAN;

  float gx = NAN;
  float gy = NAN;
  float gz = NAN;
};

NodeState nodes[5];

// =====================================================
// 8. RECOVERY STATE
// =====================================================

struct RecoveryState {
  bool active = false;
  bool acknowledged = false;
  bool dataVerified = false;

  uint8_t failedNode = 0;
  uint8_t taskID = 0;
  uint8_t retries = 0;

  uint32_t startedAt = 0;
  uint32_t lastCommandAt = 0;
};

RecoveryState recovery;

// =====================================================
// 9. GLOBAL STATE
// =====================================================

uint32_t startupAt = 0;

uint32_t canErrorCount = 0;
uint32_t malformedFrameCount = 0;
uint32_t faultEventCount = 0;

uint32_t lastCloudUpload = 0;
uint32_t lastOLEDUpdate = 0;
uint32_t lastStatusPrint = 0;

uint8_t oledPage = 0;

bool oledAvailable = false;
bool twaiAvailable = false;

SemaphoreHandle_t stateMutex;

// =====================================================
// 10. STATE LOCKING
// =====================================================

void lockState() {
  if (stateMutex != nullptr) {
    xSemaphoreTake(stateMutex, portMAX_DELAY);
  }
}

void unlockState() {
  if (stateMutex != nullptr) {
    xSemaphoreGive(stateMutex);
  }
}

// =====================================================
// 11. CAN TRANSMISSION
// =====================================================

bool sendCAN(
  uint32_t id,
  const uint8_t* data,
  uint8_t len
) {
  if (!twaiAvailable || len > 8) {
    return false;
  }

  twai_message_t message = {};

  message.identifier = id;
  message.extd = 0;
  message.rtr = 0;
  message.data_length_code = len;

  for (uint8_t i = 0; i < len; i++) {
    message.data[i] = data[i];
  }

  esp_err_t result = twai_transmit(
    &message,
    pdMS_TO_TICKS(100)
  );

  if (result != ESP_OK) {
    lockState();
    canErrorCount++;
    unlockState();

    Serial.printf(
      "[CAN ERROR] TX failed: 0x%03lX\n",
      (unsigned long)id
    );

    return false;
  }

  return true;
}

// =====================================================
// 12. CAN BYTE DECODING
// =====================================================

uint16_t readU16BE(const uint8_t* data, uint8_t index) {
  return ((uint16_t)data[index] << 8)
       | data[index + 1];
}

int16_t readI16BE(const uint8_t* data, uint8_t index) {
  return (int16_t)readU16BE(data, index);
}

// =====================================================
// 13. SENSOR FRAME DECODERS
// =====================================================

// DHT11 frame:
// [temperature_x10 high, low,
//  humidity_x10 high, low]

bool decodeDHT(
  NodeState& node,
  const uint8_t* data,
  uint8_t len
) {
  if (len != 4) {
    return false;
  }

  float temperature =
    readI16BE(data, 0) / 10.0f;

  float humidity =
    readU16BE(data, 2) / 10.0f;

  if (temperature < -40.0f ||
      temperature > 85.0f ||
      humidity > 100.0f) {
    return false;
  }

  node.temperature = temperature;
  node.humidity = humidity;

  node.sensorDataValid = true;

  return true;
}

// Vibration frame:
// [ADC high, ADC low, detected flag]

bool decodeVibration(
  NodeState& node,
  const uint8_t* data,
  uint8_t len
) {
  if (len != 3) {
    return false;
  }

  uint16_t adc = readU16BE(data, 0);

  if (adc > 4095) {
    return false;
  }

  node.vibrationRaw = adc;
  node.vibrationDetected = data[2] != 0;

  node.sensorDataValid = true;

  return true;
}

// MPU6050 frame:
// six signed 16-bit values.
// Acceleration: mg.
// Gyroscope: mdps.

bool decodeMPU(
  NodeState& node,
  const uint8_t* data,
  uint8_t len
) {
  if (len != 12) {
    return false;
  }

  node.ax = readI16BE(data, 0) / 1000.0f;
  node.ay = readI16BE(data, 2) / 1000.0f;
  node.az = readI16BE(data, 4) / 1000.0f;

  node.gx = readI16BE(data, 6) / 1000.0f;
  node.gy = readI16BE(data, 8) / 1000.0f;
  node.gz = readI16BE(data, 10) / 1000.0f;

  node.sensorDataValid = true;

  return true;
}

// =====================================================
// 14. BACKUP TASK MAPPING
// =====================================================

uint8_t taskForNode(uint8_t nodeID) {
  switch (nodeID) {
    case 1:
      return TASK_DHT11;

    case 2:
      return TASK_VIBRATION;

    case 3:
      return TASK_MPU6050;

    default:
      return 0;
  }
}

// =====================================================
// 15. RECOVERY COMMAND
// =====================================================

void sendRecoveryCommand() {
  uint8_t payload[3];

  lockState();

  if (!recovery.active) {
    unlockState();
    return;
  }

  payload[0] = recovery.taskID;
  payload[1] = recovery.failedNode;
  payload[2] = 1;

  recovery.lastCommandAt = millis();

  unlockState();

  if (sendCAN(
        RECOVERY_CMD,
        payload,
        sizeof(payload)
      )) {
    Serial.printf(
      "[RECOVERY] Task %u requested for failed Node %u\n",
      payload[0],
      payload[1]
    );
  }
}

void beginRecovery(uint8_t failedNode) {
  if (failedNode < 1 || failedNode > 3) {
    return;
  }

  lockState();

  if (recovery.active) {
    unlockState();
    return;
  }

  if (!nodes[4].online) {
    Serial.println(
      "[RECOVERY ERROR] Node 4 is not online"
    );

    unlockState();
    return;
  }

  recovery.active = true;
  recovery.acknowledged = false;
  recovery.dataVerified = false;

  recovery.failedNode = failedNode;
  recovery.taskID = taskForNode(failedNode);

  recovery.retries = 0;
  recovery.startedAt = millis();
  recovery.lastCommandAt = 0;

  // Prevent old backup readings from verifying a new recovery.
  nodes[4].lastData = 0;

  unlockState();

  Serial.printf(
    "[FAULT RECOVERY] Requesting task %u from Node 4\n",
    taskForNode(failedNode)
  );

  sendRecoveryCommand();
}

// =====================================================
// 16. PROCESS SENSOR DATA
// =====================================================

void processSensorFrame(
  uint8_t nodeID,
  const uint8_t* data,
  uint8_t len
) {
  if (nodeID < 1 || nodeID > 4) {
    return;
  }

  bool valid = false;

  lockState();

  NodeState& node = nodes[nodeID];

  if (nodeID == 1) {
    valid = decodeDHT(node, data, len);
  }
  else if (nodeID == 2) {
    valid = decodeVibration(node, data, len);
  }
  else if (nodeID == 3) {
    valid = decodeMPU(node, data, len);
  }
  else if (nodeID == 4) {
    if (recovery.active && recovery.acknowledged) {
      if (recovery.taskID == TASK_DHT11) {
        valid = decodeDHT(node, data, len);
      }
      else if (recovery.taskID == TASK_VIBRATION) {
        valid = decodeVibration(node, data, len);
      }
      else if (recovery.taskID == TASK_MPU6050) {
        valid = decodeMPU(node, data, len);
      }
    }
  }

  if (valid) {
    node.lastData = millis();
    node.framesReceived++;

    if (nodeID == 4 &&
        recovery.active &&
        recovery.acknowledged) {
      recovery.dataVerified = true;
      recovery.active = false;

      Serial.println(
        "[RECOVERY VERIFIED] Valid backup sensor data received"
      );
    }
  }
  else {
    node.badFrames++;
    malformedFrameCount++;
  }

  unlockState();
}

// =====================================================
// 17. PROCESS CAN FRAME
// =====================================================

void processFrame(const twai_message_t& message) {
  if (message.extd || message.rtr) {
    return;
  }

  uint32_t id = message.identifier;
  uint8_t len = message.data_length_code;

  if (len > 8) {
    return;
  }

  const uint8_t* data = message.data;

  // Heartbeat IDs.
  if (id >= HB_NODE1 && id <= HB_NODE4) {
    uint8_t nodeID = id - HB_NODE1 + 1;

    lockState();

    nodes[nodeID].everSeen = true;
    nodes[nodeID].lastHeartbeat = millis();
    nodes[nodeID].online = true;

    unlockState();

    return;
  }

  // Sensor data IDs.
  if (id >= DATA_NODE1 && id <= DATA_NODE4) {
    uint8_t nodeID = id - DATA_NODE1 + 1;

    processSensorFrame(
      nodeID,
      data,
      len
    );

    return;
  }

  // Recovery acknowledgment.
  if (id == RECOVERY_ACK) {
    if (len != 2) {
      lockState();
      malformedFrameCount++;
      unlockState();

      return;
    }

    uint8_t taskID = data[0];
    uint8_t result = data[1];

    lockState();

    if (recovery.active &&
        taskID == recovery.taskID &&
        result == 1) {
      recovery.acknowledged = true;

      Serial.printf(
        "[RECOVERY ACK] Node 4 accepted task %u\n",
        taskID
      );
    }
    else {
      Serial.println(
        "[RECOVERY ACK] Unexpected or rejected acknowledgment"
      );
    }

    unlockState();

    return;
  }

  Serial.printf(
    "[UNKNOWN CAN ID] 0x%03lX\n",
    (unsigned long)id
  );
}

// =====================================================
// 18. CAN RECEIVE TASK
// =====================================================

void CanReceiveTask(void* parameter) {
  twai_message_t message;

  while (true) {
    esp_err_t result = twai_receive(
      &message,
      pdMS_TO_TICKS(100)
    );

    if (result == ESP_OK) {
      processFrame(message);
    }
    else if (result != ESP_ERR_TIMEOUT) {
      lockState();
      canErrorCount++;
      unlockState();
    }

    vTaskDelay(pdMS_TO_TICKS(1));
  }
}

// =====================================================
// 19. NODE HEALTH MONITOR
// =====================================================

void monitorNodes() {
  if (millis() - startupAt < STARTUP_GRACE_MS) {
    return;
  }

  uint32_t now = millis();

  bool shouldRecover[4] = {
    false, false, false, false
  };

  lockState();

  for (uint8_t i = 1; i <= 4; i++) {
    bool onlineNow =
      nodes[i].everSeen &&
      (now - nodes[i].lastHeartbeat <=
       HEARTBEAT_TIMEOUT_MS);

    bool wasOnline = nodes[i].online;

    nodes[i].online = onlineNow;

    if (!onlineNow && wasOnline) {
      faultEventCount++;

      Serial.printf(
        "[FAULT] Node %u heartbeat timeout\n",
        i
      );

      if (i <= 3) {
        shouldRecover[i] = true;
      }
    }
  }

  unlockState();

  // Start recovery outside the state lock.
  for (uint8_t i = 1; i <= 3; i++) {
    if (shouldRecover[i]) {
      beginRecovery(i);
    }
  }
}

// =====================================================
// 20. RECOVERY MONITOR
// =====================================================

void monitorRecovery() {
  bool shouldRetry = false;
  bool timedOut = false;

  uint32_t now = millis();

  lockState();

  if (recovery.active) {
    if (now - recovery.startedAt >=
        RECOVERY_TIMEOUT_MS) {
      recovery.active = false;
      timedOut = true;
    }
    else if (!recovery.acknowledged &&
             recovery.retries < MAX_RECOVERY_RETRIES &&
             now - recovery.lastCommandAt >=
             RECOVERY_RETRY_MS) {
      recovery.retries++;
      shouldRetry = true;
    }
  }

  unlockState();

  if (timedOut) {
    Serial.println(
      "[RECOVERY TIMEOUT] Backup recovery not verified"
    );
  }

  if (shouldRetry) {
    sendRecoveryCommand();
  }
}

// =====================================================
// 21. OLED DISPLAY
// =====================================================

void updateOLED() {
  if (!oledAvailable) {
    return;
  }

  if (millis() - lastOLEDUpdate < OLED_INTERVAL_MS) {
    return;
  }

  lastOLEDUpdate = millis();

  lockState();

  NodeState n1 = nodes[1];
  NodeState n2 = nodes[2];
  NodeState n3 = nodes[3];
  NodeState n4 = nodes[4];

  RecoveryState r = recovery;

  unlockState();

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  if (oledPage == 0) {
    display.setCursor(0, 0);
    display.println("CAN SENSOR MONITOR");

    display.printf(
      "N1 DHT: %s\n",
      n1.online ? "ONLINE" : "OFFLINE"
    );

    if (n1.sensorDataValid) {
      display.printf(
        "T:%.1fC H:%.1f%%\n",
        n1.temperature,
        n1.humidity
      );
    }
    else {
      display.println("DHT: NO DATA");
    }

    display.printf(
      "N2 VIB: %s\n",
      n2.online ? "ONLINE" : "OFFLINE"
    );

    display.printf(
      "ADC:%u DET:%s\n",
      n2.vibrationRaw,
      n2.vibrationDetected ? "YES" : "NO"
    );
  }
  else if (oledPage == 1) {
    display.setCursor(0, 0);
    display.println("MPU6050 MONITOR");

    display.printf(
      "N3: %s\n",
      n3.online ? "ONLINE" : "OFFLINE"
    );

    if (n3.sensorDataValid) {
      display.printf(
        "AX:%.2f AY:%.2f\n",
        n3.ax,
        n3.ay
      );

      display.printf(
        "AZ:%.2f GZ:%.2f\n",
        n3.az,
        n3.gz
      );
    }
    else {
      display.println("MPU: NO DATA");
    }

    display.printf(
      "CAN ERR:%lu\n",
      (unsigned long)canErrorCount
    );
  }
  else {
    display.setCursor(0, 0);
    display.println("FAULT & RECOVERY");

    display.printf(
      "N1:%s N2:%s\n",
      n1.online ? "ON" : "OFF",
      n2.online ? "ON" : "OFF"
    );

    display.printf(
      "N3:%s N4:%s\n",
      n3.online ? "ON" : "OFF",
      n4.online ? "ON" : "OFF"
    );

    if (r.active) {
      display.printf(
        "RECOVER NODE %u\n",
        r.failedNode
      );

      display.printf(
        "ACK:%s DATA:%s\n",
        r.acknowledged ? "YES" : "NO",
        r.dataVerified ? "YES" : "NO"
      );
    }
    else if (r.dataVerified) {
      display.println("BACKUP VERIFIED");
    }
    else {
      display.println("RECOVERY IDLE");
    }

    display.printf(
      "WiFi:%s\n",
      WiFi.status() == WL_CONNECTED ? "ON" : "OFF"
    );
  }

  display.display();

  oledPage = (oledPage + 1) % 3;
}

// =====================================================
// 22. SUPABASE CLOUD UPLOAD
// =====================================================

bool uploadToSupabase() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[CLOUD] Wi-Fi disconnected");
    return false;
  }

  // DEMONSTRATION ONLY:
  // setInsecure disables TLS certificate verification.
  // Replace with a trusted root CA for production.
  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  if (!http.begin(client, SUPABASE_TABLE_URL)) {
    Serial.println("[CLOUD] HTTP initialization failed");
    return false;
  }

  http.setTimeout(4000);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  http.addHeader(
    "apikey",
    SUPABASE_KEY
  );

  http.addHeader(
    "Authorization",
    String("Bearer ") + SUPABASE_KEY
  );

  http.addHeader(
    "Prefer",
    "return=minimal"
  );

  StaticJsonDocument<1024> doc;

  lockState();

  doc["node1_online"] = nodes[1].online;
  doc["node2_online"] = nodes[2].online;
  doc["node3_online"] = nodes[3].online;
  doc["node4_online"] = nodes[4].online;

  if (nodes[1].sensorDataValid) {
    doc["temperature_c"] = nodes[1].temperature;
    doc["humidity_pct"] = nodes[1].humidity;
  }

  if (nodes[2].sensorDataValid) {
    doc["vibration_raw"] = nodes[2].vibrationRaw;

    doc["vibration_detected"] =
      nodes[2].vibrationDetected;
  }

  if (nodes[3].sensorDataValid) {
    doc["accel_x_g"] = nodes[3].ax;
    doc["accel_y_g"] = nodes[3].ay;
    doc["accel_z_g"] = nodes[3].az;

    doc["gyro_x_dps"] = nodes[3].gx;
    doc["gyro_y_dps"] = nodes[3].gy;
    doc["gyro_z_dps"] = nodes[3].gz;
  }

  doc["recovery_active"] = recovery.active;
  doc["recovery_task"] = recovery.taskID;
  doc["failed_node"] = recovery.failedNode;

  doc["recovery_acknowledged"] =
    recovery.acknowledged;

  doc["recovery_data_verified"] =
    recovery.dataVerified;

  doc["can_error_count"] = canErrorCount;
  doc["malformed_frame_count"] = malformedFrameCount;

  unlockState();

  String payload;

  serializeJson(doc, payload);

  int httpCode = http.POST(payload);

  if (httpCode >= 200 && httpCode < 300) {
    Serial.printf(
      "[CLOUD] Upload successful: HTTP %d\n",
      httpCode
    );
  }
  else {
    Serial.printf(
      "[CLOUD ERROR] HTTP %d\n",
      httpCode
    );

    if (httpCode > 0) {
      Serial.println(http.getString());
    }
  }

  http.end();

  return httpCode >= 200 && httpCode < 300;
}

// =====================================================
// 23. WI-FI CONNECTION
// =====================================================

void connectWiFi() {
  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  Serial.print("Connecting to Wi-Fi");

  uint32_t startTime = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - startTime < 15000) {
    Serial.print(".");
    delay(300);
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[WiFi] Connected");

    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  }
  else {
    Serial.println(
      "\n[WiFi] Not connected; CAN monitoring continues"
    );
  }
}

// =====================================================
// 24. CLOUD TASK
// =====================================================

void CloudTask(void* parameter) {
  while (true) {
    if (WiFi.status() != WL_CONNECTED) {
      WiFi.reconnect();

      // Retry later without blocking CAN reception.
      vTaskDelay(pdMS_TO_TICKS(5000));
      continue;
    }

    if (millis() - lastCloudUpload >=
        CLOUD_INTERVAL_MS) {
      lastCloudUpload = millis();
      uploadToSupabase();
    }

    vTaskDelay(pdMS_TO_TICKS(250));
  }
}

// =====================================================
// 25. MONITOR TASK
// =====================================================

void MonitorTask(void* parameter) {
  while (true) {
    monitorNodes();
    monitorRecovery();

    if (millis() - lastStatusPrint >=
        STATUS_INTERVAL_MS) {
      lastStatusPrint = millis();

      lockState();

      Serial.println("\n===== MASTER NODE STATUS =====");

      for (uint8_t i = 1; i <= 4; i++) {
        Serial.printf(
          "Node %u: %s | frames=%lu | bad=%lu\n",
          i,
          nodes[i].online ? "ONLINE" : "OFFLINE",
          (unsigned long)nodes[i].framesReceived,
          (unsigned long)nodes[i].badFrames
        );
      }

      Serial.printf(
        "CAN errors: %lu\n",
        (unsigned long)canErrorCount
      );

      Serial.printf(
        "Malformed frames: %lu\n",
        (unsigned long)malformedFrameCount
      );

      Serial.printf(
        "Fault events: %lu\n",
        (unsigned long)faultEventCount
      );

      Serial.println("==============================");

      unlockState();
    }

    bool allOnline;

    lockState();

    allOnline =
      nodes[1].online &&
      nodes[2].online &&
      nodes[3].online &&
      nodes[4].online;

    unlockState();

    digitalWrite(
      STATUS_LED,
      allOnline ? HIGH : LOW
    );

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// =====================================================
// 26. OLED TASK
// =====================================================

void OLEDTask(void* parameter) {
  while (true) {
    updateOLED();

    vTaskDelay(pdMS_TO_TICKS(100));
  }
}

// =====================================================
// 27. SETUP
// =====================================================

void setup() {
  Serial.begin(115200);

  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);

  startupAt = millis();

  stateMutex = xSemaphoreCreateMutex();

  if (stateMutex == nullptr) {
    Serial.println("[FATAL] Mutex creation failed");

    while (true) {
      delay(1000);
    }
  }

  // OLED setup.
  Wire.begin(
    OLED_SDA_PIN,
    OLED_SCL_PIN
  );

  oledAvailable = display.begin(
    SSD1306_SWITCHCAPVCC,
    0x3C
  );

  if (oledAvailable) {
    display.clearDisplay();
    display.setTextSize(1);
    display.setTextColor(SSD1306_WHITE);
    display.setCursor(0, 0);
    display.println("MASTER GATEWAY");
    display.println("Starting...");
    display.display();

    Serial.println("[OLED] Initialized");
  }
  else {
    Serial.println(
      "[OLED] Not detected; continuing without display"
    );
  }

  // CAN setup.
  twai_general_config_t g_config =
    TWAI_GENERAL_CONFIG_DEFAULT(
      (gpio_num_t)CAN_TX_PIN,
      (gpio_num_t)CAN_RX_PIN,
      TWAI_MODE_NORMAL
    );

  twai_timing_config_t t_config =
    TWAI_TIMING_CONFIG_500KBITS();

  twai_filter_config_t f_config =
    TWAI_FILTER_CONFIG_ACCEPT_ALL();

  esp_err_t result = twai_driver_install(
    &g_config,
    &t_config,
    &f_config
  );

  if (result != ESP_OK) {
    Serial.printf(
      "[FATAL] TWAI install failed: %d\n",
      result
    );

    while (true) {
      delay(1000);
    }
  }

  result = twai_start();

  if (result != ESP_OK) {
    Serial.printf(
      "[FATAL] TWAI start failed: %d\n",
      result
    );

    while (true) {
      delay(1000);
    }
  }

  twaiAvailable = true;

  Serial.println("[CAN] Started at 500 kbps");

  // Wi-Fi setup.
  connectWiFi();

  // CAN receive task.
  xTaskCreatePinnedToCore(
    CanReceiveTask,
    "CAN_RX",
    4096,
    nullptr,
    3,
    nullptr,
    0
  );

  // Fault and node monitoring task.
  xTaskCreatePinnedToCore(
    MonitorTask,
    "Monitor",
    4096,
    nullptr,
    2,
    nullptr,
    1
  );

  // OLED display task.
  xTaskCreatePinnedToCore(
    OLEDTask,
    "OLED",
    4096,
    nullptr,
    1,
    nullptr,
    1
  );

  // Cloud uploader task.
  xTaskCreatePinnedToCore(
    CloudTask,
    "Cloud",
    8192,
    nullptr,
    1,
    nullptr,
    1
  );

  Serial.println(
    "\nMASTER GATEWAY INITIALIZATION COMPLETE"
  );
}

// =====================================================
// 28. MAIN LOOP
// =====================================================

void loop() {
  vTaskDelay(pdMS_TO_TICKS(1000));
}