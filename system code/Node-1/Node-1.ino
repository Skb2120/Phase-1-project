
#include <Arduino.h>
#include <Wire.h>
#include <DHT.h>
#include "driver/twai.h"

// ---------- Pin configuration ----------
#define DHT_PIN       2
#define DHT_TYPE      DHT11

#define CAN_TX_PIN    GPIO_NUM_5
#define CAN_RX_PIN    GPIO_NUM_4

// ---------- CAN message IDs ----------
#define HEARTBEAT_ID  0x101
#define DHT_DATA_ID   0x201

DHT dht(DHT_PIN, DHT_TYPE);

unsigned long lastHeartbeat = 0;
unsigned long lastSensorRead = 0;

bool canReady = false;

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
  msg.extd = 0;  // Standard 11-bit CAN ID
  msg.rtr = 0;
  msg.data_length_code = len;

  for (int i = 0; i < len; i++) {
    msg.data[i] = data[i];
  }

  return twai_transmit(&msg, pdMS_TO_TICKS(20)) == ESP_OK;
}

// ---------- Heartbeat ----------
void sendHeartbeat() {
  uint8_t payload[1] = {1};

  if (!sendCAN(HEARTBEAT_ID, payload, sizeof(payload))) {
    Serial.println("Heartbeat TX failed");
  }
}

// ---------- DHT11 data ----------
void readAndSendDHT() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("DHT11 read failed");
    return;
  }

  // Protocol: temperature x10 (signed int16),
  // humidity x10 (unsigned uint16), big-endian.
  int16_t temp10 = (int16_t)lroundf(temperature * 10.0f);
  uint16_t hum10 = (uint16_t)lroundf(humidity * 10.0f);

  uint8_t payload[4];
  payload[0] = (uint8_t)((temp10 >> 8) & 0xFF);
  payload[1] = (uint8_t)(temp10 & 0xFF);
  payload[2] = (uint8_t)((hum10 >> 8) & 0xFF);
  payload[3] = (uint8_t)(hum10 & 0xFF);

  if (sendCAN(DHT_DATA_ID, payload, sizeof(payload))) {
    Serial.printf("Temperature: %.1f C | Humidity: %.1f %%\n",
                  temperature, humidity);
  } else {
    Serial.println("DHT11 CAN transmission failed");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\nNode 1 - DHT11 CAN Sensor");

  dht.begin();

  canReady = initCAN();

  if (!canReady) {
    Serial.println("Check CAN wiring and restart");
  }
}

void loop() {
  if (!canReady) {
    delay(1000);
    return;
  }

  unsigned long now = millis();

  // Heartbeat every 500 ms
  if (now - lastHeartbeat >= 500) {
    lastHeartbeat = now;
    sendHeartbeat();
  }

  // DHT11 reading every 2 seconds
  if (now - lastSensorRead >= 2000) {
    lastSensorRead = now;
    readAndSendDHT();
  }

  delay(5);
}
