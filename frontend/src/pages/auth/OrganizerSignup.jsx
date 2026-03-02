import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import toast from 'react-hot-toast';

const OrganizerSignup = () => {
    const [formData, setFormData] = useState({
        collegeName: '', email: '', place: '', password: '', confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(formData).some(val => !val)) {
            toast.error('Please fill in all fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const payload = { ...formData };
            delete payload.confirmPassword;
            await axios.post('/auth/organizer/signup', payload);
            toast.success('Registration successful! Pending admin review.');
            navigate('/review-pending');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen py-20 px-6 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-surface/90"></div>

            <div className="w-full max-w-xl relative z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="text-3xl font-heading font-bold text-gradient inline-block mb-2">EventNexus</Link>
                    <h2 className="text-2xl font-bold text-white">Organizer Registration</h2>
                </div>

                <div className="card shadow-neon-cyan/20 border-accent/20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-400 mb-1">College/Institution Name</label>
                                <input type="text" value={formData.collegeName} onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Official Email Address</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" placeholder="events@college.edu" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">City / Place</label>
                                <input type="text" value={formData.place} onChange={(e) => setFormData({ ...formData, place: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
                                <input type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} className="input-field" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full mt-8 btn-primary bg-gradient-to-r from-accent to-blue-500 hover:from-accent-dark hover:to-blue-600 shadow-neon-cyan">
                            {loading ? 'Submitting...' : 'Register as Organizer'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400">
                        Already registered? <Link to="/organizer/login" className="text-accent hover:text-white transition-colors font-semibold">Log in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganizerSignup;
