import http from "../http-common";

// Function to generate headers with Authorization token and Content-Type
const generateHeaders = (token) => {
  return {
    Authorization: `${token}`,
    "Content-Type": "application/json",
  };
};

// Function to make requests with custom headers
const requestWithHeaders = async (method, url, data, token) => {
  const headers = generateHeaders(token);
  try {
    const response = await http.request({
      method,
      url,
      data,
      headers,
    });
    console.log("Request:", response.config);
    console.log("Headers:", response.config.headers);
    return response;
  } catch (error) {
    throw error;
  }
};

const UserService = {
  // Making a login request with custom headers
  login: async (user) => {
    return requestWithHeaders("post", "/user/login", user);
  },

  // Making a signup request with custom headers
  signup: async (user) => {
    return requestWithHeaders("post", "/user/signup", user);
  },

  // Function to check username with authentication token
  checkUsername: (username, token) => {
    return requestWithHeaders(
      "get",
      `/user/checkUsername?username=${username}`,
      null,
      token
    );
  },

  // Function to check email with authentication token
  checkEmail: (email, token) => {
    return requestWithHeaders(
      "get",
      `/user/checkEmail?email=${email}`,
      null,
      token
    );
  },

  // Function to save user preferences with authentication token
  saveUserPreferences: (userpreferences, token) => {
    return requestWithHeaders(
      "post",
      "/user/addpreferences",
      userpreferences,
      token
    );
  },

  // Function to add a meal to favorites with authentication token  
  addMealToFavorites: (mealInfo, token) => {
    return requestWithHeaders("post", "/user/addfavorite", mealInfo, token);
  },

  // Function to check if a meal is in favorites with authentication token
  checkMealInFavorites: (userId, mealName, token) => {
    return requestWithHeaders(
      "get",
      `/user/isMealInFavorites?userId=${userId}&mealName=${mealName}`,
      null,
      token
    );
  },

  // Function to get favorite meals for a user with authentication token
  getFavoriteMeals: (userId, token) => {
    return requestWithHeaders(
      "get",
      `/user/getFavoriteMeals?userId=${userId}`,
      null,
      token
    );
  },

  // Function to remove a favorite meal for a user with authentication token
  removeFavoriteMeal: (userId, favoritemealId, token) => {
    const headers = {
      Authorization: `${token}`,
      "Content-Type": "application/json",
    };

    return http.delete(`/user/removefavorite/${userId}/${favoritemealId}`, {
      headers,
    });
  },

  // Function to get user information with authentication token
  getUserInfo: (userId, token) => {
    return requestWithHeaders(
      "get",
      `/user/getUserInfo?userId=${userId}`,
      null,
      token
    );
  },

  // Function to save modified username with authentication token
  saveModifiedUsername: (userId, newUsername, token) => {
    const data = { userId, newUsername };
    return requestWithHeaders("put", "/user/updateUsername", data, token);
  },

  // Function to save modified email with authentication token
  saveModifiedEmail: (userId, newUseremail, token) => {
    const data = { userId, newUseremail };
    return requestWithHeaders("put", "/user/updateUseremail", data, token);
  },

  // Function to save modified category type with authentication token
  saveModifiedCategoryType: (userId, newUserCategoryType, token) => {
    const data = { userId, newUserCategoryType };
    return requestWithHeaders(
      "put",
      "/user/updateUserCategoryType",
      data,
      token
    );
  },

  // Function to check password with authentication token
  checkPassword: (userId, currentPassword, token) => {
    const headers = generateHeaders(token);
    const params = { params: { currentPassword }, headers };
    return http.get(`/user/checkPassword/${userId}`, params);
  },

  // Function to save modified password with authentication token
  saveModifiedPassword: (userId, newPassword, token) => {
    const data = { userId, newPassword };
    return requestWithHeaders("put", "/user/updateUserPassword", data, token);
  },
};

export default UserService;
