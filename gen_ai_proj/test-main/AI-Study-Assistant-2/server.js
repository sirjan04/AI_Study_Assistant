// server.js — Main entry point for AI Study Assistant
// =====================================================
// Load environment variables from .env file FIRST
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');

// Import Models
const User = require('./models/User');
const Question = require('./models/Question');

// ─── APP SETUP ────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

// ─── TEMPLATE ENGINE ──────────────────────────────────────────────────────────
app.set('view engine', 'ejs');                      // Use EJS for templates
app.set('views', path.join(__dirname, 'views'));     // Views folder

// ─── MIDDLEWARE ───────────────────────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));     // Parse form data
app.use(express.json());                             // Parse JSON
app.use(methodOverride('_method'));                  // Support PUT/DELETE in forms
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallbacksecret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Flash messages (success/error notifications)
app.use(flash());

// ─── GLOBAL VARIABLES MIDDLEWARE ──────────────────────────────────────────────
// Makes these variables available in ALL EJS templates
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.currentUser = req.session.userId ? req.session.user : null;
  next();
});

// ─── AUTHENTICATION MIDDLEWARE ────────────────────────────────────────────────
// Protect routes — redirects to login if not logged in
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  req.flash('error_msg', 'Please login to access this page');
  res.redirect('/login');
}

// ─── DATABASE CONNECTION ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected Successfully');
    // Seed sample questions if the collection is empty
    await seedQuestions();
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────
// Adds sample quiz questions to the database on first run
async function seedQuestions() {
  const count = await Question.countDocuments();
  if (count > 0) return; // Don't seed if questions already exist

  const sampleQuestions = [
    {
      questionText: 'What does CPU stand for?',
      options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'],
      correctAnswerIndex: 0,
      category: 'Computer Science',
      difficulty: 'Easy',
      explanation: 'CPU stands for Central Processing Unit — the brain of a computer.'
    },
    {
      questionText: 'Which planet is known as the Red Planet?',
      options: ['Venus', 'Jupiter', 'Mars', 'Saturn'],
      correctAnswerIndex: 2,
      category: 'Science',
      difficulty: 'Easy',
      explanation: 'Mars is called the Red Planet because of iron oxide (rust) on its surface.'
    },
    {
      questionText: 'What is the time complexity of Binary Search?',
      options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'],
      correctAnswerIndex: 2,
      category: 'Computer Science',
      difficulty: 'Medium',
      explanation: 'Binary search divides the search space in half each step, giving O(log n) complexity.'
    },
    {
      questionText: 'Who invented the World Wide Web?',
      options: ['Bill Gates', 'Tim Berners-Lee', 'Steve Jobs', 'Linus Torvalds'],
      correctAnswerIndex: 1,
      category: 'Technology',
      difficulty: 'Easy',
      explanation: 'Tim Berners-Lee invented the WWW in 1989 while working at CERN.'
    },
    {
      questionText: 'What does HTML stand for?',
      options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Hyper Transfer Markup Logic', 'Home Tool Markup Language'],
      correctAnswerIndex: 0,
      category: 'Web Development',
      difficulty: 'Easy',
      explanation: 'HTML stands for HyperText Markup Language — the standard language for web pages.'
    },
    {
      questionText: 'Which data structure uses LIFO (Last In, First Out)?',
      options: ['Queue', 'Array', 'Stack', 'Linked List'],
      correctAnswerIndex: 2,
      category: 'Computer Science',
      difficulty: 'Medium',
      explanation: 'A Stack uses LIFO — the last element added is the first one removed.'
    },
    {
      questionText: 'What is the output of 2 ** 10 in Python?',
      options: ['20', '100', '512', '1024'],
      correctAnswerIndex: 3,
      category: 'Programming',
      difficulty: 'Medium',
      explanation: '2 ** 10 means 2 raised to the power of 10, which equals 1024.'
    },
    {
      questionText: 'What does SQL stand for?',
      options: ['Simple Query Language', 'Structured Query Language', 'Standard Question Logic', 'System Query Layout'],
      correctAnswerIndex: 1,
      category: 'Database',
      difficulty: 'Easy',
      explanation: 'SQL stands for Structured Query Language, used to manage relational databases.'
    },
    {
      questionText: 'Which of these is NOT a JavaScript framework?',
      options: ['React', 'Angular', 'Django', 'Vue'],
      correctAnswerIndex: 2,
      category: 'Web Development',
      difficulty: 'Medium',
      explanation: 'Django is a Python web framework. React, Angular, and Vue are JavaScript frameworks.'
    },
    {
      questionText: 'What is the value of π (pi) approximately?',
      options: ['2.718', '3.14159', '1.618', '1.414'],
      correctAnswerIndex: 1,
      category: 'Mathematics',
      difficulty: 'Easy',
      explanation: 'Pi (π) is approximately 3.14159 — the ratio of a circle\'s circumference to its diameter.'
    }
  ];

  await Question.insertMany(sampleQuestions);
  console.log('🌱 Sample questions seeded to database!');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.render('home', { title: 'AI Study Assistant' });
});

