import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from "react-router-dom";
import './index.css';

import { SERVER } from "./config.js";

import App from './App.js';
import Protected from './components/Protected.jsx';
import Home from "./pages/Home.jsx";
import Videos from "./pages/Videos.jsx";
import Video from "./pages/VideoDetail.jsx";
import Episodes from "./pages/Episodes.jsx";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Player from "./pages/Videoplayer.jsx";
import Index from './pages/Index.jsx';
import News from './pages/News.jsx';


// get base-directory for the Browserrouter if the app on server is handled by subdirectory
const serverDir =  SERVER.split('/').length > 4 ? SERVER.substring( SERVER.substring( 0, SERVER.length -1 ).lastIndexOf( '/' ), SERVER.length -1 ) : '/';

const router = createBrowserRouter(

    createRoutesFromElements(

        <Route element = { <App/> } > 

            <Route path ="/" index element = { <Home/> } /> 
            <Route path = "/home" element = { <Home/> } /> 
            <Route path = "/login" element = { <Login/> } />

            <Route path="/" element={<Protected/>}>

                <Route path = "index/:itable" element = {  <Index/> }/>
                <Route path = "video/:recno"  element = { <Video/> } />   
                <Route path = "episodes/:recno/:title"  element = { <Episodes/> } />   
                <Route path = "videos/:filter/:page" element = { <Videos/> } /> 
                <Route path = "videos/:filter" element = { <Videos/> } />
                <Route path = "logout" element = { <Logout/> } />
                <Route path = "player/:recno/:epiNo" element = { <Player/> } />
                <Route path = "player/:recno" element = { <Player/> } />
                <Route path = "news" element = {  <News/> }/>

            </Route>

            <Route path="*" element={<Home/>}/>

        </Route>
    ),{ basename: serverDir, future: { v7_relativeSplatPath: true } }
);

ReactDOM.createRoot(document.getElementById('root')).render(

    <React.StrictMode>
        <RouterProvider router={router}  future={ { v7_startTransition: false } }>
            <App />
        </RouterProvider>
    </React.StrictMode>
);

