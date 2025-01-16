const jwt = require("jsonwebtoken");
const { KEYS } = require("../lib/util");

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    if (!req.cookies || !req.cookies[KEYS.USER_SESSION_COOKIE]) {
      return res.status(401).json({ error: "No token provided" });
    }
    const sessionToken = req.cookies[KEYS.USER_SESSION_COOKIE];
    const token = await req.redis.getUserJWTBySession(sessionToken)

    const decoded = jwt.verify(token, req.JWT_SECRET);

    // Get user from database
    const user = await req.userDb.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    next(error);
  }
};

module.exports = {
  authMiddleware,
  requireRole,
};
