import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import AnalyticsCharts from '../../components/student/AnalyticsCharts';
import Loader from '../../components/common/Loader';
import { FiActivity, FiAward, FiCheckCircle, FiStar } from 'react-icons/fi';

const StudentAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get('/student/analytics');
                setData(res.data);
            } catch (error) {
                console.error('Failed to fetch analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <Loader />;
    if (!data) return <div className="text-white">Error loading analytics.</div>;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">My Analytics</h1>
                <p className="text-gray-400">Track your event participation and performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div className="card border-primary/20 bg-gradient-to-br from-surface-card to-primary/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-primary/20 text-primary-light">
                            <FiActivity className="text-xl" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{data.totalRegistered}</h3>
                    <p className="text-sm text-gray-400">Events Registered</p>
                </div>

                <div className="card border-green-500/20 bg-gradient-to-br from-surface-card to-green-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                            <FiCheckCircle className="text-xl" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verified</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{data.totalAttended}</h3>
                    <p className="text-sm text-gray-400">Events Attended</p>
                </div>

                <div className="card border-accent/20 bg-gradient-to-br from-surface-card to-accent/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-accent/20 text-accent">
                            <FiStar className="text-xl" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Rate</span>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">
                        {data.totalRegistered > 0 ? Math.round((data.totalAttended / data.totalRegistered) * 100) : 0}%
                    </h3>
                    <p className="text-sm text-gray-400">Attendance Rate</p>
                </div>

                <div className="card border-pink-500/20 bg-gradient-to-br from-surface-card to-pink-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
                            <FiAward className="text-xl" />
                        </div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Fav</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                        {data.eventsByCategory.length > 0 ? data.eventsByCategory[0].name : 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-400">Top Category</p>
                </div>
            </div>

            {/* Charts */}
            {data.totalRegistered > 0 ? (
                <AnalyticsCharts eventsByMonth={data.eventsByMonth} eventsByCategory={data.eventsByCategory} />
            ) : (
                <div className="text-center py-20 bg-surface-card rounded-3xl border border-surface-border">
                    <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                        <FiActivity className="text-2xl text-gray-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">No data to display</h3>
                    <p className="text-gray-500">Register and attend events to see your analytics grow.</p>
                </div>
            )}
        </div>
    );
};

export default StudentAnalytics;
