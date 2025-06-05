const input = document.querySelector('.input_area input');
const button = document.querySelector('.input_area button');
const chatArea = document.querySelector('.chat_area');       // 스크롤 조작용
const chatWrap = document.querySelector('.chat_area .wrap'); // 메시지 추가용

if (input && button && chatArea && chatWrap) {
  button.addEventListener('click', sendMessage);

  input.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') sendMessage();
  });

  function sendMessage() {
  const text = input.value.trim();
  if (text === '') return;

  addMessage(text, 'ch2');  // ← 사용자 메시지는 오른쪽(ch2)

  input.value = '';

  chatArea.scrollTop = chatArea.scrollHeight;
  sendToAPI(text); //api호출함수.
  // setTimeout(() => {
  //   addMessage('챗봇응답 예시입니다', 'ch1'); // 챗봇 메시지(왼쪽)
  //   chatArea.scrollTop = chatArea.scrollHeight;
  // }, 800);
}

function addMessage(message, type) {
  const chat = document.createElement('div');
  chat.className = 'chat ' + type;

  const isUser = type === 'ch2'; // 사용자: ch2, 챗봇: ch1
  const imgSrc = isUser ? 'images/user.png' : 'images/secretary.png';
  const imgAlt = isUser ? 'User' : 'Bot';
  const iconClass = isUser ? 'user-icon' : 'bot-icon';

  chat.innerHTML = `
    <div class="${iconClass}">
      <img src="${imgSrc}" alt="${imgAlt}" />
    </div>
    <div class="textbox">${message}</div>
  `;

  chatWrap.appendChild(chat);

  setTimeout(() => {
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 50);
}
} 
function sendToAPI(userMessage) {
  fetch("https://asia-northeast3-li-ma-56446.cloudfunctions.net/api/books", { //  API 주소
    method: 'GET',
// { 내가 보내는형태.
//   "message": "책 대여 가능해?"
// }
    // headers: {
    //   'Content-Type': 'application/json' //내가 보내는형태 json
    // },
    // body: JSON.stringify({ message: userMessage })
  })
  .then(res => res.json())
  .then(data => handleAPIResponse(data)) // 응답 처리 함수 호출
  .catch(error => {
    console.error('Error:', error);
    addMessage(' 서버 응답 오류가 발생했습니다.', 'ch1');
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}
function handleAPIResponse(data) {
// { 서버 응답 예시.
//   "text": "안녕하세요! 무엇을 도와드릴까요?",
//   "status": "success"
// }
  const botReply = data.text || '챗봇 응답을 받아오지 못했습니다.';
  addMessage(botReply, 'ch1');
  chatArea.scrollTop = chatArea.scrollHeight;
}




function refreshEnvData() {
  // 서버 온습도 API 호출
  fetch('/api/env') // ← 실제 API 주소로 변경 필요
    .then(res => res.json())
    .then(data => {
      document.getElementById('env-value').innerText = `${data.temperature}℃ / ${data.humidity}%`;
    })
    .catch(err => {
      console.error('환경 정보 갱신 실패:', err);
      // 실패 시 기본값 사용
      document.getElementById('env-value').innerText = `36.5℃ / 55%`;
    });
}