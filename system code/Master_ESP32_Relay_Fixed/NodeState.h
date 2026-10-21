#pragma once
#include <Arduino.h>
#include <math.h>

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

