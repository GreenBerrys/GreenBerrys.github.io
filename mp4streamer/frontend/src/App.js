import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import './App.css';
import Context from './AppContext.js';

import Menu from "./components/NavMenu.jsx";
import Footer from "./components/Footer.jsx";

import { AUTOLOGIN } from './config.js';

function App() {

    const [ auth, setAuth ] = useState( () => {

        const user = sessionStorage.getItem("User");

        if( user || AUTOLOGIN ){
            return true;
        }
        else{
            return false;
        }    
    }); 

    return (

        <Context.Provider value={{ auth, setAuth }}>

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
