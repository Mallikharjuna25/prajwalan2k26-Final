import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import EventCard from '../../components/common/EventCard';
import Loader from '../../components/common/Loader';
import { FiArrowRight, FiZap, FiShield, FiTrendingUp } from 'react-icons/fi';

const LandingPage = () => {
    const [featuredEvents, setFeaturedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
    const y2 = useTransform(scrollY, [0, 1000], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('/events');
                setFeaturedEvents(data.slice(0, 6)); // Top 6 events
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
                    <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-neon-purple/30 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-4000"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
                </div>

                <motion.div
                    style={{ opacity, y: y1 }}
                    className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            Discover & Join <br />
                            <span className="text-gradient">Amazing Events</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            The ultimate platform for college students to explore, register, and experience incredible events. Manage your registrations and unearth new opportunities all in one place.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/events" className="btn-primary text-lg flex items-center justify-center gap-2 group">
                                Explore Events
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/about" className="btn-secondary text-lg flex items-center justify-center">
                                Learn More
                            </Link>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 text-gray-500 flex flex-col items-center gap-2"
                >
                    <span className="uppercase tracking-widest text-xs font-bold">Scroll Down</span>
                    <div className="w-px h-12 bg-gradient-to-b from-gray-500 to-transparent"></div>
                </motion.div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative z-10 bg-surface/50 backdrop-blur-3xl border-y border-white/5">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Why EventNexus?</h2>
                        <p className="text-gray-400 max-w-xl mx-auto">Everything you need to manage your collegiate event experience perfectly.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div whileHover={{ y: -10 }} className="card bg-surface/80 border-primary/20">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center mb-6">
                                <FiZap className="text-2xl text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Instant Registration</h3>
                            <p className="text-gray-400">One-click registration with auto-filled details. Get your QR entry pass delivered instantly via email.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -10 }} className="card bg-surface/80 border-accent/20">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center mb-6">
                                <FiShield className="text-2xl text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Secure & Verified</h3>
                            <p className="text-gray-400">All organizers and students are verified by admins, ensuring a safe and authentic ecosystem.</p>
                        </motion.div>

                        <motion.div whileHover={{ y: -10 }} className="card bg-surface/80 border-purple-500/20">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
                                <FiTrendingUp className="text-2xl text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Rich Analytics</h3>
                            <p className="text-gray-400">Track your attendance, view charts of your activities, and build an impressive portfolio of participation.</p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Featured Events Section */}
            <section className="py-32 container mx-auto px-6 relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Upcoming Highlights</h2>
                        <p className="text-gray-400">Don't miss out on the most anticipated events.</p>
                    </div>
                    <Link to="/events" className="hidden md:flex items-center gap-2 text-primary-light hover:text-primary transition-colors font-semibold group">
                        View All <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {loading ? (
                    <Loader />
                ) : featuredEvents.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {featuredEvents.map((event, index) => (
                            <motion.div
                                key={event._id}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <EventCard event={event} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-20 bg-surface-card rounded-3xl border border-surface-border">
                        <h3 className="text-2xl font-bold text-gray-300 mb-2">No active events right now</h3>
                        <p className="text-gray-500">Check back later for exciting opportunities!</p>
                    </div>
                )}

                <div className="mt-8 text-center md:hidden">
                    <Link to="/events" className="btn-secondary inline-flex items-center gap-2">
                        View All Events <FiArrowRight />
                    </Link>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative z-10">
                <div className="container mx-auto px-6">
                    <div className="glass-strong rounded-3xl p-12 md:p-20 text-center relative overflow-hidden border-primary/30 shadow-neon">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full mix-blend-screen filter blur-[80px]"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full mix-blend-screen filter blur-[80px]"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to elevate your experience?</h2>
                            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                                Join thousands of students discovering their next big opportunity, or start hosting your own successful events today.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/student/signup" className="btn-primary text-lg">Join as Student</Link>
                                <Link to="/organizer/signup" className="btn-secondary text-lg border-white/20 text-white hover:bg-white/10">Become an Organizer</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
