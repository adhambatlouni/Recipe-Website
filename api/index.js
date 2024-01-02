const express = require("express");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const socketIO = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

let messages = [];

// WebSocket connection handling
io.on("connection", (socket) => {
  console.log("New WebSocket connection");

  // Emit existing messages to new clients
  socket.emit("existingMessages", messages);

  // Listen for new chat messages
  socket.on("chatMessage", (data) => {
    const message = {
      user: data.user,
      content: data.message,
    };
    // Add new message to the array
    messages.push(message);
    // Broadcast the new message to all connected clients
    io.emit("message", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

const port = process.env.PORT || 3001;

const currentDirectory = __dirname;
const buildDirectory = path.join(currentDirectory, "build");

app.use(express.static(buildDirectory));

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

// Import user-related routes
const user = require("./routes/UserRoute");

// Basic route to verify server-side operation
app.get("/", (req, res) => {
  res.send({ message: "Ok from the server side" });
});

// Define user-related routes using the '/user' endpoint
app.use("/user", user);

// Start the server to listen on the specified port
server.listen(port, () => {
  console.log(`my app is running on ${port}`);
});
