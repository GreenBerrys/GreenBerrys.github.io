import React, { useState, useEffect, useContext } from "react";
import userApi from "../lib/userApi.js";
import Context from "../AppContext.js";

/********************************************************************************************
 * 
 */
function Logout() {

const { auth, setAuth } = useContext( Context );
const [init, setInit] = useState(false);

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    if(init)
        window.scrollTo( { top: 0, behavior: 'auto' } );
        if(auth){
            userApi.logout( (data) => {
                        //console.log(data);
                });
        }    
        setAuth( false )
        setInit( () => false );  
return () => {
    userApi.setUser( { _id: null } );
    sessionStorage.removeItem("User");
};
// eslint-disable-next-line react-hooks/exhaustive-deps
},[init]);

return (
            <h1 style={{color: 'green'}}><br></br>
                Tschüssi {userApi.getUser().name},<br></br><br></br>
                bis zum nächsten mal 
            </h1>
        );        
}
export default Logout;

