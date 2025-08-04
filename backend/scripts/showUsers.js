const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

async function showUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Fetch all users
    const users = await User.find({});
    
    console.log(`\n📊 Total Users in Database: ${users.length}\n`);
    console.log('=' .repeat(80));

    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Bio: ${user.bio || 'No bio provided'}`);
      console.log(`   Location: ${user.location || 'No location provided'}`);
      console.log(`   Skills to Teach: ${user.skillsToTeach.length > 0 ? user.skillsToTeach.join(', ') : 'None'}`);
      console.log(`   Skills to Learn: ${user.skillsToLearn.length > 0 ? user.skillsToLearn.join(', ') : 'None'}`);
      console.log(`   Rating: ${user.rating}/5.0`);
      console.log(`   Total Sessions: ${user.totalSessions}`);
      console.log(`   Active: ${user.isActive ? 'Yes' : 'No'}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log('-'.repeat(80));
    });

    if (users.length === 0) {
      console.log('No users found in the database.');
    }

  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

showUsers();
