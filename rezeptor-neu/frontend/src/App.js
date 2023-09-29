import './App.css';
import React, { useState } from 'react';
import { Routes, Route } from "react-router-dom";

import Menu from "./components/NavMenu.jsx";
import Footer from "./components/Footer.jsx";

import Home from "./pages/Home.jsx";
import Recipes from "./pages/RecipesView.jsx";
import Authors from "./pages/AuthorsView.jsx";
import Recipe from "./pages/RecipeDetail.jsx";
import Login from "./pages/Login.jsx";
import Registration from "./pages/Registration.jsx";
import Logout from "./pages/Logout.jsx"
import Profile from "./pages/Profile.jsx"
import Comments from "./pages/RecipeComments.jsx";
import Context from './AppContext.js';
import userApi from './lib/userApi.js';
import About from './pages/About.jsx';


function App() {

   const [ auth, setAuth ] = useState( () => {

        const user = sessionStorage.getItem("User");
        if( user ){
            userApi.setUser(JSON.parse(user));
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
                    <Route path = "recipe/:filter" element = { <Recipe/> } />
                    <Route path = "recipes/:filter" element = { <Recipes/> } />
                    <Route path = "authors/:filter" element = { <Authors/> } />
                    <Route path = "comments/:filter" element = { <Comments/> } />
                    <Route path = "login" element = { <Login/> } />
                    <Route path = "signin" element = { <Registration/> } />
                    <Route path = "logout" element = { <Logout/> } />
                    <Route path = "profile" element = { <Profile/> } />
                    <Route path = "about" element = { <About/> } />
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
