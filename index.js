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
  // console.log("data:", data);

  try {
    const { username } = (await UserModel.findById(req.params._id)) || {};
    if (!username) return res.status(400).json({ error: "User not found" });

    const exerciseData = {
      userId: req.params._id,
      description: data.description,
      duration: parseInt(data.duration),
    };

    if (data.date && data.date.trim() !== "") {
      exerciseData.date = new Date(data.date);
    } else {
      exerciseData.date = new Date();
    }

    // Now create the document
    const newExercise = await ExerciseModel.create(exerciseData);

    // console.log("testingggRxercise:", newExercise);
    res.json({
      _id: newExercise.userId,
      username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: new Date(newExercise.date).toDateString(),
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { username } = (await UserModel.findById(req.params._id)) || {};
  if (!username) return res.status(400).json({ error: "User not found" });
  console.log("id:", userId, "username:", username);

  if (!(JSON.stringify(req.query) === "{}")) {
    console.log("query:", req.query);

    const from = new Date(req.query.from) || null;
    const to = new Date(req.query.to) || null;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;

    console.log("query data:", from, to, limit);

    let logs;

    if(req.query.from || req.query.to) {
      logs = await ExerciseModel.find({
      userId,
      date: { $gte: from, $lte: to },
    });
    } else {
      logs = await ExerciseModel.find({userId});
    }

    if (req.query.limit) {
      logs = logs.splice(0, limit);
    }

    // console.log('logs:', logs)

    const count = logs.length;

    console.log("logs count:", count);

    const response = {
      username,
      count,
      _id: userId,
      log: logs.map((entry) => {
        return {
          description: entry.description,
          duration: Number(entry.duration),
          date: entry.date.toDateString(),
        };
      }),
    };
    console.log("response:", response.username, response.count);

    return res.json(response);
  }

  const allExercises = await ExerciseModel.find({ userId });
  // console.log("allExercises:", allExercises);

  const response = {
    username,
    count: allExercises.length,
    _id: userId,
    log: allExercises.map((entry) => {
      return {
        description: entry.description,
        duration: Number(entry.duration),
        date: entry.date.toDateString(),
      };
    }),
  };

  // console.log(response.log)
  res.send(response);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
