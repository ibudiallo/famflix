const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { KEYS } = require("../lib/util");

const generateSessionToken = async (req, res, token) => {
  const sessionToken = uuidv4();
  await req.redis.setUserJWTSession(sessionToken, token);
  res.cookie(KEYS.USER_SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 3600, // 30days
  });
  return token;
};

const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await req.userDb.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Create user
    const user = await req.userDb.createUser({
      email,
      password,
      fullName,
    });

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      req.JWT_SECRET,
      {
        expiresIn: KEYS.JWT_TOKEN_EXPIRY,
      }
    );

    const sessionToken = uuidv4();
    await req.redis.setUserJWTSession(sessionToken, token);
    res.cookie(KEYS.USER_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 3600, // 30days
    });

    res.status(201).json({
      message: "User registered successfully",
      userId: user.userId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find user
    const user = await req.userDb.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      req.JWT_SECRET,
      {
        expiresIn: KEYS.JWT_TOKEN_EXPIRY,
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
};

const checkSession = async (req, res) => {
  const sessionToken = req.cookies[KEYS.USER_SESSION_COOKIE];
  if (!sessionToken) {
    return res.json({ loggedIn: false });
  }
  const token = await req.redis.getUserJWTBySession(sessionToken)

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ loggedIn: false });
    }
    res.json({ loggedIn: true });
  });
};

module.exports = {
  register,
  login,
  checkSession,
};
