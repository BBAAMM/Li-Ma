import requests

def check_books_api():
    try:
        url = "http://asia-northeast3-li-ma-56446.cloudfunctions.net/api/books"
        response = requests.get(url)

        if response.status_code != 200:
            print("📛 오류: 응답 실패 - 상태 코드:", response.status_code)
            return

        books = response.json()

        print("📚 도서 목록:")
        for i, book in enumerate(books, 1):
            print(f"{i}. 제목: {book.get('title')}, 대출 가능 여부: {book.get('lendable')}")
    except Exception as e:
        print("🚨 예외 발생:", str(e))

if __name__ == "__main__":
    check_books_api()
