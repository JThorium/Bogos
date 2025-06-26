const express = require('express');
const path = require('path');

const app = express();
const PORT = 8000;
const DIRECTORY = __dirname; // Serve files from the current directory (AdventureAliens)

// Serve static files from the current directory
app.use(express.static(DIRECTORY));

// Serve xenoscape-genesis.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(DIRECTORY, 'xenoscape-genesis.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Serving files from: ${DIRECTORY}`);
});
