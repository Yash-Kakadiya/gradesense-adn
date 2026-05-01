import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false)
    }, [location.pathname])

    return (
        <div className="h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 flex overflow-hidden">
            {/* Subtle background gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50/30 via-transparent to-transparent pointer-events-none" />
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #9CA3AF 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main content wrapper */}
            <div className="flex-1 flex flex-col h-screen min-w-0 relative">
                {/* Navbar */}
                <Navbar onMenuClick={() => setSidebarOpen(true)} />

                {/* Page content with smooth transition */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-[1600px] mx-auto animate-fadeIn">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="flex-shrink-0 py-4 px-6 text-center text-sm text-gray-400 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
                    <p>© 2026 GradeSense. Built with ❤️ for better education management.</p>
                </footer>
            </div>
        </div>
    )
}

export default DashboardLayout
