import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.js';
import { SERVER } from "./config.js";

const root = ReactDOM.createRoot(document.getElementById('root'));

// get base-directory for the Browserrouter if the app on server is handled by subdirectory
const serverDir =  SERVER.split('/').length > 4 ? SERVER.substring( SERVER.substring( 0, SERVER.length -1 ).lastIndexOf( '/' ), SERVER.length -1 ) : '/';

root.render(
    <BrowserRouter basename={ serverDir }>
        <App />
    </BrowserRouter>

);

