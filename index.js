const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create user schema
const userSchema = new mongoose.Schema({ 
  username: String
}); 

// Create user model
const User = mongoose.model('User', userSchema);

// Create exercise schema
const exerciseSchema = new mongoose.Schema({ 
  username: String,
  description: String,
  duration: Number,
  date: Date
}); 

// Create exercise model
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Create user
app.post("/api/users", (req, res) => {
  const username = req.body.username;

  if (username) {
    const newUser = new User({ username });
    newUser.save();
    res.json({ username:newUser.username, _id: newUser._id });
  } else {
    res.json({ error: "Unable to create new user" });
  }
});

// Get all the users
app.get("/api/users", (req, res) => {
  const usersArray = User.find({}, "username _id");
  
  if(usersArray.length > 0) {
    res.json(usersArray);
  } else {
    res.json({ error: "Unable to fetch all users" });
  }
});

// Add exercise to a user with given id
app.post("/api/users/:_id/exercises", (req, res) => {
  const {description, duration, date} = req.body;
  const id = req.params._id;
  const exerciseDate= date ? new Date(date) : new Date();

  const findUser = User.findById(id);

  if (!findUser) {
    res.json({ error: "User not found" });
  }

  const newExercise = new Exercise({ userId: _id, description, duration, date: exerciseDate });
  newExercise.save();

  if(newExercise) {
    res.json( {
      username: findUser.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: findUser.id
    });
  } else {
    res.json({ error: "Unable to add exercise" })
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
