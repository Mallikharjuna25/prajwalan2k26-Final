import { NavLink } from 'react-router-dom';
import { FiGrid, FiBookmark, FiCalendar, FiPieChart, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import useAuth from '../../hooks/useAuth';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StudentSidebar = () => {
    const { logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const navItems = [
        { name: 'Events', path: '/student/dashboard', icon: <FiGrid /> },
        { name: 'My Events', path: '/student/dashboard/my-events', icon: <FiBookmark /> },
        { name: 'Calendar', path: '/student/dashboard/calendar', icon: <FiCalendar /> },
        { name: 'Analytics', path: '/student/dashboard/analytics', icon: <FiPieChart /> },
        { name: 'Profile', path: '/student/dashboard/profile', icon: <FiUser /> },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-surface-card border-r border-surface-border w-64 md:w-72">
            <div className="p-6">
                <h2 className="text-2xl font-heading font-bold text-gradient">Student Hub</h2>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        end={item.path === '/student/dashboard'}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? 'bg-gradient-neon text-white font-medium shadow-neon'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`
                        }
                    >
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-surface-border">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                >
                    <FiLogOut className="text-lg" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-surface-card rounded-lg border border-surface-border"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <FiX className="text-white text-xl" /> : <FiMenu className="text-white text-xl" />}
            </button>

            <div className="hidden md:block h-screen fixed left-0 top-0">
                <SidebarContent />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                            transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
                            className="md:hidden fixed left-0 top-0 h-screen z-50 shadow-2xl"
                        >
                            <SidebarContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default StudentSidebar;
