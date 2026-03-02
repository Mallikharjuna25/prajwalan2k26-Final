import { Outlet } from 'react-router-dom';
import OrganizerSidebar from '../../components/organizer/OrganizerSidebar';

const OrganizerDashboard = () => {
    return (
        <div className="min-h-screen bg-surface flex">
            <OrganizerSidebar />
            <div className="flex-1 md:ml-72 transition-all duration-300">
                <div className="p-6 md:p-8 lg:p-10 pt-20 md:pt-10 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default OrganizerDashboard;
