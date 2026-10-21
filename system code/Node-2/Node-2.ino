
#include <Arduino.h>
#include "driver/twai.h"

// ---------- Pin configuration ----------
#define VIBRATION_AO_PIN 34

#define CAN_TX_PIN GPIO_NUM_5
#define CAN_RX_PIN GPIO_NUM_4

// ---------- CAN IDs ----------
#define HEARTBEAT_ID 0x102
#define VIBRATION_DATA_ID 0x202

// Adjust after testing your particular sensor.
#define VIBRATION_THRESHOLD 1800

unsigned long lastHeartbeat = 0;
unsigned long lastSensorRead = 0;

bool canReady = false;

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

void sendHeartbeat() {
  uint8_t payload[1] = {2};

  if (!sendCAN(HEARTBEAT_ID, payload, sizeof(payload))) {
    Serial.println("Heartbeat TX failed");
  }
}

void readAndSendVibration() {
  // ESP32 ADC reading: normally 0 to 4095 at 12-bit resolution.
  uint16_t rawValue = analogRead(VIBRATION_AO_PIN);

  // Simple threshold-based indicator, not calibrated vibration severity.
  uint8_t detected =
      (rawValue >= VIBRATION_THRESHOLD) ? 1 : 0;

  // Protocol: ADC raw uint16 big-endian, detected byte.
  uint8_t payload[3];
  payload[0] = (rawValue >> 8) & 0xFF;
  payload[1] = rawValue & 0xFF;
  payload[2] = detected;

  if (sendCAN(VIBRATION_DATA_ID, payload, sizeof(payload))) {
    Serial.printf("ADC: %u | Vibration: %s\n",
                  rawValue,
                  detected ? "DETECTED" : "NOT DETECTED");
  } else {
    Serial.println("Vibration CAN transmission failed");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\nNode 2 - Vibration Sensor CAN");

  analogReadResolution(12);
  pinMode(VIBRATION_AO_PIN, INPUT);

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

  // Send sensor reading every 100 ms
  if (now - lastSensorRead >= 100) {
    lastSensorRead = now;
    readAndSendVibration();
  }

  delay(2);
}
