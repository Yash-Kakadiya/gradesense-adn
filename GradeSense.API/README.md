
# GradeSense.API - Backend Documentation

ASP.NET Core 8.0 Web API for the GradeSense Student Performance Tracking System.

## 📋 Overview

A RESTful API providing complete CRUD operations for student performance management with JWT authentication, role-based authorization, and comprehensive business logic validation.

## 🏗️ Architecture

### **Layered Architecture:**
```
┌─────────────────────────────────────────┐
│          Controllers Layer              │  ← API Endpoints
├─────────────────────────────────────────┤
│           Services Layer                │  ← Business Logic
├─────────────────────────────────────────┤
│         Repositories Layer              │  ← Data Access
├─────────────────────────────────────────┤
│      Entity Framework Core (ORM)        │  ← Database Access
├─────────────────────────────────────────┤
│           SQL Server Database           │  ← Data Storage
└─────────────────────────────────────────┘
```

### **Project Structure:**
```
GradeSense.API/
├── Controllers/              # API endpoints (18 controllers)
│   ├── AssessmentItemsController.cs
│   ├── AttendanceRecordsController.cs
│   ├── AuditLogsController.cs
│   ├── AuthController.cs
│   ├── BatchesController.cs
│   ├── CourseEnrollmentsController.cs
│   ├── CourseOfferingsController.cs
│   ├── DepartmentsController.cs
│   ├── EvaluationSchemesController.cs
│   ├── FacultiesController.cs
│   ├── FacultyAssignmentsController.cs
│   ├── PredictionsController.cs
│   ├── StudentMarksController.cs
│   ├── StudentsController.cs
│   ├── SubjectsController.cs
│   ├── SubjectUnitsController.cs
│   ├── UploadHistoriesController.cs
│   └── UsersController.cs
│
├── Services/                 # Business logic (13 services)
│   ├── AuthService.cs
│   ├── UserService.cs
│   └── ...
│
├── Repositories/             # Data access (13 repositories)
│   ├── UserRepository.cs
│   ├── DepartmentRepository.cs
│   └── ...
│
├── Models/                   # Entity models (17 models)
│   ├── User.cs
│   ├── Department.cs
│   └── ...
│
├── DTOs/                     # Data Transfer Objects
│   ├── Auth/
│   ├── User/
│   ├── Department/
│   └── ...
│
├── Validators/               # FluentValidation (26 validators)
│   ├── Auth/
│   ├── User/
│   └── ...
│
├── Interfaces/
│   ├── Repositories/         # Repository interfaces
│   └── Services/             # Service interfaces
│
├── Helpers/
│   ├── JwtTokenGenerator.cs
│   └── PasswordHasher.cs
│
├── Data/
│   └── GradeSenseDbContext.cs
│
├── Migrations/               # EF Core migrations
│
├── Program.cs                # Application configuration
└── appsettings.json          # Configuration settings
```

## 🛠️ Technologies & Packages

```xml
<PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
<PackageReference Include="FluentValidation.AspNetCore" Version="11.3.1" />
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.22" />
<PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.22" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.22" />
<PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.22" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.22" />
<PackageReference Include="Swashbuckle.AspNetCore" Version="6.6.2" />
```

## 📊 Database Schema Summary

**17 Tables with Full CRUD:**

