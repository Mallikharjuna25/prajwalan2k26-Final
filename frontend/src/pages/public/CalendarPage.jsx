import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCalendar, FiMapPin, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await axios.get('/events');
                // Format for FullCalendar
                const formattedEvents = data.map(ev => {
                    // Combine date and time
                    const dateStr = new Date(ev.date).toISOString().split('T')[0];
                    return {
                        id: ev._id,
                        title: ev.title,
                        start: `${dateStr}T${ev.time}:00`,
                        backgroundColor: getCategoryColor(ev.category),
                        borderColor: getCategoryColor(ev.category),
                        extendedProps: { ...ev }
                    };
                });
                setEvents(formattedEvents);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const getCategoryColor = (category) => {
        switch (category) {
            case 'Tech': return '#7c3aed';       // Primary Purple
            case 'Cultural': return '#ec4899';   // Pink
            case 'Sports': return '#f59e0b';     // Amber
            case 'Academic': return '#3b82f6';   // Blue
            case 'Workshop': return '#10b981';   // Emerald
            default: return '#6b7280';           // Default Gray
        }
    };

    const handleEventClick = (clickInfo) => {
        setSelectedEvent(clickInfo.event.extendedProps);
    };

    return (
        <div className="min-h-screen pt-28 pb-20">
            <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Event <span className="text-gradient">Calendar</span></h1>
                    <p className="text-gray-400">Plan your schedule. Click any event to see details.</p>
                </div>

                {loading ? (
                    <Loader />
                ) : (
                    <div className="glass p-6 md:p-8 rounded-3xl shadow-neon-cyan/5 border-primary/20 calendar-container">
                        <style>
                            {`
                .fc { --fc-page-bg-color: transparent; --fc-neutral-bg-color: rgba(255,255,255,0.02); --fc-neutral-text-color: #9ca3af; --fc-border-color: rgba(255,255,255,0.1); --fc-daygrid-event-dot-width: 8px; --fc-event-text-color: #fff; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(255,255,255,0.05); }
                .fc-col-header-cell { padding: 12px 0; background: rgba(0,0,0,0.2); }
                .fc-day-today { background: rgba(124, 58, 237, 0.1) !important; }
                .fc-event { border-radius: 6px; padding: 2px 4px; font-size: 0.85em; cursor: pointer; border: none; font-weight: 500;}
                .fc-event:hover { opacity: 0.9; }
                .fc-h-event { background-color: var(--fc-event-bg-color, #7c3aed); }
                .fc .fc-button-primary { background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; text-transform: capitalize; border-radius: 8px; font-weight: 500;}
                .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #7c3aed; border-color: #7c3aed; }
                .fc .fc-button-primary:hover { background-color: rgba(255,255,255,0.1); }
                .fc-toolbar-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #fff; }
              `}
                        </style>
                        <FullCalendar
                            plugins={[dayGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            events={events}
                            eventClick={handleEventClick}
                            headerToolbar={{
                                left: 'title',
                                right: 'prev,next today'
                            }}
                            height="auto"
                            contentHeight="700px"
                        />
                    </div>
                )}

                {/* Event Detail Modal */}
                <AnimatePresence>
                    {selectedEvent && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setSelectedEvent(null)}
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="glass-strong relative w-full max-w-lg rounded-2xl overflow-hidden shadow-neon z-10"
                            >
                                {selectedEvent.bannerImage ? (
                                    <img src={`http://localhost:5000${selectedEvent.bannerImage}`} alt="Banner" className="w-full h-48 object-cover" />
                                ) : (
                                    <div className="w-full h-32 bg-gradient-neon" />
                                )}

                                <button
                                    onClick={() => setSelectedEvent(null)}
                                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                >
                                    <FiX />
                                </button>

                                <div className="p-6 md:p-8">
                                    <div className="mb-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/20 bg-white/10">
                                        {selectedEvent.category}
                                    </div>
                                    <h3 className="text-3xl font-bold text-white mb-2">{selectedEvent.title}</h3>
                                    <p className="text-gray-400 mb-6">{selectedEvent.organizerCollegeName}</p>

                                    <div className="space-y-4 mb-8 bg-surface-card p-4 rounded-xl border border-surface-border">
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <FiCalendar className="text-primary-light text-xl" />
                                            <span>{format(new Date(selectedEvent.date), 'PPPP')}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <FiClock className="text-primary-light text-xl" />
                                            <span>{selectedEvent.time}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-300">
                                            <FiMapPin className="text-primary-light text-xl" />
                                            <span>{selectedEvent.venue}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setSelectedEvent(null);
                                            navigate(`/events/${selectedEvent._id}`);
                                        }}
                                        className="w-full btn-primary"
                                    >
                                        View Full Details & Register
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default CalendarPage;
