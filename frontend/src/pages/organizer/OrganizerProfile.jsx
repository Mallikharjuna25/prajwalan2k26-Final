import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import Loader from '../../components/common/Loader';
import { FiMail, FiMapPin, FiCheckCircle } from 'react-icons/fi';

const OrganizerProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/organizer/profile');
                setProfile(data);
            } catch (error) {
                console.error('Failed to fetch profile', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <Loader />;
    if (!profile) return <div className="text-white">Profile not found.</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Institution Profile</h1>
                <p className="text-gray-400">View your verified organization details.</p>
            </div>

            <div className="card overflow-hidden p-0 border-accent/20">
                <div className="h-32 bg-gradient-to-r from-accent to-blue-500 relative">
                    <div className="absolute -bottom-12 left-8 w-24 h-24 bg-surface rounded-2xl border-4 border-surface-card flex items-center justify-center text-4xl font-bold text-white capitalize shadow-xl">
                        {profile.collegeName.charAt(0)}
                    </div>
                </div>

                <div className="pt-16 px-8 pb-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                {profile.collegeName}
                                <FiCheckCircle className="text-blue-500 text-xl" title="Verified Institution" />
                            </h2>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider">
                            {profile.status}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-surface p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                <FiMail className="text-xl text-accent" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Official Email</p>
                                <p className="text-white font-medium">{profile.email}</p>
                            </div>
                        </div>

                        <div className="bg-surface p-5 rounded-2xl border border-white/5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                <FiMapPin className="text-xl text-accent" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">City / Location</p>
                                <p className="text-white font-medium">{profile.place}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerProfile;
