import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import UserService from "../services/UserService";
import Navbar from "./Navbar";

// Chat component
const ChatComponent = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [username, setUsername] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Fetches user information 
  useEffect(() => {
    // Function to fetch user info from the server
    const fetchUserInfo = async () => {
      try {
        // Fetch user info using the UserService
        const response = await UserService.getUserInfo(userId, token);
        const userObject = response.data.user;
        const username = userObject.user_name;

        // Set the retrieved username to the state
        setUsername(username);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchUserInfo();

    // Establishes a socket connection to the server
    const newSocket = io("http://127.0.0.1:3001");
    setSocket(newSocket);

    // Closes the socket connection 
    return () => newSocket.close();
  }, []);

  // Sets up event listeners for incoming messages
  useEffect(() => {
    if (socket) {
      // Listens for incoming messages and updates the state
      socket.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Listens for existing messages when the user joins and sets the messages state
      socket.on("existingMessages", (existingMessages) => {
        setMessages(existingMessages);
      });
    }
  }, [socket]);

  // Sends a message via the socket connection
  const handleMessageSend = () => {
    if (socket && messageInput.trim() !== "") {
      // Sends a message via the socket connection
      const messageData = {
        user: username,
        message: messageInput,
      };
      socket.emit("chatMessage", messageData);
      // Resets the message input field after sending
      setMessageInput("");
    }
  };

  // Resets the message input field after sending
  const handleKeyPress = (e) => {
    // Sends the message when "Enter" is pressed
    if (e.key === "Enter") {
      handleMessageSend();
    }
  };

  // Sends the message when "Enter" is pressed
  const isCurrentUser = (messageUser) => {
    return messageUser === username;
  };

  // Navigation links for the Navbar component
  const navLinks = [
    // Configuration for navigation links
    { label: "Home", to: "/homepage", active: false },
    { label: "Meals", to: "/meals", active: false },
    { label: "Favorites", to: "/favorites", active: false },
    { label: "Chat", to: "/chat", active: true },
  ];

  return (
    <div>
      <header className="header flex">
        <Navbar links={navLinks} />
      </header>
      <style>
        {`
          h1 {
            margin: 0 0 2.5rem 3rem;
            position: relative;
            display: inline-block;
          }

          h1::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 2px;
            background-color: #ed7739; 
            bottom: -10px; 
            left: 0;
          }
        `}
      </style>
      <h1>Chat With Other Users</h1>
      <div className="chat-container">
        <div className="message-container">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${isCurrentUser(msg.user) ? 'sent' : 'received'}`}
            >
              <p>
                <strong>{msg.user}: </strong>
                {msg.content}
              </p>
            </div>
          ))}
          <div className="input-container">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
            />
            <button className="btn2" onClick={handleMessageSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatComponent;
