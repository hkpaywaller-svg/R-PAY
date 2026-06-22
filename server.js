const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const uri = "mongodb+srv://hkpaywaller_db_user:5Xf9YRwUHoMPOHey@cluster0.ucnyait.mongodb.net/Rpay?retryWrites=true&w=majority";

mongoose.connect(uri)
    .then(() => console.log("MongoDB Connected!"))
    .catch(err => console.log("DB Error:", err));

const userSchema = new mongoose.Schema({
    mobile: { type: String, required: true, unique: true }, // unique: true से दोबारा रजिस्ट्रेशन बंद
    password: { type: String, required: true },
    role: { type: String, default: 'member' },
    referralCode: String,
    parentCode: String,
    id: String
});

const User = mongoose.model('User', userSchema);

// मेन पेज (login.html) को लोड करने के लिए
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// रजिस्ट्रेशन API
app.post('/api/register', async (req, res) => {
    try {
        const { mobile, password, enteredCode } = req.body;
        
        // चेक करो कि मोबाइल पहले से है या नहीं
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "यह नंबर पहले से रजिस्टर्ड है!" });
        }
        
        const newId = Math.floor(100000 + Math.random() * 900000).toString();
        
        const newUser = new User({
            mobile, password, role: 'member',
            referralCode: mobile.slice(-5),
            parentCode: enteredCode,
            id: newId 
        });
        
        await newUser.save();
        res.json({ success: true, message: "Registered", id: newId });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));