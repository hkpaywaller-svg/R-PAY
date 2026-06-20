const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
// यह लाइन तेरी वेबसाइट की फाइल (HTML, CSS) को सर्वर पर दिखाएगी
app.use(express.static(__dirname));

// MongoDB कनेक्शन लिंक
const uri = "mongodb+srv://hkpaywaller_db_user:5Xf9YRwUHoMPOHey@cluster0.ucnyait.mongodb.net/Rpay?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log("MongoDB Connected to Rpay!"))
    .catch(err => console.log(err));

// यूजर का Schema
const userSchema = new mongoose.Schema({
    mobile: String,
    password: String,
    role: String,
    referralCode: String,
    parentCode: String,
    id: String
});

const User = mongoose.model('User', userSchema);

// मेन पेज दिखाने के लिए (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// रजिस्ट्रेशन API
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, password, enteredCode } = req.body;
        
        // बिना UID के सिर्फ 6 अंकों का रैंडम नंबर
        const newId = Math.floor(100000 + Math.random() * 900000).toString();
        
        const newUser = new User({
            mobile,
            password,
            role: 'member',
            referralCode: mobile.slice(-5),
            parentCode: enteredCode,
            id: newId 
        });
        
        await newUser.save();
        res.json({ success: true, message: "User registered successfully", user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

// सर्वर स्टार्ट
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));