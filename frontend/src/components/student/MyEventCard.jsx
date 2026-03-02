import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMapPin, FiCheckCircle, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { format } from 'date-fns';
import { getEventStatus } from '../../utils/eventStatus';
import EventStatusBadge from '../common/EventStatusBadge';
import CountdownTimer from '../common/CountdownTimer';
import FeedbackForm from './FeedbackForm';

const MyEventCard = ({ registration }) => {
    const [expanded, setExpanded] = useState(false);
    const [feedbackGiven, setFeedbackGiven] = useState(registration.hasGivenFeedback || false);
    const event = registration.event;

    if (!event) return null;

    const isPaid = registration.paymentStatus === 'PAID';
    const isCancelled = event.status === 'CANCELLED' || registration.status === 'CANCELLED';
    const status = getEventStatus(event);
    const datePart = typeof event.date === 'string' ? event.date.split('T')[0] : new Date(event.date).toISOString().split('T')[0];
    const startDateTime = new Date(`${datePart}T${event.time || '00:00'}:00`);

    const handleExpandToggle = () => {
        if (isPaid) {
            setExpanded(!expanded);
        }
    };

    return (
        <div className={`card p-0 overflow-hidden ${!isPaid ? 'opacity-80 grayscale-[20%]' : ''}`}>
            <div
                className={`p-5 flex flex-col md:flex-row gap-5 ${registration.paymentStatus === 'PAID' || registration.paymentStatus === 'FREE' ? 'cursor-pointer hover:bg-white/5 transition-colors' : 'cursor-not-allowed'}`}
                onClick={() => (registration.paymentStatus === 'PAID' || registration.paymentStatus === 'FREE') && setExpanded(!expanded)}
            >
                {/* Thumbnail */}
                <div className="w-full md:w-32 h-32 rounded-xl overflow-hidden shrink-0 bg-surface-border">
                    {event.bannerImage ? (
                        <img
                            src={`http://localhost:5000${event.bannerImage}`}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center">
                            <span className="text-xs font-bold opacity-50 uppercase tracking-widest">{event.category}</span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col pt-1">
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                            <h3 className="text-xl font-bold text-white line-clamp-1 pr-4">{event.title}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-sm text-gray-400">{event.organizerCollegeName}</p>
                                <EventStatusBadge status={status} />
                            </div>
                        </div>

                        <div className="shrink-0">
                            {isCancelled ? (
                                <span className="flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                                    ❌ Cancelled
                                </span>
                            ) : registration.paymentStatus === 'PENDING' ? (
                                <span className="flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold tracking-wider bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                    <FiClock /> Payment Pending
                                </span>
                            ) : registration.attended ? (
                                <span className="flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/10 text-green-500 border border-green-500/20">
                                    <FiCheckCircle /> Attended
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                    <FiCheckCircle /> Confirmed
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-300 mt-auto">
                        <div className="flex items-start gap-2">
                            <FiCalendar className="text-primary-light mt-1" />
                            <div className="flex flex-col gap-1">
                                <span>{format(new Date(event.date), 'MMM do, yyyy')} • {event.time}</span>
                                {status === 'UPCOMING' && <CountdownTimer targetDate={startDateTime} />}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiMapPin className="text-primary-light" />
                            <span>{event.venue}</span>
                        </div>
                    </div>
                </div>

                {/* Toggle Icon or Action */}
                <div className="hidden md:flex items-center shrink-0 pr-2">
                    {isPaid ? (
                        expanded ? <FiChevronUp className="text-2xl text-gray-500" /> : <FiChevronDown className="text-2xl text-gray-500" />
                    ) : (
                        <span className="text-xs bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-gray-400">Action Required</span>
                    )}
                </div>
            </div>

            {/* Expanded Content (QR Code) */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/20"
                    >
                        <div className="p-6">
                            {isCancelled ? (
                                <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                                    <div className="w-40 h-40 rounded-xl bg-red-500/10 flex items-center justify-center border-2 border-red-500/20">
                                        <FiX className="text-6xl text-red-500" />
                                    </div>
                                    <div className="text-center md:text-left max-w-sm">
                                        <h4 className="text-lg font-bold text-red-400 mb-2">Event Cancelled</h4>
                                        <p className="text-sm text-gray-400 mb-4">
                                            This event was cancelled by the organiser.
                                            {registration.paymentStatus === 'PAID'
                                                ? ` Your refund of ₹${registration.refundAmount || registration.event?.registrationFee} has been initiated.`
                                                : ' Your registration has been voided.'}
                                        </p>

                                        {registration.paymentStatus === 'PAID' && (
                                            <div className="bg-surface-card p-4 rounded-xl border border-surface-border space-y-3">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-gray-500 font-bold uppercase">Refund Status</span>
                                                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${registration.refundStatus === 'REFUNDED' ? 'bg-green-500/20 text-green-400' :
                                                            registration.refundStatus === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-500'
                                                        }`}>
                                                        {registration.refundStatus}
                                                    </span>
                                                </div>
                                                {registration.refundId && (
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className="text-gray-500 font-bold uppercase">Refund ID</span>
                                                        <span className="text-white font-mono">{registration.refundId}</span>
                                                    </div>
                                                )}
                                                <p className="text-[10px] text-gray-500 italic mt-1 text-center border-t border-white/5 pt-2">
                                                    Expected in 5–7 business days to your original payment method.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col md:flex-row items-center gap-8 justify-center">
                                        <div className="bg-white p-2 rounded-xl shadow-lg border-2 border-white/10 shrink-0">
                                            <img
                                                src={registration.qrCode}
                                                alt="Entry QR"
                                                className="w-40 h-40"
                                            />
                                        </div>
                                        <div className="text-center md:text-left max-w-sm">
                                            <h4 className="text-lg font-bold text-primary-light mb-2">Your Entry Pass</h4>
                                            <p className="text-sm text-gray-400 mb-4">
                                                Show this QR code at the registration desk on the day of the event. It contains your unique registration ID.
                                            </p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-surface-card p-3 rounded-lg border border-surface-border">
                                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Pass No.</p>
                                                    <p className="text-white font-mono break-all line-clamp-1" title={registration._id}>{registration._id}</p>
                                                </div>
                                                <div className="bg-surface-card p-3 rounded-lg border border-surface-border">
                                                    <p className="text-xs text-gray-500 font-bold uppercase mb-1">Registered On</p>
                                                    <p className="text-white">{format(new Date(registration.registeredAt), 'MMM dd, yyyy')}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback Form for Completed Events */}
                                    {status === 'COMPLETED' && !feedbackGiven && (
                                        <div className="px-6 pb-6 pt-6 md:px-12 max-w-3xl mx-auto border-t border-white/5 mt-6">
                                            <FeedbackForm
                                                eventId={event._id}
                                                registrationId={registration._id}
                                                onFeedbackSubmitted={() => setFeedbackGiven(true)}
                                            />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyEventCard;
