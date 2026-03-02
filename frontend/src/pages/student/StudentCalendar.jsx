import { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import { FiExternalLink } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StudentCalendar = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const { data } = await axios.get('/student/my-events');
                const formatted = data.map(reg => {
                    if (!reg.event) return null;
                    const ev = reg.event;
                    const dateStr = new Date(ev.date).toISOString().split('T')[0];
                    return {
                        id: ev._id,
                        title: ev.title,
                        start: `${dateStr}T${ev.time}:00`,
                        backgroundColor: reg.attended ? '#10b981' : '#7c3aed',
                        borderColor: reg.attended ? '#10b981' : '#7c3aed',
                        url: `/events/${ev._id}`
                    };
                }).filter(Boolean);

                setEvents(formatted);
            } catch (error) {
                console.error('Failed to fetch calendar events', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyEvents();
    }, []);

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">My Calendar</h1>
                    <p className="text-gray-400">Keep track of your registered events.</p>
                </div>
                <Link to="/events" className="btn-secondary hidden sm:flex items-center gap-2 text-sm">
                    More Events <FiExternalLink />
                </Link>
            </div>

            {loading ? (
                <Loader />
            ) : (
                <div className="card border-primary/20 p-6 md:p-8 calendar-container">
                    <style>
                        {`
                .fc { --fc-page-bg-color: transparent; --fc-neutral-bg-color: rgba(255,255,255,0.02); --fc-neutral-text-color: #9ca3af; --fc-border-color: rgba(255,255,255,0.1); --fc-daygrid-event-dot-width: 8px; --fc-event-text-color: #fff; }
                .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(255,255,255,0.05); }
                .fc-col-header-cell { padding: 12px 0; background: rgba(0,0,0,0.2); }
                .fc-day-today { background: rgba(124, 58, 237, 0.1) !important; }
                .fc-event { border-radius: 6px; padding: 2px 4px; font-size: 0.85em; cursor: pointer; border: none; font-weight: 500;}
                .fc-event:hover { opacity: 0.9; }
                .fc .fc-button-primary { background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; text-transform: capitalize; border-radius: 8px; font-weight: 500;}
                .fc .fc-button-primary:not(:disabled):active, .fc .fc-button-primary:not(:disabled).fc-button-active { background-color: #7c3aed; border-color: #7c3aed; }
                .fc-toolbar-title { font-family: 'Space Grotesk', sans-serif; font-weight: 700; color: #fff; }
              `}
                    </style>
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        headerToolbar={{
                            left: 'title',
                            right: 'prev,next today'
                        }}
                        height="auto"
                        contentHeight="600px"
                    />
                </div>
            )}
        </div>
    );
};

export default StudentCalendar;
