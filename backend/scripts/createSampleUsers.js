const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Load environment variables
dotenv.config();

async function createSampleUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Clear existing users (optional - remove this if you want to keep existing users)
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create sample users
    const sampleUsers = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: 'password123',
        bio: 'Experienced software developer passionate about teaching programming and learning new technologies.',
        location: 'San Francisco, CA',
        skillsToTeach: ['JavaScript', 'React', 'Node.js', 'Python'],
        skillsToLearn: ['Machine Learning', 'DevOps', 'UI/UX Design'],
        rating: 4.8,
        totalSessions: 15
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        bio: 'Digital marketing expert and graphic designer. Love helping others build their online presence.',
        location: 'New York, NY',
        skillsToTeach: ['Digital Marketing', 'Graphic Design', 'Adobe Photoshop', 'Social Media Strategy'],
        skillsToLearn: ['Web Development', 'Data Analysis', 'Photography'],
        rating: 4.9,
        totalSessions: 22
      }
    ];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`Created user: ${user.name} (${user.email})`);
    }

    console.log('Sample users created successfully!');
    console.log('\nTest Credentials:');
    console.log('User 1: john@example.com / password123');
    console.log('User 2: sarah@example.com / password123');

  } catch (error) {
    console.error('Error creating sample users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createSampleUsers();
