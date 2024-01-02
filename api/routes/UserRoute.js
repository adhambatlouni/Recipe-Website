const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const UserService = require("../services/UserService");
const authenticateToken = require("./middleware");

// User registration route
router.post("/signup", userController.signup);

// User login route
router.post("/login", userController.login); 

// Check if the username is taken
router.get("/checkUsername", async (req, res) => {
  const username = req.query.username;
  const isTaken = await UserService.isUsernameTaken(username);
  res.json({ isTaken });
});

// Check if the email is taken
router.get("/checkEmail", authenticateToken, async (req, res) => {
  const email = req.query.email;
  const isTaken = await UserService.isEmailTaken(email);
  res.json({ isTaken });
});

// Check if the provided password is correct for the user
router.get("/checkPassword", async (req, res) => {
  const userId = req.user.id;
  const currentPassword = req.query.password;

  try {
    const isPasswordCorrect = await UserService.checkPassword(
      userId,
      currentPassword
    );
    res.json({ isPasswordCorrect });
  } catch (error) {
    console.error("Error checking password:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add user preferences route
router.post(
  "/addpreferences",
  authenticateToken,
  userController.savePreferences
); 

// Add favorite meal route
router.post("/addfavorite", authenticateToken, userController.addFavorite); 

// Check if a meal is in the user's favorites
router.get("/isMealInFavorites", authenticateToken, async (req, res) => {
  const mealName = req.query.mealName;
  const userId = req.query.userId;

  try {
    const isFavorite = await UserService.isMealInFavorites(userId, mealName); 
    res.json({ isFavorite });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's favorite meals route
router.get(
  "/getFavoriteMeals",
  authenticateToken,
  userController.getFavoriteMeals
); 

// Remove meal from favorites route
router.delete(
  "/removefavorite/:userId/:favoritemealId",
  authenticateToken,
  userController.removeFavoriteMeal
); 

// Get user information route
router.get("/getUserInfo", authenticateToken, userController.getUserInfo); 

// Update username route
router.put("/updateUsername", authenticateToken, userController.updateUsername); 

// Update user email route
router.put(
  "/updateUseremail",
  authenticateToken,
  userController.updateUseremail
); 

// Update user category type route
router.put(
  "/updateUserCategoryType",
  authenticateToken,
  userController.updateUserCategoryType
); 

// Check if provided password matches user's current password route
router.get(
  "/checkPassword/:userId",
  authenticateToken,
  userController.isPasswordCorrect
); 

// Update user password route
router.put(
  "/updateUserPassword",
  authenticateToken,
  userController.updatePassword
); 

module.exports = router;
