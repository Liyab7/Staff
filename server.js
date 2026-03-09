const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const submissionSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    inclusiveVision: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const Submission = mongoose.model("Submission", submissionSchema);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.post("/api/submit", async (req, res) => {
  try {
    const { firstName, email, inclusiveVision } = req.body;

    if (!firstName || !email || !inclusiveVision) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const submission = new Submission({ firstName, email, inclusiveVision });
    await submission.save();

    res.status(201).json({ success: true, message: "Your vision has been submitted successfully!" });
  } catch (err) {
    console.error("Submission error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again later." });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
