const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

let lastUserId = 0; 

// ऑटो-आईडी जनरेटर रूट
app.post('/api/register', (req, res) => {
    lastUserId++; 
    res.json({
        success: true,
        message: "Registration Successful!",
        userId: lastUserId
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});