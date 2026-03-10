const mongoose = require('mongoose');

async function checkUsers() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/mentorlink');
        const db = mongoose.connection.db;
        const collection = db.collection('users');
        const users = await collection.find({}).toArray();
        users.forEach((u, i) => {
            console.log(`\n--- User ${i + 1} ---`);
            console.log(`  Name: "${u.name}", Role: "${u.role}", Email: "${u.email}"`);
            console.log(`  specialization: "${u.specialization || '(none)'}"`);
            console.log(`  password: "${u.password ? 'SET' : '(none)'}"`);
            console.log(`  availability: ${JSON.stringify(u.availability)}`);
            console.log(`  sessionSlots: ${JSON.stringify(u.sessionSlots)}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
}

checkUsers();
