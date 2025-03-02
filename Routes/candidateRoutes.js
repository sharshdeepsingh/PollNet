const express = require("express");
const router = express.Router();
const User = require("../Models/userSchema");
const { generateToken, jwtAuthMiddleware } = require("../jwt");
const Candidate = require("../Models/candidateSchema");

// Function to check if the user is an admin
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === "admin";
  } catch (err) {
    console.error(err);
    return false;
  }
};

// 🔹 Admin-only route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin rights" });
    }

    const newCandidate = new Candidate(req.body);
    const response = await newCandidate.save();

    console.log("Candidate added successfully");
    res.status(201).json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔹 Admin updates candidate details
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin rights" });
    }

    const candidateId = req.params.candidateId;
    const updatedCandidate = await Candidate.findByIdAndUpdate(candidateId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCandidate) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate data updated successfully");
    res.status(200).json(updatedCandidate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Admin deletes a candidate
router.delete("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin rights" });
    }

    const candidateId = req.params.candidateId;
    const response = await Candidate.findByIdAndDelete(candidateId);

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate deleted successfully");
    res.status(200).json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 🔹 Voting Route (Fix)
router.post("/vote/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    const { candidateId } = req.params;
    const userId = req.user.id;

    const candidate = await Candidate.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVoted) {
      return res.status(403).json({ message: "User can vote only once" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Admins don't have voting rights" });
    }

    candidate.vote.push({ user: userId });
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: "Vote cast successfully" });
  } catch (err) {
    console.error("Voting Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


// 🔹 Get Vote Counts (Fix)
router.get("/vote/count", async (req, res) => {
  try {
    const candidates = await Candidate.find().lean();

    const totalVotes = candidates.map((data) => ({
      party: data.party,
      count: data.vote.length, // 🔹 Calculate vote count dynamically
    }));

    return res.status(200).json(totalVotes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
