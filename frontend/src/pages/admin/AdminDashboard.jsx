import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-surface flex">
            <AdminSidebar />
            <div className="flex-1 md:ml-64 transition-all duration-300">
                <div className="p-6 md:p-8 lg:p-10 pt-20 md:pt-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
