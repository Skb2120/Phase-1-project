
#include <Arduino.h>
#include <Wire.h>
#include <DHT.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "driver/twai.h"
#include <math.h>

// ---------- Node 4 pins ----------
#define DHT_PIN       2
#define DHT_TYPE      DHT11
#define VIBRATION_PIN 34

#define MPU_SDA_PIN   21
#define MPU_SCL_PIN   22

#define CAN_TX_PIN GPIO_NUM_5
#define CAN_RX_PIN GPIO_NUM_4

// ---------- CAN IDs ----------
#define HEARTBEAT_ID  0x104
#define BACKUP_DATA_ID 0x204
#define RECOVERY_CMD_ID 0x310
#define RECOVERY_ACK_ID 0x311

// ---------- Task IDs ----------
#define TASK_NONE       0
#define TASK_DHT        1
#define TASK_VIBRATION  2
#define TASK_MPU6050    3

// Tune this threshold after observing real sensor readings.
#define VIBRATION_THRESHOLD 1800

DHT dht(DHT_PIN, DHT_TYPE);
Adafruit_MPU6050 mpu;

bool canReady = false;
bool dhtReady = false;
bool mpuReady = false;

// Currently assigned backup task
uint8_t activeTask = TASK_NONE;
uint8_t failedNode = 0;

unsigned long lastHeartbeat = 0;
unsigned long lastSensorRead = 0;

const unsigned long HEARTBEAT_INTERVAL = 500;
const unsigned long SENSOR_INTERVAL = 100;

// ---------- CAN initialization ----------
bool initCAN() {
  twai_general_config_t g_config =
      TWAI_GENERAL_CONFIG_DEFAULT(
          CAN_TX_PIN, CAN_RX_PIN, TWAI_MODE_NORMAL);

  twai_timing_config_t t_config =
      TWAI_TIMING_CONFIG_500KBITS();

  twai_filter_config_t f_config =
      TWAI_FILTER_CONFIG_ACCEPT_ALL();

  if (twai_driver_install(
          &g_config, &t_config, &f_config) != ESP_OK) {
    Serial.println("CAN driver installation failed");
    return false;
  }

  if (twai_start() != ESP_OK) {
    Serial.println("CAN start failed");
    twai_driver_uninstall();
    return false;
  }

  Serial.println("CAN started at 500 kbps");
  return true;
}

// ---------- Send CAN frame ----------
bool sendCAN(uint32_t id, const uint8_t *data, uint8_t len) {
  twai_message_t msg = {};
  msg.identifier = id;
  msg.extd = 0;
  msg.rtr = 0;
  msg.data_length_code = len;

  for (uint8_t i = 0; i < len; i++) {
    msg.data[i] = data[i];
  }

  return twai_transmit(&msg, pdMS_TO_TICKS(20)) == ESP_OK;
}

// ---------- Heartbeat ----------
void sendHeartbeat() {
  uint8_t payload[1] = {4};
  sendCAN(HEARTBEAT_ID, payload, sizeof(payload));
}

// ---------- Recovery acknowledgment ----------
void sendRecoveryAck(uint8_t taskID, uint8_t result) {
  uint8_t payload[2] = {taskID, result};

  if (!sendCAN(RECOVERY_ACK_ID, payload, sizeof(payload))) {
    Serial.println("Recovery ACK transmission failed");
  }
}

// ---------- Process Master's recovery command ----------
void processCAN() {
  twai_message_t msg;

  // Process all currently queued CAN messages.
  while (twai_receive(&msg, 0) == ESP_OK) {
    if (msg.extd || msg.rtr) {
      continue;
    }

    if (msg.identifier != RECOVERY_CMD_ID ||
        msg.data_length_code != 3) {
      continue;
    }

    uint8_t taskID = msg.data[0];
    uint8_t failed = msg.data[1];
    uint8_t activate = msg.data[2];

    Serial.printf(
        "Recovery command: task=%u failedNode=%u activate=%u\n",
        taskID, failed, activate);

    if (activate == 0) {
      if (activeTask == taskID && failedNode == failed) {
        activeTask = TASK_NONE;
        failedNode = 0;
      }

      sendRecoveryAck(taskID, 1);
      continue;
    }

    bool taskAvailable =
        (taskID == TASK_DHT && dhtReady) ||
        (taskID == TASK_VIBRATION) ||
        (taskID == TASK_MPU6050 && mpuReady);

    if (taskID < TASK_DHT || taskID > TASK_MPU6050 ||
        !taskAvailable) {
      sendRecoveryAck(taskID, 0);
      continue;
    }

    activeTask = taskID;
    failedNode = failed;
    lastSensorRead = 0;

    Serial.printf("Backup task %u activated\n", activeTask);

    // Acknowledges activation, not yet verified sensor data.
    sendRecoveryAck(taskID, 1);
  }
}

