import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import Loader from '../../components/common/Loader';
import QRModal from '../../components/common/QRModal';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiTag, FiCheckCircle, FiStar, FiActivity } from 'react-icons/fi';
import { format } from 'date-fns';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, role, user } = useAuth();

    const [event, setEvent] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Registration state
    const [isRegistering, setIsRegistering] = useState(false);
    const [hasRegistered, setHasRegistered] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [customFieldData, setCustomFieldData] = useState({});

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`/events/${id}/info`);
                setEvent(data.event);
                setFeedbacks(data.feedbacks || []);

                // Handle Stripe redirect returns
                const searchParams = new URLSearchParams(location.search);
                const success = searchParams.get('success');
                const canceled = searchParams.get('canceled');
                const sessionId = searchParams.get('session_id');
                const regId = searchParams.get('registration_id');

                if (success === 'true' && sessionId && regId && isAuthenticated) {
                    try {
                        const verifyRes = await axios.post("/payment/verify-session", {
                            session_id: sessionId,
                            registrationId: regId
                        });

                        if (verifyRes.data.success) {
                            toast.success('Payment successful! Your pass is ready.');
                            setHasRegistered(true);
                        }
                    } catch (err) {
                        toast.error(err.response?.data?.message || "Payment verification failed.");
                    }
                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);
                } else if (canceled === 'true') {
                    toast.error("Payment was canceled.");
                    window.history.replaceState({}, document.title, window.location.pathname);
                }

                // Check if already registered
                if (isAuthenticated && role === 'student') {
                    const regRes = await axios.get('/student/my-events');
                    const isReg = regRes.data.some(reg => reg.event._id === id);
                    if (isReg) {
                        const myReg = regRes.data.find(reg => reg.event._id === id);
                        if (myReg.paymentStatus === 'PAID' || myReg.paymentStatus === 'FREE') {
                            setHasRegistered(true);
                            setQrCodeData(myReg.qrCode);
                        }
                    }
                }
            } catch (error) {
                toast.error('Event not found');
                navigate('/events');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, isAuthenticated, role, navigate, location.search]);

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please login as a student to register');
            navigate('/student/login');
            return;
        }
        if (role !== 'student') {
            toast.error('Only students can register for events');
            return;
        }

        // Validate custom fields
        if (event.customFields && event.customFields.length > 0) {
            for (let field of event.customFields) {
                if (field.required && !customFieldData[field.fieldName]) {
                    toast.error(`Please fill out: ${field.fieldName}`);
                    return;
                }
            }
        }

        setIsRegistering(true);
        try {
            // Step 1: Register and get DB DB Registration record
            const { data: registrationData } = await axios.post(`/student/events/${id}/register`, { customFieldData });

            const isPaidEvent = event.registrationFee > 0;

            if (isPaidEvent) {
                // Step 2: Initialize Stripe Checkout for PAID events
                const { data: sessionData } = await axios.post("/payment/create-checkout-session", {
                    amount: event.registrationFee * 100, // INR Paise
                    eventId: event._id,
                    registrationId: registrationData._id
                });

                if (sessionData.url) {
                    window.location.href = sessionData.url;
                } else {
                    toast.error("Failed to generate checkout session.");
                    setIsRegistering(false);
                }
            } else {
                // Step 2b: Free Event immediate success
                toast.success('Successfully registered! QR pass sent to your email.');
                setHasRegistered(true);
                setQrCodeData(registrationData.qrCode);
                setEvent(prev => ({ ...prev, participantsCount: prev.participantsCount + 1 }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setIsRegistering(false);
        }
    };

    const isFull = event?.participantsCount >= event?.capacity;

    if (loading) return <Loader fullScreen />;
    if (!event) return null;

    return (
        <div className="min-h-screen pt-24 pb-20">
            {/* Banner */}
            <div className="w-full h-[40vh] md:h-[50vh] relative">
                {event.bannerImage ? (
                    <img
                        src={`http://localhost:5000${event.bannerImage}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-neon flex items-center justify-center">
                        <FiTag className="text-white/20 text-9xl" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent"></div>
            </div>

            <div className="container mx-auto px-6 relative -mt-32 z-10">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Main Content */}
                    <div className="flex-1 space-y-8">
                        <div className="bg-surface-card p-8 rounded-3xl border border-surface-border shadow-2xl">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/20 text-primary-light border border-primary/30">
                                    {event.category}
                                </span>
                                {isFull && (
                                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/20 text-red-500 border border-red-500/30">
                                        Sold Out
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-4">
                                <h1 className="text-4xl md:text-5xl font-bold text-white">{event.title}</h1>
                                {event.averageRating > 0 && (
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                            <FiStar className="fill-yellow-500 text-yellow-500 text-lg" />
                                            <span className="text-lg font-bold text-yellow-500">{event.averageRating}</span>
                                        </div>
                                        <span className="text-xs text-gray-500 mt-1">{event.totalRatings} ratings</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-xl text-gray-400 mb-8 font-medium">Organized by {event.organizerCollegeName}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                        <FiCalendar className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold uppercase">Date</p>
                                        <p className="text-white font-medium">{format(new Date(event.date), 'MMMM do, yyyy')}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
                                        <FiClock className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold uppercase">Time</p>
                                        <p className="text-white font-medium">{event.time}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-400">
                                        <FiMapPin className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold uppercase">Venue</p>
                                        <p className="text-white font-medium">{event.venue}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                        <FiUsers className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 font-bold uppercase">Participants</p>
                                        <p className="text-white font-medium">{event.participantsCount} / {event.capacity}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Fee Summary (if any) */}
                            {event.registrationFee > 0 && (
                                <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-transparent border-l-4 border-green-500">
                                    <p className="text-gray-300">
                                        <span className="font-bold text-white">Registration Fee:</span> ₹{event.registrationFee}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">Payment required to confirm your slot. Secured by Stripe.</p>
                                </div>
                            )}

                            <div className="prose prose-invert max-w-none mb-12">
                                <h3 className="text-2xl font-bold text-white mb-4">About this event</h3>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line">{event.description}</p>
                            </div>

                            {/* Ratings & Reviews Section */}
                            {feedbacks.length > 0 && (
                                <div className="mb-12">
                                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                        <FiStar className="text-yellow-500" /> Reviews
                                    </h3>
                                    <div className="space-y-4">
                                        {feedbacks.map((fb) => (
                                            <div key={fb._id} className="bg-surface p-5 rounded-xl border border-white/5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-white">{fb.studentId?.name || "Anonymous User"}</h4>
                                                        <span className="text-xs text-gray-500">{format(new Date(fb.submittedAt), 'MMMM do, yyyy')}</span>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <FiStar key={star} className={`text-sm ${star <= fb.rating ? 'fill-yellow-500 text-yellow-500' : 'text-gray-600'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                {fb.feedbackText && (
                                                    <p className="text-gray-300 text-sm mt-3">{fb.feedbackText}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Event History Timeline */}
                            {event.eventLog && event.eventLog.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                        <FiActivity className="text-primary-light" /> Event History
                                    </h3>
                                    <div className="relative border-l-2 border-primary/20 ml-3 md:ml-4 space-y-6">
                                        {event.eventLog.slice().reverse().map((log, index) => (
                                            <div key={log._id || index} className="relative pl-6">
                                                <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-surface-card"></div>
                                                <div className="bg-surface p-4 rounded-xl border border-white/5">
                                                    <p className="text-sm font-semibold text-white mb-1">{log.action}</p>
                                                    <p className="text-xs text-gray-500">{format(new Date(log.timestamp), 'MMM do, yyyy • h:mm a')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Registration Sidebar */}
                    <div className="w-full lg:w-[400px] shrink-0">
                        <div className="sticky top-28 card border-primary/20 shadow-neon">
                            <h3 className="text-2xl font-bold text-white mb-6">Registration</h3>

                            {hasRegistered ? (
                                <div className="text-center p-6 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FiCheckCircle className="text-3xl text-green-500" />
                                    </div>
                                    <h4 className="text-lg font-bold text-green-500 mb-2">You're Registered!</h4>
                                    <p className="text-sm text-green-400/80 mb-4">Your entry pass has been generated.</p>
                                    <button
                                        onClick={() => navigate('/student/dashboard/my-events')}
                                        className="btn-primary w-full bg-green-600 hover:bg-green-700 shadow-none"
                                    >
                                        View My Pass
                                    </button>
                                </div>
                            ) : isFull ? (
                                <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                    <h4 className="text-lg font-bold text-red-500 mb-2">Registration Closed</h4>
                                    <p className="text-sm text-red-400/80">This event has reached its maximum capacity.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleRegister} className="space-y-5">
                                    {/* Custom Fields */}
                                    {event.customFields && event.customFields.map((field) => (
                                        <div key={field.fieldName}>
                                            <label className="block text-sm font-medium text-gray-400 mb-1">
                                                {field.fieldName} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {field.fieldType === 'text' || field.fieldType === 'number' ? (
                                                <input
                                                    type={field.fieldType}
                                                    required={field.required}
                                                    value={customFieldData[field.fieldName] || ''}
                                                    onChange={(e) => setCustomFieldData({ ...customFieldData, [field.fieldName]: e.target.value })}
                                                    className="input-field"
                                                />
                                            ) : field.fieldType === 'dropdown' ? (
                                                <select
                                                    required={field.required}
                                                    value={customFieldData[field.fieldName] || ''}
                                                    onChange={(e) => setCustomFieldData({ ...customFieldData, [field.fieldName]: e.target.value })}
                                                    className="input-field"
                                                >
                                                    <option value="">Select an option</option>
                                                    {field.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : null}
                                        </div>
                                    ))}

                                    <button
                                        type="submit"
                                        disabled={isRegistering}
                                        className="btn-primary w-full mt-4 h-14 text-lg bg-gradient-to-r from-primary to-accent hover:shadow-neon"
                                    >
                                        {isRegistering ? 'Processing...' : (event.registrationFee > 0 ? `Pay ₹${event.registrationFee} & Register` : 'Register Now')}
                                    </button>

                                    {!isAuthenticated && (
                                        <p className="text-xs text-center text-gray-500 mt-4">
                                            You will be redirected to login.
                                        </p>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {qrCodeData && (
                <QRModal qrCodeUrl={qrCodeData} onClose={() => setQrCodeData(null)} />
            )}
        </div>
    );
};

export default EventDetails;
