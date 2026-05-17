
# GradeSense - Student Performance Tracking System

![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-8.0-blueviolet)
![React](https://img.shields.io/badge/React-18-blue)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple)
![SQL Server](https://img.shields.io/badge/Database-SQL_Server-red)
![JWT](https://img.shields.io/badge/Auth-JWT-green)
![License](https://img.shields.io/badge/License-MIT-green)

A full-stack web application for tracking and predicting student academic performance using ASP.NET Core Web API and React.

## 📋 Project Overview

**GradeSense** is a comprehensive student performance management system that enables:
- ✅ Student enrollment and course management
- ✅ Grade tracking and evaluation schemes
- ✅ Attendance monitoring
- ✅ Performance analytics and reporting
- ✅ ML-based prediction for at-risk student identification
- ✅ Role-based access control (Admin, Faculty, Student)

## 🌐 Live Deployment

### 🚀 Frontend Application
🔗 https://grade-sense.vercel.app

### ⚙️ Backend API (Swagger Docs)
🔗 https://gradesense-api.runasp.net/swagger

---

### 🧪 Demo Credentials

#### 👨‍💼 Admin
```text
Email: admin@gradesense.edu
Password: Admin@123
```
#### 👩‍🏫 Faculty
```text
Email: faculty@gradesense.edu
Password: Faculty@123
```
#### 👨‍🎓 Student
```text
Email: student@gradesense.edu
Password: Student@123
```

⚠️ Note: Demo credentials are for evaluation and testing purposes only.

## 🏗️ Architecture

```
gradesense-adn/
├── GradeSense.sln                    # Solution file
├── GradeSense.API/                   # Backend - ASP.NET Core Web API
│   ├── Controllers/                  # API Controllers
│   ├── Services/                     # Business Logic Layer
│   ├── Repositories/                 # Data Access Layer
│   ├── Models/                       # Entity Models
│   ├── DTOs/                         # Data Transfer Objects
│   ├── Validators/                   # FluentValidation
│   └── Program.cs                    # Application Entry Point
│
└── GradeSense.Client/                # Frontend - React + Vite
    ├── src/
    │   ├── components/               # Reusable UI Components
    │   ├── pages/                    # Page Components
    │   ├── services/                 # API Service Layer
    │   ├── hooks/                    # Custom React Hooks
    │   ├── context/                  # React Context (State Management)
    │   ├── utils/                    # Utility Functions
    │   └── App.jsx                   # Root Component
    ├── public/                       # Static Assets
    └── index.html                    # HTML Entry Point
```

## 🛠️ Technology Stack

### **Backend (GradeSense.API)**
| Technology | Version | Purpose |
|-----------|---------|---------|
| .NET | 8.0 | Runtime Framework |
| ASP.NET Core | 8.0 | Web API Framework |
| Entity Framework Core | 8.0 | ORM |
| SQL Server | 2019+ | Database |
| JWT Bearer | 8.0 | Authentication |
| FluentValidation | 11.3.1 | Input Validation |
| BCrypt.Net | 4.0.3 | Password Hashing |
| Swagger/OpenAPI | 6.6.2 | API Documentation |

### **Frontend (GradeSense.Client)**
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3+ | UI Framework |
| Vite | 5.0+ | Build Tool |
| React Router | 6.x | Routing |
| Tailwind CSS | 3.x | Styling |
| Axios | 1.x | HTTP Client |
| Zustand / Context API | - | State Management |
| React Query (TanStack) | 5.x | Server State Management |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation |
| Recharts | 2.x | Data Visualization |
| Lucide React | - | Icons |

## 📊 Database Schema

**17 Tables Total:**

### **Core Entities:**
- **Users** - System users (Admin, Faculty, Student)
- **Departments** - Academic departments
- **Faculties** - Faculty members (1-to-1 with Users)
- **Students** - Students (1-to-1 with Users)

### **Academic Structure:**
- **Batches** - Student groups by year/semester
- **Subjects** - Courses/subjects offered
- **SubjectUnits** - Subject topics/modules

### **Course Management:**
- **CourseOfferings** - Subject assigned to batch
- **CourseEnrollments** - Students enrolled in courses
- **EvaluationSchemes** - Assessment structure
- **AssessmentItems** - Individual assessments

### **Performance Tracking:**
- **StudentMarks** - Grades/marks
- **AttendanceRecords** - Attendance tracking
- **FacultyAssignments** - Faculty teaching assignments

### **System & ML:**
- **UploadHistory** - Bulk upload tracking
- **AuditLog** - System audit trail
- **Predictions** - ML-based predictions

## 🚀 Getting Started

### **Prerequisites**
```bash
# Backend
- .NET 8.0 SDK
- SQL Server 2019+
- Visual Studio 2022 / VS Code

# Frontend
- Node.js 18+ and npm/yarn
- VS Code (recommended)
```

### **Backend Setup**
```bash
cd GradeSense.API

# Restore dependencies
dotnet restore

# Update connection string in appsettings.json
# Update database
dotnet ef database update

# Run API
dotnet run
```

API will be available at: `https://localhost:7197` or `http://localhost:5197`

### **Frontend Setup**
```bash
cd GradeSense.Client

# Install dependencies
npm install

# Create .env file with API URL
echo "VITE_API_URL=https://localhost:7197" > .env

# Run development server
npm run dev
```

Client will be available at: `http://localhost:5173`

## 📖 Documentation

- **Backend API Documentation:** [GradeSense.API/README.md](./GradeSense.API/README.md)
- **Frontend Documentation:** [GradeSense.Client/README.md](./GradeSense.Client/README.md)
- **API Endpoints:** Access Swagger UI at `https://localhost:7197/swagger`

## 🔐 Authentication

The system uses **JWT Bearer Token** authentication with the following roles:
- **Admin** - Full system access
- **Faculty** - Course management, grading, attendance
- **Student** - View own data, courses, grades

### Default Test Accounts
```
Admin:
Email: admin@gradesense.edu
Password: Admin@123

Faculty:
Email: faculty@gradesense.edu
Password: Faculty@123

Student:
Email: student@gradesense.edu
Password: Student@123
```

## 🎯 Key Features

### **For Admins:**
- ✅ Manage users, departments, batches, subjects
- ✅ Configure evaluation schemes
- ✅ View system-wide reports and analytics
- ✅ Audit log access

### **For Faculty:**
- ✅ Manage course offerings and enrollments
- ✅ Record grades and attendance
- ✅ View student performance analytics
- ✅ Generate class reports

### **For Students:**
- ✅ View enrolled courses
- ✅ Check grades and attendance
- ✅ Track CGPA and performance trends
- ✅ View at-risk predictions

## 📈 Development Status

### **Completed:**
✅ Full CRUD for all 17 tables  
✅ JWT Authentication & Authorization  
✅ FluentValidation on all inputs  
✅ Soft delete functionality  
✅ Pagination & filtering  
✅ Business logic validation  
✅ Swagger API documentation  

### **In Progress:**
🔄 React Frontend Development  
🔄 Dashboard & Analytics  
🔄 ML Model Integration  

### **Planned:**
⏳ Bulk operations & CSV import/export  
⏳ File upload (photos, documents)  
⏳ Email notifications  
⏳ Real-time features (SignalR)  
⏳ Unit & Integration testing  
⏳ Docker containerization  
⏳ CI/CD pipeline  

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

