import React, { useContext } from 'react';
import Loading from '../components/Loading';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({children}) => {

    const {currentUser, loading} = useContext(AuthContext);
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