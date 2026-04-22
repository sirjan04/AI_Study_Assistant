# 🎓 AI Study Assistant

A modern, full-stack AI-powered study web application built with **Node.js**, **Express**, **MongoDB**, **EJS**, and **Bootstrap 5**.

---

## 📁 Project Structure

```
AI-Study-Assistant/
├── server.js                  ← Main Express app + all routes
├── package.json               ← Dependencies
├── .env                       ← Environment variables (MongoDB URI, session secret)
│
├── models/
│   ├── User.js                ← User schema (name, email, hashed password, quiz scores)
│   └── Question.js            ← Quiz question schema (text, options, correct answer)
│
├── views/
│   ├── home.ejs               ← Landing page with hero section
│   ├── login.ejs              ← Login form
│   ├── register.ejs           ← Registration form with password strength meter
│   ├── dashboard.ejs          ← User dashboard with stats + action cards
│   ├── chatbot.ejs            ← AI chatbot chat interface
│   ├── quiz.ejs               ← Multiple choice quiz page
│   ├── quiz-result.ejs        ← Quiz results with detailed review
│   ├── progress.ejs           ← Progress tracking with score history
│   ├── 404.ejs                ← 404 Not Found page
│   └── partials/
│       ├── header.ejs         ← Shared navbar + flash messages
│       └── footer.ejs         ← Shared footer + scripts
│
├── public/
│   ├── css/
│   │   └── style.css          ← Full custom CSS (glassmorphism, gradients, animations)
│   └── js/
│       └── main.js            ← Client-side JS (flash auto-dismiss)
```

---

## ⚙️ STEP-BY-STEP SETUP GUIDE

### STEP 1 — Prerequisites

Make sure you have these installed:

| Tool | Download |
|------|----------|
| Node.js (v18+) | https://nodejs.org |
| MongoDB Community | https://www.mongodb.com/try/download/community |
| VS Code | https://code.visualstudio.com |

Verify installation:
```bash
node --version     # Should show v18.x or higher
npm --version      # Should show 9.x or higher
mongod --version   # Should show MongoDB version
```

---

### STEP 2 — Open Project in VS Code

