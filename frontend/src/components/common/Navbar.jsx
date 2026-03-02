import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../hooks/useAuth';
import { FiMenu, FiX, FiUser } from 'react-icons/fi';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { isAuthenticated, user, role, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleDashboardRedirect = () => {
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'organizer') navigate('/organizer/dashboard');
        else navigate('/student/dashboard');
    };

    return (
        <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}>
            <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">

                {/* Logo */}
                <Link to="/" className="text-2xl font-heading font-bold flex items-center gap-2">
                    <span className="text-gradient">EventNexus</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link to="/events" className="hover:text-primary-light transition-colors font-medium">Events</Link>
                    <Link to="/calendar" className="hover:text-primary-light transition-colors font-medium">Calendar</Link>
                    <Link to="/about" className="hover:text-primary-light transition-colors font-medium">About</Link>
                    <Link to="/contact" className="hover:text-primary-light transition-colors font-medium">Contact</Link>
                </div>

                {/* Right Section (Auth / Avatar) */}
                <div className="hidden md:flex items-center relative">
                    {isAuthenticated ? (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 transition-all px-4 py-2 rounded-full border border-white/10"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center text-sm font-bold">
                                    {user?.name?.charAt(0) || user?.adminId?.charAt(0) || user?.collegeName?.charAt(0) || <FiUser />}
                                </div>
                                <span className="text-sm font-medium">{role}</span>
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-3 w-48 glass rounded-xl shadow-glass overflow-hidden flex flex-col"
                                    >
                                        <button onClick={handleDashboardRedirect} className="text-left px-4 py-3 hover:bg-white/10 transition-colors">Dashboard</button>
                                        <button onClick={logout} className="text-left px-4 py-3 text-red-400 hover:bg-white/10 transition-colors">Logout</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <div className="relative">
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="btn-primary py-2 px-5 text-sm"
                            >
                                Login / Signup
                            </button>

                            <AnimatePresence>
                                {dropdownOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-3 w-56 glass rounded-xl shadow-glass overflow-hidden flex flex-col p-2 space-y-1"
                                    >
                                        <Link to="/student/login" onClick={() => setDropdownOpen(false)} className="px-4 py-2 hover:bg-primary/20 rounded-lg transition-colors text-sm">Student Login</Link>
                                        <Link to="/student/signup" onClick={() => setDropdownOpen(false)} className="px-4 py-2 hover:bg-primary/20 rounded-lg transition-colors text-sm">Student Signup</Link>
                                        <div className="h-px bg-white/10 my-1"></div>
                                        <Link to="/organizer/login" onClick={() => setDropdownOpen(false)} className="px-4 py-2 hover:bg-primary/20 rounded-lg transition-colors text-sm">Organizer Login</Link>
                                        <Link to="/organizer/signup" onClick={() => setDropdownOpen(false)} className="px-4 py-2 hover:bg-primary/20 rounded-lg transition-colors text-sm">Organizer Signup</Link>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-2xl text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden glass border-t border-white/10 overflow-hidden"
                    >
                        <div className="flex flex-col px-6 py-4 space-y-4">
                            <Link to="/events" onClick={() => setMobileMenuOpen(false)}>Events</Link>
                            <Link to="/calendar" onClick={() => setMobileMenuOpen(false)}>Calendar</Link>
                            <Link to="/about" onClick={() => setMobileMenuOpen(false)}>About</Link>
                            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>

                            <div className="h-px bg-white/10 w-full"></div>

                            {isAuthenticated ? (
                                <>
                                    <button onClick={() => { handleDashboardRedirect(); setMobileMenuOpen(false); }} className="text-left">Dashboard ({role})</button>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-left text-red-500">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/student/login" onClick={() => setMobileMenuOpen(false)} className="text-primary-light">Student Login</Link>
                                    <Link to="/organizer/login" onClick={() => setMobileMenuOpen(false)} className="text-accent">Organizer Login</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
