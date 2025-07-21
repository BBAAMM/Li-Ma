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



// function refreshEnvData() {
//   fetch('https://li-ma-56446-default-rtdb.asia-southeast1.firebasedatabase.app/devices.json')
//   .then(res => res.json())
//   .then(data => {
//     const temp = data.s2.temp;
//     const hum = data.s2.hum;

//     document.getElementById('env-value').innerText = `${temp}℃ / ${hum}%`;
//   })
//   .catch(err => {
//     console.error('환경 정보 갱신 실패:', err);
//     document.getElementById('env-value').innerText = `36.5℃ / 55%`;
//   });


// }
function refreshEnvData() {
  fetch('https://li-ma-56446-default-rtdb.asia-southeast1.firebasedatabase.app/devices.json')
    .then(res => res.json())
    .then(data => {
      const temp1 = data.s1.temp;
      const hum1 = data.s1.hum;
      const temp2 = data.s2.temp;
      const hum2 = data.s2.hum;
      const temp3 = data.s3.temp;
      const hum3 = data.s3.hum;
      const temp4 = data.s4.temp;
      const hum4 = data.s4.hum;
      const avg_temp = ((temp1+temp2 + temp3 + temp4) / 4).toFixed(1);
      const avg_hum = ((hum1+hum2 + hum3 + hum4) / 4).toFixed(1);
      document.getElementById('env-value').innerText = `${avg_temp}℃ / ${avg_hum}%`;
      document.getElementById('env-value1').innerText = `1구역: ${temp1}℃ / ${hum1}%`;
      document.getElementById('env-value2').innerText = `2구역: ${temp2}℃ / ${hum2}%`; 
      document.getElementById('env-value3').innerText = `3구역: ${temp3}℃ / ${hum3}%`;
      document.getElementById('env-value4').innerText = `4구역: ${temp4}℃ / ${hum4}%`;

    })
    .catch(err => {
      console.error('환경 정보 갱신 실패:', err);
      document.getElementById('env-value').innerText = `36.5℃ / 55%`;
    });
}

// 5초마다 자동 갱신
refreshEnvData();
setInterval(refreshEnvData, 5000);


function toggleEnvDetail() {
  const detailBox = document.getElementById('env-details');
  detailBox.style.display = (detailBox.style.display === 'none' || detailBox.style.display === '') ? 'block' : 'none';
}