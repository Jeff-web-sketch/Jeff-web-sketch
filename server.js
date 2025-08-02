const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

const app = express();
const PORT = 3000;

const snippetsDir = path.join(__dirname, 'public', 'snippets');
const usersFile = path.join(__dirname, 'users.json');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'change_this_secret',
  resave: false,
  saveUninitialized: false,
}));

// Serve static files (except snippets, handled separately)
app.use(express.static('public'));

// Serve snippet files with Content-Type text/plain for code files
app.get('/snippets/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(snippetsDir, fileName);

  // Security: prevent path traversal attacks
  if (!filePath.startsWith(snippetsDir)) {
    return res.status(400).send('Invalid filename');
  }

  fs.access(filePath, fs.constants.R_OK, (err) => {
    if (err) return res.status(404).send('File not found');

    // Force text/plain for common code extensions so browser displays them
    const codeExtensions = ['.py', '.js', '.java', '.cpp', '.txt'];
    const ext = path.extname(filePath).toLowerCase();

    if (codeExtensions.includes(ext)) {
      res.setHeader('Content-Type', 'text/plain');
    } else {
      const mimeType = mime.lookup(filePath) || 'application/octet-stream';
      res.setHeader('Content-Type', mimeType);
    }

    fs.createReadStream(filePath).pipe(res);
  });
});

// API: Get snippet list
app.get('/api/snippets', (req, res) => {
  fs.readdir(snippetsDir, (err, files) => {
    if (err) return res.status(500).json({ error: 'Unable to read snippets' });
    res.json(files);
  });
});

// Utility: Load users or return empty object
function loadUsers() {
  if (!fs.existsSync(usersFile)) return {};
  try {
    const data = fs.readFileSync(usersFile, 'utf-8');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

// Utility: Save users object
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Middleware to check if logged in
function requireLogin(req, res, next) {
  if (req.session.username) {
    next();
  } else {
    res.redirect('/login.html');
  }
}

// Setup multer for file uploads, restrict to txt, py, js, java, cpp
const upload = multer({
  dest: snippetsDir,
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.txt', '.py', '.js', '.java', '.cpp'];
    if (allowedExts.includes(path.extname(file.originalname).toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Sign up handler
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (users[username]) {
    return res.status(400).send('Username already exists');
  }

  const hashed = await bcrypt.hash(password, 10);
  users[username] = { password: hashed };
  saveUsers(users);
  req.session.username = username;
  res.redirect('/upload.html');
});

// Login handler
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();

  if (!users[username]) {
    return res.status(400).send('Invalid username or password');
  }

  const match = await bcrypt.compare(password, users[username].password);
  if (!match) {
    return res.status(400).send('Invalid username or password');
  }

  req.session.username = username;
  res.redirect('/upload.html');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Upload snippet (must be logged in)
app.post('/upload', requireLogin, upload.single('snippet'), (req, res) => {
  const tempPath = req.file.path;
  const targetPath = path.join(snippetsDir, req.file.originalname);

  fs.rename(tempPath, targetPath, err => {
    if (err) return res.status(500).send('File upload failed');
    res.send('File uploaded! <a href="/snippets.html">Go to snippets</a>');
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
