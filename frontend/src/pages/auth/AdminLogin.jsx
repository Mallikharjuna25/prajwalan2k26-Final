import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import useAuth from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { FiShield } from 'react-icons/fi';

const AdminLogin = () => {
    const [formData, setFormData] = useState({ adminId: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.adminId || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const { data } = await axios.post('/auth/admin/login', formData);
            loginAdmin(data.token, data);
            toast.success('Admin login successful!');
            navigate('/admin/dashboard');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Unauthorized');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-500/10 border-2 border-red-500/50 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <FiShield className="text-red-500 text-3xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">System Admin Portal</h2>
                    <p className="text-gray-500 text-sm mt-2">Restricted Access</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 bg-surface-card p-8 rounded-2xl border border-white/5 shadow-glass">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Administrator ID</label>
                        <input
                            type="text"
                            value={formData.adminId}
                            onChange={(e) => setFormData({ ...formData, adminId: e.target.value })}
                            className="w-full bg-surface border border-surface-border text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Master Password</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-surface border border-surface-border text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-500/50"
                        />
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white transition-colors mt-4">
                        {loading ? 'Authenticating...' : 'Authorize Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
