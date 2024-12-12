import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";
import './App.css';
import Context from './AppContext.js';

import Protected from './components/Protected.jsx';

import Home from "./pages/Home.jsx";
import Videos from "./pages/Videos.jsx";
import Video from "./pages/VideoDetail.jsx";
import Episodes from "./pages/Episodes.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Player from "./pages/Videoplayer.jsx";

import Menu from "./components/NavMenu.jsx";
import Footer from "./components/Footer.jsx";

import { AUTOLOGIN } from './config.js';
import Index from './pages/Index.jsx';



function App() {

    // get login-state
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
                    <Routes>

                        <Route path = "/" element = { <Home/> } />
                        <Route path = "/login" element = { <Login/> } />

                        <Route path="/" element={<Protected/>}>

                            <Route path = "/videos/actors" element = {  <Index indextab = { "actors" } 
                                                                               path = { "/videos/plot" } 
                                                                               isname = { true } 
                                                                               title = { "Darsteller:" }  
                                                                               searchadd = { ':' }  
                                                                        /> } />
                            <Route path = "/videos/directors" element = { <Index indextab = { "directors" } 
                                                                                 path = { "/videos/director" } 
                                                                                 isname = { true } 
                                                                                 title = { "Regie:" }  
                                                                         /> } />
                            <Route path = "/videos/genres" element = { <Index indextab = { "genres" } 
                                                                              path = { "/videos/genre" } 
                                                                              isname = { false } 
                                                                              title = { "Genre:" }
                                                                         /> } />
                            <Route path = "/videos/tags" element = { <Index indextab = { "tags" } 
                                                                            path = { "/videos/tag" } 
                                                                            isname = { false } 
                                                                            title = { "Tags:" }
                                                                        /> } />
                                                                        
                            <Route path = "/video/:recno"  element = { <Video/> } />   
                            <Route path = "/episodes/:recno/:title"  element = { <Episodes/> } />   
                            <Route path = "/videos/:filter" element = { <Videos/> } />
                            <Route path = "/logout" element = { <Logout/> } />
                            <Route path = "/player/:recno/:epiNo" element = { <Player/> } />
                            <Route path = "/player/:recno" element = { <Player/> } />

                        </Route>

                    </Routes>
                </div>
                <footer>
                    <Footer/>
                </footer>              

            </div>

        </Context.Provider>
  );
}

export default App;
