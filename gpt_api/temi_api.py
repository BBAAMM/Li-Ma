import requests
import json

# Firebase Realtime Database URL (끝에 반드시 `/` 포함)
FIREBASE_URL = "https://li-ma-56446-default-rtdb.asia-southeast1.firebasedatabase.app/"

# 저장할 데이터 구조
data = {
    "command": "Book1",
    "locations": [
        None,
        "Book1",
        "Book2"
    ]
}

# Firebase에 PUT으로 저장
def write_command_data():
    response = requests.put(FIREBASE_URL + "library/command_data.json", json=data)
    print("응답 코드:", response.status_code)
    print("응답 내용:", response.text)

# 실행
if __name__ == "__main__":
    write_command_data()
