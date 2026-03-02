import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const OrganizerLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { loginOrganizer } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post('/auth/organizer/login', formData);
            loginOrganizer(data.token, data);
            toast.success('Login successful!');
            navigate('/organizer/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative">
            <div className="absolute inset-0 bg-surface/90"></div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <Link to="/" className="text-3xl font-heading font-bold text-gradient inline-block mb-2">EventNexus</Link>
                    <h2 className="text-2xl font-bold text-white">Organizer Login</h2>
                </div>

                <div className="card border-accent/30 shadow-neon-cyan/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Official Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="input-field focus:border-accent/60 focus:ring-accent/40"
                                placeholder="admin@college.edu"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="input-field focus:border-accent/60 focus:ring-accent/40"
                                placeholder="••••••••"
                            />
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary bg-gradient-to-r from-accent to-blue-500 hover:from-accent-dark hover:to-blue-600 shadow-neon-cyan">
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Want to host events? <Link to="/organizer/signup" className="text-accent hover:text-accent-dark transition-colors font-semibold">Register college</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerLogin;
