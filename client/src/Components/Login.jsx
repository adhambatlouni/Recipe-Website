import React, { useState, useRef, useEffect } from "react";
import "../css/form.css";
import UserService from "../services/UserService";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameEmpty, setUsernameEmpty] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  const usernameInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    document.body.classList.add("custom-body1");

    return () => {
      document.body.classList.remove("custom-body1");
    };
  }, []);

  // Function to handle the login process
  const handleLogin = async () => {
    // Resetting error states and messages
    setUsernameEmpty(false);
    setPasswordEmpty(false);
    setLoginErrorMessage("");

    // Validating form inputs
    if (!username || !password) {
      // Handling empty inputs
      if (!username) {
        setUsernameEmpty(true);
        usernameInputRef.current.classList.add("shake");
      }
      if (!password) {
        setPasswordEmpty(true);
        passwordInputRef.current.classList.add("shake");
      }

      // Setting error message and resetting states after 3 seconds
      setLoginErrorMessage("Please enter your username and password");
      setTimeout(() => {
        usernameInputRef.current.classList.remove("shake");
        passwordInputRef.current.classList.remove("shake");
        setUsernameEmpty(false);
        setPasswordEmpty(false);
        setLoginErrorMessage("");
      }, 3000);

      return;
    }

    try {
      // Checking username and password validity
      const isUsernameValid = await UserService.checkUsername(username, token);
      const isPasswordValid = await UserService.checkPassword(
        userId,
        password,
        token
      );

      console.log(isUsernameValid.data.isTaken);
      console.log(isPasswordValid.data.isPasswordCorrect);

      // Handling invalid credentials
      if (
        !isUsernameValid.data.isTaken &&
        !isPasswordValid.data.isPasswordCorrect
      ) {
        setLoginErrorMessage("Invalid username and password.");
        setUsernameEmpty(true);
        setPasswordEmpty(true);
        return;
      }
    } catch (error) {
      console.error("Error checking user:", error);
    }

    // Creating user object with credentials
    const user = {
      username,
      password,
    };

    console.log("User object:", user);

    try {
      // Attempting login with user credentials
      const response = await UserService.login(user);
      if (response.status === 200) {
        // Storing userId and token in localStorage
        const { userId, token } = response.data;
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token);

        // Navigating to the homepage on successful login
        navigate("/homepage");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setLoginErrorMessage("An error occurred during login");
    }
  };

  return (
    <div className="wrapper">
      <h1>Login</h1>
      <form method="post">
        <input
          type="text"
          name="username"
          placeholder="Username"
          onChange={(e) => setUsername(e.target.value)}
          ref={usernameInputRef}
          className={usernameEmpty ? "input input-taken shake" : "input"}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          ref={passwordInputRef}
          className={passwordEmpty ? "input input-taken shake" : "input"}
        />

        <button type="button" className="btn" onClick={handleLogin}>
          Login
        </button>

        {loginErrorMessage && (
          <p className="error-message">{loginErrorMessage}</p>
        )}
      </form>

      <div className="member">
        Not a member? <Link to="/">Register Now</Link>
      </div>
    </div>
  );
};

export default Login;
