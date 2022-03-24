const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");

const socket = io();

//get username and room from url using qs library
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// sending username and room to server..
socket.emit("joinRoom", { username, room });

//Get room and users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

//connection messages from backend to frontend..

socket.on("message", (message) => {
  outputMessage(message);
  //scroll up
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit...
chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  //sending message to the server..
  socket.emit("chatMessage", msg);

  //clear message after typing..
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// output message to DOM.

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta" >${message.username}<span> ${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}
//add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}
