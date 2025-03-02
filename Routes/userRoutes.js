const express = require("express");
const router = express.Router();
const User = require("../Models/userSchema");
const { generateToken, jwtAuthMiddleware } = require("../jwt");
const Candidate=require('../Models/candidateSchema')

// signup
router.post("/signup", async (req, res) => {
  try {
    //req.body se data collect
    const data = req.body;
    // creating an instance of the new user
    const newUser = new User(data);

    //db may save
    const response = await newUser.save();
    console.log("data is saved");
    //payload for jwt generation
    const payload = {
      id: response.id,
    };
    console.log(JSON.stringify(payload));
    const token = generateToken(payload);
    console.log("Token Is ", token);
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error " });
  }
});

//  login/signin
router.post("/login", async (req, res) => {
  try {
    const { adhaarCardNumber, password } = req.body;
    const user = await User.findOne({ adhaarCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: "Username or Password is wrong" }); // Added return
    }

    const payload = { id: user.id };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// user sees his porfile
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
    try {
      const userData = req.user;
      const userId = userData.id;
  
      // Fetch user from database
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      res.status(200).json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
//change the password
router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
      const userId = req.user.id; // Corrected this
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(userId);
      if (!user || !(await user.comparePassword(currentPassword))) {
          return res.status(401).json({ error: 'Invalid username or password' });
      }

      user.password = newPassword; // But it should be hashed before saving!
      await user.save();
      res.status(200).json({ message: 'Password updated successfully' });
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
  }
});


// list of candidates
router.get("/candidates", async (req, res) => {
  try {
    const candidates = await Candidate.find();

    if (!candidates || candidates.length === 0) {
      return res.status(404).json({ message: "No candidates found" });
    }

    res.status(200).json({ candidates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});



module.exports=router;