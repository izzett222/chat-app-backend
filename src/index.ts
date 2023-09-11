import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const express = require("express");
const app = express();
app.use(cors())
interface Message {
    room: string;
    sender:string;
    message:string;
}
const rooms = ["daily updates", "test"]
const messages:Message[] = []
const server = http.createServer(app)

const io =  new Server(server, {
    cors: {
        origin: "*"

    }
})
server.listen(4005, () => {
    console.log("listening to port 4005");
})


io.on("connection", (socket) => {
    console.log("someone connected")
    const { username } = socket.handshake.auth;
    io.emit("rooms", rooms)
    let room:string | null = null;
    io.emit("messages", messages);
    socket.on('chat message', (message:{message:string}) => {
        console.log(message, "message")
        if (room) {
            console.log("we have room", room)
            const newMessage:Message = { ...message, room, sender: username }
            messages.push(newMessage)
            console.log(messages)
            console.log(io.sockets.adapter.rooms)
            io.to(room).emit("chat message", newMessage)
        }
      
    })
    socket.on("join room", (pickedRoom:{ room: string }) => {
        console.log(pickedRoom, '===== room joined=========')
        socket.join(pickedRoom.room)
        
        room = pickedRoom.room;
    })

    socket.on("create room", (data: { newRoom:string }) => {
        socket.join(data.newRoom);
        rooms.push(data.newRoom);
        socket.broadcast.emit("new room", data.newRoom)
        room = data.newRoom;
    })
})

