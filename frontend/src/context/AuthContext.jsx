import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');

        if (storedToken && storedUser && storedRole) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setRole(storedRole);
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const loginStudent = (token, userData) => {
        setToken(token);
        setUser(userData);
        setRole('student');
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', 'student');
    };

    const loginOrganizer = (token, userData) => {
        setToken(token);
        setUser(userData);
        setRole('organizer');
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', 'organizer');
    };

    const loginAdmin = (token, adminData) => {
        setToken(token);
        setUser(adminData);
        setRole('admin');
        setIsAuthenticated(true);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(adminData));
        localStorage.setItem('role', 'admin');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRole(null);
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{
            user, token, role, isAuthenticated, loading,
            loginStudent, loginOrganizer, loginAdmin, logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
