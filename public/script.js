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
  fetch("http://localhost:5000/api/books", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message: userMessage })  // ← 사용자 메시지를 Python으로 전달
  })
  .then(res => res.json())
  .then(data => handleAPIResponse(data))  // 응답 처리
  .catch(error => {
    console.error('Error:', error);
    addMessage('서버 응답 오류가 발생했습니다.', 'ch1');
  });
}

function handleAPIResponse(data) {
  const botReply = data.text || '챗봇 응답을 받아오지 못했습니다.';
  addMessage(botReply, 'ch1');  // ← 응답 메시지를 UI에 표시
  chatArea.scrollTop = chatArea.scrollHeight;
}
