const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected')) 
  .catch(err => console.error('MongoDB connection error:', err));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
  

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
  date: Date,
  userId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }
}); 

// Create exercise model
const Exercise = mongoose.model('Exercise', exerciseSchema);

// Create user
app.post("/api/users", async (req, res) => {
  const {username} = req.body;

  try {
    const newUser = new User({ username });
    await newUser.save();
    res.json({ username:newUser.username, _id: newUser._id });
  } catch (error) {
    res.json({ error: "Unable to create new user" });
  }
});

// Get all the users
app.get("/api/users", async (req, res) => {
  try {
    const usersArray = await User.find({}, "username _id");
    res.json(usersArray);
  } catch (error) {
    res.json({ error: "Unable to fetch all users" });
  }
});

// Add exercise to a user with given id
app.post("/api/users/:_id/exercises", async (req, res) => {
  const {description, duration, date} = req.body;
  const userId = req.params._id;
  const exerciseDate = date ? new Date(date) : new Date();

  try {
    const user = await User.findById(userId);

    if(!user) {
      res.json({ error: "User not found" });
    }

    const newExercise = new Exercise({ 
      userId, 
      description, 
      duration, 
      date: exerciseDate 
    });
    await newExercise.save();

    res.json( {
      username: user.username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: user._id
    });
  } catch (error) {
    res.json({ error: "Unable to add exercise to user id" });
  }
});

// Get full exercise log of a user
app.get("/api/users/:_id/logs", async (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;


  try {
    const user = await User.findById(userId);

    if(!user) {
      res.json({ error: "User not found" });
    }

    // Optional date filtering
    let query = { userId: userId };
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    } 

    let userExercises = Exercise.find(query);
    if (limit) {
      userExercises = userExercises.limit(parseInt(limit));
    }
    userExercises = await userExercises.exec();


    const logEntries = userExercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));
    
    const logLength = userExercises.length;
    console.log(logLength);

    res.json({
      username: user.username,
      _id: user._id,
      count: userExercises.length,
      log: logEntries
    })
  } catch (error) {
    res.json({ error: "Unable to fetch users exercise logs" });
  }
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