// ─── REGISTER ─────────────────────────────────────────────────────────────────
app.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    req.flash('error_msg', 'Please fill in all fields');
    return res.redirect('/register');
  }
  if (password !== confirmPassword) {
    req.flash('error_msg', 'Passwords do not match');
    return res.redirect('/register');
  }
  if (password.length < 6) {
    req.flash('error_msg', 'Password must be at least 6 characters');
    return res.redirect('/register');
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error_msg', 'Email is already registered');
      return res.redirect('/register');
    }

    // Create new user (password is hashed automatically via pre-save hook)
    const user = await User.create({ name, email, password });

    req.flash('success_msg', '🎉 Account created! Please login.');
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    res.redirect('/register');
  }
});

// ─── LOGIN ────────────────────────────────────────────────────────────────────
app.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { title: 'Login' });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    req.flash('error_msg', 'Please enter email and password');
    return res.redirect('/login');
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Invalid email or password');
      return res.redirect('/login');
    }

    // Save user info to session
    req.session.userId = user._id;
    req.session.user = { name: user.name, email: user.email, id: user._id };

    req.flash('success_msg', `Welcome back, ${user.name}! 👋`);
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Login failed. Please try again.');
    res.redirect('/login');
  }
});

// ─── LOGOUT ───────────────────────────────────────────────────────────────────
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const totalQuizzes = user.quizScores.length;
    const bestScore = user.getBestScore();
    const avgScore = user.getAvgScore();
    const totalQuestions = await Question.countDocuments();

    res.render('dashboard', {
      title: 'Dashboard',
      user,
      totalQuizzes,
      bestScore,
      avgScore,
      totalQuestions
    });
  } catch (err) {
    console.error(err);
    res.redirect('/login');
  }
});

// ─── CHATBOT ──────────────────────────────────────────────────────────────────
app.get('/chatbot', isAuthenticated, (req, res) => {
  res.render('chatbot', { title: 'AI Chatbot' });
});

// Chatbot message processing endpoint
app.post('/chatbot/message', isAuthenticated, (req, res) => {
  const { message } = req.body;
  const response = getChatbotResponse(message);
  res.json({ response, timestamp: new Date().toLocaleTimeString() });
});

