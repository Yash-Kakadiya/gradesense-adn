import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/layout'
import { Card, Button, Input, Select, Avatar, Badge, Modal } from '@/components/common'
import { useModal } from '@/hooks'
import { useAuth } from '@/context/AuthContext'
import { User, Mail, Phone, Calendar, Book, Building, Save, Lock, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

const passwordSchema = z
    .object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'Password must be at least 6 characters'),
        confirmPassword: z.string().min(1, 'Please confirm your password'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    })

const StudentProfilePage = () => {
    const { user } = useAuth()
    const passwordModal = useModal()
    const [isEditing, setIsEditing] = useState(false)

    // Mock student data - replace with actual API call
    const studentData = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 234 567 8900',
        rollNumber: 'CS23001',
        batch: 'CS 2023',
        department: 'Computer Science',
        semester: 3,
        dateOfBirth: '2003-05-15',
        gender: 'Male',
        address: '123 Main Street, City, State 12345',
        guardianName: 'Robert Doe',
        guardianPhone: '+1 234 567 8901',
        admissionDate: '2023-08-01',
        cgpa: 8.4,
        status: 'Active',
    }

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(passwordSchema),
    })

    const handlePasswordChange = async (data) => {
        try {
            // API call to change password
            console.log('Password change:', data)
            toast.success('Password changed successfully')
            passwordModal.close()
            reset()
        } catch (error) {
            toast.error('Failed to change password')
        }
    }

    const handleProfileUpdate = () => {
        toast.success('Profile updated successfully')
        setIsEditing(false)
    }

    return (
        <div>
            <PageHeader
                title="My Profile"
                description="View and manage your profile information"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="lg:col-span-1">
                    <Card.Body className="text-center py-8">
                        <div className="relative inline-block">
                            <Avatar
                                name={`${studentData.firstName} ${studentData.lastName}`}
                                size="xl"
                                className="w-24 h-24 text-2xl mx-auto"
                            />
                            <button className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mt-4">
                            {studentData.firstName} {studentData.lastName}
                        </h2>
                        <p className="text-gray-500">{studentData.rollNumber}</p>
                        <Badge variant="success" className="mt-2">
                            {studentData.status}
                        </Badge>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-2xl font-bold text-blue-600">{studentData.cgpa.toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">CGPA</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-green-600">92%</p>
                                    <p className="text-xs text-gray-500">Attendance</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 space-y-2">
                            <Button
                                variant="outline"
                                fullWidth
                                leftIcon={<Lock className="w-4 h-4" />}
                                onClick={passwordModal.open}
                            >
                                Change Password
                            </Button>
                        </div>
                    </Card.Body>
                </Card>

                {/* Details Card */}
                <Card className="lg:col-span-2">
                    <Card.Header>
                        <div className="flex items-center justify-between">
                            <Card.Title>Personal Information</Card.Title>
                            {!isEditing ? (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    Edit Profile
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={<Save className="w-4 h-4" />}
                                        onClick={handleProfileUpdate}
                                    >
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <User className="w-4 h-4" />
                                    <span>Full Name</span>
                                </div>
                                {isEditing ? (
                                    <Input defaultValue={`${studentData.firstName} ${studentData.lastName}`} />
                                ) : (
                                    <p className="font-medium">{studentData.firstName} {studentData.lastName}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Mail className="w-4 h-4" />
                                    <span>Email</span>
                                </div>
                                <p className="font-medium">{studentData.email}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Phone className="w-4 h-4" />
                                    <span>Phone</span>
                                </div>
                                {isEditing ? (
                                    <Input defaultValue={studentData.phone} />
                                ) : (
                                    <p className="font-medium">{studentData.phone}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <span>Date of Birth</span>
                                </div>
                                <p className="font-medium">
                                    {new Date(studentData.dateOfBirth).toLocaleDateString()}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Building className="w-4 h-4" />
                                    <span>Department</span>
                                </div>
                                <p className="font-medium">{studentData.department}</p>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Book className="w-4 h-4" />
                                    <span>Batch</span>
                                </div>
                                <p className="font-medium">{studentData.batch} • Semester {studentData.semester}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-4">Guardian Information</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <User className="w-4 h-4" />
                                        <span>Guardian Name</span>
                                    </div>
                                    <p className="font-medium">{studentData.guardianName}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <Phone className="w-4 h-4" />
                                        <span>Guardian Phone</span>
                                    </div>
                                    <p className="font-medium">{studentData.guardianPhone}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <h4 className="font-medium text-gray-900 mb-4">Address</h4>
                            {isEditing ? (
                                <Input defaultValue={studentData.address} />
                            ) : (
                                <p className="text-gray-700">{studentData.address}</p>
                            )}
                        </div>
                    </Card.Body>
                </Card>
            </div>

            {/* Academic Info Card */}
            <Card className="mt-6">
                <Card.Header>
                    <Card.Title>Academic Information</Card.Title>
                </Card.Header>
                <Card.Body>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{studentData.rollNumber}</p>
                            <p className="text-sm text-gray-500">Roll Number</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{studentData.batch}</p>
                            <p className="text-sm text-gray-500">Batch</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">{studentData.semester}</p>
                            <p className="text-sm text-gray-500">Current Semester</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-900">
                                {new Date(studentData.admissionDate).getFullYear()}
                            </p>
                            <p className="text-sm text-gray-500">Admission Year</p>
                        </div>
                    </div>
                </Card.Body>
            </Card>

            {/* Change Password Modal */}
            <Modal
                isOpen={passwordModal.isOpen}
                onClose={passwordModal.close}
                title="Change Password"
            >
                <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
                    <Input
                        type="password"
                        label="Current Password"
                        {...register('currentPassword')}
                        error={errors.currentPassword?.message}
                    />
                    <Input
                        type="password"
                        label="New Password"
                        {...register('newPassword')}
                        error={errors.newPassword?.message}
                    />
                    <Input
                        type="password"
                        label="Confirm New Password"
                        {...register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={passwordModal.close}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={isSubmitting}>
                            Change Password
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default StudentProfilePage
