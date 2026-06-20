const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());

// यह रेंडर के लिए सबसे जरूरी लाइन है, यह फाइल्स को सही जगह ढूंढने में मदद करेगी
app.use(express.static(path.join(__dirname, './')));

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

// मेन पेज (जो भी तुम्हारी फाइल है) को लोड करने का रास्ता
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

// रजिस्ट्रेशन API
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, password, enteredCode } = req.body;
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));