| # | Table | Purpose | Key Features |
|---|-------|---------|--------------|
| 1 | Users | System users | Email unique, role-based |
| 2 | Departments | Academic departments | HOD relationship |
| 3 | Faculties | Faculty profiles | 1-to-1 with User |
| 4 | Students | Student profiles | 1-to-1 with User, CGPA tracking |
| 5 | Batches | Student groups | Semester, year, coordinator |
| 6 | Subjects | Courses/subjects | Credit, prerequisites |
| 7 | SubjectUnits | Course modules | Unit number per subject |
| 8 | CourseOfferings | Courses per batch | Subject + Batch + Coordinator |
| 9 | CourseEnrollments | Student enrollments | Unique roll number per course |
| 10 | EvaluationSchemes | Assessment structure | Total marks, passing marks, weight |
| 11 | AssessmentItems | Individual assessments | Linked to scheme and unit |
| 12 | StudentMarks | Grades/marks | Obtained marks, grader |
| 13 | FacultyAssignments | Teaching assignments | Faculty to course mapping |
| 14 | AttendanceRecords | Attendance tracking | Date, status, remarks |
| 15 | UploadHistory | Bulk upload logs | File tracking, success/error counts |
| 16 | AuditLog | System audit trail | Action, actor, changes |
| 17 | Predictions | ML predictions | Risk score, predicted grade |

## 🔐 Authentication & Authorization

### **JWT Configuration:**
```json
"JwtSettings": {
  "SecretKey": "GradeSense_SuperSecure_JWT_Secret_Key_2025_MustBe32CharsOrMore!@#$%^&*()",
  "Issuer": "GradeSenseAPI",
  "Audience": "GradeSenseClient",
  "ExpiryMinutes": 60,
  "RefreshTokenExpiryDays": 7
}
```

### **User Roles:**
- **Admin** - Full system access
- **Faculty** - Course & grade management
- **Student** - Read-only access to own data

### **Authorization Policies:**
```csharp
"AdminOnly"        → Requires Admin role
"FacultyOnly"      → Requires Faculty or Admin role
"StudentOnly"      → Requires Student role
"FacultyOrAdmin"   → Requires Faculty or Admin role
```

## 🚀 API Endpoints

### **Authentication:**
```
POST   /api/auth/login           # Login with credentials
POST   /api/auth/refresh         # Refresh access token
POST   /api/auth/logout          # Logout (revoke token)
GET    /api/auth/me              # Get current user info
GET    /api/auth/validate        # Validate token
GET    /api/auth/health          # Health check
```

### **Standard CRUD Pattern (All Entities):**
```
GET    /api/{entity}             # List all (paginated & filtered)
GET    /api/{entity}/{id}        # Get by ID
POST   /api/{entity}             # Create new
PUT    /api/{entity}/{id}        # Update existing
DELETE /api/{entity}/{id}        # Soft delete
```

### **Entities with Full CRUD:**
- `/api/users`
- `/api/departments`
- `/api/faculties`
- `/api/students`
- `/api/batches`
- `/api/subjects`
- `/api/subjectunits`
- `/api/courseofferings`
- `/api/courseenrollments`
- `/api/evaluationschemes`
- `/api/assessmentitems`
- `/api/studentmarks`
- `/api/facultyassignments`
- `/api/attendancerecords`
- `/api/uploadhistory`
- `/api/auditlogs`
- `/api/predictions`

## 📝 Common Request/Response Patterns

### **Pagination & Filtering:**
```
GET /api/students?pageNumber=1&pageSize=10&searchTerm=john&departmentId=1&status=Active&sortBy=fullName&sortOrder=asc
```

### **Standard Response Wrapper:**
```json
{
  "success": true,
  "message": "Students retrieved successfully",
  "data": {
    "data": [...],           // Array of items
    "pageNumber": 1,
    "pageSize": 10,
    "totalRecords": 150,
    "totalPages": 15,
    "hasPreviousPage": false,
    "hasNextPage": true
  },
  "errors": null
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    {
      "field": "Email",
      "message": "Email is required"
    }
  ]
}
```

## 🎯 Key Features

### **1. Soft Delete:**
All entities support soft delete using `DeletedAt` timestamp. Deleted records are filtered out automatically.

### **2. Validation:**
- **FluentValidation** on all Create/Update requests
- Business logic validation in services
- Custom validators for complex rules

### **3. Relationship Management:**
- Proper foreign key validation
- Cascade delete prevention
- Related entity loading with `.Include()`

