import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiUsers, FiStar } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { getEventStatus } from '../../utils/eventStatus';
import EventStatusBadge from './EventStatusBadge';
import CountdownTimer from './CountdownTimer';

const EventCard = ({ event, onClickAction }) => {
    const isFull = event.registrationCount >= event.maxParticipants;
    const eventDate = new Date(event.date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const status = getEventStatus(event);
    const datePart = typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0];
    const startDateTime = new Date(`${datePart}T${event.time || '00:00'}:00`);

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="card flex flex-col h-full cursor-pointer hover:shadow-neon transition-all duration-300 overflow-hidden p-0"
        >
            {/* Banner */}
            <div className="relative h-48 w-full bg-surface-border">
                {event.bannerImage ? (
                    <img
                        src={`http://localhost:5000${event.bannerImage}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                        <span className="text-xl font-bold opacity-50">{event.category}</span>
                    </div>
                )}
                <div className="absolute top-4 left-4">
                    <EventStatusBadge status={status} />
                </div>
                <div className="absolute top-4 right-4 glass px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                    {event.category}
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold line-clamp-2 pr-2">{event.title}</h3>
                    {event.averageRating > 0 && (
                        <div className="flex items-center gap-1 shrink-0 bg-yellow-500/10 px-2 py-1 rounded text-yellow-500 border border-yellow-500/20">
                            <FiStar className="fill-yellow-500" />
                            <span className="text-sm font-bold">{event.averageRating}</span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-gray-400 text-sm line-clamp-2">{event.organizerCollegeName}</p>
                    {event.organizer && event.organizer.overallRating > 0 && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">
                            <FiStar className="fill-yellow-500 text-[10px]" />
                            {event.organizer.overallRating}
                        </span>
                    )}
                </div>

                <div className="space-y-3 mt-auto mb-6">
                    <div className="flex items-start text-sm text-gray-300 gap-2">
                        <FiCalendar className="text-primary-light mt-1" />
                        <div className="flex flex-col gap-1">
                            <span>{eventDate} • {event.time}</span>
                            {status === 'UPCOMING' && <CountdownTimer targetDate={startDateTime} />}
                        </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-300 gap-2">
                        <FiMapPin className="text-primary-light" />
                        <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-300 gap-2">
                        <FiUsers className="text-primary-light" />
                        <span>{event.registrationCount} / {event.maxParticipants} Registered</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 mb-6">
                    <div
                        className="bg-gradient-neon h-1.5 rounded-full"
                        style={{ width: `${Math.min((event.registrationCount / event.maxParticipants) * 100, 100)}%` }}
                    ></div>
                </div>

                {onClickAction ? (
                    <button
                        onClick={onClickAction}
                        disabled={isFull && status !== 'COMPLETED'}
                        className={`w-full py-2.5 rounded-xl font-semibold transition-all ${(isFull && status !== 'COMPLETED') ? 'bg-surface-border text-gray-500 cursor-not-allowed' : 'btn-primary'}`}
                    >
                        {status === 'COMPLETED' ? 'View Results & Info' : isFull ? 'Sold Out' : 'View Details & Register'}
                    </button>
                ) : (
                    <Link to={`/events/${event._id}`} className={`w-full py-2.5 rounded-xl font-semibold transition-all text-center ${(isFull && status !== 'COMPLETED') ? 'bg-surface-border text-gray-500 cursor-not-allowed' : 'btn-primary'}`}>
                        {status === 'COMPLETED' ? 'View Results & Info' : isFull ? 'Sold Out' : 'View Details & Register'}
                    </Link>
                )}
            </div>
        </motion.div>
    );
};

export default EventCard;
