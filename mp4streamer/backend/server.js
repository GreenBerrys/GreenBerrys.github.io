import fs from "fs";
import { execSync } from "node:child_process";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import database from "./Database/database.js";
import log from "./utils/logger.js"

import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";

database.init();

dotenv.config( { path: "./server.env" } );
const PORT = process.env.s_PORT;
const SERVER = process.env.s_SERVER;

const server = express();
server.use( cors() );
server.set( 'trust proxy', true );
server.use( express.json() );
server.use( express.urlencoded( { extended: true } ) ); 

server.use( session( {
    name: `${process.env.s_COOKIE}`,
    secret: `${process.env.s_SECRET}`,
    resave: false,
    saveUninitialized: true,
    rolling: false, 
    cookie: { 
        maxAge: 60000 * 60 * 5,    // 5 hours
        httpOnly: true, 
        sameSite: 'strict',
        //secure: true
    },
}));

server.listen( PORT, () => console.log( `${SERVER} is listening on port ${PORT}` ) );

// ------------------------------------------------------------------------------------------------

server.use( "/user", userRouter );  
server.use( "/video", videoRouter );  

// ------------------------------------------------------------------------------------------------
// ------------------------ Deliver production-build  
const ARGS = process.argv;

const DLM = ARGS[1][1] !== ':' ? '/' : '\\';
const BUILDDIR = ARGS[1][1] !== ':' ? '/' + ARGS[1].substring( 1, ARGS[1].lastIndexOf( `${DLM}backend` ) ) + `${DLM}frontend${DLM}build` :
                                           ARGS[1].substring( 2, ARGS[1].lastIndexOf( `${DLM}backend` ) )  + `${DLM}frontend${DLM}build`;

if( fs.existsSync( BUILDDIR ) ){
    server.use( "/", express.static( BUILDDIR ));
    server.get('*', ( req, res ) => { res.sendFile( 'index.html', {root: BUILDDIR } ) } );
    console.log( `Production-build at "${BUILDDIR}" online` );   

    if( process.env.s_AUTOSTART === 'true' && ARGS[1][1] === ':' && process.env.s_URL === 'http://localhost' ){
        execSync(`start http://localhost:${PORT}/`);
    }
}
else{
    console.log(`"${BUILDDIR}" not found..`);                
    server.use( "/", ( req, res ) => res.status( 404 ).send( `"${req.url}" Page not found` ) );
}
// ------------------------------------------------------------------------------------------------
server.use( (req, res, err) => {

        log.logger( "Allgemeiner Fehler" + JSON.parse(err), req )
        //console.log("-------------> allgemeine fehlerausgabe");
        //console.log( `ERROR: \n`, err.message );
        res.status(500).json( err.message );
});

