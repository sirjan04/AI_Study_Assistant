// models/User.js
// This model defines the structure of a User in our database

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema
const UserSchema = new mongoose.Schema({
  // User's full name
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  // User's email (must be unique)
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },

  // Hashed password (never store plain text!)
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  // Quiz scores history
  quizScores: [
    {
      score: Number,
      total: Number,
      percentage: Number,
      dateTaken: { type: Date, default: Date.now }
    }
  ],

  // Account creation date
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ---- MIDDLEWARE ----
// Hash password BEFORE saving to database
UserSchema.pre('save', async function (next) {
  // Only hash if password was modified
  if (!this.isModified('password')) return next();

  try {
    // Generate salt (10 rounds is a good balance of security & speed)
    const salt = await bcrypt.genSalt(10);
    // Hash the password with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// ---- METHODS ----
// Method to compare entered password with hashed password in DB
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get the best quiz score
UserSchema.methods.getBestScore = function () {
  if (this.quizScores.length === 0) return 0;
  return Math.max(...this.quizScores.map(s => s.percentage));
};

// Method to get average quiz score
UserSchema.methods.getAvgScore = function () {
  if (this.quizScores.length === 0) return 0;
  const total = this.quizScores.reduce((sum, s) => sum + s.percentage, 0);
  return Math.round(total / this.quizScores.length);
};

module.exports = mongoose.model('User', UserSchema);
