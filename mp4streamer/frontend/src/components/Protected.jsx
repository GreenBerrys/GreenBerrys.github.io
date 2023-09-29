import React, { useContext }  from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import Context from "../AppContext.js";

const Protected = () => {

    const { auth } = useContext( Context );

    return auth ? <Outlet/> : <Navigate to="/" />
    // return <Outlet/>  
}

export default Protected