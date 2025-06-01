#include <DFRobot_DHT11.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "ROBOT";
const char* password = "20000428";

DFRobot_DHT11 DHT;
const int dht11_pin = 2;

volatile float temp = 0;
volatile float humi = 0;

volatile float noise = 0;
volatile int noise_cnt = 0;
volatile float noise_history[10] = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
volatile float noise_sum = 0;
const int noise_threshold = 150;
bool patrol = false;

unsigned long now_time = 0;
unsigned long pre_time = 0;
int i = 0;

// Firebase의 호출 주소
const char* serverName = "https://librarystates-default-rtdb.firebaseio.com/data/device/s2.json";  // Firestore가 아니라 Realtime DB 주소임

WiFiClientSecure wifiClient;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected.");
}

void loop() {
  now_time = millis();

  if (now_time - pre_time > 2000 && WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    // SSL 인증 무시 (테스트용)
    wifiClient.setInsecure();  // 실제 배포 전에는 루트 인증서 적용을 권장

    http.begin(wifiClient, serverName);  // ✅ 최신 방식

    // 온습도 센서 값 수집
    DHT.read(dht11_pin);
    temp = DHT.temperature;
    humi = DHT.humidity;

    // 소음 값 수집
    noise = analogRead(A0);

    if (i < 9) {  // 소음값 기록
      noise_sum -= noise_history[i];
      noise_history[i] = noise;
      noise_sum += noise_history[i];
      i++;
    } else if (i == 9) {  // 소음값 기록
      noise_sum -= noise_history[i];
      noise_history[i] = noise;
      noise_sum += noise_history[i];
      i = 0;
    }

    if (patrol == false && noise_sum > noise_threshold) {
      patrol = true;
    } else if (patrol == true && noise_sum < noise_threshold) {
      patrol = false;
    }

    http.addHeader("Content-Type", "application/json");

    if (patrol == true) {
      String json = "{\"hum\":"+ String(humi)+ ",\"patrol\":\"true\",\"temp\":" + String(temp) + "}";
      int httpCode = http.sendRequest("PUT", json);  // 또는 POST도 가능
    } else {
      String json = "{\"hum\":"+ String(humi)+ ",\"patrol\":\"false\",\"temp\":" + String(temp) + "}";
      int httpCode = http.sendRequest("PUT", json);  // 또는 POST도 가능
    }

    // Serial.print("HTTP 응답 코드: ");
    // Serial.println(httpCode);

    // if (httpCode > 0) {
      // Serial.println("서버 응답:");
      // Serial.println(http.getString());
    // }

    pre_time = millis();
    http.end();
  }
}
