import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

const ProtectedRoute = ({children}) => {
    const {session, loading} = useAuth();
    if (loading) return <div className="page-loading">Loading...</div>;
    if (!session) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;
