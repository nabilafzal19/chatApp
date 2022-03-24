const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  useLeaves,
  getRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// setting our static frontend folder
// thats why using path to get path of public folder
//in server folder..

app.use(express.static(path.join(__dirname, "public")));

const botName = "Chat Bot";
// run whem client connects.
io.on("connection", (socket) => {
  console.log("new ws connection");

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);
    socket.join();
    //broadcast to single user..
    socket.emit(
      "message",
      formatMessage(botName, `welcome to chatApp ${username}`)
    );
    //broadcast to all users execpt the client connecting..
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} joined this room`)
      );
    //send users and room info to frontend.
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoom(user.room),
    });
  });

  //listening to the message arriving from frontend..
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //when user leaves the chat..
  socket.on("disconnect", () => {
    const user = useLeaves(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left`)
      );
      //send users and room info to frontend.
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoom(user.room),
      });
    }
  });
});
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`server running at port ${PORT}`));
