const express = require("express");
const router = express.Router();
const User = require("../Models/userSchema");
const { generateToken, jwtAuthMiddleware } = require("../jwt");
const Candidate = require("../Models/candidateSchema");

// Function to check if the user is an admin
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === "admin"; // Ensures it returns false explicitly
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Admin-only route to add a candidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin rights" });
    }

    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();

    console.log("Candidate added successfully");
    res.status(201).json({ response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Admin updates candidate details
router.put("/:candidateId", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id))) {
      return res.status(403).json({ message: "User does not have admin rights" });
    }

    const candidateId = req.params.candidateId;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(candidateId, updatedCandidateData, {
      new: true,
      runValidators: true,
    });

    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    console.log("Candidate data updated successfully");
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin deletes a candidate
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

module.exports = router;
