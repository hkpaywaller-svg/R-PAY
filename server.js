const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const MASTER_ID = "7628950634"; 
const DB_FILE = path.join(__dirname, 'users.json');

function loadUsers() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
}

function generatePermanentId() { return "UID" + Date.now().toString().slice(-6); }
function generateUniqueCode() { return Math.floor(10000 + Math.random() * 90000).toString(); }

app.post('/api/register', (req, res) => {
    const { mobile, password, enteredCode } = req.body;
    let users = loadUsers();
    let role = 'member';
    let referralCode = mobile.slice(-5);

    if (enteredCode === MASTER_ID) {
        role = 'tl';
        referralCode = generateUniqueCode();
    } else {
        const parent = users.find(u => u.referralCode === enteredCode && u.role === 'tl');
        if (!parent) return res.json({ success: false, message: "Invalid Code!" });
    }

    const newUser = { id: generatePermanentId(), mobile, password, role, referralCode, parentCode: enteredCode };
    users.push(newUser);
    saveUsers(users);
    res.json({ success: true, id: newUser.id });
});

app.get('/api/get-team-data', (req, res) => {
    const users = loadUsers();
    const currentUser = users[users.length - 1];
    if (currentUser && currentUser.role === 'tl') {
        res.json({ canInvite: true, referralCode: currentUser.referralCode });
    } else {
        res.json({ canInvite: false });
    }
});

app.get('/api/get-team-members', (req, res) => {
    const users = loadUsers();
    const currentUser = users[users.length - 1];
    if (!currentUser) return res.json([]);
    
    if (currentUser.password === MASTER_ID) res.json(users.filter(u => u.role === 'tl'));
    else if (currentUser.role === 'tl') res.json(users.filter(u => u.parentCode === currentUser.referralCode));
    else res.json([]);
});

// यह रहा वो नया हिस्सा जो तेरे 'me.html' को ID देगा
app.get('/api/get-profile', (req, res) => {
    const users = loadUsers();
    const currentUser = users[users.length - 1];
    if (currentUser) {
        res.json({ id: currentUser.id });
    } else {
        res.json({ id: "Not Found" });
    }
});

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));
app.get('/team', (req, res) => res.sendFile(path.join(__dirname, 'team.html')));
app.get('/me', (req, res) => res.sendFile(path.join(__dirname, 'me.html')));

app.listen(PORT, () => console.log(`Server: http://localhost:${PORT}`));