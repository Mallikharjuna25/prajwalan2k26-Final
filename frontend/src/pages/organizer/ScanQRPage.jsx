import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import QRScanner from '../../components/organizer/QRScanner';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import Loader from '../../components/common/Loader';

const ScanQRPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // NEW 2-Step Flow States
    const [previewData, setPreviewData] = useState(null); // Holds data before confirm
    const [lastScanned, setLastScanned] = useState(null); // Holds data after confirm or error

    // To prevent rapid double-scanning while evaluating
    const [isScanningActive, setIsScanningActive] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const { data } = await axios.get(`/events/${id}`);
                setEvent(data);
            } catch (error) {
                toast.error("Failed to load event");
                navigate('/organizer/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const handleScan = async (scannedString) => {
        if (!isScanningActive) return;

        setIsScanningActive(false); // Pause scanning
        setLastScanned(null);

        try {
            // STEP 1: Fetch Preview Data
            const { data } = await axios.post(`/organizer/events/${id}/scan-preview`, { qrData: scannedString });

            // Show preview UI
            setPreviewData(data);

        } catch (error) {
            // If even the preview fails (e.g., incorrect event, invalid QR format)
            toast.error(error.response?.data?.message || 'Invalid QR Code');
            setLastScanned({
                success: false,
                message: error.response?.data?.message || 'Verification Failed',
                time: new Date().toLocaleTimeString()
            });
            setTimeout(() => setIsScanningActive(true), 3000); // Resume scanning after 3s
        }
    };

    const confirmEntry = async () => {
        if (!previewData) return;

        try {
            // STEP 2: Actually Mark Attendance
            await axios.post(`/organizer/events/${id}/scan`, { registrationId: previewData.registrationId });

            toast.success('Attendance marked successfully!');
            // Move preview data into the success box, clear preview
            setLastScanned({
                success: true,
                message: 'Entry Verified',
                studentName: previewData.studentName,
                idCardUrl: previewData.idCardUrl,
                time: new Date().toLocaleTimeString()
            });
            setPreviewData(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error marking attendance');
            setLastScanned({
                success: false,
                message: error.response?.data?.message || 'Error occurred',
                time: new Date().toLocaleTimeString()
            });
            setPreviewData(null);
        } finally {
            setTimeout(() => setIsScanningActive(true), 2500); // Resume scanning after 2.5s
        }
    };

    const cancelEntry = () => {
        setPreviewData(null);
        setIsScanningActive(true); // Resume immediately
    };

    if (loading) return <Loader />;

    return (
        <div className="max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/organizer/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
                <FiArrowLeft /> Back to Dashboard
            </button>

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Scan Entry Pass</h1>
                <p className="text-accent">{event?.title}</p>
            </div>

            {/* Scanner Area - Hidden while evaluating a pass */}
            <div className={`mb-10 transition-opacity duration-300 ${!isScanningActive ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                <QRScanner onScan={handleScan} />
                {!isScanningActive && !previewData && (
                    <p className="text-center mt-4 text-accent animate-pulse font-medium">Processing...</p>
                )}
            </div>

            {/* PREVIEW STEP UI (Manual Confirmation) */}
            {previewData && (
                <div className="bg-surface border border-primary/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(79,70,229,0.15)] mt-8 animate-fadeIn text-center">
                    <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Verify Identity</h2>
                    <p className="text-sm text-gray-400 mb-6">Please check the ID photo before approving entry.</p>

                    <div className="flex flex-col items-center">
                        {previewData.idCardUrl ? (
                            <div className="w-56 h-72 rounded-xl overflow-hidden border-2 border-primary shadow-[0_0_20px_rgba(79,70,229,0.3)] bg-black/50 mb-4">
                                <img
                                    src={`http://localhost:5000${previewData.idCardUrl}`}
                                    alt="Student ID card"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-48 h-64 rounded-xl border border-white/20 bg-white/5 flex flex-col items-center justify-center text-gray-500 mb-4">
                                <span className="uppercase text-xs font-bold tracking-widest text-center">No Photo<br />Available</span>
                            </div>
                        )}

                        <h3 className="text-2xl font-bold text-white">{previewData.studentName}</h3>
                        <p className="text-primary-light font-mono mb-8">{previewData.registerNumber}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
                        <button
                            onClick={confirmEntry}
                            className="btn-primary w-full sm:w-auto px-8 shadow-[0_0_15px_rgba(34,197,94,0.3)] bg-green-600 hover:bg-green-500 text-white"
                        >
                            Approve Entry
                        </button>
                        <button
                            onClick={cancelEntry}
                            className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 px-8 py-3 rounded-lg font-bold transition-all w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* FINAL SUCCESS/ERROR UI */}
            {!previewData && lastScanned && (
                <div className={`mt-8 p-8 rounded-2xl border text-center transition-all shadow-2xl ${lastScanned.success
                    ? 'bg-green-500/10 border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.15)]'
                    : 'bg-red-500/10 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.15)]'
                    }`}>
                    <div className="flex justify-center mb-4">
                        {lastScanned.success ? (
                            <FiCheckCircle className="text-5xl text-green-500 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_15px_rgba(239,68,68,0.5)]">X</div>
                        )}
                    </div>
                    <h3 className={`text-2xl font-bold mb-2 uppercase tracking-wide ${lastScanned.success ? 'text-green-400' : 'text-red-400'}`}>
                        {lastScanned.message}
                    </h3>

                    {lastScanned.studentName && (
                        <p className="text-white text-lg font-medium mb-1">{lastScanned.studentName}</p>
                    )}
                    <p className="text-sm text-gray-500 mb-6">Time: {lastScanned.time}</p>

                    {lastScanned.success && lastScanned.idCardUrl && (
                        <div className="flex justify-center border-t border-white/10 pt-6 mt-4">
                            <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">Student ID Verification</span>
                                <div className="w-48 h-64 rounded-xl overflow-hidden border-2 border-green-500/50 shadow-[0_0_25px_rgba(34,197,94,0.2)] bg-black/50">
                                    <img
                                        src={`http://localhost:5000${lastScanned.idCardUrl}`}
                                        alt="Student ID card"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/200x300?text=No+Photo' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ScanQRPage;
