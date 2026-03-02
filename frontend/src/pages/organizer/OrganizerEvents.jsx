import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import { FiPlus, FiEdit2, FiUsers, FiCamera, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import { getEventStatus } from '../../utils/eventStatus';
import EventStatusBadge from '../../components/common/EventStatusBadge';
import CountdownTimer from '../../components/common/CountdownTimer';
import CancelEventModal from '../../components/organizer/CancelEventModal';
import { FiSlash } from 'react-icons/fi';
import toast from 'react-hot-toast';

const OrganizerEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const filterTabs = ['All', 'PENDING', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED'];

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/organizer/events');
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch organizer events', error);
            toast.error('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                    <p className="text-gray-400">Manage all events hosted by your institution.</p>
                </div>
                <Link to="/organizer/dashboard/create" className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
                    <FiPlus /> <span className="hidden sm:inline">Create Event</span>
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-none">
                {filterTabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => setStatusFilter(tab)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${statusFilter === tab
                            ? 'bg-primary text-white'
                            : 'bg-surface-card text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {tab === 'ONGOING' ? 'Live Now' : tab}
                    </button>
                ))}
            </div>

            {loading ? (
                <Loader />
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {events.filter(event => statusFilter === 'All' || getEventStatus(event) === statusFilter).map((event) => {
                        const status = getEventStatus(event);
                        const datePart = typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0];
                        const startDateTime = new Date(`${datePart}T${event.time || '00:00'}:00`);

                        return (
                            <div key={event._id} className="card p-0 overflow-hidden flex flex-col">
                                <div className="h-40 bg-surface-border relative">
                                    {event.bannerImage ? (
                                        <img src={`http://localhost:5000${event.bannerImage}`} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-neon" />
                                    )}
                                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-black/50 text-white backdrop-blur-md">
                                        {event.category}
                                    </div>
                                    <div className="absolute top-3 left-3">
                                        <EventStatusBadge status={status} />
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{event.title}</h3>

                                    <div className="flex justify-between items-start text-sm text-gray-400 mb-6">
                                        <div className="flex flex-col gap-1">
                                            <span>{format(new Date(event.date), 'MMM do, yyyy')}</span>
                                            {status === 'UPCOMING' && <CountdownTimer targetDate={startDateTime} />}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span>{event.registrationCount || 0} / {event.capacity || event.maxParticipants} Joined</span>
                                            <span className={`font-semibold mt-1 ${event.registrationFee > 0 ? 'text-green-400' : 'text-primary-light'}`}>
                                                {event.registrationFee > 0 ? `₹${event.registrationFee}` : 'Free Event'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-auto grid grid-cols-2 gap-2">
                                        <Link
                                            to={`/events/${event._id}`}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
                                        >
                                            <FiEye /> View
                                        </Link>
                                        <Link
                                            to={`/organizer/dashboard/edit/${event._id}`}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
                                        >
                                            <FiEdit2 /> Edit
                                        </Link>
                                        <Link
                                            to={`/organizer/dashboard/participants/${event._id}`}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
                                        >
                                            <FiUsers /> Guests
                                        </Link>
                                        <Link
                                            to={`/organizer/dashboard/scan/${event._id}`}
                                            className="flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary-light text-sm font-medium transition-colors"
                                        >
                                            <FiCamera /> Scan QR
                                        </Link>

                                        {(status === 'PENDING' || status === 'UPCOMING' || status === 'ONGOING') && (
                                            <button
                                                onClick={() => {
                                                    setSelectedEventId(event._id);
                                                    setShowCancelModal(true);
                                                }}
                                                className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-lg border border-red-500/50 hover:bg-red-500/10 text-red-500 text-sm font-bold transition-all mt-2"
                                                title="Cancelling will refund all paid participants before event is removed"
                                            >
                                                <FiSlash /> Cancel Event
                                            </button>
                                        )}

                                        {status === 'CANCELLED' && (
                                            <button
                                                onClick={() => {
                                                    setSelectedEventId(event._id);
                                                    setShowCancelModal(true);
                                                }}
                                                className="col-span-2 flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500 text-white text-sm font-bold transition-all mt-2"
                                            >
                                                <FiTrash2 /> View Refund Report
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-card rounded-2xl border border-surface-border">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <FiPlus className="text-2xl text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No events created yet</h3>
                    <p className="text-gray-500 mb-6">Start hosting incredible events by creating your first one.</p>
                    <Link to="/organizer/dashboard/create" className="btn-primary inline-flex">
                        Create Event
                    </Link>
                </div>
            )}

            {showCancelModal && (
                <CancelEventModal
                    eventId={selectedEventId}
                    onClose={() => setShowCancelModal(false)}
                    onRefresh={fetchEvents}
                />
            )}
        </div>
    );
};

export default OrganizerEvents;
