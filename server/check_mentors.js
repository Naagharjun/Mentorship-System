const mongoose = require('mongoose');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/mentorlink');
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        const users = await collection.find({ role: 'mentor' }).toArray();
        console.log(JSON.stringify(users, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

checkUsers();
