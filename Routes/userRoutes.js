const express = require("express");
const router = express.Router();
const User = require("../Models/userSchema");
const { generateToken, jwtAuthMiddleware } = require("../jwt");

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
    const user = await User.findOne({ adhaarCardNumber: adhaarCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      res.status(400).json({ error: "Username or Password is wrong" });
    }
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error " });
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
        const userId = req.params.id; // Extract the id from the token
        const { currentPassword, newPassword } = req.body; // Extract current and new password from request body
        const user = await User.findById(userId);

        if (!user || !(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        user.password = newPassword;
        await user.save();
        console.log('Password has been updated');

        res.status(200).json({ message: 'Password updated successfully' }); // Add response
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}); 


// list of candidates
router.get("/candidatesCount", (req, res) => {});

// vot for the candidate
router.put("/vote/:candidateId", (req, res) => {});

// user change password
router.put("/user/id", (req, res) => {});


module.exports=router;