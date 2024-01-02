import React, { useEffect, useState } from "react";
import UserService from "../services/UserService";
import Navbar from "./Navbar";

// Component for the table header
const TableHeader = () => (
  <thead className="thead-dark">
    <tr>
      <th className="custom-th">Meal Name</th>
      <th className="custom-th">Meal Category</th>
      <th className="custom-th">Action</th>
    </tr>
  </thead>
);

// Component for a single row in the table
const TableRow = ({ meal, removeMealFromFavorites }) => (
  <tr key={meal.favorite_meal_id} className="custom-tr">
    <td className="custom-td">{meal.meal_name}</td>
    <td className="custom-td">{meal.meal_categorytype}</td>
    <td>
      <button
        className="btn custom-btn"
        onClick={() => removeMealFromFavorites(meal.favorite_meal_id)}
      >
        Remove
      </button>
    </td>
  </tr>
);

// Favorites component
const Favorites = () => {
  const [favoriteMeals, setFavoriteMeals] = useState([]);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  // Navigation links for the Navbar component
  const navLinks = [
    // Configuration for navigation links
    { label: "Home", to: "/homepage", active: false },
    { label: "Meals", to: "/meals", active: false },
    { label: "Favorites", to: "/favorites", active: true },
    { label: "Chat", to: "/chat", active: false },
  ];

  // Function to remove a meal from favorites
  const removeMealFromFavorites = async (favoritemealId) => {
    try {
      // Remove meal from favorites 
      const response = await UserService.removeFavoriteMeal(
        userId,
        favoritemealId,
        token
      );
      if (response && response.status === 200) {
        fetchFavoriteMeals();
      } else {
        console.error("Failed to remove favorite meal");
      }
    } catch (error) {
      console.error("Error removing favorite meal:", error);
    }
  };

  // Function to fetch favorite meals for the user
  const fetchFavoriteMeals = async () => {
    try {
      // Fetch favorite meals 
      const response = await UserService.getFavoriteMeals(userId, token);
      setFavoriteMeals(response.data);
    } catch (error) {
      console.error("Error fetching favorite meals:", error);
    }
  };

  // Fetch favorite meals on component mount or userId change
  useEffect(() => {
    fetchFavoriteMeals();
  }, [userId]);

  // Render the table of favorite meals
  const renderFavoriteMeals = () => (
    <div className="table-container">
      <table className="table custom-table">
        <TableHeader />
        <tbody>
          {favoriteMeals.map((meal) => (
            <TableRow
              key={meal.favorite_meal_id}
              meal={meal}
              removeMealFromFavorites={removeMealFromFavorites}
            />
          ))}
        </tbody>
      </table>
    </div>
  );

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
      <style>
        {`
          h1 {
            margin: 3rem; 
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
      <header className="header flex">
        <Navbar links={navLinks} />
      </header>
      <h1>Your Favorite Meals</h1>
      {renderFavoriteMeals()}
    </div>
  );
};

export default Favorites;
