import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-12 h-12 border-4 border-surface border-t-primary rounded-full shadow-neon"
            />
            <p className="text-sm font-medium text-gray-400 animate-pulse">Loading...</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-surface z-50 flex items-center justify-center">
                {content}
            </div>
        );
    }

    return <div className="py-12 flex justify-center">{content}</div>;
};

export default Loader;
