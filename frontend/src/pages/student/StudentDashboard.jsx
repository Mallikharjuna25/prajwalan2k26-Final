import { Outlet } from 'react-router-dom';
import StudentSidebar from '../../components/student/StudentSidebar';

const StudentDashboard = () => {
    return (
        <div className="min-h-screen bg-surface flex">
            <StudentSidebar />
            <div className="flex-1 md:ml-72 transition-all duration-300">
                <div className="p-6 md:p-8 lg:p-10 pt-20 md:pt-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
