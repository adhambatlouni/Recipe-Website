const { query } = require("../database/db.js");
const bcrypt = require("bcrypt");

const userService = {
  // Checks if a username is already taken in the database
  isUsernameTaken: async (username) => {
    const queryText = "SELECT COUNT(*) AS count FROM users WHERE user_name = ?";
    const values = [username];

    try {
      const result = await query(queryText, values);
      return result[0].count > 0;
    } catch (error) {
      throw error;
    }
  },

  // Checks if an email is already registered in the database
  isEmailTaken: async (email) => {
    const queryText =
      "SELECT COUNT(*) AS count FROM users WHERE user_email = ?";
    const values = [email];

    try {
      const result = await query(queryText, values);
      return result[0].count > 0;
    } catch (error) {
      throw error;
    }
  },

  // Creates a new user in the database
  createUser: async (name, email, password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const insertQuery =
      "INSERT INTO users (user_name, user_email, user_password) VALUES (?, ?, ?)";
    const values = [name, email, hashedPassword];

    try {
      const result = await query(insertQuery, values);
      return result.insertId;
    } catch (error) {
      throw error;
    }
  },

  // Validates user credentials during login
  validateUser: async (username, password) => {
    const queryText = "SELECT * FROM users WHERE user_name = ?";
    const values = [username];

    try {
      const result = await query(queryText, values);

      if (result.length === 0) {
        return null;
      }

      const user = result[0];

      const passwordMatch = await comparePassword(password, user.user_password);

      if (passwordMatch) {
        return { ...user, id: user.user_id };
      }

      return null;
    } catch (error) {
      throw error;
    }
  },

  // Saves user preferences in the database
  saveUserPreferences: async (userId, categoryType) => {
    const queryText =
      "UPDATE users SET user_categorytype = ? WHERE user_id = ?";
    const values = [categoryType, userId];

    try {
      const result = await query(queryText, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Adds a favorite meal for a user in the database
  addFavoriteMeal: async (userId, meal, categoryType, mealImage) => {
    const insertQuery =
      "INSERT INTO favoritemeals (user_id, meal_name, meal_categorytype, meal_image) VALUES (?, ?, ?, ?)";

    const values = [userId, meal, categoryType, mealImage];

    try {
      const result = await query(insertQuery, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Checks if a particular meal is in a user's favorites
  isMealInFavorites: async (userId, meal) => {
    const queryText =
      "SELECT COUNT(*) AS count FROM favoritemeals WHERE user_id = ? AND meal_name = ?";
    const values = [userId, meal];

    try {
      const result = await query(queryText, values);
      return result[0].count > 0;
    } catch (error) {
      throw error;
    }
  },

  // Retrieves a user's favorite meals from the database
  getFavoriteMeals: async (userId) => {
    const queryText = "SELECT * FROM favoritemeals WHERE user_id = ?";

    try {
      const result = await query(queryText, [userId]);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Removes a favorite meal for a user from the database
  removeFavoriteMeal: async (userId, favoritemealid) => {
    const queryText =
      "DELETE FROM favoritemeals WHERE user_id = ? AND favorite_meal_id = ?";
    const values = [userId, favoritemealid];

    try {
      const result = await query(queryText, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Retrieves user information from the database
  getUserInfo: async (userId) => {
    const queryText = "SELECT * FROM users WHERE user_id = ?";
    const values = [userId];

    try {
      const result = await query(queryText, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Updates the username in the database
  updateUsername: async (userId, newUsername) => {
    const queryText = "UPDATE users SET user_name = ? WHERE user_id = ?";
    const values = [newUsername, userId];

    try {
      const result = await query(queryText, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Updates the user email in the database
  updateUseremail: async (userId, newUseremail) => {
    const queryText = "UPDATE users SET user_email = ? WHERE user_id = ?";
    const values = [newUseremail, userId];

    try {
      const result = await query(queryText, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Updates the user category type in the database
  updateUserCategoryType: async (userId, newUserCategoryType) => {
    const queryText =
      "UPDATE users SET user_categorytype = ? WHERE user_id = ?";
    const values = [newUserCategoryType, userId];

    try {
      const result = await query(queryText, values);
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Checks if the provided password matches the user's current password
  checkPassword: async (userId, currentPassword) => {
    const queryText = "SELECT user_password FROM users WHERE user_id = ?";
    const values = [userId];

    try {
      const result = await query(queryText, values);

      if (result.length === 0) {
        return false;
      }

      const hashedPassword = result[0].user_password;
      const passwordMatch = await comparePassword(
        currentPassword,
        hashedPassword
      );

      return passwordMatch;
    } catch (error) {
      throw error;
    }
  },

  // Updates the user's password in the database
  saveModifiedPassword: async (userId, newPassword) => {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      const updateQuery =
        "UPDATE users SET user_password = ? WHERE user_id = ?";
      const values = [hashedPassword, userId];

      const result = await query(updateQuery, values);

      return result;
    } catch (error) {
      throw error;
    }
  },
};

// Function to compare plain text password with hashed password
async function comparePassword(plainTextPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  } catch (error) {
    throw error;
  }
}

module.exports = userService;
