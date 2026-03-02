import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import ReviewCard from '../../components/admin/ReviewCard';
import toast from 'react-hot-toast';
import { FiUserCheck } from 'react-icons/fi';

const StudentReviews = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingStudents = async () => {
        try {
            const { data } = await axios.get('/admin/students/pending');
            setStudents(data);
        } catch (error) {
            console.error('Failed to fetch pending students', error);
            toast.error('Failed to load pending students');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingStudents();
    }, []);

    const handleApprove = async (student) => {
        try {
            const { data } = await axios.patch(`/admin/students/${student._id}/approve`);

            // If they had a pending manual review on their ID card, mark that log as approved
            if (student.verificationLogId && student.verificationStatus === 'MANUAL_REVIEW') {
                try {
                    await axios.post(`/verify/admin/review/${student.verificationLogId._id}`, { adminDecision: 'APPROVED', adminNote: 'Approved via Student Reviews Dashboard' });
                } catch (err) {
                    console.warn('Failed to update verification log', err);
                }
            }

            toast.success(data.message || 'Student Approved');
            setStudents(prev => prev.filter(s => s._id !== student._id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        }
    };

    const handleReject = async (student) => {
        const reason = prompt("Enter rejection reason (this will be emailed to the student):");
        if (reason === null) return; // cancelled

        try {
            const { data } = await axios.patch(`/admin/students/${student._id}/reject`, { reason: reason || 'Does not meet criteria' });

            // If they had a pending manual review on their ID card, mark that log as rejected
            if (student.verificationLogId && student.verificationStatus === 'MANUAL_REVIEW') {
                try {
                    await axios.post(`/verify/admin/review/${student.verificationLogId._id}`, { adminDecision: 'REJECTED', adminNote: reason });
                } catch (err) {
                    console.warn('Failed to update verification log', err);
                }
            }

            toast.success(data.message || 'Student Rejected');
            setStudents(prev => prev.filter(s => s._id !== student._id));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Student Reviews</h1>
                <p className="text-gray-400">Review and approve new student registrations before they can log in.</p>
            </div>

            {loading ? (
                <Loader />
            ) : students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {students.map(student => (
                        <ReviewCard
                            key={student._id}
                            type="student"
                            user={student}
                            onApprove={() => handleApprove(student)}
                            onReject={() => handleReject(student)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-surface-card rounded-2xl border border-surface-border">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <FiUserCheck className="text-3xl text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No pending reviews</h3>
                    <p className="text-gray-500">All student accounts are currently processed.</p>
                </div>
            )}
        </div>
    );
};

export default StudentReviews;
