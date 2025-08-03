const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const ExerciseModel = require("./models/exerciseModel");
const UserModel = require("./models/userModel");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Create new user
app.post("/api/users", async (req, res) => {
  const data = req.body;
  console.log(data);

  if (!data.username) return res.json({ error: "Invalid data" });

  const existing = await UserModel.findOne({ username: data.username });
  if (existing) {
    console.log("Notice -> User " + existing.username + " exists");

    return res.json({
      _id: existing._id,
      username: existing.username,
    });
  }

  const newUser = await UserModel.create({ username: data.username });

  res.json({
    username: newUser.username,
    _id: newUser._id,
  });
});

//  Get all users
app.get("/api/users", async (req, res) => {
  const users = await UserModel.find({});

  res.send(users);
});

// Add exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  const data = req.body;

  try {
    const { username } = (await UserModel.findById(req.params._id)) || {};
    if (!username) return res.status(400).json({ error: "User not found" });

    const newExercise = await ExerciseModel.create({
      userId: req.params._id,
      description: data.description,
      duration: parseInt(data.duration),
    });

    console.log("newRxercise:", newExercise);
    res.json({
      _id: newExercise.userId,
      username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toString().toDateString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { username } = (await UserModel.findById(req.params._id)) || {};
  if (!username) return res.status(400).json({ error: "User not found" });

  if (req.query) {
    const from = new Date(req.query.from);
    const to = new Date(req.query.to);
    const limit = req.query.limit;

    const logs = await ExerciseModel.find({
      date: { $gte: from, $lte: to },
    }).limit(limit);

    const count = response.length;

    const response = {
      username,
      count,
      _id,
      log: logs.map((entry) => {
        return {
          descrition: entry.description,
          duration: Number(entry.duration),
          date: entry.date.toString().toDateString()
        };
      }),
    };

    return res.json(response);
  }

  const allExercises = await ExerciseModel.find({ userId });

  res.send(allExercises);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
