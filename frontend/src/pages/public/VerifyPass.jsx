import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../../api/axios';
import { FiCheckCircle, FiXCircle, FiAlertTriangle, FiUser, FiCalendar, FiMapPin, FiCreditCard } from 'react-icons/fi';
import { format } from 'date-fns';

const VerifyPass = () => {
    const { registrationId } = useParams();
    const [status, setStatus] = useState('loading'); // loading, verified, invalid, error
    const [data, setData] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const verifyQR = async () => {
            try {
                const response = await axios.get(`/pass/verify/${registrationId}`);
                setData(response.data.data);

                // Advanced Status Checks
                const reg = response.data.data;
                if (reg.event?.status === 'CANCELLED') {
                    setStatus('cancelled');
                } else if (!reg.paymentStatus || reg.paymentStatus === 'FREE' || reg.paymentStatus === 'PAID') {
                    if (reg.attended) {
                        setStatus('already_scanned');
                    } else {
                        setStatus('verified');
                    }
                } else {
                    setStatus('pending_payment');
                }
            } catch (error) {
                console.error("Verification failed:", error);
                setStatus('invalid');
                setErrorMsg(error.response?.data?.message || 'Invalid QR Code or Not Found');
            }
        };

        if (registrationId) {
            verifyQR();
        }
    }, [registrationId]);

    // RENDER HELPERS
    if (status === 'loading') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                <h2 className="mt-6 text-xl text-gray-400 font-medium animate-pulse">Scanning Pass...</h2>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-red-500/10 border-2 border-red-500/50 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.2)]">
                    <FiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-400 mb-2">INVALID PASS</h2>
                    <p className="text-white/80 mb-6">{errorMsg}</p>
                    <div className="bg-black/40 rounded-lg p-3 font-mono text-sm break-all text-gray-500">
                        {registrationId}
                    </div>
                </div>
                <Link to="/" className="mt-8 text-primary hover:text-primary-light underline transition-colors">
                    Return to Homepage
                </Link>
            </div>
        );
    }

    const { student, event } = data;

    // Status UI Configuration
    let bannerConfig = {};
    if (status === 'verified') {
        bannerConfig = { color: 'green', icon: FiCheckCircle, text: 'ENTRY APPROVED', bg: 'bg-green-500', border: 'border-green-400' };
    } else if (status === 'already_scanned') {
        bannerConfig = { color: 'yellow', icon: FiAlertTriangle, text: 'ALREADY SCANNED', bg: 'bg-yellow-500', border: 'border-yellow-400', secondary: 'Entry previously approved. Ask admin for overrides.' };
    } else if (status === 'pending_payment') {
        bannerConfig = { color: 'red', icon: FiXCircle, text: 'PAYMENT PENDING', bg: 'bg-red-500', border: 'border-red-400', secondary: 'Entry Denied. Please clear dues at desk.' };
    } else if (status === 'cancelled') {
        bannerConfig = { color: 'red', icon: FiXCircle, text: 'EVENT CANCELLED', bg: 'bg-red-600', border: 'border-red-500', secondary: 'This event has been cancelled by the organiser.' };
    }

    const BannerIcon = bannerConfig.icon;

    return (
        <div className="min-h-[80vh] py-12 px-4 sm:px-6 relative flex items-center justify-center">

            <div className="w-full max-w-lg relative z-10 shadow-[0_0_50px_rgba(16,185,129,0.15)] rounded-2xl overflow-hidden bg-surface border border-white/10">
                {/* Header Banner */}
                <div className={`${bannerConfig.bg} bg-opacity-20 border-b-2 ${bannerConfig.border} p-6 text-center`}>
                    <BannerIcon className={`text-5xl text-${bannerConfig.color}-400 mx-auto mb-3 drop-shadow-[0_0_15px_currentColor]`} />
                    <h1 className={`text-2xl sm:text-3xl font-bold text-${bannerConfig.color}-400 tracking-wider font-heading uppercase`}>
                        {bannerConfig.text}
                    </h1>
                    {bannerConfig.secondary && (
                        <p className={`text-${bannerConfig.color}-300 mt-2 font-medium`}>{bannerConfig.secondary}</p>
                    )}
                </div>

                <div className="p-6 sm:p-8">
                    {/* Identity Section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 border-b border-white/10 pb-8">
                        {/* ID Photo */}
                        <div className={`w-32 h-40 shrink-0 rounded-xl overflow-hidden border-4 ${status === 'verified' ? 'border-green-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'border-white/10'} bg-black/50`}>
                            {student.studentIdCard?.url ? (
                                <img
                                    src={`http://localhost:5000${student.studentIdCard.url}`}
                                    alt="Student ID"
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Photo' }}
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                    <FiUser className="text-4xl mb-2" />
                                    <span className="text-xs uppercase font-bold tracking-widest text-center">No ID<br />Found</span>
                                </div>
                            )}
                        </div>

                        {/* Student Details */}
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-white mb-1 line-clamp-1">{student.name}</h2>
                            <p className="text-gray-400 font-mono text-sm mb-3">{student.registerNumber}</p>

                            <div className="space-y-2 mt-4">
                                <p className="text-sm text-gray-300 line-clamp-1">
                                    <span className="text-gray-500 font-medium mr-2">College:</span>
                                    {student.collegeName}
                                </p>
                                <p className="text-sm text-gray-300">
                                    <span className="text-gray-500 font-medium mr-2">Email:</span>
                                    {student.email}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Event Details */}
                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Event Details</h3>
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                            <h4 className={`text-lg font-bold line-clamp-1 ${status === 'cancelled' ? 'text-red-400' : 'text-primary-light'}`}>{event.title}</h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <FiCalendar className="text-gray-500 shrink-0" />
                                    <span>{format(new Date(event.date), 'MMM do, yyyy')} • {event.time}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-300">
                                    <FiMapPin className="text-gray-500 shrink-0" />
                                    <span className="line-clamp-1">{event.venue}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Refund Info for Cancelled */}
                    {status === 'cancelled' && data.paymentStatus === 'PAID' && (
                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Refund Information</h3>
                            <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/20 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Refund Status</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${data.refundStatus === 'REFUNDED' ? 'bg-green-500/20 text-green-400' :
                                            data.refundStatus === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {data.refundStatus}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Refund Amount</span>
                                    <span className="text-white font-bold">₹{data.refundAmount || event.registrationFee}</span>
                                </div>
                                {data.refundId && (
                                    <div className="flex justify-between items-center text-sm font-mono pt-3 border-t border-white/5">
                                        <span className="text-gray-500">REFUND ID</span>
                                        <span className="text-white text-xs">{data.refundId}</span>
                                    </div>
                                )}
                                <p className="text-[11px] text-gray-500 italic text-center mt-2">
                                    Refunds typically reflect in your account within 5-7 business days.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Transaction Section (Hide if cancelled) */}
                    {status !== 'cancelled' && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Transaction</h3>
                            <div className="bg-black/30 rounded-xl p-4 border border-white/5 flex flex-wrap justify-between items-center gap-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${data.paymentStatus === 'PAID' || data.paymentStatus === 'FREE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        <FiCreditCard className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Amount</p>
                                        <p className="text-white font-bold text-lg">
                                            {data.paymentAmount ? `₹${data.paymentAmount}` : 'FREE'}
                                        </p>
                                    </div>
                                </div>

                                <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${data.paymentStatus === 'PAID' || data.paymentStatus === 'FREE' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'} border`}>
                                    {data.paymentStatus || 'PAID'}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="mt-8 text-center border-t border-white/10 pt-6">
                        <p className="text-xs text-gray-600 font-mono">
                            REG ID: {registrationId}
                            <br />
                            Issued: {format(new Date(data.registeredAt), 'MMM dd, yyyy HH:mm')}
                        </p>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default VerifyPass;
