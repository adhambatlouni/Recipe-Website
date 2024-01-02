import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import UserService from "../services/UserService.js";

// Mealpopup component
const MealPopup = ({ meal, userId, categoryType, onClose }) => {
  const contentRef = useRef(null);
  const [popupHeight, setPopupHeight] = useState("auto");
  const [addedToFavorites, setAddedToFavorites] = useState(false);
  const [message, setMessage] = useState("");
  const [messageVisible, setMessageVisible] = useState(false);
  const [messageTimer, setMessageTimer] = useState(null);
  const [isInFavorites, setIsInFavorites] = useState(false);

  // Retrieving token from local storage
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Function to adjust popup size based on content
    const adjustPopupSize = () => {
      if (contentRef.current) {
        const totalHeight = Array.from(contentRef.current.children).reduce(
          (acc, child) => acc + child.scrollHeight,
          0
        );
        setPopupHeight(`${totalHeight}px`);
      }
    };

    // Function to check if the meal is in favorites for the user
    const checkMealInFavorites = async () => {
      // Fetching data to check if the meal is in favorites
      try {
        const response = await UserService.checkMealInFavorites(
          userId,
          meal.strMeal,
          token
        );
        // Updating state based on the response
        if (response.data.isFavorite) {
          setIsInFavorites(true);
        } else {
          setIsInFavorites(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Initial size adjustment and checking meal in favorites
    adjustPopupSize();
    checkMealInFavorites();

    // Event listener for window resize to readjust popup size
    window.addEventListener("resize", adjustPopupSize);

    // Cleanup function for removing event listener
    return () => {
      window.removeEventListener("resize", adjustPopupSize);
    };
  }, [meal, userId]);

  // Function to convert image URL to base64
  const convertImageToBase64 = async (imageUrl) => {
    // Fetching image and converting to base64
    try {
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} - ${response.statusText}`
        );
      }

      const blob = await response.blob();

      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw error;
    }
  };

  // Function to add meal to favorites
  const addMealToFavorites = async () => {
    try {
      // Handling addition or notification of meal in favorites
      if (isInFavorites) {
        setMessage("Meal is already in favorites");
        setMessageVisible(true);

        if (messageTimer) {
          clearTimeout(messageTimer);
        }

        const timerId = setTimeout(() => {
          setMessageVisible(false);
        }, 3000);

        setMessageTimer(timerId);
      } else {
        const mealInfo = {
          userId,
          meal: meal.strMeal,
          categoryType,
          mealImage: await convertImageToBase64(meal.strMealThumb),
        };

        const response = await UserService.addMealToFavorites(mealInfo, token);

        if (response.status === 200) {
          setAddedToFavorites(true);
          setIsInFavorites(true);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="popup" ref={contentRef}>
      <div className="popup-content" style={{ height: popupHeight }}>
        <div className="close-icon" onClick={onClose}>
          <FontAwesomeIcon
            icon={faTimes}
            size="2x"
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="popup-section">
          <div className="popup-label">Meal name:</div>
          <div className="popup-info">
            <p className="popup-meal-name">{meal.strMeal}</p>
          </div>
        </div>
        <div className="popup-section">
          <div className="popup-label">Meal instructions:</div>
          <div className="popup-info">
            <p className="popup-instructions">{meal.strInstructions}</p>
          </div>
        </div>
        {meal.strYoutube && (
          <div className="popup-section">
            <div className="popup-label">Meals tutorial:</div>
            <div className="popup-info">
              <a
                href={meal.strYoutube}
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Video on YouTube
              </a>
            </div>
          </div>
        )}
        <div className="popup-section">
          <button className="btn2" onClick={addMealToFavorites}>
            {isInFavorites ? "Meal in Favorites" : "Add to Favorites"}
          </button>
          {messageVisible && <div className="message">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default MealPopup;
