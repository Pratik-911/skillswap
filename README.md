# SkillSwap MVP

A free platform where users connect to teach and learn skills from each other — with no money involved.

## Tech Stack
- **Frontend**: React.js, HTML, CSS, JavaScript
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT

## Features
- User Authentication (Sign up/Login)
- User Profiles with skills they can teach/learn
- Skill Matching System
- Real-time Messaging
- Appointment Booking & Scheduling

## Project Structure
```
skillswap/
├── backend/          # Node.js + Express API
├── frontend/         # React.js application
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/matches` - Get skill matches
- `GET /api/messages/:userId` - Get messages
- `POST /api/messages` - Send message
- 
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - Get user appointments

## Environment Variables
Create `.env` files in both backend and frontend directories with required configurations.

## License
Commercial use is prohibited. 
