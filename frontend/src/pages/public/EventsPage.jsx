import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter } from 'react-icons/fi';
import axios from '../../api/axios';
import EventCard from '../../components/common/EventCard';
import Loader from '../../components/common/Loader';

const categories = ["All", "Tech", "Cultural", "Sports", "Academic", "Workshop", "Other"];

const EventsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('/events');
                setEvents(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            event.organizerCollegeName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent z-0 pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Explore <span className="text-gradient">Events</span></h1>
                    <p className="text-lg text-gray-400">Discover coding challenges, cultural fests, sports tournaments, and everything in between.</p>
                </div>

                {/* Filters and Search */}
                <div className="glass p-4 rounded-2xl mb-12 flex flex-col md:flex-row gap-4 items-center justify-between border-white/10 shadow-glass">
                    <div className="relative w-full md:max-w-md">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search events or colleges..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface/50 border border-white/10 text-white placeholder-gray-500 px-12 py-3 rounded-xl focus:outline-none focus:border-primary/50 focus:bg-surface transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                        <FiFilter className="text-gray-400 shrink-0 mr-2" />
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-primary text-white shadow-neon'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <Loader />
                ) : (
                    <>
                        <AnimatePresence mode="popLayout">
                            {filteredEvents.length > 0 ? (
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                                >
                                    {filteredEvents.map(event => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            key={event._id}
                                        >
                                            <EventCard event={event} />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="text-center py-20"
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-surface-card border border-white/10 mb-6">
                                        <FiSearch className="text-3xl text-gray-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-300 mb-2">No events found</h3>
                                    <p className="text-gray-500">Try adjusting your search or category filter.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
};

export default EventsPage;
