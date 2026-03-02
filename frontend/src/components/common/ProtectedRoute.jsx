import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role, loading } = useAuth();

    if (loading) {
        return <Loader fullScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to their respective dashboard if wrong role
        if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'organizer') return <Navigate to="/organizer/dashboard" replace />;
        return <Navigate to="/student/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
