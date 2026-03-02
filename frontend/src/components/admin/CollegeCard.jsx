import { motion } from 'framer-motion';
import { FiBriefcase } from 'react-icons/fi';

const CollegeCard = ({ collegeName, studentCount, organizerCount, onClick }) => {
    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={onClick}
            className="card cursor-pointer hover:border-primary/50 transition-all duration-300"
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-neon flex items-center justify-center shrink-0">
                    <FiBriefcase className="text-white text-xl" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">{collegeName}</h3>
                    <div className="flex gap-4">
                        <div className="bg-surface-card px-3 py-1.5 rounded-lg border border-surface-border flex items-center gap-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Students</span>
                            <span className="text-white font-bold">{studentCount}</span>
                        </div>
                        <div className="bg-surface-card px-3 py-1.5 rounded-lg border border-surface-border flex items-center gap-2">
                            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Organizers</span>
                            <span className="text-white font-bold">{organizerCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CollegeCard;
