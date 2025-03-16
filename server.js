const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const usersFile = path.join(__dirname, 'users.json');

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

function loadUsers() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, '[]', 'utf8');
    }
    return JSON.parse(fs.readFileSync(usersFile, 'utf8'));
}

function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

app.post('/signup', async (req, res) => {
    const { fullName, email, password } = req.body;
    let users = loadUsers();

    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'Email already exists!' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ fullName, email, password: hashedPassword });
    saveUsers(users);
    
    res.json({ message: 'Signup successful!' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = loadUsers();
    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password!' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid email or password!' });
    }

    res.json({ message: 'Login successful!' });
});

app.listen(PORT, () => {
    console.log(`ძლივს გაისტარტა აქ http://localhost:${PORT}`);
});