// ─── KEYWORD-BASED CHATBOT LOGIC ─────────────────────────────────────────────
// NOTE: Replace this with OpenAI API call for production use!
function getChatbotResponse(message) {
  const msg = message.toLowerCase().trim();

  // Greetings
  if (msg.match(/\b(hi|hello|hey|howdy|greetings)\b/)) {
    const greetings = [
      "Hello! 👋 I'm your AI Study Assistant. What would you like to learn today?",
      "Hi there! Ready to study? Ask me anything about your subjects!",
      "Hey! Great to see you. What topic can I help you with?"
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }

  // JavaScript
  if (msg.includes('javascript') || msg.includes('js')) {
    return "📘 **JavaScript** is a versatile programming language used for web development. Key concepts include:\n• Variables (let, const, var)\n• Functions & Arrow Functions\n• DOM Manipulation\n• Promises & Async/Await\n• ES6+ Features\n\nWant me to explain any of these in detail?";
  }

  // Python
  if (msg.includes('python')) {
    return "🐍 **Python** is a beginner-friendly, high-level language. Great for:\n• Data Science & ML (NumPy, Pandas)\n• Web Development (Django, Flask)\n• Automation & Scripting\n• AI & Deep Learning\n\nPython uses indentation instead of curly braces. What aspect do you want to explore?";
  }

  // Machine Learning / AI
  if (msg.match(/\b(machine learning|ml|artificial intelligence|ai|deep learning|neural)\b/)) {
    return "🤖 **Machine Learning** is a subset of AI where machines learn from data. Key concepts:\n• Supervised Learning (labeled data)\n• Unsupervised Learning (clustering)\n• Reinforcement Learning (rewards)\n• Neural Networks & Deep Learning\n• Popular libraries: TensorFlow, PyTorch, Scikit-learn\n\nWhich area would you like to dive into?";
  }

  // Data Structures
  if (msg.match(/\b(data structure|array|linked list|stack|queue|tree|graph|hash)\b/)) {
    return "📚 **Data Structures** organize data efficiently. Common ones:\n• **Array** - Fixed-size sequential storage\n• **Linked List** - Dynamic chain of nodes\n• **Stack** - LIFO (Last In, First Out)\n• **Queue** - FIFO (First In, First Out)\n• **Tree** - Hierarchical structure\n• **Hash Table** - Key-value pairs\n\nWhich one should we explore deeper?";
  }

  // Algorithms
  if (msg.match(/\b(algorithm|sorting|searching|big o|complexity)\b/)) {
    return "⚙️ **Algorithms** are step-by-step problem solutions. Key areas:\n• **Sorting**: Bubble, Merge, Quick Sort\n• **Searching**: Linear O(n), Binary O(log n)\n• **Big O Notation**: Measures time/space complexity\n• **Dynamic Programming**: Optimal substructure problems\n• **Greedy Algorithms**: Locally optimal choices\n\nWant to understand any of these better?";
  }

  // Database
  if (msg.match(/\b(database|sql|mongodb|nosql|mysql|postgresql)\b/)) {
    return "🗄️ **Databases** store and manage data. Two main types:\n• **SQL** (Relational): MySQL, PostgreSQL, SQLite — use tables & joins\n• **NoSQL** (Non-relational): MongoDB, Redis, Cassandra — flexible schemas\n\n**MongoDB** (used in this app!) stores data as JSON-like documents.\n\nWhat database concept can I explain?";
  }

  // HTML / CSS
  if (msg.match(/\b(html|css|web|frontend|bootstrap)\b/)) {
    return "🌐 **Web Development** fundamentals:\n• **HTML** - Structure of web pages\n• **CSS** - Styling and layout\n• **JavaScript** - Interactivity\n• **Bootstrap** - CSS framework for responsive design\n• **Responsive Design** - Works on all screen sizes\n\nThis app uses all of these! Need help with a specific topic?";
  }

  // Mathematics
  if (msg.match(/\b(math|mathematics|calculus|algebra|statistics|probability)\b/)) {
    return "🔢 **Mathematics** is the foundation of computing! Topics:\n• **Algebra** - Variables and equations\n• **Statistics** - Data analysis and probability\n• **Calculus** - Derivatives and integrals (used in ML!)\n• **Discrete Math** - Logic, sets, graphs\n• **Linear Algebra** - Vectors and matrices (core of AI)\n\nWhich branch do you need help with?";
  }

  // Quiz related
  if (msg.match(/\b(quiz|test|exam|practice|questions)\b/)) {
    return "📝 **Ready to test your knowledge?** \n\nHead to the **Quiz** section from your dashboard! We have questions on:\n• Computer Science\n• Web Development\n• Mathematics\n• Science\n• Programming\n\nEach quiz shows your score and tracks your progress. Good luck! 🍀";
  }

  // Study tips
  if (msg.match(/\b(study|tips|how to study|learn|memorize)\b/)) {
    return "📖 **Top Study Tips** to maximize learning:\n1. **Pomodoro Technique** - 25 min study, 5 min break\n2. **Active Recall** - Test yourself instead of just re-reading\n3. **Spaced Repetition** - Review material at increasing intervals\n4. **Teach others** - Feynman Technique for deep understanding\n5. **Mind Maps** - Visual connections between concepts\n6. **Practice Problems** - Apply knowledge, don't just memorize\n\nConsistency beats intensity. Even 30 minutes daily is powerful! 💪";
  }

  // Help
  if (msg.match(/\b(help|what can you do|commands|topics)\b/)) {
    return "🌟 **I can help you with:**\n• Programming (JavaScript, Python, Java, C++)\n• Web Development (HTML, CSS, React, Node.js)\n• Data Structures & Algorithms\n• Databases (SQL, MongoDB)\n• Machine Learning & AI concepts\n• Mathematics & Statistics\n• Study tips & techniques\n\nJust ask any question and I'll do my best to explain it clearly!";
  }

  // Bye / Thanks
  if (msg.match(/\b(bye|goodbye|thanks|thank you|thx)\b/)) {
    return "You're welcome! Keep studying hard! 🎓 Come back anytime you need help. See you! 👋";
  }

  // Default response
  return `🤔 That's an interesting question about **"${message}"**!\n\nI'm currently in learning mode and may not know everything yet. Try asking about:\n• Programming languages\n• Data Structures\n• Algorithms\n• Web Development\n• Databases\n• Study tips\n\n*(For smarter AI responses, integrate the OpenAI API in the /chatbot/message route!)*`;
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────────
app.get('/quiz', isAuthenticated, async (req, res) => {
  try {
    // Fetch 10 random questions from database
    const questions = await Question.aggregate([{ $sample: { size: 10 } }]);
    res.render('quiz', { title: 'Quiz', questions });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Could not load quiz questions');
    res.redirect('/dashboard');
  }
});

// Process quiz submission
app.post('/quiz/submit', isAuthenticated, async (req, res) => {
  try {
    const { answers } = req.body; // Object: { questionId: selectedIndex }

    if (!answers || typeof answers !== 'object') {
      req.flash('error_msg', 'Invalid quiz submission');
      return res.redirect('/quiz');
    }

    const questionIds = Object.keys(answers);
    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    const results = questions.map(q => {
      const selected = parseInt(answers[q._id.toString()]);
      const isCorrect = selected === q.correctAnswerIndex;
      if (isCorrect) score++;
      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswerIndex: q.correctAnswerIndex,
        selectedIndex: selected,
        isCorrect,
        explanation: q.explanation
      };
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    // Save score to user's record
    await User.findByIdAndUpdate(req.session.userId, {
      $push: {
        quizScores: { score, total, percentage }
      }
    });

    res.render('quiz-result', {
      title: 'Quiz Results',
      score,
      total,
      percentage,
      results
    });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Error processing quiz');
    res.redirect('/quiz');
  }
});

// ─── PROGRESS ─────────────────────────────────────────────────────────────────
app.get('/progress', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findById(req.session.userId);
    const scores = user.quizScores.sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken));

    res.render('progress', {
      title: 'My Progress',
      user,
      scores,
      bestScore: user.getBestScore(),
      avgScore: user.getAvgScore(),
      totalQuizzes: scores.length
    });
  } catch (err) {
    console.error(err);
    res.redirect('/dashboard');
  }
});

// ─── 404 HANDLER ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ─── START SERVER ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 AI Study Assistant is running!`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
  console.log(`🔧 Press Ctrl+C to stop\n`);
});
