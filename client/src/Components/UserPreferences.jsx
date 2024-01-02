import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserService from "../services/UserService";
import axios from "axios";
import "../css/form.css";

// Component for a select input field
const SelectInput = ({ id, value, options, onChange }) => (
  <select id={id} value={value} onChange={onChange}>
    <option value="">Select Category</option>
    {options.map((type) => (
      <option key={type} value={type}>
        {type}
      </option>
    ))}
  </select>
);

// Component for a button
const Button = ({ type, label, onClick }) => (
  <button type={type} className="btn" onClick={onClick}>
    {label}
  </button>
);

// Userpreferences component
const UserPreferences = () => {
  const [categoryTypes, setCategoryTypes] = useState([]);
  const [categoryType, setCategoryType] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const navigate = useNavigate();

  // Fetch categories from an external API when component mounts
  useEffect(() => {
    document.body.classList.add("custom-body1");

    axios
      .get("https://www.themealdb.com/api/json/v1/1/categories.php")
      .then((response) => {
        const categories = response.data.categories.map(
          (category) => category.strCategory
        );
        setCategoryTypes(categories);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });

    return () => {
      document.body.classList.remove("custom-body1");
    };
  }, []);

  // Handle change in selected category type
  const handleCategoryTypeChange = (e) => {
    const selectedCategory = e.target.value;
    setCategoryType(selectedCategory);
  };

  // Handle form submission
  const handleSubmit = async () => {
    console.log("Submit button clicked");

    try {
      if (categoryType === "") {
        setErrorMessage("Please select a category");
        setTimeout(() => {
          setErrorMessage("");
        }, 3000);
        return;
      }

      // Create an object with user preferences
      const userPreferences = {
        userId,
        categoryType,
      };

      // Save user preferences using UserService
      await UserService.saveUserPreferences(userPreferences, token);

      // Update local storage with the selected category
      localStorage.setItem("categoryType", categoryType);

      // Navigate to the homepage on successful submission
      navigate("/homepage");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="wrapper wrapper-preferences">
      <h1 className="preferences">User Preferences</h1>
      <form>
        <div>
          <SelectInput
            id="categoryType"
            value={categoryType}
            options={categoryTypes}
            onChange={handleCategoryTypeChange}
          />
        </div>

        <Button type="button" label="Save Preferences" onClick={handleSubmit} />

        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default UserPreferences;