### **4. Timestamps:**
- `CreatedAt` - Set on creation
- `UpdatedAt` - Set on modification
- `DeletedAt` - Set on soft delete

### **5. Security:**
- JWT authentication
- Role-based authorization
- Password hashing with BCrypt
- CORS configuration
- Security headers

## 🔧 Configuration

### **appsettings.json:**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=SERVER;Database=GradeSenseCodeFirst;Trusted_Connection=True;TrustServerCertificate=True;"
  },
  "JwtSettings": {
    "SecretKey": "Your-Secret-Key-Here",
    "Issuer": "GradeSenseAPI",
    "Audience": "GradeSenseClient",
    "ExpiryMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

## 📦 Setup & Installation

### **1. Prerequisites:**
```bash
- .NET 8.0 SDK
- SQL Server 2019+
- Visual Studio 2022 / VS Code
```

### **2. Database Setup:**
```bash
# Update connection string in appsettings.json

# Run migrations
dotnet ef database update

# Or if starting fresh
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### **3. Run the API:**
```bash
dotnet restore
dotnet run
```

API will be available at:
- HTTPS: `https://localhost:7197`
- HTTP: `http://localhost:5197`
- Swagger: `https://localhost:7197/swagger`

## 🧪 Testing

### **Using Swagger:**
1. Navigate to `https://localhost:7197/swagger`
2. Click "Authorize" button
3. Enter token: `Bearer {your-jwt-token}`
4. Test endpoints

### **Using Postman:**
1. Import API collection
2. Set environment variable `baseUrl = https://localhost:7197`
3. Login to get token
4. Set `Authorization: Bearer {token}` header
5. Test endpoints

### **Sample Login Request:**
```bash
POST https://localhost:7197/api/auth/login
Content-Type: application/json

{
  "email": "admin@gradesense.edu",
  "password": "Admin@123",
  "rememberMe": false
}
```

## 📊 Business Logic Examples

### **Example 1: Student Enrollment:**
```
1. Validate CourseOffering exists and is active
2. Validate Student exists and is active
3. Check if student already enrolled (prevent duplicate)
4. Validate RollNumber uniqueness per course
5. Check MaxEnrollment limit
6. Create enrollment
```

### **Example 2: Grade Entry:**
```
1. Validate CourseEnrollment exists
2. Validate AssessmentItem exists
3. Check ObtainedMarks <= MaxMarks
4. Validate grader is Faculty
5. Record StudentMark
```

### **Example 3: Soft Delete Prevention:**
```
Cannot delete Department if:
- Has active Faculties
- Has active Students
- Has active Subjects
- Has active Batches
```

## 🔄 API Versioning (Future)

Currently using URL path versioning approach:
```
/api/v1/students
/api/v2/students
```

## 📈 Performance Considerations

### **Current Implementation:**
- EF Core with eager loading (`.Include()`)
- Pagination on all list endpoints
- Indexed foreign keys
- Async/await throughout

### **Future Enhancements:**
- Redis caching
- Query result caching
- Response compression
- Database query optimization
- CDN for static files

## 🐛 Common Issues & Solutions

### **Issue 1: JWT Token Expired**
```json
{
  "success": false,
  "message": "You are not authorized to access this resource"
}
```
**Solution:** Use refresh token endpoint to get new access token

### **Issue 2: Validation Errors**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [...]
}
```
**Solution:** Check request body against validator rules

### **Issue 3: Database Connection Error**
**Solution:** Verify connection string in appsettings.json

## 📚 Additional Resources

- **Swagger Documentation:** `https://localhost:7197/swagger`
- **EF Core Docs:** https://docs.microsoft.com/ef/core/
- **ASP.NET Core Docs:** https://docs.microsoft.com/aspnet/core/
- **JWT Guide:** https://jwt.io/

## 🤝 Contributing

Follow the established patterns:
1. Repository → Service → Controller
2. FluentValidation for inputs
3. Soft delete for all entities
4. Consistent error handling
5. Logging for all operations