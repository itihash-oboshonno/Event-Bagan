import Loading from '../components/Loading';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

const PrivateRoute = ({children}) => {

    const {currentUser, loading} = useAuth();
    const intendedLocation = useLocation();

    if(loading) {
        return <Loading></Loading>;
    }

    if (currentUser) {
        return children;
    }
    return <Navigate to="/login" state={{ from: intendedLocation }} replace></Navigate>
};

export default PrivateRoute;