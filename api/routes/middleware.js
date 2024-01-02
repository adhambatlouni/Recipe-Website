const jwt = require("jsonwebtoken"); 

// Middleware function to verify the token in the request header
const verifyToken = (req, res, next) => {
  // Extracting the token from the request header
  const token = req.headers.authorization; 
  // Logging the received token
  console.log("Received token:", token); 

  // Checking if the token is missing
  if (!token) {
    console.log("Token is missing.");
    return res.status(403).json({ message: "Token is missing" });
  }

  // Verifying the token using the secret key
  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log("Token verification error:", err);

      // Handling different error scenarios during token verification
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token has expired" }); 
      } else {
        return res.status(401).json({ message: "Unauthorized" }); 
      }
    }

    // If token verification is successful, 
    // set the decoded user ID in the request object and proceed to the next middleware or route handler
    req.userId = decoded.userId;
    next();
  });
};

module.exports = verifyToken; 
