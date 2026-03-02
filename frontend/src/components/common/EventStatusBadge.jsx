import React from 'react';

const EventStatusBadge = ({ status }) => {
    switch (status) {
        case 'COMPLETED':
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">✅ Completed</span>;
        case 'ONGOING':
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">🟢 Live Now</span>;
        case 'UPCOMING':
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">🔔 Upcoming</span>;
        case 'PENDING':
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30">🕐 Pending</span>;
        case 'CANCELLED':
            return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500/20 text-red-400 border border-red-500/30">❌ Cancelled</span>;
        default:
            return null;
    }
};

export default EventStatusBadge;
