# GradeSense.Client - Frontend Application

React-based frontend for the GradeSense Student Performance Tracking System.

## 📋 Overview

Modern, responsive web application built with **React 18**, **Vite**, and **Tailwind CSS** for managing student academic performance, grades, and attendance.

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3+ | UI Framework |
| Vite | 5.0+ | Build Tool & Dev Server |
| React Router | 6.x | Client-side Routing |
| Tailwind CSS | 3.x | Utility-first CSS |
| Axios | 1.x | HTTP Client |
| React Query | 5.x | Server State Management |
| Zustand | 4.x | Client State Management |
| React Hook Form | 7.x | Form Management |
| Zod | 3.x | Schema Validation |
| Recharts | 2.x | Data Visualization |
| Lucide React | Latest | Icon Library |

## 🚀 Quick Start

### **Prerequisites**

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### **Installation**

```bash
# Clone repository
git clone [repository-url]
cd GradeSense.Client

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your API URL
VITE_API_URL=https://localhost:7197

# Start development server
npm run dev
```

Application will be available at: `http://localhost:5173`

## 📁 Project Structure

```
src/
├── assets/              # Images, fonts, static files
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Input, etc.)
│   ├── layout/         # Layout components (Navbar, Sidebar)
│   └── features/       # Feature-specific components
├── pages/              # Page components (routes)
│   ├── auth/
│   ├── admin/
│   ├── faculty/
│   └── student/
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── routes/             # Route configuration
├── schemas/            # Zod validation schemas
├── utils/              # Utility functions
├── App.jsx             # Root component
└── main.jsx            # Entry point
```

## 🎨 Key Features

### **For Admins:**
- 👥 User management (Create, Edit, Delete users)
- 🏢 Department management
- 📚 Batch and subject configuration
- 📊 System-wide analytics and reports

### **For Faculty:**
- 📖 Course management
- ✏️ Grade entry and management
- 📅 Attendance tracking
- 📈 Class performance analytics
- 📄 Report generation

### **For Students:**
- 📚 View enrolled courses
- 📊 Check grades and CGPA
- 📅 View attendance records
- 📈 Performance trends
- ⚠️ At-risk predictions

## 🔐 Authentication

The app uses **JWT Bearer Token** authentication with role-based access control.

### **User Roles:**
- **Admin** - Full system access
- **Faculty** - Course & grade management
- **Student** - View personal data

### **Login Flow:**

```
1. User enters credentials
2. API validates and returns JWT token
3. Token stored in localStorage
4. Token sent with every API request
5. Automatic redirect on token expiry
```

## 🛣️ Routing

### **Public Routes:**
- `/login` - Login page

### **Admin Routes:**
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/departments` - Department management
- `/admin/batches` - Batch management
- `/admin/subjects` - Subject management

### **Faculty Routes:**
- `/faculty/dashboard` - Faculty dashboard
- `/faculty/courses` - My courses
- `/faculty/grades` - Grade management
- `/faculty/attendance` - Attendance tracking
- `/faculty/reports` - Reports

### **Student Routes:**
- `/student/dashboard` - Student dashboard
- `/student/courses` - My courses
- `/student/grades` - My grades
- `/student/attendance` - My attendance
- `/student/profile` - My profile

## 📦 State Management

### **Server State (React Query):**
- API data caching
- Automatic background refetching
- Optimistic updates
- Request deduplication

### **Client State (Zustand/Context):**
- Authentication state
- UI state (modals, theme)
- User preferences

## 🎨 Styling

### **Tailwind CSS Utilities:**

```jsx
// Container
<div className="container mx-auto px-4 py-8">

// Card
<div className="bg-white rounded-lg shadow-md p-6">

// Button
<button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700">

// Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### **Custom Components:**

```jsx
import { Button, Input, Card, Table, Modal } from '@/components/common'

<Button variant="primary" size="md">Click me</Button>
<Input label="Email" error="Email is required" />
<Card title="Dashboard">Content</Card>
```

## 📊 API Integration

### **Service Layer:**

```javascript
// services/studentService.js
import api from './api'

export const studentService = {
  getAll: (params) => api.get('/api/students', { params }),
  getById: (id) => api.get(`/api/students/${id}`),
  create: (data) => api.post('/api/students', data),
  update: (id, data) => api.put(`/api/students/${id}`, data),
  delete: (id) => api.delete(`/api/students/${id}`),
}
```

### **Using React Query:**

```jsx
import { useStudents, useCreateStudent } from '@/hooks/useStudents'

function StudentsList() {
  const { data, isLoading } = useStudents({ pageNumber: 1, pageSize: 10 })
  const createStudent = useCreateStudent()

  if (isLoading) return <Spinner />

  return (
    <div>
      {data?.data.map(student => (
        <div key={student.id}>{student.fullName}</div>
      ))}
    </div>
  )
}
```

## 📝 Forms & Validation

### **Using React Hook Form + Zod:**

```jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} error={errors.email?.message} />
      <Input type="password" {...register('password')} error={errors.password?.message} />
      <Button type="submit">Login</Button>
    </form>
  )
}
```

## 📊 Charts & Visualization

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<LineChart width={500} height={300} data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Line type="monotone" dataKey="value" stroke="#3b82f6" />
</LineChart>
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🏗️ Build & Deployment

### **Development:**
```bash
npm run dev
```

### **Production Build:**
```bash
npm run build
```

### **Preview Production Build:**
```bash
npm run preview
```

### **Lint & Format:**
```bash
npm run lint
npm run format
```

## 🌍 Environment Variables

Create a `.env` file:

```env
VITE_API_URL=https://localhost:7197
VITE_APP_NAME=GradeSense
VITE_APP_VERSION=1.0.0
VITE_ITEMS_PER_PAGE=10
```

## 📈 Performance

### **Optimization Strategies:**

1. **Code Splitting:**
   - Lazy loading routes
   - Dynamic imports for heavy components

2. **Memoization:**
   - React.memo for expensive components
   - useMemo for expensive calculations
   - useCallback for function props

3. **Image Optimization:**
   - WebP format
   - Lazy loading images
   - Responsive images

4. **Bundle Size:**
   - Tree shaking
   - Remove unused dependencies
   - Analyze with `npm run build -- --analyze`

## 🐛 Common Issues

### **Issue: API requests failing**
**Solution:** Check VITE_API_URL in .env and verify backend is running

### **Issue: 401 Unauthorized**
**Solution:** Token expired, logout and login again

### **Issue: CORS errors**
**Solution:** Verify backend CORS configuration allows frontend origin

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router](https://reactrouter.com/)
- [React Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)

## 🤝 Contributing

1. Follow the established code patterns
2. Use TypeScript for new files (if migrating)
3. Write tests for new features
4. Run linter before committing
5. Follow commit message conventions

## 📝 Code Style

- Use functional components
- Use hooks over class components
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper TypeScript types (if using TypeScript)

## 📧 Support

For issues or questions, contact: kakadiyayash77@gmail.com

