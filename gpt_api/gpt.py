import os
import pandas as pd
from flask import Flask, request, jsonify
from openai import OpenAI
from flask_cors import CORS
import requests

# Firebase 관련 상수
FIREBASE_URL = "https://li-ma-56446-default-rtdb.asia-southeast1.firebasedatabase.app/"

def write_command_data(command_value):
    data = {
        "command": command_value,
        
    }
    response = requests.patch(FIREBASE_URL + "library.json", json=data)
    print("Firebase 응답 코드:", response.status_code)
    print("Firebase 응답 내용:", response.text)

class LibraryChatbot:
    EXCEL_FILE = "library_data.xlsx"

    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.history = []

    def _load_books(self):
        return pd.read_excel(self.EXCEL_FILE, sheet_name="Sheet1")

    def _build_books_prompt(self):
        df = pd.read_excel(self.EXCEL_FILE, sheet_name=0)
        lines = []
        for _, row in df.iterrows():
            title = row.get("title", "제목 없음")
            author = row.get("author", "저자 정보 없음")
            pub = (row["publish_date"].strftime("%Y-%m-%d")
                   if hasattr(row["publish_date"], "strftime")
                   else str(row.get("publish_date", "출간일 정보 없음")))
            
            lines.append(f"『{title}』 — 저자: {author}, 출간: {pub}")
        content = "보유 도서 목록:\n" + "\n".join(lines)
        return {"role": "system", "content": content}

    def generate_response(self, user_input: str) -> str:
        self.history.append({"role": "user", "content": user_input})
        base_prompts = [
            {"role": "system",
             "content": "You are a ‘도서관봇’, a library information robot. Always answer in polite Korean."},
            {"role": "system",
             "content": "Listen carefully to their questions and ask brief follow-up questions if necessary."},
            {
            "role": "system",
            "content": "If the user asks questions such as 'Can I borrow [book name]?', 'Is [book name] available?', or any other questions related to borrowing a book, respond only in Korean with a sentence like: '『[book name]』의 대출 가능 여부를 확인해드릴게요.'"
            },

            {"role": "system",
             "content": "If the user asks where one of the following books is located — '리마 개발일지', '딥 워크', '원씽', '초집중', '기획자의 습관', or '일 잘하는 사람은 단순하게 합니다' — respond with: '해당 책의 위치로 안내해드릴까요?' If the user gives a positive response (e.g., '네', '응', '좋아요', etc.), respond only in Korean with: '『[book name]』의 위치로 안내해드릴게요. 테미를 따라 이동해주세요."},

             {"role": "system",
             "content": "Information you don't know when answering is information you don't know. Say."},
        ]
        books_prompt = self._build_books_prompt()
        messages = base_prompts + [books_prompt] + self.history

        resp = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
        )
        reply = resp.choices[0].message.content.strip()
        self.history.append({"role": "assistant", "content": reply})

        if "대출 가능" in reply or "대출 여부" in reply or "대출 중" in reply:
            reply += self.check_book_availability(reply)

        
        # 응답에 따라 Firebase에 데이터 전송
        if "리마 개발일지" in reply and "안내해드릴게요" in reply:
            write_command_data("400/리마 개발일지")
        elif "딥 워크" in reply and "안내해드릴게요" in reply:
            write_command_data("300/딥 워크")
        elif "원씽" in reply and "안내해드릴게요" in reply:
            write_command_data("100/원씽")
        elif "초집중" in reply and "안내해드릴게요" in reply:
            write_command_data("100/초집중")
        elif "기획자의 습관" in reply and "안내해드릴게요" in reply:
            write_command_data("600/기획자의 습관")
        elif "일 잘하는 사람은 단순하게 합니다" in reply and "안내해드릴게요" in reply:
            write_command_data("300/일 잘하는 사람은 단순하게 합니다")



        return reply
    
    def check_book_availability(self, gpt_reply: str) -> str:
        try:
            # 실시간 도서 데이터 가져오기
            response = requests.get("http://asia-northeast3-li-ma-56446.cloudfunctions.net/api/books")
            if response.status_code != 200:
                return "\n⚠️ 도서 대출 정보를 확인할 수 없습니다."

            books = response.json()

            # GPT 응답에서 『책 제목』 추출
            import re
            matches = re.findall(r"『(.+?)』", gpt_reply)
            if not matches:
                return ""  # 책 제목이 없으면 추가 메시지 없음

            results = []
            for title in matches:
                for book in books:
                    if title.strip() in book.get("id", ""):
                        lendable = book.get("lendable", False)
                        if lendable:
                            results.append(f"📘 『{title}』은(는) 현재 대출 가능합니다.")
                        else:
                            results.append(f"📕 『{title}』은(는) 현재 대출 중입니다.")
                        break
                else:
                    results.append(f"{title}』은(는) 도서 목록에서 찾을 수 없습니다.")

            return "\n" + "\n".join(results)

        except Exception as e:
            return f"\n🚨 도서 정보를 가져오는 중 오류 발생: {str(e)}"

# Flask REST API 구성
app = Flask(__name__)
CORS(app) 
chatbot = LibraryChatbot()

@app.route('/api/books', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get("message", "")
    if not user_message:
        return jsonify({"text": "메시지가 비어 있습니다.", "status": "error"})
    
    try:
        response = chatbot.generate_response(user_message)
        return jsonify({"text": response, "status": "success"})
    except Exception as e:
        return jsonify({"text": f"에러 발생: {str(e)}", "status": "error"})
    




if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
