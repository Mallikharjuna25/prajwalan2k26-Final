import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiCamera, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

const QRScanner = ({ onScan }) => {
    const [scannerActive, setScannerActive] = useState(false);
    const [errorLine, setErrorLine] = useState('');

    useEffect(() => {
        let scanner;

        if (scannerActive) {
            scanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
            );

            scanner.render((decodedText) => {
                // Stop scanning after success to prevent multiple triggers
                scanner.clear();
                setScannerActive(false);
                onScan(decodedText);
            }, (errorMessage) => {
                // Just log errors invisibly, html5-qrcode scans every frame
                console.log(errorMessage);
                setErrorLine('Ensure the QR code is clearly visible');
            });
        }

        return () => {
            if (scanner) {
                scanner.clear().catch(e => console.error("Failed to clear scanner", e));
            }
        };
    }, [scannerActive, onScan]);

    return (
        <div className="flex flex-col items-center">
            {!scannerActive ? (
                <div className="glass p-12 rounded-2xl border-2 border-dashed border-white/20 w-full max-w-md flex flex-col items-center justify-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <FiCamera className="text-3xl text-primary-light" />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Scan Entry Pass</h3>
                        <p className="text-sm text-gray-400 mb-6">Request camera permissions to scan student QR codes.</p>
                        <button
                            onClick={() => setScannerActive(true)}
                            className="btn-primary w-full"
                        >
                            Start Scanner
                        </button>
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-md bg-surface-card rounded-2xl overflow-hidden border border-primary/30 shadow-neon">
                    <div className="bg-surface p-4 flex justify-between items-center border-b border-white/10">
                        <h3 className="font-bold text-white">Scanning QR Code...</h3>
                        <button
                            onClick={() => setScannerActive(false)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <FiXCircle className="text-xl" />
                        </button>
                    </div>
                    <div id="qr-reader" className="w-full bg-black"></div>
                    {errorLine && <p className="text-center text-xs text-yellow-500/70 p-2 bg-black">{errorLine}</p>}
                </div>
            )}
        </div>
    );
};

export default QRScanner;
