const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const MASTER_ID = "7628950634"; 
let users = []; 
let idCounter = 1; 

// यूनिक कोड जनरेटर फंक्शन (TL के लिए)
function generateUniqueCode() {
    return Math.floor(10000 + Math.random() * 90000).toString();
}

// रजिस्टर API
app.post('/api/register', (req, res) => {
    const { mobile, password, enteredCode } = req.body; 

    if (!mobile || !enteredCode) {
        return res.json({ success: false, message: "सभी जानकारी भरें!" });
    }

    let role = 'member';
    let referralCode = mobile.slice(-5);

    // 1. मास्टर आईडी चेक (अगर मास्टर है तो ID 1 ही रहेगी)
    if (enteredCode === MASTER_ID) {
        role = 'tl';
        referralCode = generateUniqueCode();
    } 
    // 2. क्या किसी TL के नीचे रजिस्टर हो रहा है?
    else {
        const isReferrerValid = users.find(u => u.referralCode === enteredCode && u.role === 'tl');
        if (!isReferrerValid) {
            return res.json({ success: false, message: "Invalid Referral Code!" });
        }
        role = 'member';
    }

    const newUser = { 
        id: idCounter++, 
        mobile: mobile, 
        password: password, 
        role: role, 
        referralCode: referralCode,
        parentCode: enteredCode 
    };
    users.push(newUser);

    res.json({ success: true, message: "Registration Successful!", role: role, referralCode: referralCode, id: newUser.id });
});

// प्रोफाइल के लिए API
app.get('/api/get-profile', (req, res) => {
    // अगर कोई यूजर नहीं है, तो खाली रिस्पॉन्स भेजें ताकि undefined न दिखे
    if (users.length === 0) {
        return res.json({ id: 0, mobile: "N/A" });
    }
    const currentUser = users[users.length - 1]; 
    res.json({ mobile: currentUser.mobile, id: currentUser.id });
});

// टीम पेज के लिए डेटा
app.get('/api/get-team-data', (req, res) => {
    const currentUser = users[users.length - 1]; 
    if (currentUser && currentUser.role === 'tl') {
        res.json({ canInvite: true, referralCode: currentUser.referralCode });
    } else {
        res.json({ canInvite: false });
    }
});

// टीम मेंबर्स की लिस्ट
app.get('/api/get-team-members', (req, res) => {
    const currentUser = users[users.length - 1]; 
    if (currentUser && currentUser.role === 'tl') {
        const myTeam = users.filter(u => u.parentCode === currentUser.referralCode);
        res.json(myTeam);
    } else {
        res.json([]);
    }
});

// राउट्स
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'register.html')); });
app.get('/team', (req, res) => { res.sendFile(path.join(__dirname, 'team.html')); });
app.get('/me', (req, res) => { res.sendFile(path.join(__dirname, 'me.html')); });

// सर्वर स्टार्ट करने वाली लाइन
app.listen(PORT, () => { 
    console.log(`Server running at http://localhost:${PORT}`); 
});