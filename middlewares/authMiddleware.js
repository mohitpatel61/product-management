const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]; // Get Authorization header
  const token = authHeader && authHeader.split(" ")[1]; // Extract Bearer token
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid token" });
    }
    req.user = user; // Attach decoded user data to request
    next(); // Continue to the next middleware or route
  });
};

module.exports = authenticateToken;
