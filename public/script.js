
//const socket = io('http://localhost:3000')
const socket = io(window.location.href)

const messageContainer = document.getElementById('message-container')
const roomContainer = document.getElementById('room-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
const video = document.getElementById('video')

let elem = document.getElementById('top-container');
let elem_font = document.getElementById('font-select');
let currentEmotion = ""; 
user_name = ""
loginlist = []
cur_style = ""

//neutral, happy, sad, angry, fearful, disgusted, surprised
fonts = {
  "neutral" : {
    "basic" : "basic1"
  },
  "happy" : {
    "happy1" : "happy1",
    "happy2" : "happy2",
    "happy3" : "happy3",
    "happy4" : "happy4",
    "happy5" : "happy5",
    "happy6" : "happy6",
  },
  "sad" : {},
  "angry" : {},
  "fearful" : {},
  "disgusted" : {},
  "surprised" : {},

}

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  //document.body.append(canvas)
  document.getElementById("pp").appendChild(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    //console.log(detections[0]["expressions"])
    //console.log(`emotion :  ${selectEmotion(detections[0]["expressions"])}`)
    currentEmotion = selectEmotion(detections[0]["expressions"])
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
  }, 50)
})

function selectEmotion(_array){
  if (_array.length == 0){
    return "감정 포착 실패!";
  }
  let emotion = "";
  let target = 0;
  for (const [key, value] of Object.entries(_array)) {
    if(value>target){
      target = value;
      emotion = key;
    }
  }
  return emotion
}

if (messageForm != null) {
  const name = prompt('당신의 이름은 무엇인가요?')
  appendMessage(`${name}님이 참가했습니다.`)
  socket.emit('new-user', roomName, name)

  user_name = name;
  elem.innerHTML = `</br><h1>${user_name}님, 채팅방에 오신 것을 환영합니다.</h1>`

  messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`${user_name}: ${message}`)
    socket.emit('send-chat-message', roomName, message)
    messageInput.value = ''
  })
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div')
  roomElement.innerText = room
  const roomLink = document.createElement('a')
  roomLink.href = `/${room}`
  roomLink.innerText = 'join'
  roomContainer.append(roomElement)
  roomContainer.append(roomLink)
})

socket.on('chat-message', data => {
  appendMessage(`${data.name}: ${data.message}`)
})

socket.on('user-connected', name => {
  appendMessage(`${name}님이 연결되었습니다.`)
  console.log(name)
  loginlist.add(name);
  console.log(loginlist)
  elem.innerHTML = `<h1>${loginList.join(", ")}님과의 채팅방입니다.</h1>`
})

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`)
})

function appendMessage(message) {
  const messageElement = document.createElement('div')
  messageElement.innerText = message
  messageContainer.append(messageElement)
}

function showfont(){
  //neutral, happy, sad, angry, fearful, disgusted, surprised
  //fonts[currentEmotion].keys()
  console.log(`현재 감정 상태는 ${currentEmotion}입니다.`)
  return_array = []
  Object.keys(fonts[currentEmotion]).forEach(
    x => return_array.push(`<span onclick="getthename(${x})" style="background-color:white;paddig:5px;margin:5px;border:true;">${x}</span>`)
  )
  

  elem_font.innerHTML = "</br>"+ return_array.join("")

}

function getthename(name){
  console.log(name)

}