// ---------- Task 1: DHT11 ----------
void readAndSendDHT() {
  if (!dhtReady) return;

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Backup DHT11 read failed");
    return;
  }

  int16_t temp10 =
      (int16_t)lroundf(temperature * 10.0f);
  uint16_t hum10 =
      (uint16_t)lroundf(humidity * 10.0f);

  uint8_t payload[4] = {
    (uint8_t)((temp10 >> 8) & 0xFF),
    (uint8_t)(temp10 & 0xFF),
    (uint8_t)((hum10 >> 8) & 0xFF),
    (uint8_t)(hum10 & 0xFF)
  };

  if (sendCAN(BACKUP_DATA_ID, payload, sizeof(payload))) {
    Serial.printf(
        "BACKUP DHT: %.1f C, %.1f %% RH\n",
        temperature, humidity);
  }
}

// ---------- Task 2: Vibration sensor ----------
void readAndSendVibration() {
  uint16_t raw = analogRead(VIBRATION_PIN);
  uint8_t detected = raw >= VIBRATION_THRESHOLD ? 1 : 0;

  uint8_t payload[3] = {
    (uint8_t)((raw >> 8) & 0xFF),
    (uint8_t)(raw & 0xFF),
    detected
  };

  if (sendCAN(BACKUP_DATA_ID, payload, sizeof(payload))) {
    Serial.printf(
        "BACKUP Vibration: ADC=%u, detected=%u\n",
        raw, detected);
  }
}

// ---------- Task 3: MPU6050 ----------
void readAndSendMPU() {
  if (!mpuReady) return;

  sensors_event_t accel, gyro, temp;
  mpu.getEvent(&accel, &gyro, &temp);

  int16_t values[6] = {
    (int16_t)lroundf(
      accel.acceleration.x / 9.80665f * 1000.0f),
    (int16_t)lroundf(
      accel.acceleration.y / 9.80665f * 1000.0f),
    (int16_t)lroundf(
      accel.acceleration.z / 9.80665f * 1000.0f),
    (int16_t)lroundf(
      gyro.gyro.x * 57.2957795f * 1000.0f),
    (int16_t)lroundf(
      gyro.gyro.y * 57.2957795f * 1000.0f),
    (int16_t)lroundf(
      gyro.gyro.z * 57.2957795f * 1000.0f)
  };

  uint8_t payload[12];

  for (int i = 0; i < 6; i++) {
    uint16_t value = (uint16_t)values[i];
    payload[i * 2] = (value >> 8) & 0xFF;
    payload[i * 2 + 1] = value & 0xFF;
  }

  if (sendCAN(BACKUP_DATA_ID, payload, sizeof(payload))) {
    Serial.println("BACKUP MPU6050 data transmitted");
  }
}

// ---------- Setup ----------
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\nNode 4 - Universal Backup Node");

  analogReadResolution(12);
  pinMode(VIBRATION_PIN, INPUT);

  dht.begin();

  Wire.begin(MPU_SDA_PIN, MPU_SCL_PIN);
  mpuReady = mpu.begin(0x68, &Wire);

  if (mpuReady) {
    mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
    mpu.setGyroRange(MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
    Serial.println("MPU6050 detected");
  } else {
    Serial.println("MPU6050 not detected");
  }

  // DHT11 has no universal reliable software presence check.
  // Confirm its readings before relying on backup operation.
  dhtReady = true;

  canReady = initCAN();

  if (canReady) {
    Serial.println("Waiting for Master recovery command...");
  }
}

// ---------- Main loop ----------
void loop() {
  if (!canReady) {
    delay(1000);
    return;
  }

  processCAN();

  unsigned long now = millis();

  if (now - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    lastHeartbeat = now;
    sendHeartbeat();
  }

  if (activeTask != TASK_NONE &&
      now - lastSensorRead >= SENSOR_INTERVAL) {
    lastSensorRead = now;

    switch (activeTask) {
      case TASK_DHT:
        readAndSendDHT();
        break;

      case TASK_VIBRATION:
        readAndSendVibration();
        break;

      case TASK_MPU6050:
        readAndSendMPU();
        break;
    }
  }

  delay(2);
}
