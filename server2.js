const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

const snippetsDir = path.join(__dirname, 'public', 'snippets');

// Serve static files (HTML, CSS, JS, snippets)
app.use(express.static('public'));

// API to list snippet filenames
app.get('/api/snippets', (req, res) => {
  fs.readdir(snippetsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read snippets directory' });
    }
    res.json(files);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
