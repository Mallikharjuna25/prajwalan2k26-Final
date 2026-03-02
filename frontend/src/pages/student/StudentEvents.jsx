import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import EventCard from '../../components/common/EventCard';
import Loader from '../../components/common/Loader';
import { motion } from 'framer-motion';

const StudentEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('All');

    const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'];

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('/events');
                setEvents(data);
            } catch (error) {
                console.error('Failed to fetch events', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = category === 'All' ? events : events.filter(e => e.category === category);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Discover Events</h1>
                <p className="text-gray-400">Explore and register for upcoming events.</p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${category === cat ? 'bg-primary text-white shadow-neon' : 'bg-surface-card text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <Loader />
            ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map(event => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            key={event._id}
                        >
                            <EventCard event={event} />
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-card rounded-2xl border border-surface-border">
                    <p className="text-gray-400">No events found in this category.</p>
                </div>
            )}
        </div>
    );
};

export default StudentEvents;
