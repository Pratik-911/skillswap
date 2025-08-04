const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../data');
const USERS_FILE = path.join(DB_PATH, 'users.json');
const MESSAGES_FILE = path.join(DB_PATH, 'messages.json');
const APPOINTMENTS_FILE = path.join(DB_PATH, 'appointments.json');

// Ensure data directory exists
if (!fs.existsSync(DB_PATH)) {
  fs.mkdirSync(DB_PATH, { recursive: true });
}

// Initialize database files if they don't exist
const initializeDatabase = () => {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(MESSAGES_FILE)) {
    fs.writeFileSync(MESSAGES_FILE, JSON.stringify([]));
  }
  if (!fs.existsSync(APPOINTMENTS_FILE)) {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify([]));
  }
};

// Database operations
const db = {
  users: {
    findAll: () => {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    },
    
    findById: (id) => {
      const users = db.users.findAll();
      return users.find(user => user._id === id);
    },
    
    findByEmail: (email) => {
      const users = db.users.findAll();
      return users.find(user => user.email === email);
    },
    
    create: (userData) => {
      const users = db.users.findAll();
      const newUser = {
        _id: generateId(),
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(newUser);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return newUser;
    },
    
    update: (id, updateData) => {
      const users = db.users.findAll();
      const index = users.findIndex(user => user._id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updateData, updatedAt: new Date().toISOString() };
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        return users[index];
      }
      return null;
    }
  },
  
  messages: {
    findAll: () => {
      const data = fs.readFileSync(MESSAGES_FILE, 'utf8');
      return JSON.parse(data);
    },
    
    create: (messageData) => {
      const messages = db.messages.findAll();
      const newMessage = {
        _id: generateId(),
        ...messageData,
        createdAt: new Date().toISOString()
      };
      messages.push(newMessage);
      fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
      return newMessage;
    },
    
    findConversations: (userId) => {
      const messages = db.messages.findAll();
      const userMessages = messages.filter(msg => 
        msg.senderId === userId || msg.receiverId === userId
      );
      
      // Group by conversation partner
      const conversations = {};
      userMessages.forEach(msg => {
        const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
        if (!conversations[partnerId]) {
          conversations[partnerId] = [];
        }
        conversations[partnerId].push(msg);
      });
      
      return conversations;
    },
    
    findBetweenUsers: (userId1, userId2) => {
      const messages = db.messages.findAll();
      return messages.filter(msg => 
        (msg.senderId === userId1 && msg.receiverId === userId2) ||
        (msg.senderId === userId2 && msg.receiverId === userId1)
      ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  },
  
  appointments: {
    findAll: () => {
      const data = fs.readFileSync(APPOINTMENTS_FILE, 'utf8');
      return JSON.parse(data);
    },
    
    create: (appointmentData) => {
      const appointments = db.appointments.findAll();
      const newAppointment = {
        _id: generateId(),
        ...appointmentData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      appointments.push(newAppointment);
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
      return newAppointment;
    },
    
    findByUser: (userId) => {
      const appointments = db.appointments.findAll();
      return appointments.filter(apt => 
        apt.teacherId === userId || apt.learnerId === userId
      );
    },
    
    update: (id, updateData) => {
      const appointments = db.appointments.findAll();
      const index = appointments.findIndex(apt => apt._id === id);
      if (index !== -1) {
        appointments[index] = { ...appointments[index], ...updateData, updatedAt: new Date().toISOString() };
        fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(appointments, null, 2));
        return appointments[index];
      }
      return null;
    }
  }
};

// Generate simple ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Initialize sample data
const initializeSampleData = async () => {
  const users = db.users.findAll();
  if (users.length === 0) {
    console.log('Creating sample users...');
    
    // Create sample users
    const sampleUsers = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        password: await bcrypt.hash('password123', 10),
        bio: 'Full-stack developer with 5 years of experience. Love teaching web development and learning new technologies.',
        location: 'San Francisco, CA',
        skillsToTeach: ['JavaScript', 'React', 'Node.js', 'Web Development'],
        skillsToLearn: ['Photography', 'Guitar', 'Spanish'],
        rating: 4.8,
        totalSessions: 12,
        isActive: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: await bcrypt.hash('password123', 10),
        bio: 'Professional photographer and guitar instructor. Passionate about capturing moments and creating music.',
        location: 'New York, NY',
        skillsToTeach: ['Photography', 'Guitar', 'Photo Editing'],
        skillsToLearn: ['Web Development', 'JavaScript', 'Digital Marketing'],
        rating: 4.9,
        totalSessions: 18,
        isActive: true
      }
    ];
    
    sampleUsers.forEach(userData => {
      db.users.create(userData);
    });
    
    console.log('Sample users created successfully!');
  }
};

module.exports = { db, initializeDatabase, initializeSampleData };
