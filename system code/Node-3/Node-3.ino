
#include <Arduino.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include "driver/twai.h"

// ---------- Pin configuration ----------
#define MPU_SDA_PIN 21
#define MPU_SCL_PIN 22

#define CAN_TX_PIN GPIO_NUM_5
#define CAN_RX_PIN GPIO_NUM_4

// ---------- CAN message IDs ----------
#define HEARTBEAT_ID  0x103
#define MPU_DATA_ID   0x203

Adafruit_MPU6050 mpu;

unsigned long lastHeartbeat = 0;
unsigned long lastSensorRead = 0;

bool canReady = false;
bool mpuReady = false;

// ---------- Initialize CAN ----------
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
  uint8_t payload[1] = {3};

  if (!sendCAN(HEARTBEAT_ID, payload, sizeof(payload))) {
    Serial.println("Heartbeat TX failed");
  }
}

// ---------- Read and transmit MPU6050 ----------
void readAndSendMPU() {
  if (!mpuReady) {
    return;
  }

  sensors_event_t accel, gyro, temp;
  mpu.getEvent(&accel, &gyro, &temp);

  // Adafruit library units:
  // acceleration: m/s^2
  // angular velocity: rad/s

  // Convert acceleration to milli-g (mg).
  int16_t ax = (int16_t)lroundf(
      accel.acceleration.x / 9.80665f * 1000.0f);
  int16_t ay = (int16_t)lroundf(
      accel.acceleration.y / 9.80665f * 1000.0f);
  int16_t az = (int16_t)lroundf(
      accel.acceleration.z / 9.80665f * 1000.0f);

  // Convert angular velocity to millidegrees per second (mdps).
  const float RAD_TO_DEG_F = 57.2957795f;

  int16_t gx = (int16_t)lroundf(
      gyro.gyro.x * RAD_TO_DEG_F * 1000.0f);
  int16_t gy = (int16_t)lroundf(
      gyro.gyro.y * RAD_TO_DEG_F * 1000.0f);
  int16_t gz = (int16_t)lroundf(
      gyro.gyro.z * RAD_TO_DEG_F * 1000.0f);

  // Protocol: six signed int16 values, big-endian:
  // ax, ay, az in mg; gx, gy, gz in mdps.
  uint8_t payload[12];
  int16_t values[6] = {ax, ay, az, gx, gy, gz};

  for (int i = 0; i < 6; i++) {
    uint16_t value = (uint16_t)values[i];
    payload[i * 2]     = (value >> 8) & 0xFF;
    payload[i * 2 + 1] = value & 0xFF;
  }

  if (sendCAN(MPU_DATA_ID, payload, sizeof(payload))) {
    Serial.printf(
        "Accel mg: X=%d Y=%d Z=%d | "
        "Gyro mdps: X=%d Y=%d Z=%d\n",
        ax, ay, az, gx, gy, gz);
  } else {
    Serial.println("MPU6050 CAN transmission failed");
  }
}

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println("\nNode 3 - MPU6050 CAN Sensor");

  // Start I2C using the specified pins.
  Wire.begin(MPU_SDA_PIN, MPU_SCL_PIN);

  // Most MPU6050 modules use I2C address 0x68.
  if (mpu.begin(0x68, &Wire)) {
    mpuReady = true;
    Serial.println("MPU6050 detected");

    mpu.setAccelerometerRange(
        MPU6050_RANGE_8_G);
    mpu.setGyroRange(
        MPU6050_RANGE_500_DEG);
    mpu.setFilterBandwidth(
        MPU6050_BAND_21_HZ);
  } else {
    Serial.println(
        "MPU6050 not detected. Check wiring/address.");
  }

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

  // Heartbeat every 500 ms.
  if (now - lastHeartbeat >= 500) {
    lastHeartbeat = now;
    sendHeartbeat();
  }

  // Sensor reading every 100 ms (10 Hz).
  if (now - lastSensorRead >= 100) {
    lastSensorRead = now;
    readAndSendMPU();
  }

  delay(2);
}
