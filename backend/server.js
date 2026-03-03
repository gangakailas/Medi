import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import app from "./app.js";
import cloudinary from "cloudinary";
import http from "http";
import { Server } from "socket.io";
import { ChatMessage } from "./models/chatMessageSchema.js";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO event handlers
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join a consultation room
  socket.on("joinRoom", (data) => {
    const { roomId, userName, userRole } = data;
    socket.join(roomId);
    socket.roomId = roomId;
    socket.userName = userName;
    socket.userRole = userRole;
    console.log(`${userName} (${userRole}) joined room: ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit("userJoined", {
      userName,
      userRole,
      socketId: socket.id,
    });
  });

  // Handle text chat messages
  socket.on("chatMessage", async (data) => {
    const { roomId, message, senderId, senderName, senderRole, consultationId } = data;

    // Save message to database
    try {
      await ChatMessage.create({
        consultationId,
        senderId,
        senderName,
        senderRole,
        message,
      });
    } catch (err) {
      console.error("Error saving chat message:", err);
    }

    // Broadcast message to everyone in the room (including sender)
    io.to(roomId).emit("chatMessage", {
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date(),
    });
  });

  // WebRTC signaling - offer
  socket.on("callUser", (data) => {
    const { to, signal, from, userName } = data;
    io.to(to).emit("incomingCall", { signal, from, userName });
  });

  // WebRTC signaling - answer
  socket.on("answerCall", (data) => {
    const { to, signal } = data;
    io.to(to).emit("callAccepted", { signal });
  });

  // Handle leaving room
  socket.on("leaveRoom", (data) => {
    const { roomId, userName } = data;
    socket.leave(roomId);
    socket.to(roomId).emit("userLeft", { userName, socketId: socket.id });
    console.log(`${userName} left room: ${roomId}`);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("userLeft", {
        userName: socket.userName,
        socketId: socket.id,
      });
    }
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
