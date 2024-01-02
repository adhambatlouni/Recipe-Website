import React, { useState, useRef, useEffect } from "react";
import "../css/form.css";
import UserService from "../services/UserService.js";
import { Link, useNavigate } from "react-router-dom";

// Signup component
const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nameEmpty, setNameEmpty] = useState(false);
  const [emailEmpty, setEmailEmpty] = useState(false);
  const [passwordEmpty, setPasswordEmpty] = useState(false);
  const [infoErrorMessage, setInfoErrorMessage] = useState("");
  const inputRef = useRef(null);

  // Retrieve token from local storage
  const token = localStorage.getItem("token");

  // Navigation hook
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add("custom-body1");

    return () => {
      document.body.classList.remove("custom-body1");
    };
  }, []);

  // Function to handle displaying error message with timeout
  const handleErrorWithTimeout = (inputRef, errorMessage, emptyStates) => {

    // Apply CSS animation to input field for visual indication
    inputRef.current.classList.add("shake");
    setInfoErrorMessage(errorMessage);

    // Set respective empty states to true for showing error state
    if (Array.isArray(emptyStates)) {
      emptyStates.forEach((setState) => setState(true));
    } else {
      emptyStates(true);
    }

    // Clear error message and reset states after 3 seconds
    setTimeout(() => {
      inputRef.current.classList.remove("shake");
      setInfoErrorMessage("");

      if (Array.isArray(emptyStates)) {
        emptyStates.forEach((setState) => setState(false));
      } else {
        emptyStates(false);
      }
    }, 3000);
  };

  // Function to handle user sign-up
  const handleSignUp = async () => {
    // Validation: Check if fields are empty
    if (!name || !email || !password) {
      if (!name) {
        handleErrorWithTimeout(
          inputRef,
          "Please enter the required info.",
          setNameEmpty
        );
      }
      if (!email) {
        handleErrorWithTimeout(
          inputRef,
          "Please enter the required info.",
          setEmailEmpty
        );
      }
      if (!password) {
        handleErrorWithTimeout(
          inputRef,
          "Please enter the required info.",
          setPasswordEmpty
        );
      }

      return;
    }

    try {
      // Check if email and username already exist
      const isEmailExistsResponse = await UserService.checkEmail(email, token);
      const isUsernameExistsResponse = await UserService.checkUsername(
        name,
        token
      );

      // Handle existing email and username cases
      if (
        isEmailExistsResponse.data.isTaken &&
        isUsernameExistsResponse.data.isTaken
      ) {
        handleErrorWithTimeout(inputRef, "Username and Email already exist.", [
          setNameEmpty,
          setEmailEmpty,
        ]);
        return;
      } else if (isEmailExistsResponse.data.isTaken) {
        handleErrorWithTimeout(
          inputRef,
          "Email already exists.",
          setEmailEmpty
        );
        return;
      } else if (isUsernameExistsResponse.data.isTaken) {
        handleErrorWithTimeout(
          inputRef,
          "Username already exists.",
          setNameEmpty
        );
        return;
      }
    } catch (error) {
      console.error("Error inserting user:", error);
    }

    // Prepare user object with input data
    const user = { name, email, password };

    try {
      // Send sign-up request and handle the response
      const response = await UserService.signup(user);

      console.log("Response:", response);
      if (response.status === 200) {
        const { userId, token } = response.data;
        localStorage.setItem("userId", userId);
        localStorage.setItem("token", token);

        // Clear input fields after successful sign-up
        inputRef.current.value = "";

        // Redirect to user preferences page
        navigate("/userpreferences");
      } else {
        alert("Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred during registration");
    }
  };

  return (
    <div className="flex">
      <div className="wrapper">
        <h1>Sign Up</h1>
        <form method="post">
          <input
            id="nameInput"
            name="name"
            placeholder="Customer Name"
            onChange={(e) => setName(e.target.value)}
            ref={inputRef}
            className={nameEmpty ? "input input-taken shake" : "input"}
          />

          <input
            id="emailInput"
            name="email"
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            ref={inputRef}
            className={emailEmpty ? "input input-taken shake" : "input"}
          />

          <input
            id="passwordInput"
            name="password"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            ref={inputRef}
            className={passwordEmpty ? "input input-taken shake" : "input"}
          />

          <button type="button" className="btn" onClick={handleSignUp}>
            Sign Up
          </button>
          {infoErrorMessage && (
            <p className="error-message">{infoErrorMessage}</p>
          )}
        </form>
        <div className="member">
          Already a member? <Link to="/login">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
