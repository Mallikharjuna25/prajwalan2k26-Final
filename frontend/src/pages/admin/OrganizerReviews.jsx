import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import ReviewCard from '../../components/admin/ReviewCard';
import toast from 'react-hot-toast';
import { FiCheckSquare } from 'react-icons/fi';

const OrganizerReviews = () => {
    const [organizers, setOrganizers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingOrganizers = async () => {
        try {
            const { data } = await axios.get('/admin/organizers/pending');
            setOrganizers(data);
        } catch (error) {
            console.error('Failed to fetch pending organizers', error);
            toast.error('Failed to load pending organizers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingOrganizers();
    }, []);

    const handleApprove = async (id) => {
        try {
            const { data } = await axios.patch(`/admin/organizers/${id}/approve`);
            toast.success(data.message);
            setOrganizers(prev => prev.filter(o => o._id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt("Enter rejection reason (this will be emailed to the organizer):");
        if (reason === null) return; // cancelled

        try {
            const { data } = await axios.patch(`/admin/organizers/${id}/reject`, { reason: reason || 'Does not meet criteria' });
            toast.success(data.message);
            setOrganizers(prev => prev.filter(o => o._id !== id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Organizer / College Reviews</h1>
                <p className="text-gray-400">Review and verify new institutions before they can create events.</p>
            </div>

            {loading ? (
                <Loader />
            ) : organizers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {organizers.map(organizer => (
                        <ReviewCard
                            key={organizer._id}
                            type="organizer"
                            user={organizer}
                            onApprove={() => handleApprove(organizer._id)}
                            onReject={() => handleReject(organizer._id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-card rounded-2xl border border-surface-border">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <FiCheckSquare className="text-3xl text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No pending reviews</h3>
                    <p className="text-gray-500">All organizer accounts are currently verified.</p>
                </div>
            )}
        </div>
    );
};

export default OrganizerReviews;
