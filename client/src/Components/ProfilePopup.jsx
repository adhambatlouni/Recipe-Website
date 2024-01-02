import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSave, faEdit } from "@fortawesome/free-solid-svg-icons";
import UserService from "../services/UserService";
import axios from "axios";
import "../css/form.css";

// Profilepopup component
const ProfilePopup = ({ onClose }) => {
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [newUsername, setNewUsername] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserCategoryType, setNewUserCategoryType] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalUserEmail, setOriginalUserEmail] = useState("");
  const [originalUserCategoryType, setOriginalUserCategoryType] = useState("");
  const [isUsernameEditMode, setIsUsernameEditMode] = useState(false);
  const [isEmailEditMode, setIsEmailEditMode] = useState(false);
  const [isCategoryTypeEditMode, setIsCategoryTypeEditMode] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState(null);
  const [emailMessage, setEmailMessage] = useState(null);
  const [categoryTypeMessage, setCategoryTypeMessage] = useState(null);
  const [userId, setUserId] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);
  const [isNextPasswordMode, setIsNextPasswordMode] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Retrieve token from local storage
  const token = localStorage.getItem("token");

  // Fetch user information and categories when component mounts
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId);

    // Fetch user information from the API
    const fetchUserInfo = async () => {
      try {
        const response = await UserService.getUserInfo(storedUserId, token);
        const userObject = response.data.user;

        if (userObject) {
          const {
            user_name: username,
            user_email: userEmail,
            user_categorytype: userCategoryType,
          } = userObject;

          setNewUsername(username);
          setOriginalUsername(username);
          setNewUserEmail(userEmail);
          setOriginalUserEmail(userEmail);
          setNewUserCategoryType(userCategoryType);
          setOriginalUserCategoryType(userCategoryType);
        } else {
          console.error("User not found in the response.");
        }
      } catch (error) {
        console.error("Error fetching user information:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // Fetching categories from an external API when the component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          "https://www.themealdb.com/api/json/v1/1/categories.php"
        );
        // Extracting category names from the response and updating state
        const categories = response.data.categories.map(
          (category) => category.strCategory
        );
        setCategoryTypes(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    // Calling the fetchCategories function
    fetchCategories();
  }, []);

  // Function to handle enabling edit mode for username
  const handleEditClickUsername = () => {
    setIsUsernameEditMode(true);
  };

  // Function to handle enabling edit mode for email
  const handleEditClickEmail = () => {
    setIsEmailEditMode(true);
  };

  // Function to enable edit mode for category type and set its original value
  const handleEditClickCategoryType = () => {
    setIsCategoryTypeEditMode(true);
    setOriginalUserCategoryType(newUserCategoryType);
  };

  // Function to enable edit mode for password
  const handleEditClickPassword = () => {
    setIsChangePasswordMode(true);
  };

  // Generalized function to handle saving various user profile details
  const handleSave = async (
    checkFunction,
    saveFunction,
    setMessage,
    successMessage,
    errorMessage,
    successCallback,
    args
  ) => {
    try {
      // Checking if the new value is already taken
      const checkResult = await checkFunction(...args);
      if (checkResult.data.isTaken) {
        setMessage(errorMessage);
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // Saving the updated value and displaying success or error messages
      await saveFunction(...args);
      setMessage(successMessage);
      setTimeout(() => setMessage(null), 3000);
      if (successCallback) successCallback();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // Function to save the updated username after checking its availability
  const handleSaveUsername = async () => {
    await handleSave(
      UserService.checkUsername.bind(null, newUsername, token),
      UserService.saveModifiedUsername,
      setUsernameMessage,
      "Username updated successfully!",
      "Username is already taken. Choose another one.",
      () => setIsUsernameEditMode(false),
      [userId, newUsername, token]
    );
  };

  // Function to save the updated email after checking its availability
  const handleSaveEmail = async () => {
    await handleSave(
      UserService.checkEmail.bind(null, newUserEmail, token),
      UserService.saveModifiedEmail,
      setEmailMessage,
      "Email updated successfully!",
      "Email is already taken. Choose another one.",
      () => setIsEmailEditMode(false),
      [userId, newUserEmail, token]
    );
  };

  // Function to save the updated category type after checking its availability
  const handleSaveCategoryType = async () => {
    await handleSave(
      () => Promise.resolve({ data: { isTaken: false } }),
      UserService.saveModifiedCategoryType,
      setCategoryTypeMessage,
      "Category type updated successfully!",
      "Error saving category type.",
      () => {
        localStorage.setItem("categoryType", newUserCategoryType);
        setIsCategoryTypeEditMode(false);
      },
      [userId, newUserCategoryType, token]
    );
  };

  // Function to validate the current password before allowing the user to change it
  const handleNextChangePassword = async () => {
    try {
      // Checking if the entered current password is correct
      const response = await UserService.checkPassword(
        userId,
        currentPassword,
        token
      );
      const isCurrentPasswordValid = response.data.isPasswordCorrect;

      if (!isCurrentPasswordValid) {
        console.log("Invalid current password");
        setPasswordMessage("Incorrect current password. Please try again.");
        setTimeout(() => setPasswordMessage(null), 3000);
        return;
      }

      // If the current password is valid, enabling the next step for password change
      setIsNextPasswordMode(true);
    } catch (error) {
      console.error("Error checking current password:", error);
    }
  };

  // Function to save the updated password after checking its availability
  const handleSavePassword = async () => {
    await handleSave(
      () => Promise.resolve({ data: { isTaken: false } }),
      UserService.saveModifiedPassword,
      setPasswordMessage,
      "Password changed successfully!",
      "Error saving password.",
      () => {
        setCurrentPassword("");
        setNewPassword("");
        setIsChangePasswordMode(false);
        setIsNextPasswordMode(false);
      },
      [userId, newPassword, token]
    );
  };

  // Function to handle canceling the edit of a field and reverting to the original value
  const handleCancelEdit = (originalValue, setter, setIsEditMode) => {
    setter(originalValue);
    setIsEditMode(false);
  };

  // Function to handle canceling the edit for username
  const handleCancelEditUsername = () => {
    handleCancelEdit(originalUsername, setNewUsername, setIsUsernameEditMode);
  };

  // Function to handle canceling the edit for email
  const handleCancelEditEmail = () => {
    handleCancelEdit(originalUserEmail, setNewUserEmail, setIsEmailEditMode);
  };

  // Function to handle canceling the edit for category type
  const handleCancelEditCategoryType = () => {
    handleCancelEdit(
      originalUserCategoryType,
      setNewUserCategoryType,
      setIsCategoryTypeEditMode
    );
  };

  // Function to handle canceling the edit for password
  const handleCancelChangePassword = () => {
    handleCancelEdit("", setCurrentPassword, setIsChangePasswordMode);
    setNewPassword("");
  };

  return (
    <div className="popup">
      <div className="small-popup-content">
        <div className="close-icon" onClick={onClose}>
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="popup-section">
          <div className="popup-label">Username:</div>
          <div className="popup-info">
            <input
              type="text"
              value={newUsername}
              readOnly={!isUsernameEditMode}
              onChange={(e) => setNewUsername(e.target.value)}
              className="popup-input"
            />
            {isUsernameEditMode ? (
              <div className="button-group">
                <button className="btn2" onClick={handleSaveUsername}>
                  <FontAwesomeIcon icon={faSave} /> Save Username
                </button>
                <button className="btn2" onClick={handleCancelEditUsername}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn2" onClick={handleEditClickUsername}>
                <FontAwesomeIcon icon={faEdit} /> Change Username
              </button>
            )}
            {usernameMessage && (
              <div className="message">{usernameMessage}</div>
            )}
          </div>
        </div>
        <div className="popup-section">
          <div className="popup-label">User Email:</div>
          <div className="popup-info">
            <input
              type="text"
              value={newUserEmail}
              readOnly={!isEmailEditMode}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="popup-input"
            />
            {isEmailEditMode ? (
              <div className="button-group">
                <button className="btn2" onClick={handleSaveEmail}>
                  <FontAwesomeIcon icon={faSave} /> Save Email
                </button>
                <button className="btn2" onClick={handleCancelEditEmail}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn2" onClick={handleEditClickEmail}>
                <FontAwesomeIcon icon={faEdit} /> Change Email
              </button>
            )}
            {emailMessage && <div className="message">{emailMessage}</div>}
          </div>
        </div>
        <div className="popup-section">
          <div className="popup-label">User Category Type:</div>
          <div className="popup-info">
            <select
              id="categoryType"
              value={newUserCategoryType}
              disabled={!isCategoryTypeEditMode}
              onChange={(e) => setNewUserCategoryType(e.target.value)}
              className="popup-input"
            >
              {categoryTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {isCategoryTypeEditMode ? (
              <div className="button-group">
                <button className="btn2" onClick={handleSaveCategoryType}>
                  <FontAwesomeIcon icon={faSave} /> Save Category Type
                </button>
                <button className="btn2" onClick={handleCancelEditCategoryType}>
                  Cancel
                </button>
              </div>
            ) : (
              <button className="btn2" onClick={handleEditClickCategoryType}>
                <FontAwesomeIcon icon={faEdit} /> Change Category Type
              </button>
            )}
            {categoryTypeMessage && (
              <div className="message">{categoryTypeMessage}</div>
            )}
          </div>
        </div>
        <div className="popup-section">
          <div className="popup-label">User Password:</div>
          <div className="popup-info">
            {isChangePasswordMode ? (
              <>
                {isNextPasswordMode ? (
                  <>
                    <input
                      type="password"
                      placeholder="Enter your new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="popup-input"
                    />
                    <div className="button-group">
                      <button className="btn2" onClick={handleSavePassword}>
                        <FontAwesomeIcon icon={faSave} /> Save Password
                      </button>
                      <button
                        className="btn2"
                        onClick={handleCancelChangePassword}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <input
                      type="password"
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="popup-input"
                    />
                    <div className="button-group">
                      <button
                        className="btn2"
                        onClick={handleNextChangePassword}
                      >
                        Next
                      </button>
                      <button
                        className="btn2"
                        onClick={handleCancelChangePassword}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button className="btn2" onClick={handleEditClickPassword}>
                <FontAwesomeIcon icon={faEdit} /> Change Password
              </button>
            )}
            {passwordMessage && (
              <div className="message">{passwordMessage}</div>
            )}
          </div>
        </div>
        ;
      </div>
    </div>
  );
};

export default ProfilePopup;
