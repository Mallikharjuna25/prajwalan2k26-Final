import React, { useState, useEffect } from 'react';
import { FiX, FiAlertTriangle, FiCheckCircle, FiLoader, FiRotateCcw, FiTrash2 } from 'react-icons/fi';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CancelEventModal = ({ eventId, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(true);
    const [eventData, setEventData] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [summary, setSummary] = useState(null);
    const [refundsInitiated, setRefundsInitiated] = useState(false);
    const [cancelEnabled, setCancelEnabled] = useState(false);
    const [hasFailures, setHasFailures] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const navigate = useNavigate();

    const fetchPreview = async () => {
        try {
            const { data } = await axios.get(`/events/cancellation/${eventId}/cancel-preview`);
            setEventData(data.event);
            setParticipants(data.participants);
            setSummary(data.summary);

            // If some are already processing, we should start polling
            const isAnyProcessing = data.participants.some(p => p.refundStatus === 'PROCESSING');
            if (isAnyProcessing) {
                setRefundsInitiated(true);
                setIsPolling(true);
            }

            // Check if all settled
            const paidOnly = data.participants.filter(p => p.paymentStatus === 'PAID');
            const refunded = paidOnly.filter(p => p.refundStatus === 'REFUNDED');
            const failed = paidOnly.filter(p => p.refundStatus === 'FAILED');
            const processing = paidOnly.filter(p => p.refundStatus === 'PROCESSING');

            if (paidOnly.length === 0 || (refunded.length === paidOnly.length && processing.length === 0 && failed.length === 0)) {
                setCancelEnabled(true);
            }

            setHasFailures(failed.length > 0);

        } catch (error) {
            toast.error('Failed to fetch cancellation details');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreview();
    }, [eventId]);

    // Polling logic
    useEffect(() => {
        if (!isPolling) return;

        const pollInterval = setInterval(async () => {
            try {
                // First verify processing ones
                await axios.post(`/events/cancellation/${eventId}/verify-refunds`);

                // Then fetch updated preview
                const { data } = await axios.get(`/events/cancellation/${eventId}/cancel-preview`);
                setParticipants(data.participants);
                setSummary(data.summary);

                const paidOnly = data.participants.filter(p => p.paymentStatus === 'PAID');
                const refunded = paidOnly.filter(p => p.refundStatus === 'REFUNDED');
                const failed = paidOnly.filter(p => p.refundStatus === 'FAILED');
                const processing = paidOnly.filter(p => p.refundStatus === 'PROCESSING');

                setHasFailures(failed.length > 0);

                const allSettled = processing.length === 0 && (refunded.length + failed.length === paidOnly.length);

                if (allSettled) {
                    setIsPolling(false);
                    setCancelEnabled(failed.length === 0);
                    clearInterval(pollInterval);
                }
            } catch (error) {
                console.error('Polling error', error);
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [isPolling, eventId]);

    const handleInitiateRefunds = async () => {
        try {
            setLoading(true);
            await axios.post(`/events/cancellation/${eventId}/initiate-refunds`);
            setRefundsInitiated(true);
            setIsPolling(true);
            toast.success('Refunds initiated successfully');
        } catch (error) {
            toast.error('Failed to initiate refunds');
        } finally {
            setLoading(false);
        }
    };

    const handleRetryFailed = async () => {
        try {
            setLoading(true);
            await axios.post(`/events/cancellation/${eventId}/retry-failed-refunds`);
            setIsPolling(true);
            toast.success('Retrying failed refunds...');
        } catch (error) {
            toast.error('Failed to retry refunds');
        } finally {
            setLoading(false);
        }
    };

    const handleManualRefund = async (registrationId, amount) => {
        const note = prompt('Enter a note for manual refund:');
        if (note === null) return;

        try {
            await axios.post(`/events/cancellation/${eventId}/mark-manual-refund`, {
                registrationId,
                amount,
                note
            });
            toast.success('Marked as manually refunded');
            fetchPreview();
        } catch (error) {
            toast.error('Failed to update refund status');
        }
    };

    const handleConfirmCancel = async () => {
        if (!window.confirm('Are you absolutely sure you want to cancel this event? This action cannot be undone.')) return;

        try {
            setLoading(true);
            const { data } = await axios.post(`/events/cancellation/${eventId}/cancel`);
            if (data.success) {
                toast.success('Event cancelled successfully');
                onRefresh();
                // Delay slightly to ensure toast is visible and state updates start
                setTimeout(() => {
                    navigate('/organizer/dashboard', { replace: true });
                    onClose();
                }, 100);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to cancel event');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !participants.length) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-surface-card border border-surface-border rounded-2xl p-8 max-w-md w-full text-center">
                    <FiLoader className="text-4xl text-primary animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Preparing Settlement...</h3>
                    <p className="text-gray-400">Fetching participant list and payment statuses.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-surface-card border border-surface-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-surface-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                            <FiTrash2 className="text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">Cancel Event — Refund Settlement</h2>
                            <p className="text-sm text-gray-400">Event: {eventData?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                        <FiX className="text-2xl" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {/* Warning Area */}
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 flex gap-4">
                        <FiAlertTriangle className="text-2xl text-red-500 shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-red-400 mb-1">WARNING: Critical Action</h4>
                            <p className="text-sm text-gray-300">
                                Cancelling this event will initiate refunds to all paid participants. The event will ONLY be marked
                                as CANCELLED after every refund is verified as complete. This process cannot be reversed.
                            </p>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Total Participants</p>
                            <p className="text-2xl font-bold text-white">{summary?.totalParticipants}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Paid Participants</p>
                            <p className="text-2xl font-bold text-green-400">{summary?.paidCount}</p>
                            <p className="text-xs text-gray-500 mt-1">Total: ₹{summary?.totalRefund}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Free Participants</p>
                            <p className="text-2xl font-bold text-blue-400">{summary?.freeCount}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Refunds Completed</p>
                            <p className="text-2xl font-bold text-primary">{summary?.refundedCount} / {summary?.paidCount}</p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {summary?.paidCount > 0 && (
                        <div className="mb-8">
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-sm font-bold text-gray-300">Refund Progress</span>
                                <span className="text-sm font-bold text-white">{summary?.progressPercent}%</span>
                            </div>
                            <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                <div
                                    className={`h-full transition-all duration-500 ${summary?.progressPercent === 100 ? 'bg-green-500' : 'bg-primary'}`}
                                    style={{ width: `${summary?.progressPercent}%` }}
                                ></div>
                            </div>
                            {isPolling && (
                                <p className="text-xs text-primary mt-2 flex items-center gap-1">
                                    <FiLoader className="animate-spin" /> Polling live status every 5 seconds...
                                </p>
                            )}
                        </div>
                    )}

                    {/* Participants List */}
                    <div className="border border-surface-border rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 border-b border-surface-border">
                                <tr>
                                    <th className="px-4 py-3 font-bold text-gray-300">Student Name</th>
                                    <th className="px-4 py-3 font-bold text-gray-300">Roll No</th>
                                    <th className="px-4 py-3 font-bold text-gray-300">Amount</th>
                                    <th className="px-4 py-3 font-bold text-gray-300 text-center">Refund Status</th>
                                    <th className="px-4 py-3 font-bold text-gray-300">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-border">
                                {participants.map((p, idx) => (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-white font-medium">{p.studentName}</td>
                                        <td className="px-4 py-3 text-gray-400">{p.rollNumber}</td>
                                        <td className="px-4 py-3 text-white">
                                            {p.paymentStatus === 'PAID' ? `₹${p.amountPaid}` : 'Free'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {p.paymentStatus === 'PAID' ? (
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.refundStatus === 'REFUNDED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                    p.refundStatus === 'PROCESSING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                                        p.refundStatus === 'FAILED' ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                                                            'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                                    }`}>
                                                    {p.refundStatus || 'PENDING'}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-500/20 text-gray-500 border border-gray-500/30">
                                                    N/A
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {p.refundStatus === 'FAILED' && (
                                                <button
                                                    onClick={() => handleManualRefund(p.registrationId, p.amountPaid)}
                                                    className="text-xs text-primary hover:underline font-bold"
                                                >
                                                    Manual Refund
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-6 border-t border-surface-border flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex gap-2">
                        {!refundsInitiated && summary?.paidCount > 0 ? (
                            <button
                                onClick={handleInitiateRefunds}
                                disabled={loading}
                                className="btn-primary"
                            >
                                {loading ? <FiLoader className="animate-spin" /> : 'Initiate All Refunds'}
                            </button>
                        ) : hasFailures ? (
                            <button
                                onClick={handleRetryFailed}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-yellow-500 text-black font-bold hover:bg-yellow-400 transition-all"
                            >
                                <FiRotateCcw className={loading ? 'animate-spin' : ''} /> Retry Failed Refunds
                            </button>
                        ) : null}

                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold border border-white/10 transition-all"
                        >
                            Go Back
                        </button>
                    </div>

                    <button
                        onClick={handleConfirmCancel}
                        disabled={!cancelEnabled || loading}
                        className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold transition-all ${cancelEnabled
                            ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                            : 'bg-gray-500/20 text-gray-500 cursor-not-allowed border border-white/5'
                            }`}
                    >
                        {loading && <FiLoader className="animate-spin" />}
                        <FiCheckCircle className={!loading ? 'text-lg' : 'hidden'} /> Confirm Cancel Event
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CancelEventModal;
