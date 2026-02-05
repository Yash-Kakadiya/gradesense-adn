# GradeSense Frontend Development Guide

Complete planning and development guide for building the React-based frontend for GradeSense Student Performance Tracking System.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup & Configuration](#setup--configuration)
5. [Architecture & Patterns](#architecture--patterns)
6. [Page-by-Page Development Plan](#page-by-page-development-plan)
7. [Component Library](#component-library)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Authentication & Authorization](#authentication--authorization)
11. [Styling & Theming](#styling--theming)
12. [Forms & Validation](#forms--validation)
13. [Data Visualization](#data-visualization)
14. [Error Handling](#error-handling)
15. [Performance Optimization](#performance-optimization)
16. [Testing Strategy](#testing-strategy)
17. [Deployment](#deployment)

---

## 1. Project Overview

### **Application Purpose:**
A modern, responsive web application for managing student performance, grades, attendance, and predictions.

### **User Roles:**
- **Admin** - Full system management
- **Faculty** - Course and grade management
- **Student** - View personal academic data

### **Key Features:**
- Dashboard with analytics
- CRUD operations for all entities
- Grade and attendance tracking
- Performance visualization
- ML-based predictions
- Responsive design (mobile-first)

---

## 2. Technology Stack

### **Core Framework:**
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "vite": "^5.0.0"
}
```

### **Routing:**
```json
{
  "react-router-dom": "^6.21.0"
}
```

### **State Management:**
```json
{
  "@tanstack/react-query": "^5.17.0",  // Server state
  "zustand": "^4.4.7"                   // Client state (alternative: Context API)
}
```

### **HTTP Client:**
```json
{
  "axios": "^1.6.5"
}
```

### **Forms & Validation:**
```json
{
  "react-hook-form": "^7.49.3",
  "zod": "^3.22.4",
  "@hookform/resolvers": "^3.3.4"
}
```

### **UI & Styling:**
```json
{
  "tailwindcss": "^3.4.1",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.33"
}
```

### **UI Components:**
```json
{
  "lucide-react": "^0.303.0",          // Icons
  "@headlessui/react": "^1.7.17",      // Unstyled components
  "react-hot-toast": "^2.4.1",         // Notifications
  "recharts": "^2.10.3",               // Charts
  "date-fns": "^3.0.6"                 // Date utilities
}
```

### **Development Tools:**
```json
{
  "@vitejs/plugin-react": "^4.2.1",
  "eslint": "^8.56.0",
  "prettier": "^3.1.1",
  "tailwindcss-animate": "^1.0.7"
}
```

---

## 3. Project Structure

```
GradeSense.Client/
├── public/
│   ├── favicon.ico
│   └── logo.png
│
├── src/
│   ├── assets/               # Static assets (images, fonts)
│   │   ├── images/
│   │   └── fonts/
│   │
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Generic components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Table.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Spinner.jsx
│   │   │   └── Pagination.jsx
│   │   │
│   │   ├── layout/          # Layout components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PageHeader.jsx
│   │   │   └── DashboardLayout.jsx
│   │   │
│   │   └── features/        # Feature-specific components
│   │       ├── auth/
│   │       ├── students/
│   │       ├── courses/
│   │       ├── grades/
│   │       └── attendance/
│   │
│   ├── pages/               # Page components (routes)
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx
│   │   │   └── ResetPasswordPage.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── FacultyDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   │
│   │   ├── admin/           # Admin pages
│   │   │   ├── users/
│   │   │   ├── departments/
│   │   │   ├── batches/
│   │   │   └── subjects/
│   │   │
│   │   ├── faculty/         # Faculty pages
│   │   │   ├── courses/
│   │   │   ├── grades/
│   │   │   ├── attendance/
│   │   │   └── reports/
│   │   │
│   │   └── student/         # Student pages
│   │       ├── courses/
│   │       ├── grades/
│   │       ├── attendance/
│   │       └── profile/
│   │
│   ├── services/            # API service layer
│   │   ├── api.js           # Axios instance & interceptors
│   │   ├── authService.js
│   │   ├── userService.js
│   │   ├── departmentService.js
│   │   ├── studentService.js
│   │   ├── courseService.js
│   │   ├── gradeService.js
│   │   └── attendanceService.js
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   ├── useDebounce.js
│   │   ├── usePagination.js
│   │   ├── useTable.js
│   │   └── useLocalStorage.js
│   │
│   ├── context/             # React Context
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   │
│   ├── store/               # Zustand stores (if using)
│   │   ├── authStore.js
│   │   └── uiStore.js
│   │
│   ├── utils/               # Utility functions
│   │   ├── constants.js     # App constants
│   │   ├── helpers.js       # Helper functions
│   │   ├── validators.js    # Custom validators
│   │   ├── formatters.js    # Data formatters
│   │   └── errorHandler.js  # Error handling
│   │
│   ├── routes/              # Route configuration
│   │   ├── index.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── RoleBasedRoute.jsx
│   │
│   ├── schemas/             # Zod validation schemas
│   │   ├── authSchemas.js
│   │   ├── studentSchemas.js
│   │   └── gradeSchemas.js
│   │
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
│
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .eslintrc.js             # ESLint config
├── .prettierrc              # Prettier config
├── tailwind.config.js       # Tailwind config
├── vite.config.js           # Vite config
├── package.json
└── README.md
```

---

## 4. Setup & Configuration

### **Initial Setup:**

```bash
# Create Vite project
npm create vite@latest GradeSense.Client -- --template react
cd GradeSense.Client

# Install dependencies
npm install

# Install additional packages
npm install react-router-dom axios @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install tailwindcss postcss autoprefixer
npm install lucide-react @headlessui/react react-hot-toast recharts date-fns

# Initialize Tailwind
npx tailwindcss init -p
```

### **Environment Variables (.env):**

```env
VITE_API_URL=https://localhost:7197
VITE_APP_NAME=GradeSense
VITE_APP_VERSION=1.0.0
VITE_ITEMS_PER_PAGE=10
```

### **Vite Configuration (vite.config.js):**

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://localhost:7197',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
```

### **Tailwind Configuration (tailwind.config.js):**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
    },
  },
  plugins: [],
}
```

---

## 5. Architecture & Patterns

### **Design Patterns:**

1. **Component Composition** - Build complex UIs from simple components
2. **Container/Presentational** - Separate logic from UI
3. **Custom Hooks** - Reusable stateful logic
4. **Render Props** - Share code between components
5. **Higher-Order Components** - Component enhancement

### **State Management Strategy:**

```
┌─────────────────────────────────────────────┐
│         React Query (Server State)          │
│   - API data caching                        │
│   - Automatic refetching                    │
│   - Optimistic updates                      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│      Zustand/Context (Client State)         │
│   - Auth state                              │
│   - UI state (modals, theme)                │
│   - User preferences                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│        Local Component State (useState)      │
│   - Form inputs                             │
│   - UI toggles                              │
│   - Temporary data                          │
└─────────────────────────────────────────────┘
```

### **Folder-by-Feature vs Folder-by-Type:**

**Hybrid Approach:**
- Common components → By type (`components/common/`)
- Feature-specific → By feature (`components/features/students/`)
- Pages → By role/feature (`pages/admin/users/`)

---

## 6. Page-by-Page Development Plan

### **Phase 1: Authentication & Layout (Week 1)**

#### **Pages to Build:**
1. **Login Page** (`/login`)
   - Email/password form
   - Remember me checkbox
   - Validation with Zod
   - Error handling

2. **Dashboard Layout**
   - Responsive sidebar
   - Top navbar with user menu
   - Breadcrumbs
   - Footer

3. **Not Found Page** (`/404`)

### **Phase 2: Admin Module (Week 2-3)**

#### **User Management:**
1. **Users List** (`/admin/users`)
   - Searchable table
   - Filters (role, active status)
   - Pagination
   - Actions (view, edit, delete)

2. **Create User** (`/admin/users/create`)
   - Form with validation
   - Role selection
   - Success/error feedback

3. **Edit User** (`/admin/users/:id/edit`)
   - Pre-filled form
   - Password change option

4. **View User** (`/admin/users/:id`)
   - User details
   - Related data (if Faculty/Student)

#### **Department Management:**
5. **Departments List** (`/admin/departments`)
6. **Create/Edit Department**
7. **View Department** (with statistics)

#### **Batch Management:**
8. **Batches List** (`/admin/batches`)
9. **Create/Edit Batch**
10. **View Batch**

#### **Subject Management:**
11. **Subjects List** (`/admin/subjects`)
12. **Create/Edit Subject**
13. **View Subject** (with units)

### **Phase 3: Faculty Module (Week 4-5)**

#### **Course Management:**
1. **My Courses** (`/faculty/courses`)
   - Courses coordinating
   - Courses teaching
   - Quick actions

2. **Course Detail** (`/faculty/courses/:id`)
   - Enrolled students
   - Evaluation schemes
   - Assessment items
   - Quick grade entry

#### **Grade Management:**
3. **Grade Entry** (`/faculty/grades`)
   - Select course
   - Select assessment
   - Bulk grade entry
   - Import from CSV

4. **Grade Review** (`/faculty/grades/review`)
   - Course-wise grades
   - Statistics
   - Export options

#### **Attendance Management:**
5. **Mark Attendance** (`/faculty/attendance`)
   - Select course
   - Date picker
   - Quick mark (Present/Absent)
   - Bulk operations

6. **Attendance Reports** (`/faculty/attendance/reports`)
   - Student-wise summary
   - Course-wise summary
   - Low attendance alerts

#### **Reports:**
7. **Class Performance** (`/faculty/reports/class`)
   - Average scores
   - Grade distribution
   - Charts and graphs

8. **Student Performance** (`/faculty/reports/students`)
   - Individual student analysis
   - Predictions

### **Phase 4: Student Module (Week 6)**

#### **Student Dashboard:**
1. **Dashboard** (`/student/dashboard`)
   - Current semester courses
   - CGPA tracker
   - Attendance summary
   - Recent grades
   - Predictions/alerts

#### **My Courses:**
2. **Courses List** (`/student/courses`)
   - Enrolled courses
   - Course details
   - Faculty info

3. **Course Detail** (`/student/courses/:id`)
   - Syllabus
   - Evaluation scheme
   - My grades
   - Attendance

#### **Grades:**
4. **My Grades** (`/student/grades`)
   - Semester-wise
   - Subject-wise
   - Grade trends (charts)

#### **Attendance:**
5. **My Attendance** (`/student/attendance`)
   - Subject-wise percentage
   - Calendar view
   - Monthly summary

#### **Profile:**
6. **My Profile** (`/student/profile`)
   - Personal info
   - Academic info
   - CGPA trend
   - Change password

### **Phase 5: Advanced Features (Week 7-8)**

1. **Analytics Dashboard**
   - Department-wise performance
   - Batch comparisons
   - Subject difficulty analysis
   - Prediction accuracy

2. **Bulk Operations**
   - CSV import/export
   - Bulk student enrollment
   - Bulk grade entry

3. **Notifications**
   - In-app notifications
   - Real-time updates (future: WebSocket)

4. **Search & Filters**
   - Global search
   - Advanced filtering
   - Saved filters

---

## 7. Component Library

### **Core Components to Build:**

#### **Form Components:**
```jsx
<Input />              // Text input
<Select />             // Dropdown select
<Checkbox />           // Checkbox
<Radio />              // Radio button
<DatePicker />         // Date input
<FileUpload />         // File upload
<SearchInput />        // Search with debounce
```

#### **Data Display:**
```jsx
<Table />              // Data table with sorting
<Card />               // Card container
<Badge />              // Status badge
<Avatar />             // User avatar
<EmptyState />         // No data state
<ErrorState />         // Error state
```

#### **Feedback:**
```jsx
<Alert />              // Alert messages
<Toast />              // Toast notifications
<Modal />              // Modal dialog
<ConfirmDialog />      // Confirmation dialog
<Spinner />            // Loading spinner
<ProgressBar />        // Progress indicator
```

#### **Navigation:**
```jsx
<Tabs />               // Tab navigation
<Breadcrumbs />        // Breadcrumb trail
<Pagination />         // Page navigation
<Menu />               // Dropdown menu
```

#### **Charts:**
```jsx
<LineChart />          // Line chart
<BarChart />           // Bar chart
<PieChart />           // Pie chart
<AreaChart />          // Area chart
```

### **Component Example Pattern:**

```jsx
// Button.jsx
import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'

const Button = forwardRef(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2',
          {
            'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
            'bg-white text-gray-900 border hover:bg-gray-50': variant === 'secondary',
            'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4': size === 'md',
            'h-12 px-6 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

export default Button
```

---

## 8. State Management

### **Option A: React Query + Context API**

```jsx
// AuthContext.jsx
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  const login = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('token', authToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

### **Option B: Zustand**

```jsx
// stores/authStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)
```

### **React Query Setup:**

```jsx
// App.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  )
}
```

---

## 9. API Integration

### **Axios Instance Setup:**

```javascript
// services/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
```

### **Service Layer Pattern:**

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

### **React Query Hooks:**

```javascript
// hooks/useStudents.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studentService } from '@/services/studentService'

export const useStudents = (params) => {
  return useQuery({
    queryKey: ['students', params],
    queryFn: () => studentService.getAll(params),
  })
}

export const useStudent = (id) => {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => studentService.getById(id),
    enabled: !!id,
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: studentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
    },
  })
}
```

---

## 10. Authentication & Authorization

### **Protected Route:**

```jsx
// routes/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export const ProtectedRoute = () => {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

### **Role-Based Route:**

```jsx
// routes/RoleBasedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export const RoleBasedRoute = ({ allowedRoles }) => {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}
```

### **Route Configuration:**

```jsx
// routes/index.jsx
import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleBasedRoute } from './RoleBasedRoute'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: 'admin',
        element: <RoleBasedRoute allowedRoles={['Admin']} />,
        children: [
          { path: 'users', element: <UsersListPage /> },
          { path: 'users/create', element: <CreateUserPage /> },
          // ...
        ],
      },
      {
        path: 'faculty',
        element: <RoleBasedRoute allowedRoles={['Faculty', 'Admin']} />,
        children: [
          { path: 'courses', element: <CoursesListPage /> },
          // ...
        ],
      },
      {
        path: 'student',
        element: <RoleBasedRoute allowedRoles={['Student']} />,
        children: [
          { path: 'dashboard', element: <StudentDashboard /> },
          // ...
        ],
      },
    ],
  },
])
```

---

## 11. Styling & Theming

### **Tailwind Utility Classes:**

```jsx
// Common patterns
<div className="container mx-auto px-4 py-8">
  <h1 className="text-3xl font-bold text-gray-900 mb-6">Title</h1>
  <div className="bg-white rounded-lg shadow-md p-6">
    {/* Content */}
  </div>
</div>
```

### **Responsive Design:**

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

### **Dark Mode (Optional):**

```jsx
// ThemeContext.jsx
import { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

---

## 12. Forms & Validation

### **Form Pattern with React Hook Form + Zod:**

```jsx
// schemas/studentSchemas.js
import { z } from 'zod'

export const createStudentSchema = z.object({
  userId: z.number().min(1, 'User is required'),
  enrollmentNumber: z.string().min(1, 'Enrollment number is required'),
  departmentId: z.number().min(1, 'Department is required'),
  admissionYear: z.number().min(2000).max(new Date().getFullYear() + 1),
  currentSemester: z.number().min(1).max(8),
  cgpa: z.number().min(0).max(10).optional(),
})
```

```jsx
// CreateStudentForm.jsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createStudentSchema } from '@/schemas/studentSchemas'

export const CreateStudentForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createStudentSchema),
  })

  const onSubmit = (data) => {
    console.log(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Enrollment Number"
        {...register('enrollmentNumber')}
        error={errors.enrollmentNumber?.message}
      />
      {/* More fields */}
      <Button type="submit">Create Student</Button>
    </form>
  )
}
```

---

## 13. Data Visualization

### **Chart Examples:**

```jsx
// GradeDistributionChart.jsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

export const GradeDistributionChart = ({ data }) => {
  return (
    <BarChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="grade" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="count" fill="#3b82f6" />
    </BarChart>
  )
}
```

---

## 14. Error Handling

### **Error Boundary:**

```jsx
// components/ErrorBoundary.jsx
import { Component } from 'react'

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Something went wrong</h1>
            <p className="text-gray-600 mt-2">{this.state.error?.message}</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### **Toast Notifications:**

```jsx
// Using react-hot-toast
import toast from 'react-hot-toast'

// Success
toast.success('Student created successfully!')

// Error
toast.error('Failed to create student')

// Loading
const loading = toast.loading('Creating student...')
toast.dismiss(loading)
```

---

## 15. Performance Optimization

### **Best Practices:**

1. **Code Splitting:**
```jsx
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))

<Suspense fallback={<Spinner />}>
  <AdminDashboard />
</Suspense>
```

2. **Memoization:**
```jsx
import { memo, useMemo, useCallback } from 'react'

const ExpensiveComponent = memo(({ data }) => {
  const processedData = useMemo(() => {
    return data.map(/* expensive operation */)
  }, [data])

  return <div>{/* Render */}</div>
})
```

3. **Virtualization for large lists:**
```jsx
import { useVirtualizer } from '@tanstack/react-virtual'
```

---

## 16. Testing Strategy

### **Testing Tools:**
```json
{
  "vitest": "^1.1.0",
  "@testing-library/react": "^14.1.2",
  "@testing-library/jest-dom": "^6.1.5",
  "@testing-library/user-event": "^14.5.1"
}
```

### **Test Types:**

1. **Unit Tests** - Individual components
2. **Integration Tests** - Component interactions
3. **E2E Tests** - Full user flows (future: Playwright/Cypress)

### **Example Test:**

```jsx
// Button.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 17. Deployment

### **Build for Production:**

```bash
npm run build
```

### **Deployment Options:**

1. **Vercel** (Recommended for Vite/React)
2. **Netlify**
3. **AWS S3 + CloudFront**
4. **Azure Static Web Apps**
5. **Docker Container**

### **Environment-Specific Configs:**

```
.env.development   # Development
.env.staging       # Staging
.env.production    # Production
```

---

## 📊 Development Timeline

| Week | Focus Area | Deliverables |
|------|-----------|--------------|
| 1 | Setup & Auth | Login, Layout, Routing |
| 2 | Admin Module | Users, Departments CRUD |
| 3 | Admin Module | Batches, Subjects CRUD |
| 4 | Faculty Module | Courses, Grades |
| 5 | Faculty Module | Attendance, Reports |
| 6 | Student Module | Dashboard, Grades, Attendance |
| 7 | Advanced Features | Analytics, Bulk Operations |
| 8 | Polish & Testing | Bug fixes, Testing, Optimization |

---

## 🎯 Success Metrics

- ✅ All 17 entity CRUD operations functional
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Page load time < 2 seconds
- ✅ No console errors
- ✅ Accessibility score > 90 (Lighthouse)
- ✅ Test coverage > 70%

---

**This guide serves as a complete reference for building the GradeSense frontend. Follow the patterns and conventions outlined here for consistency and maintainability.**

