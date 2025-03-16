const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');
const app = express();

app.use(bodyParser.json());

const uri = "your-mongodb-uri";
let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db('your-db-name');
  })
  .catch(error => console.error(error));

app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
        return res.json({ success: false, message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({ name, email, password: hashedPassword });

    res.json({ success: true });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await db.collection('users').findOne({ email });
    if (!user) {
        return res.json({ success: false, message: 'User not found' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.json({ success: false, message: 'Invalid password' });
    }

    res.json({ success: true });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
