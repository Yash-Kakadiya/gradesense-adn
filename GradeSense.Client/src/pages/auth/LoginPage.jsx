import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Card, Alert } from '@/components/common'
import { GraduationCap, Mail, Lock, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(1, 'Password is required'),
})

const LoginPage = () => {
    const { login, isAuthenticated, getDashboardRoute } = useAuth()
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to={getDashboardRoute()} replace />
    }

    const onSubmit = async (data) => {
        setError('')
        setIsLoading(true)
        try {
            const result = await login(data)
            if (result.success) {
                navigate(result.redirectPath)
            } else {
                setError(result.error || 'Login failed')
            }
        } catch (err) {
            setError('An unexpected error occurred')
        } finally {
            setIsLoading(false)
        }
    }

    const fillCredentials = (email, password) => {
        setValue('email', email, { shouldValidate: true, shouldDirty: true })
        setValue('password', password, { shouldValidate: true, shouldDirty: true })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <GraduationCap className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">GradeSense</h1>
                    <p className="text-gray-600 mt-2">Student Performance Tracking System</p>
                </div>

                {/* Login Card */}
                <Card className="shadow-xl">
                    <Card.Body>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                            Sign in to your account
                        </h2>

                        {error && (
                            <Alert variant="error" className="mb-4" dismissible onDismiss={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <Input
                                label="Email"
                                type="email"
                                placeholder="Enter your email"
                                leftIcon={<Mail className="w-5 h-5" />}
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <div className="relative">
                                <Input
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    leftIcon={<Lock className="w-5 h-5" />}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-[34px] text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">Remember me</span>
                                </label>
                                <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                                    Forgot password?
                                </a>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                loading={isLoading}
                            >
                                Sign In
                            </Button>
                        </form>
                    </Card.Body>
                </Card>

                {/* Test Credentials */}
                <div className="mt-6 p-4 bg-white/50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Test Credentials:</p>
                    <div className="space-y-2 text-xs text-gray-600">
                        <div className="flex items-center justify-between gap-3">
                            <p><span className="font-medium">Admin:</span> admin@gradesense.edu / Admin@123</p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => fillCredentials('admin@gradesense.edu', 'Admin@123')}
                            >
                                Use
                            </Button>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <p><span className="font-medium">Faculty:</span> faculty@gradesense.edu / Faculty@123</p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => fillCredentials('faculty@gradesense.edu', 'Faculty@123')}
                            >
                                Use
                            </Button>
                        </div>
                        <div className="flex items-center justify-between gap-3">
                            <p><span className="font-medium">Student:</span> student@gradesense.edu / Student@123</p>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => fillCredentials('student@gradesense.edu', 'Student@123')}
                            >
                                Use
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2026 GradeSense. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default LoginPage
