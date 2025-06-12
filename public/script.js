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
  sendToAPI(text); 

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
  fetch("https://asia-northeast3-li-ma-56446.cloudfunctions.net/api/books", {
    method: 'GET',

  })
  .then(res => res.json())
  .then(data => {
    console.log('= API 응답 성공:', data[0]); // ← 콘솔 출력 추가!
    console.log(' API 응답 내용용:', data[0].author); // ← 콘솔 출력 추가!
    handleAPIResponse(data[0]);
  })
  .catch(error => {
    console.error(' API 요청 실패:', error);
    addMessage('서버 응답 오류가 발생했습니다.', 'ch1');
    chatArea.scrollTop = chatArea.scrollHeight;
  });
}


function handleAPIResponse(data) {
  const botReply = data.author || '챗봇 응답을 받아오지 못했습니다.';
  addMessage(botReply, 'ch1');
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
      // const temp1 = data.s1.temp;
      // const hum1 = data.s1.hum;
      const temp2 = data.s2.temp;
      const hum2 = data.s2.hum;
      const temp3 = data.s3.temp;
      const hum3 = data.s3.hum;
      const temp4 = data.s4.temp;
      const hum4 = data.s4.hum;
      const avg_temp = ((temp2 + temp3 + temp4) / 3).toFixed(1);
      const avg_hum = ((hum2 + hum3 + hum4) / 3).toFixed(1);
      document.getElementById('env-value').innerText = `${avg_temp}℃ / ${avg_hum}%`;
    })
    .catch(err => {
      console.error('환경 정보 갱신 실패:', err);
      document.getElementById('env-value').innerText = `36.5℃ / 55%`;
    });
}

// 5초마다 자동 갱신
refreshEnvData();
setInterval(refreshEnvData, 5000);
