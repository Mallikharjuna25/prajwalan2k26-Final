import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import MyEventCard from '../../components/student/MyEventCard';

const StudentMyEvents = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming'); // upcoming, past

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const { data } = await axios.get('/student/my-events');
                setRegistrations(data);
            } catch (error) {
                console.error('Failed to fetch registered events', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    const today = new Date().toISOString().split('T')[0];

    const filtered = registrations.filter(reg => {
        if (!reg.event) return false;
        const eventDate = new Date(reg.event.date).toISOString().split('T')[0];
        if (filter === 'upcoming') {
            return eventDate >= today;
        } else {
            return eventDate < today;
        }
    });

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                    <p className="text-gray-400">View your registrations and entry passes.</p>
                </div>

                <div className="flex bg-surface-card p-1 rounded-xl border border-surface-border">
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'upcoming' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('past')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'past' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Past Events
                    </button>
                </div>
            </div>

            {loading ? (
                <Loader />
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {filtered.map(reg => (
                        <MyEventCard key={reg._id} registration={reg} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-card/50 rounded-2xl border border-dashed border-white/10">
                    <h3 className="text-xl font-bold text-gray-400 mb-2">No {filter} events</h3>
                    <p className="text-gray-500">You haven't registered for any {filter} events yet.</p>
                </div>
            )}
        </div>
    );
};

export default StudentMyEvents;
