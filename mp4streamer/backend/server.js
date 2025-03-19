import fs from "fs";
import { execSync } from "node:child_process";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieSession from "cookie-session";
import fileUpload from "express-fileupload";
import log from "./utils/logger.js"

import userRouter from "./routers/userRouter.js";
import videoRouter from "./routers/videoRouter.js";

dotenv.config( { path: "./server.env" } );
const PORT = process.env.s_PORT;
const SERVER = process.env.s_SERVER;

const server = express();
server.use( cors() );
server.set( 'trust proxy', 1 );
server.use( express.json() );
server.use( express.urlencoded( { extended: true } ) ); 

server.use( cookieSession( {
    name: `${process.env.s_COOKIE}`,
    secret: `${process.env.s_SECRET}`,
    maxAge: 1 * 60 * 60000,     //1 hour
    sameSite: 'strict',
    httpOnly: true
}));

const AUTOLOGIN = `${process.env.s_AUTOLOGIN}`.toLowerCase() === 'true' ? true : false;
if( !AUTOLOGIN ){

    const xUser = `${process.env.s_USER}`.split(',');
    if( (`${process.env.s_PASS}`.split(',')).length !== xUser.length || `${process.env.s_PASS}` === '' ) {
        
        console.log('Fehler in der server.env - Bitte für jeden Benutzer ein Password angeben (s_PASS)');
        process.exit(-1);
    }
    if( (`${process.env.s_EDIT}`.split(',')).length !== xUser.length || `${process.env.s_EDIT}` === '' ){

        console.log('Fehler in der server.env - Bitte für jeden Benutzer angeben ob er die Videoeinträge bearbeiten darf (s_EDIT)');
        process.exit(-1);
    }
}
//==================================

server.use(fileUpload( { limits: { fileSize: 1024 * 500 },   // max. filesize 500K
    abortOnLimit: true, 
    responseOnLimit: JSON.stringify( { error: true, errMsg: `Bilddatei ist zu groß.. (max. 500Kb)`, result: [] } )
}));
//==================================

server.listen( PORT, () => console.log( `${SERVER} is listening on port ${PORT}` ) );


// ------------------------------------------------------------------------------------------------
/*
server.use( "/", ( req, res, next ) => {
    console.log('----------------------------- SERVER');
    //console.log(req.originalUrl);
    //console.log('---- params\n',req.params);
    //console.log('---- headers\n', req.headers);
    //console.log('---- body\n', JSON.stringify(req.body));
    //console.log('---- files\n', JSON.stringify(req.files));
    console.log("---------------------------- \n");
    next();
  });
*/
/*
server.get( "/video/*", ( req, res, next ) => {
    console.log('----------------------------- SERVER');
    //console.log(req.originalUrl);
    //console.log('---- params\n',req.params);
    //console.log('---- headers\n', req.headers);
    //console.log('---- body\n', JSON.stringify(req.body));
    //console.log('---- files\n', JSON.stringify(req.files));
    console.log("---------------------------- \n");
    next();
  });
*/  
  
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

    server.get('*', ( req, res ) => { res.sendFile( 'index.html', {root: BUILDDIR } ) 
    
    } );
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

