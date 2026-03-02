import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiXCircle, FiLoader, FiAlertTriangle } from 'react-icons/fi';

const IDVerificationReviews = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingLogs();
    }, []);

    const fetchPendingLogs = async () => {
        try {
            const { data } = await axios.get('/verify/admin/pending');
            setLogs(data);
        } catch (error) {
            toast.error('Failed to fetch pending verification reviews');
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (logId, adminDecision) => {
        try {
            await axios.post(`/verify/admin/review/${logId}`, { adminDecision, adminNote: '' });
            toast.success(`Student application ${adminDecision.toLowerCase()} successfully`);
            setLogs(logs.filter(log => log._id !== logId));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <FiLoader className="text-4xl text-primary animate-spin" />
        </div>
    );

    return (
        <div className="animate-fadeIn">
            <h1 className="text-3xl font-heading font-bold text-white mb-2 text-glow">ID Verification Reviews</h1>
            <p className="text-gray-400 mb-8">Review student ID card scans that were flagged by the automated AI system.</p>

            {logs.length === 0 ? (
                <div className="card text-center py-12 border-2 border-dashed border-white/10">
                    <FiCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
                    <p className="text-gray-400">No pending ID verifications left to review.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {logs.map(log => (
                        <div key={log._id} className="card border border-yellow-500/30 bg-surface/80 p-6 md:p-8">
                            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                                    Manual Review Required
                                </span>
                                <span className="text-gray-400 text-sm">{new Date(log.createdAt).toLocaleString()}</span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Side: User Info & Score */}
                                <div>
                                    <div className="grid grid-cols-2 gap-4 mb-8 text-lg">
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Entered Name</p>
                                            <p className="text-white font-medium">{log.enteredName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Entered Reg No</p>
                                            <p className="text-primary-light font-mono">{log.enteredRegNo}</p>
                                        </div>
                                    </div>

                                    {/* Score Box */}
                                    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner mb-6">
                                        <div className="text-5xl font-black text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                                            {log.finalScore} <span className="text-2xl text-gray-500 font-normal">/ 100</span>
                                        </div>
                                        <p className="text-sm text-gray-400 font-medium">Final Trust Score</p>
                                    </div>

                                    {/* Red Flags */}
                                    {log.redFlags && log.redFlags.length > 0 && (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                            <div className="flex items-center gap-2 text-red-400 font-bold mb-3 uppercase text-sm tracking-wider">
                                                <FiAlertTriangle className="text-lg" /> Detected Suspicious Flags
                                            </div>
                                            <ul className="list-disc pl-5 text-red-300 text-sm space-y-1">
                                                {log.redFlags.map((flag, idx) => (
                                                    <li key={idx} dangerouslySetInnerHTML={{ __html: flag.replace(/"(.*?)"/g, '<span class="text-white font-bold">"$1"</span>') }} />
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Image & OCR Output */}
                                <div className="flex flex-col items-center">
                                    <div className="w-full max-w-sm h-64 border-2 border-white/10 rounded-2xl overflow-hidden shadow-2xl bg-black mb-6 relative">
                                        <a href={`http://localhost:5000${log.idCardImageUrl}`} target="_blank" rel="noreferrer" className="block w-full h-full cursor-zoom-in group">
                                            <img src={`http://localhost:5000${log.idCardImageUrl}`} alt="ID Card" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-sm font-bold tracking-widest uppercase bg-black/60 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">Click to View Full Size</span>
                                            </div>
                                        </a>
                                    </div>

                                    {/* OCR Data */}
                                    <div className="w-full max-w-sm bg-surface-border rounded-xl p-5 border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-primary/20 text-primary-light text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">Automated OCR Output</div>
                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Extracted Name</p>
                                                <p className="text-white/80 font-mono text-sm">{log.breakdown?.extractedName || <span className="text-red-400 italic">None</span>}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-1">Extracted Reg No</p>
                                                <p className="text-white/80 font-mono text-sm">{log.breakdown?.extractedRegNo || <span className="text-red-400 italic">None</span>}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-white/10">
                                <button
                                    onClick={() => handleReview(log._id, 'APPROVED')}
                                    className="flex-1 btn-primary py-4 shadow-[0_0_20px_rgba(34,197,94,0.3)] bg-green-600 hover:bg-green-500 border-none text-white font-bold text-lg"
                                >
                                    ✅ Approve Account
                                </button>
                                <button
                                    onClick={() => handleReview(log._id, 'REJECTED')}
                                    className="flex-1 bg-surface-card border-2 border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white rounded-lg py-4 transition-all duration-300 font-bold text-lg"
                                >
                                    ❌ Reject Application
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default IDVerificationReviews;
