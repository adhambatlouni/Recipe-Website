const UserService = require("../services/UserService");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const userController = {

  // Handles user registration by checking and creating a new user
  signup: async (req, res) => {
    const userData = req.body;
    const isEmailTaken = await UserService.isEmailTaken(userData.email);
    const isUsernameTaken = await UserService.isUsernameTaken(userData.name);

    if (isEmailTaken) {
      console.log("Email exists.");
      return res.status(400).json({ message: "Email already in use" });
    }

    if (isUsernameTaken) {
      console.log("Username exists.");
      return res.status(400).json({ message: "Username already in use" });
    }

    try {
      const newUser = await UserService.createUser(
        userData.name,
        userData.email,
        userData.password
      );
      const token = jwt.sign({ userId: newUser }, process.env.SECRET_KEY, {
        expiresIn: "1hr",
      });
      return res
        .status(200)
        .json({ message: "Registration successful", userId: newUser, token });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred during registration" });
    }
  },

  // Manages user login by validating credentials and generating a token
  login: async (req, res) => {
    const { username, password } = req.body;
    try {
      const user = await UserService.validateUser(username, password);
      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1sec",
      });

      console.log("Login successful. Token:", token);
      res
        .status(200)
        .json({ message: "Login successful", token, userId: user.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "An error occurred during login" });
    }
  },

  // Saves user preferences based on user ID and category type
  savePreferences: async (req, res) => {
    const { userId, categoryType } = req.body;

    try {
      const result = await UserService.saveUserPreferences(
        userId,
        categoryType
      );

      if (result) {
        res.status(200).json({ message: "Preferences saved successfully" });
      } else {
        res.status(400).json({ message: "Failed to save preferences" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while saving preferences" });
    }
  },

  // Adds a meal to a user's list of favorites
  addFavorite: async (req, res) => {
    const { userId, meal, categoryType, mealImage } = req.body;

    try {
      const isMealAlreadyInFavorites = await UserService.isMealInFavorites(
        userId,
        meal
      );

      if (isMealAlreadyInFavorites) {
        return res.status(400).json({ message: "Meal already in favorites" });
      }

      const result = await UserService.addFavoriteMeal(
        userId,
        meal,
        categoryType,
        mealImage
      );

      if (result) {
        res
          .status(200)
          .json({ message: "Meal added to favorites successfully" });
      } else {
        res.status(400).json({ message: "Failed to add meal to favorites" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while adding meal to favorites" });
    }
  },

  // Retrieves a user's favorite meals based on user ID
  getFavoriteMeals: async (req, res) => {
    const userId = req.query.userId;
    console.log("uu" + userId);
    try {
      const favoriteMeals = await UserService.getFavoriteMeals(userId);
      res.json(favoriteMeals);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Removes a meal from a user's list of favorite meals
  removeFavoriteMeal: async (req, res) => {
    const { userId, favoritemealId } = req.params;
    try {
      const result = await UserService.removeFavoriteMeal(
        userId,
        favoritemealId
      );

      if (result) {
        res
          .status(200)
          .json({ message: "Meal removed from favorites successfully" });
      } else {
        res
          .status(400)
          .json({ message: "Failed to remove meal from favorites" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          message: "An error occurred while removing meal from favorites",
        });
    }
  },

  // Retrieves user information using the user ID
  getUserInfo: async (req, res) => {
    const userId = req.query.userId;
    try {
      const result = await UserService.getUserInfo(userId);

      if (result && result.length > 0) {
        const user = result[0];
        res.json({ user });
      } else {
        res.status(404).json({ message: "Username not found" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Updates the username for a given user ID
  updateUsername: async (req, res) => {
    const { userId, newUsername } = req.body;

    try {
      const result = await UserService.updateUsername(userId, newUsername);

      if (result) {
        res.status(200).json({ message: "Username updated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update username" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating username" });
    }
  },

  // Updates the user email for a given user ID
  updateUseremail: async (req, res) => {
    const { userId, newUseremail } = req.body;

    try {
      const result = await UserService.updateUseremail(userId, newUseremail);

      if (result) {
        res.status(200).json({ message: "Useremail updated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update useremail" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating useremail" });
    }
  },

  // Updates the user's category type based on the user ID
  updateUserCategoryType: async (req, res) => {
    const { userId, newUserCategoryType } = req.body;

    try {
      const result = await UserService.updateUserCategoryType(
        userId,
        newUserCategoryType
      );

      if (result) {
        res.status(200).json({ message: "Usercategory updated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update usercategory" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating usercategory" });
    }
  },

  // Checks if the provided password matches the user's current password for a given user ID
  isPasswordCorrect: async (req, res) => {
    const userId = req.params.userId;
    const currentPassword = req.query.currentPassword;

    try {
      const isPasswordCorrect = await UserService.checkPassword(
        userId,
        currentPassword
      );

      res.json({ isPasswordCorrect });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  // Updates the user's password for a given user ID
  updatePassword: async (req, res) => {
    const { userId, newPassword } = req.body;

    try {
      const result = await UserService.saveModifiedPassword(
        userId,
        newPassword
      );

      if (result) {
        res.status(200).json({ message: "Password updated successfully" });
      } else {
        res.status(400).json({ message: "Failed to update password" });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "An error occurred while updating password" });
    }
  },
};

module.exports = userController;
