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

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