1. Extract the project ZIP file
2. Open VS Code
3. Click **File → Open Folder**
4. Select the `AI-Study-Assistant` folder
5. Open the integrated terminal: **View → Terminal** (or Ctrl + `)

---

### STEP 3 — Install Dependencies

In the VS Code terminal, run:

```bash
npm install
```

This installs all packages listed in `package.json`:
- `express` — Web framework
- `mongoose` — MongoDB ODM
- `ejs` — Template engine
- `bcryptjs` — Password hashing
- `express-session` — Session management
- `connect-flash` — Flash messages
- `dotenv` — Environment variables
- `method-override` — PUT/DELETE in forms
- `nodemon` — Auto-restart on file change (dev only)

---

### STEP 4 — Configure Environment Variables

Open the `.env` file and update if needed:

```env
MONGO_URI=mongodb://localhost:27017/ai-study-assistant
SESSION_SECRET=mySecretKey123StudyApp
PORT=3000
```

> **Note:** For production, change `SESSION_SECRET` to a long random string.

---

### STEP 5 — Start MongoDB

#### On Windows:
```bash
# Option 1: Run as a service (if installed as service)
net start MongoDB

# Option 2: Run manually
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

#### On macOS:
```bash
# If installed via Homebrew
brew services start mongodb-community

# Or run directly
mongod --config /usr/local/etc/mongod.conf
```

#### On Linux (Ubuntu):
```bash
sudo systemctl start mongod
sudo systemctl status mongod    # Check it's running
```

> MongoDB runs on port **27017** by default. Keep it running in the background.

---

### STEP 6 — Run the Application

In the VS Code terminal:

```bash
# Development mode (auto-restarts on file changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
🌱 Sample questions seeded to database!

🚀 AI Study Assistant is running!
📍 Visit: http://localhost:3000
```

---

### STEP 7 — Open in Browser

Visit: **http://localhost:3000**

---

## 🧪 TESTING THE APPLICATION

### Test Each Feature:

#### 1. Registration
- Go to http://localhost:3000/register
- Enter: Name, Email, Password (min 6 chars), Confirm Password
- Click "Create My Account"
- Should redirect to login with success message

#### 2. Login
- Go to http://localhost:3000/login
- Enter your registered email and password
- Should redirect to Dashboard

#### 3. Dashboard
- View your welcome message, stats cards
- Click on Quiz, Chatbot, or Progress cards

#### 4. Chatbot
- Type messages like: "Explain JavaScript", "What is Machine Learning?", "Give me study tips"
- Try quick prompt buttons
- Check that responses appear with typing indicator

#### 5. Quiz
- Click "Start Quiz" from dashboard
- Answer all 10 questions (must answer each to proceed)
- Click "Submit Quiz"
- View detailed results with explanations

#### 6. Progress
- After taking quizzes, view score history
- See performance bars and level indicators

---

## 🗄️ Sample MongoDB Data

The app **automatically seeds** 10 questions on first run. Here's the sample data format:

```javascript
{
  questionText: "What does CPU stand for?",
  options: [
    "Central Processing Unit",    // Index 0 ← CORRECT
    "Computer Personal Unit",     // Index 1
    "Central Program Utility",    // Index 2
    "Core Processing Unit"        // Index 3
  ],
  correctAnswerIndex: 0,
  category: "Computer Science",
  difficulty: "Easy",
  explanation: "CPU stands for Central Processing Unit — the brain of a computer."
}
```

### Add More Questions via MongoDB Shell:

```bash
# Open MongoDB shell
mongosh

# Switch to your database
use ai-study-assistant

# Insert a question
db.questions.insertOne({
  questionText: "What is a variable in programming?",
  options: [
    "A fixed value that never changes",
    "A container that stores data values",
    "A type of loop",
    "A function name"
  ],
  correctAnswerIndex: 1,
  category: "Programming",
  difficulty: "Easy",
  explanation: "A variable is a named storage location that holds a value which can change during program execution."
})
```

---

## 🤖 OpenAI API Integration (Future Upgrade)

The chatbot is ready for OpenAI. Replace the `/chatbot/message` route in `server.js`:

```javascript
// Install first: npm install openai
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/chatbot/message', isAuthenticated, async (req, res) => {
  const { message } = req.body;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a helpful AI study assistant. Help students understand educational topics clearly and concisely."
      },
      { role: "user", content: message }
    ],
    max_tokens: 500
  });

  const response = completion.choices[0].message.content;
  res.json({ response });
});
```

Add to `.env`:
```env
OPENAI_API_KEY=sk-your-api-key-here
```

---

## 📚 VIVA QUESTIONS & ANSWERS

### General / Architecture

**Q1: What is the MVC pattern? Does this project follow it?**
> MVC stands for Model-View-Controller. This project partially follows it:
> - **Model** → `models/User.js`, `models/Question.js` (data layer)
> - **View** → `views/*.ejs` (presentation layer)
> - **Controller** → Route handlers in `server.js` (logic layer)

**Q2: What is Express.js and why is it used?**
> Express.js is a minimal, fast Node.js web framework. It simplifies routing, middleware handling, request/response management, and serving static files — making it the standard choice for Node.js web apps.

**Q3: What is EJS and how does it work?**
> EJS (Embedded JavaScript) is a templating engine that lets you embed JavaScript code inside HTML using `<% %>` tags. The server renders EJS files into plain HTML before sending to the browser. It supports loops, conditionals, partials (`include`), and variable injection.

**Q4: What is middleware in Express?**
> Middleware are functions that run between the request and response cycle. Examples used in this project: `express.urlencoded()` (parse forms), `express-session` (manage sessions), `connect-flash` (flash messages), `isAuthenticated` (protect routes).

---

### Authentication & Security

**Q5: How does password hashing work in this project?**
> We use `bcryptjs`. When a user registers, the password goes through:
> 1. `bcrypt.genSalt(10)` — generates a random salt (10 rounds)
> 2. `bcrypt.hash(password, salt)` — creates an irreversible hash
> 3. The hash is stored in MongoDB, never the plain password
> 
> On login: `bcrypt.compare(entered, storedHash)` — compares securely.

**Q6: What is a session? How does session-based auth work?**
> A session stores user data server-side between requests. When a user logs in:
> 1. We save `req.session.userId = user._id`
> 2. Express creates a session cookie in the browser
> 3. On each request, the cookie identifies the session
> 4. We check `req.session.userId` to know if someone is logged in
> 5. Logout destroys the session with `req.session.destroy()`

**Q7: What is the difference between authentication and authorization?**
> - **Authentication**: Verifying *who* you are (login with email/password)
> - **Authorization**: Verifying *what* you can do (the `isAuthenticated` middleware checks if you're logged in before accessing protected routes)

**Q8: Why should you never store plain text passwords?**
> If the database is compromised, attackers would instantly have all user passwords. Hashing with bcrypt is one-way and slow to reverse, protecting users even if data is stolen.

---

### Database / MongoDB

**Q9: What is Mongoose? What is a Schema?**
> Mongoose is an ODM (Object Data Modeler) for MongoDB. A Schema defines the structure, data types, and validation rules for a MongoDB collection. For example, `UserSchema` defines that `email` must be unique and match a regex pattern.

**Q10: What is the difference between SQL and NoSQL?**
> | SQL | NoSQL (MongoDB) |
> |-----|-----------------|
> | Tables with fixed columns | Collections with flexible documents |
> | Strict schema | Dynamic/flexible schema |
> | Uses JOIN for relations | Embed or reference documents |
> | MySQL, PostgreSQL | MongoDB, Redis |

**Q11: What does `async/await` do in the database calls?**
> MongoDB operations are asynchronous (they take time). `async/await` lets us write asynchronous code that *looks* synchronous, avoiding "callback hell". `await` pauses execution until the Promise resolves, then continues.

**Q12: What is `$sample` in MongoDB aggregation?**
> `{ $sample: { size: 10 } }` is a MongoDB aggregation stage that randomly selects `n` documents from a collection. We use it to get 10 random quiz questions each time.

---

### Frontend / CSS

**Q13: What is glassmorphism?**
> A UI design trend using frosted-glass effects: semi-transparent backgrounds (`rgba`), `backdrop-filter: blur()`, subtle borders (`rgba` with low opacity), and soft shadows. This project uses it throughout.

**Q14: What are CSS custom properties (variables)?**
> Variables defined with `--name: value` in `:root {}` and used with `var(--name)`. They make theming consistent and easy to update — changing `--primary` color updates the whole app.

**Q15: What is `conic-gradient` used for in this project?**
> In `quiz-result.ejs`, the score circle uses `conic-gradient` to create a circular progress ring showing the percentage score. `conic-gradient(var(--primary) 0% 72%, var(--bg) 72%)` fills 72% of the circle.

---

### JavaScript / Node.js

**Q16: What is the event loop in Node.js?**
> Node.js is single-threaded but handles concurrent requests through the event loop. Non-blocking async operations (like DB queries) are offloaded, and callbacks/promises are executed when they complete — allowing Node.js to handle thousands of requests efficiently.

**Q17: How does the chatbot work?**
> The chatbot uses keyword matching: `message.toLowerCase()` is checked against regex patterns. If "javascript" is found, a pre-written response is returned. For production, replace this with an OpenAI API call for natural language understanding.

**Q18: What is `req.body` and why do we need `express.urlencoded()`?**
> `req.body` contains data submitted via HTML forms (POST requests). By default, Express doesn't parse this. `express.urlencoded({ extended: true })` is middleware that parses form data and populates `req.body`.

---

## 🚀 FUTURE IMPROVEMENTS

### Short Term
- [ ] **OpenAI API** — Replace keyword chatbot with GPT-3.5/4 for intelligent responses
- [ ] **Quiz Categories** — Filter questions by subject (Math, Science, CS)
- [ ] **Timer** — Add countdown timer for each quiz question
- [ ] **Leaderboard** — Compare scores with other users
- [ ] **Email Verification** — Verify email on registration using Nodemailer

### Medium Term
- [ ] **Spaced Repetition** — Show difficult questions more often (based on wrong answers)
- [ ] **Custom Quizzes** — Let users create and share their own quiz sets
- [ ] **Flashcard Mode** — Study with digital flashcards
- [ ] **Google OAuth** — Login with Google account
- [ ] **Dark/Light Mode Toggle** — Switch between themes

### Long Term
- [ ] **Mobile App** — React Native or Flutter app using Express API
- [ ] **AI Personalization** — Recommend topics based on weak areas
- [ ] **Video Lessons** — Embed YouTube educational videos
- [ ] **Collaborative Study** — Real-time study rooms with Socket.io
- [ ] **Certificates** — Generate PDF certificates for high scores

---

## 🛠️ VS Code Extensions (Recommended)

Install these for the best development experience:

| Extension | Purpose |
|-----------|---------|
| `EJS language support` | Syntax highlighting for `.ejs` files |
| `Prettier` | Auto-format code |
| `MongoDB for VS Code` | Browse MongoDB from VS Code |
| `Thunder Client` | Test API endpoints (like Postman) |
| `Auto Rename Tag` | Auto-rename HTML closing tags |
| `GitLens` | Git integration |

---

## 📦 NPM Scripts

```bash
npm start      # Start with Node.js (production)
npm run dev    # Start with Nodemon (auto-restart on save)
```

---

## 🐛 Common Errors & Fixes

| Error | Fix |
|-------|-----|
| `MongoDB connection refused` | Make sure `mongod` is running |
| `Cannot find module 'express'` | Run `npm install` |
| `Port 3000 already in use` | Change `PORT` in `.env` or kill the process |
| `Session not persisting` | Check `SESSION_SECRET` in `.env` is set |
| `Questions not loading` | Check MongoDB is running and URI is correct |

---

## 📄 License

MIT License — Free to use and modify for educational purposes.

---

*Built with ❤️ for students who want to study smarter.*
