import fs from "fs";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import session from "express-session";
import database from "./database/mongodb.js";

import userRouter from "./routers/userRouter.js";
import recipeRouter from "./routers/recipeRouter.js";
import ingredientRouter from "./routers/ingredientRouter.js";
import commentRouter from "./routers/commentRouter.js";
import ratingRouter from "./routers/ratingRouter.js";

import jsonRet from "./utils/buildJSONret.js"; 
import log from "./utils/logger.js";
import * as p from"./utils/path.js";

dotenv.config( { path: "./server.env" } );
const PORT = process.env.s_PORT;
const SERVER = process.env.s_SERVER;

database.init();

const server = express();
server.use( cors() );
server.use(fileUpload( { limits: { fileSize: 1024 * 1024 * process.env.s_PICMAXSIZE }, abortOnLimit: true, 
                         limitHandler: ( req ) => req.body.uploadBreak = true
                       } 
) );
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
        maxAge: 1000 * 60 * 60 * 3,    
        httpOnly: true, 
        sameSite: 'strict',
        //secure: true
    },
}));

server.listen( PORT, () => console.log( `${SERVER} is listening on port ${PORT}` ) );

/*
server.use( "/", ( req, res, next ) => {
    //console.log('----------------------------- SERVER')
    //console.log('---- params\n',req.params);
    //console.log('---- headers\n', req.headers);
    //console.log('---- body\n', req.body);
    //console.log('---- files\n', req.files);
    //console.log("---------------------------- \n");
    next();
  });
*/  
// ------------------------------------------------------------------------------------------------
server.get("/favicon.ico", ( req, res ) => res.sendFile( 'favicon.ico' , { root: './default/' } ) );
server.get("/logo.png", ( req, res ) => res.sendFile( 'logo.png' , { root: './default/' } ) );
// ------------------------------------------------------------------------------------------------
// server.use( "/*", auth.isBlockedM );
// ------------------------------------------------------------------------------------------------
server.use( "/user", userRouter );  
server.use( "/recipe", recipeRouter );  
server.use( "/ingredient", ingredientRouter );  
server.use( "/comment", commentRouter );  
server.use( "/rating", ratingRouter );  
// ------------------------------------------------------------------------------------------------
// ------------------------ Deliver production-build  
const BUILDDIR = p.buildPath();

if( fs.existsSync( BUILDDIR ) ){
    server.use( "/", express.static( BUILDDIR ));
    server.get('*', ( req, res ) => res.sendFile( 'index.html', { root: BUILDDIR } ) );
    console.log( `Production-build online` );                
}
else{
    console.log(`Production-build not found..`);                
    server.use( "/", ( req, res ) => res.status( 404 ).send( `"${req.url}" Page not found` ) );
}
// ------------------------------------------------------------------------------------------------
server.use( (req, res, err) => {

        console.log("-------------> allgemeine fehlerausgabe", err.message)

        log.logger( `ERROR: server.use() unknown error (last)`, req );
        res.status(500).json( 
            jsonRet.retObj( true, {}, { type:"unknown", msg:` unknown error` } ) 
        );   
});

