import { motion } from 'framer-motion';
import { FiCheck, FiX, FiUser, FiAlertTriangle, FiImage } from 'react-icons/fi';

const ReviewCard = ({ user, type, onApprove, onReject, isProcessing }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card border-l-4 border-l-orange-500"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-surface-card flex items-center justify-center border border-surface-border shrink-0">
                        <FiUser className="text-gray-400 text-xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                            {type === 'student' ? user.name : user.collegeName}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">{user.email}</p>

                        <div className="flex flex-wrap gap-2 mt-3">
                            {type === 'student' ? (
                                <>
                                    <span className="text-xs bg-primary/20 text-primary-light px-2 py-1 rounded-md border border-primary/20">{user.collegeName}</span>
                                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-md border border-white/10">{user.branch} • {user.graduationYear}</span>
                                    <span className="text-xs bg-white/10 text-gray-300 px-2 py-1 rounded-md border border-white/10">Reg: {user.registerNumber}</span>

                                    {/* Verification Status Badge */}
                                    <span className={`text-xs px-2 py-1 rounded-md border font-bold ${user.verificationStatus === 'AUTO_APPROVED' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                                            user.verificationStatus === 'MANUAL_REVIEW' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                                                'bg-gray-500/20 text-gray-400 border-gray-500/20'
                                        }`}>
                                        AI Score: {user.verificationScore || 0}/100
                                    </span>
                                </>
                            ) : (
                                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-md border border-accent/20">Location: {user.place}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* ID Card Verification Section (Only for students) */}
                {type === 'student' && user.verificationLogId && (
                    <div className="mt-6 md:mt-0 flex-1 md:mx-6 bg-black/40 border border-white/5 rounded-xl p-4 flex gap-4 items-start">
                        {/* ID Card Image Thumbnail */}
                        <a href={`http://localhost:5000${user.verificationLogId.idCardImageUrl}`} target="_blank" rel="noreferrer" className="shrink-0 group relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 block bg-black">
                            <img src={`http://localhost:5000${user.verificationLogId.idCardImageUrl}`} alt="ID Card" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <FiImage className="text-white text-xl" />
                            </div>
                        </a>

                        {/* Red Flags & Details */}
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-gray-300 mb-1">ID Verification Details</h4>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mb-2">
                                <span className="text-gray-500">OCR Name:</span>
                                <span className="text-white truncate">{user.verificationLogId.breakdown?.extractedName || 'N/A'}</span>
                                <span className="text-gray-500">OCR Reg:</span>
                                <span className="text-white truncate">{user.verificationLogId.breakdown?.extractedRegNo || 'N/A'}</span>
                            </div>

                            {user.verificationLogId.redFlags?.length > 0 && (
                                <div className="mt-2 bg-red-500/10 border border-red-500/20 rounded p-2">
                                    <div className="flex items-center gap-1.5 text-red-400 font-bold text-[10px] uppercase mb-1 tracking-wider">
                                        <FiAlertTriangle /> Suspicious Flags
                                    </div>
                                    <ul className="text-[10px] text-red-300 list-disc pl-4 space-y-0.5">
                                        {user.verificationLogId.redFlags.map((flag, idx) => (
                                            <li key={idx} className="line-clamp-1">{flag}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={() => onReject(user._id)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <FiX /> Reject
                    </button>
                    <button
                        onClick={() => onApprove(user._id)}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white transition-colors disabled:opacity-50"
                    >
                        <FiCheck /> Approve
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default ReviewCard;
