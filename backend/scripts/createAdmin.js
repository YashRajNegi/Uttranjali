const bcrypt = require('bcryptjs');

const password = 'your-admin-password'; // Replace with your desired password
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
        return;
    }
    console.log('Use this hashed password in MongoDB:');
    console.log(hash);
}); 