# 📝 Taskify - Modern Task Management App

A beautiful, feature-rich task management application built with the MERN stack, featuring modern animations, responsive design, and intuitive user experience.

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based registration and login
- 📝 **Task Management** - Create, edit, delete, and organize tasks
- 🏷️ **Categories** - Organize tasks by Work, Personal, Health, Finance, Shopping, Education, and Other
- 🎯 **Priority Levels** - Set task priorities (Low, Medium, High, Urgent)
- 📅 **Due Dates** - Track deadlines with overdue indicators
- 🔍 **Search & Filter** - Real-time search and advanced filtering options
- 📊 **Dashboard Stats** - Visual task completion tracking
- 🌙 **Dark Mode** - Beautiful dark theme support
- 📱 **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✨ **Smooth Animations** - Modern UI with Framer Motion animations

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - UI library
- **React Router v6** - Navigation
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd taskify
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**

   **Backend** - Create `backend/.env`:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend** - Create `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_NAME=Taskify
   REACT_APP_VERSION=1.0.0
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Tasks
- `GET /api/tasks` - Get all user tasks (with filtering)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get specific task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/toggle` - Toggle task completion

## 🎨 Features Overview

### Task Categories
- 💼 **Work** - Professional tasks and projects
- 👤 **Personal** - Personal activities and goals
- 🏥 **Health** - Health and fitness related tasks
- 💰 **Finance** - Financial planning and budgeting
- 🛒 **Shopping** - Shopping lists and purchases
- 📚 **Education** - Learning and educational tasks
- 📝 **Other** - Miscellaneous tasks

### Priority Levels
- 🟢 **Low** - Nice to have, no rush
- 🟡 **Medium** - Standard priority
- 🔴 **High** - Important, needs attention
- 🚨 **Urgent** - Critical, immediate action required

### Filtering & Search
- Search across task titles, descriptions, and tags
- Filter by category, priority, and completion status
- Sort by creation date, priority, title, or due date
- Real-time results with debounced search

## 📱 Responsive Design

Taskify works seamlessly across all devices:
- 🖥️ **Desktop** (1024px+) - Full featured experience
- 💻 **Laptop** (768px-1023px) - Optimized layout
- 📱 **Tablet** (640px-767px) - Touch-friendly interface
- 📱 **Mobile** (320px-639px) - Compact, efficient design

## 🎯 Development

### Project Structure
```
taskify/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # API controllers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Main server file
└── frontend/
    ├── public/          # Static assets
    └── src/
        ├── components/  # Reusable components
        ├── context/     # React context
        ├── pages/       # Page components
        ├── services/    # API services
        └── utils/       # Helper functions
```

### Available Scripts

**Backend:**
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server

**Frontend:**
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## 🚀 Deployment

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user with read/write permissions
4. Whitelist your IP address
5. Get the connection string for your `.env` file

### Environment Variables
Make sure to set all required environment variables in production:
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A secure, long random string
- `NODE_ENV` - Set to 'production'

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first styling
- Framer Motion for beautiful animations
- MongoDB for the flexible database solution

---

**Happy task managing!** 🎉
