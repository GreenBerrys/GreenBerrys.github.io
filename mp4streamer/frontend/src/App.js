import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import './App.css';

import Menu from "./components/NavMenu.jsx";
import Footer from "./components/Footer.jsx";

import { AUTOLOGIN } from './config.js';
import Context from './AppContext.js';

function App() {

const user = JSON.parse(sessionStorage.getItem("User"));

const [ auth, setAuth ] = useState( () => {

    return ( user || AUTOLOGIN );
}); 
const [ edit, setEdit ] = useState( () => {

    if( AUTOLOGIN )
        return true;
    else if( user ){
        return user.edit;
    }
    return false;
}); 

return (

        <Context.Provider value={ { auth, setAuth, edit, setEdit } }>

            <div className="App">

                <header>
                    <Menu/> 
                </header>

                <div className='content'>
                    <Outlet/>
                </div>
  
                <footer>
                    <Footer/>
                </footer>              

            </div>
        </Context.Provider>
    );

}
export default App;
