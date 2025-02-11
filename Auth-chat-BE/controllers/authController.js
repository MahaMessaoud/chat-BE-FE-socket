const bcrypt = require("bcryptjs");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// register
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    res.status(201).json({ message: "User registered" });
  } catch (error) {
    res.status(400).json({ error: "Email already exists" });
  }
};

// login
// exports.login = async (req, res) => {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });

//     if (!user || !(await bcrypt.compare(password, user.password))) {
//         return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     res.json({ token: generateToken(user._id) });
// };
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Generate token with username in payload
  const token = generateToken(user._id, user.username); // Pass username to generateToken
  res.json({ token });
};
// Profil utilisateur protégé
exports.getProfile = async (req, res) => {
  res.json(req.user);
};
