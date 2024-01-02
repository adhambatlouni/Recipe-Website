import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/meals.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import MealPopup from "./MealPopup";
import Navbar from "./Navbar";

// Function to shuffle an array randomly
const shuffleArray = (array) => {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Component for the header with navigation links
const Header = ({ navLinks }) => (
  <header className="header flex">
    <Navbar links={navLinks} />
  </header>
);

// Component for an individual meal card
const MealCard = ({ meal, index, openPopup }) => (
  <div
    className="meal-card"
    key={meal.idMeal}
    style={{ animationDelay: `${index * 0.1}s` }}
  >
    <img src={meal.strMealThumb} alt={meal.strMeal} />
    <p className="meal-name">{meal.strMeal}</p>
    <div className="plus-icon" onClick={() => openPopup(meal)}>
      <FontAwesomeIcon icon={faPlus} />
    </div>
  </div>
);

// Meals component
const Meals = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const categoryType = localStorage.getItem("categoryType");
  const [commonMeals, setCommonMeals] = useState([]);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.body.classList.add("custom-body-meals");

    return () => {
      document.body.classList.remove("custom-body-meals");
    };
  }, []);

    // useEffect to fetch meals based on the selected category type
  useEffect(() => {
    // Fetching recipes based on the selected category type
    const fetchRecipesBasedOnCategory = async () => {
      const categoryURL = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${categoryType}`;

      try {
        const categoryResponse = await fetch(categoryURL);
        if (!categoryResponse.ok) {
          throw new Error(
            `Error: ${categoryResponse.status} - ${categoryResponse.statusText}`
          );
        }
        const categoryData = await categoryResponse.json();

        if (categoryData.meals.length < 9) {
          console.error("There are not enough meals available.");
          return;
        }

        const mealsWithDetails = await Promise.all(
          shuffleArray(categoryData.meals)
            .slice(0, 9)
            .map(async (meal) => {
              try {
                const mealDetailsResponse = await fetch(
                  `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                if (mealDetailsResponse.ok) {
                  const mealDetailsData = await mealDetailsResponse.json();
                  return { ...meal, ...mealDetailsData.meals[0] };
                }
              } catch (error) {
                console.error("Error fetching meal details:", error);
              }
              return meal;
            })
        );

        setCommonMeals(mealsWithDetails);
      } catch (error) {
        console.error("Error fetching category:", error);
      }
    };

    // Triggering fetch only when categoryType changes
    if (categoryType) {
      fetchRecipesBasedOnCategory();
    }
  }, [categoryType]);

  // Function to handle opening the meal details popup
  const openPopup = (meal) => {
    setSelectedMeal(meal);
  };

  // Function to close the meal details popup
  const closePopup = () => {
    setSelectedMeal(null);
  };

  // Function to filter meals based on the search term
  const filteredMeals = commonMeals.filter((meal) =>
    meal.strMeal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle search input change
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Navigation links for the Navbar component
  const navLinks = [
    // Configuration for navigation links
    { label: "Home", to: "/homepage", active: false },
    { label: "Meals", to: "/meals", active: true },
    { label: "Favorites", to: "/favorites", active: false },
    { label: "Chat", to: "/chat", active: false },
  ];

  return (
    <div>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/remixicon@2.5.0/fonts/remixicon.css"
          rel="stylesheet"
        />
      </head>
      <Header navLinks={navLinks} />
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search for a meal..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-bar"
        />
      </div>
      <div className="meals-container">
        <div className="meals-grid">
          {filteredMeals.map((meal, index) => (
            <MealCard
              key={meal.idMeal}
              meal={meal}
              index={index}
              openPopup={openPopup}
            />
          ))}
        </div>
        {selectedMeal && userId && (
          <MealPopup
            meal={selectedMeal}
            mealName={selectedMeal.strMeal}
            mealImage={selectedMeal.strMealThumb}
            userId={userId}
            categoryType={categoryType}
            onClose={closePopup}
          />
        )}
      </div>
    </div>
  );
};

export default Meals;
