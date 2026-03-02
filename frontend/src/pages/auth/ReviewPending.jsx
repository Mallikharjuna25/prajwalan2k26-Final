import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiClock, FiHome } from 'react-icons/fi';

const ReviewPending = () => {
    useEffect(() => {
        // Scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-strong max-w-lg w-full rounded-3xl p-10 md:p-14 text-center z-10 border-primary/20 shadow-neon"
            >
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    className="w-24 h-24 mx-auto mb-8 border-4 border-dashed border-primary-light rounded-full flex items-center justify-center bg-primary/10"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <FiClock className="text-4xl text-white" />
                    </motion.div>
                </motion.div>

                <h1 className="text-3xl font-bold text-white mb-4">Account Under Review</h1>
                <p className="text-gray-300 mb-8 leading-relaxed">
                    Thank you for registering! Your account is currently pending review by our administrator. You will receive an email notification as soon as your account is approved.
                </p>

                <Link to="/" className="inline-flex items-center gap-2 text-primary-light font-semibold hover:text-white transition-colors bg-white/5 border border-white/10 px-6 py-3 rounded-xl hover:bg-white/10">
                    <FiHome /> Return to Home
                </Link>
            </motion.div>
        </div>
    );
};

export default ReviewPending;
