// models/Question.js
// This model defines quiz questions stored in MongoDB

const mongoose = require('mongoose');

// Define the Question Schema
const QuestionSchema = new mongoose.Schema({
  // The question text
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },

  // Four multiple-choice options
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (arr) {
        return arr.length === 4; // Must have exactly 4 options
      },
      message: 'A question must have exactly 4 options'
    }
  },

  // Index of the correct answer (0, 1, 2, or 3)
  correctAnswerIndex: {
    type: Number,
    required: true,
    min: 0,
    max: 3
  },

  // Subject category (e.g., Math, Science, History)
  category: {
    type: String,
    default: 'General',
    trim: true
  },

  // Difficulty level
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },

  // Brief explanation of the correct answer
  explanation: {
    type: String,
    default: ''
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
