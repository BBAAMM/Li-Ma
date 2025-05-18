#include <DFRobot_DHT11.h>
#include "secrets.h"
#include <Firebase.h>

/* Use the following instance for Test Mode (No Authentication) */
DFRobot_DHT11 DHT;
const int dht11_pin = 10;

Firebase fb(REFERENCE_URL);

volatile float temp = 0;
volatile float humi = 0;

volatile float noise = 0;
volatile int noise_cnt = 0;
volatile float noise_history[10] = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0};
volatile float noise_sum = 0;
const int noise_threshold = 650;

unsigned long now_time = 0;
unsigned long pre_time = 0;
int i = 0;

/* Use the following instance for Locked Mode (With Authentication) */
// Firebase fb(REFERENCE_URL, AUTH_TOKEN);

void setup() {
  Serial.begin(115200);
#if !defined(ARDUINO_UNOWIFIR4)
  WiFi.mode(WIFI_STA);
#else
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
#endif
  WiFi.disconnect();
  delay(1000);

  /* Connect to WiFi */
  Serial.println();
  Serial.println();
  Serial.print("Connecting to: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("-");
    delay(500);
  }

  Serial.println();
  Serial.println("WiFi Connected");
  Serial.println();

#if defined(ARDUINO_UNOWIFIR4)
  digitalWrite(LED_BUILTIN, HIGH);
#endif

  /* ----- */

  /*
    Set String, Int, Float, or Bool in Firebase
    
    Parameters:
      - path: The path in Firebase where the data will be stored.
      - data: The value to set, which can be of type String, Int, Float, or Bool.

    Returns:
      - HTTP response code as an integer.
        - 200 indicates success.
        - Other codes indicate failure.
  */
  fb.setFloat("S1/Temp", 0);
  fb.setFloat("S1/Hum", 0);
  fb.setFloat("S1/Noise", 0);
  fb.setBool("S1/Patrol", false);
  /*
    Push String, Int, Float, or Bool in Firebase
    
    Parameters:
      - path: The path in Firebase where the data will be stored.
      - data: The value to push, which can be of type String, Int, Float, or Bool.

    Returns:
      - HTTP response code as an integer.
        - 200 indicates success.
        - Other codes indicate failure.
  */
  // fb.pushString("Push", "Foo-Bar");
  // fb.pushInt("Push", 890);
  // fb.pushFloat("Push", 12.34);
  // fb.pushBool("Push", false);

  /*
    Get String, Int, Float, or Bool from Firebase
    
    Parameters:
      - path: The path in Firebase from which the data will be retrieved.

    Returns:
      - The value retrieved from Firebase as a String, Int, Float, or Bool.
      - If the HTTP response code is not 200, returns NULL (for String) or 0 (for Int, Float, Bool).
  */

  /*
    Remove Data from Firebase
    
    Parameters:
      - path: The path in Firebase from which the data will be removed.

    Returns:
      - HTTP response code as an integer.
        - 200 indicates success.
        - Other codes indicate failure.
  */
}

void loop() {
  now_time = millis();

  if (now_time - pre_time > 1000) {
    // 온습도 센서 값 수집
    DHT.read(dht11_pin);
    temp = DHT.temperature;
    humi = DHT.humidity;

    // 소음 값 수집
    noise = analogRead(A0);

    if (i < 9) { // 소음값 기록
      noise_sum -= noise_history[i];
      noise_history[i] = noise;
      noise_sum += noise_history[i];
      i++;
    }
    else if (i == 9) { // 소음값 기록
      noise_sum -= noise_history[i];
      noise_history[i] = noise;
      noise_sum += noise_history[i];
      i = 0;
    }

    bool patrol_ing = fb.getBool("S1/Patrol");

    fb.setFloat("S1/Temp", temp);
    fb.setFloat("S1/Hum", humi);
    fb.setFloat("S1/Noise", noise);

    if (noise_sum > noise_threshold && !patrol_ing) { // 순찰 명령 -> 사실 없어도 될 듯
      fb.setBool("S1/Patrol", true);
    }

    pre_time = millis();
  }
}
