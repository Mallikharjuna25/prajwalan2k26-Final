import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import CollegeCard from '../../components/admin/CollegeCard';
import { FiSearch, FiActivity, FiUsers, FiStar } from 'react-icons/fi';

const CollegeOverview = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const { data } = await axios.get('/admin/colleges');
                setData(data);
            } catch (error) {
                console.error('Failed to fetch overview', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOverview();
    }, []);

    if (loading) return <Loader />;
    if (!data) return <div className="text-white">Failed to load overview data.</div>;

    const totalColleges = data.collegesOverview.length;
    const filteredColleges = data.collegesOverview.filter(c =>
        c.collegeName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Platform Overview</h1>
                <p className="text-gray-400">High-level metrics and college insights.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="card border-blue-500/20 bg-gradient-to-br from-surface-card to-blue-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                            <FiActivity className="text-xl" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{totalColleges}</h3>
                    <p className="text-sm text-gray-400">Total Registered Colleges</p>
                </div>

                <div className="card border-purple-500/20 bg-gradient-to-br from-surface-card to-purple-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                            <FiUsers className="text-xl" />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-1">{data.totalStudents}</h3>
                    <p className="text-sm text-gray-400">Total Students Platform-wide</p>
                </div>

                <div className="card border-pink-500/20 bg-gradient-to-br from-surface-card to-pink-500/5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
                            <FiStar className="text-xl" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 truncate">
                        {totalColleges > 0 ? [...data.collegesOverview].sort((a, b) => b.studentCount - a.studentCount)[0].collegeName : 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-400">Most Active College</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-white">College Leaderboard</h2>
                <div className="relative w-full md:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search college..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-card border border-surface-border text-white pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:border-primary/50"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredColleges.map((college, index) => (
                    <CollegeCard
                        key={college.collegeName}
                        collegeName={college.collegeName}
                        studentCount={college.studentCount}
                        organizerCount={college.organizerCount}
                        rank={index + 1}
                    />
                ))}
                {filteredColleges.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-500 bg-surface-card rounded-2xl border border-surface-border">
                        No colleges match your search.
                    </div>
                )}
            </div>
        </div>
    );
};

export default CollegeOverview;
