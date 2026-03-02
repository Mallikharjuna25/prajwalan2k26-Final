import { motion } from 'framer-motion';
import { FiX, FiDownload } from 'react-icons/fi';

const QRModal = ({ isOpen, onClose, qrCodeBase64, eventTitle, studentName, registerNumber, date }) => {
    if (!isOpen) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = qrCodeBase64;
        link.download = `${eventTitle.replace(/\s+/g, '_')}_Ticket.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass-strong relative w-full max-w-sm rounded-2xl overflow-hidden shadow-neon z-10 flex flex-col"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-black/30 hover:bg-black/50 rounded-full transition-colors text-white"
                >
                    <FiX />
                </button>

                <div className="bg-gradient-neon p-6 text-center">
                    <h3 className="text-xl font-bold text-white mb-1">Entry Ticket</h3>
                    <p className="text-white/80 text-sm font-medium">{eventTitle}</p>
                </div>

                <div className="p-8 pb-6 flex flex-col items-center bg-white">
                    <div className="bg-white p-2 rounded-xl border-4 border-gray-100 shadow-sm mb-6">
                        <img src={qrCodeBase64} alt="Entry QR Code" className="w-48 h-48" />
                    </div>

                    <div className="w-full space-y-3 text-center">
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Attendee</p>
                            <p className="text-gray-900 font-semibold">{studentName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Reg No</p>
                                <p className="text-gray-900 text-sm font-medium">{registerNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Date</p>
                                <p className="text-gray-900 text-sm font-medium">{new Date(date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 flex justify-center border-t border-gray-200">
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
                    >
                        <FiDownload /> Download Pass
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default QRModal;
