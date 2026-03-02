import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="glass border-t border-white/5 pt-16 pb-8 mt-20">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="text-2xl font-heading font-bold flex items-center gap-2 mb-4">
                            <span className="text-gradient">EventNexus</span>
                        </Link>
                        <p className="text-gray-400 max-w-sm">
                            The centralized platform for college event discovery, registration, and seamless management. Built for students, by students.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/events" className="hover:text-primary transition-colors">Explore Events</Link></li>
                            <li><Link to="/calendar" className="hover:text-primary transition-colors">Calendar</Link></li>
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Accounts</h4>
                        <ul className="space-y-2 text-gray-400">
                            <li><Link to="/student/login" className="hover:text-primary transition-colors">Student Login</Link></li>
                            <li><Link to="/organizer/login" className="hover:text-primary transition-colors">Organizer Login</Link></li>
                            <li><Link to="/admin/login" className="hover:text-primary transition-colors">Admin Portal</Link></li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} EventNexus. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
