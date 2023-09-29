/********************************************************************************* 
 * User Controller
 */
import queryString from "node:querystring";
import nodemailer from "nodemailer";
import fs from "fs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import recipeModel from "../models/recipeModel.js";
import jsonRet from "../utils/buildJSONret.js"; 
import log from "../utils/logger.js";
import jail from "../utils/jail.js";
import isO from "../utils/isOwner.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";


dotenv.config( { path: "./server.env" } );

//const SERVERURL = ${}
const ENCRYPT = `${process.env.s_PWENCRYPT}` === 'true' ? true : false;

// ------------------------------------------------------------------------------------------[ find() ]--
let lastName = "", lastEmail = "", lastDescription = "", pageSize = process.env.s_PAGESIZE, lastPageNo = 0;
let xCount = 0;
/*-------------------------------------------------------------------------------------------------------
 * Messages
 *-------------------------------------------------------------------------------------------------------
 */
const MODUL = "userController.";

const             CREATE = 0,    GET = 1,        GETBYID = 2,  GETBYEMAIL = 3, GETBYNAME = 4, FIND = 5,     UPDATE = 6,    DEL = 7;
const ERRTYPE = [ "CreateError", "SearchError", "SearchError", "SearchError", "SearchError", "SearchError", "UpdateError", "DeleteError",
                  "LoginError", "LogoutError", "MailError", "ActivationError", "getPicture", "setPicture",  "ChangePassword" ];
const              LOGIN = 8,    LOGOUT = 9,   SENDMAIL = 10, ACTIVATE = 11,    GETPIC = 12,  SETPIC = 13,  PWCHANGE = 14;


const MSGTAB = [ [//CREATE  Function       Message
                  /*  0 */ ["create: ",   "User (name:'####' email:'####') successfully created" ],
                  /*  1 */ ["create: ",   "[100]## Email Address '####' already exists" ], 
                  /*  2 */ ["create: ",   "[101]## Name, Email Address and password required" ], 
                  /*  3 */ ["create: ",   " ####"] 
                 ],[//GET
                  /*  0 */ ["get: ",      "[110]## Userid, Email or Name required"],
                 ],[//GETBYID 
                  /*  0 */["getById: ",   "[111]## Userid '####' not found"], 
                  /*  1 */["getById: ",   " ####"] 
                 ],[//GETBYEMAIL 
                  /*  0 */["getByEmail: ","[112]## Email address '####' not found"], 
                  /*  1 */["getByEmail: "," ####"] 
                 ],[//GETBYNAME
                  /*  0 */["getByName: ", "[113]## Name '####' not found"], 
                  /*  1 */["getByName: ", " ####"] 
                 ],[//FIND   
                  /*  0 */["find: ",      "[120]## Name, email or description required"], 
                  /*  1 */["find: ",      "[121]## No users with #### found"], 
                  /*  2 */["find: ",      " ####"] 
                 ],[//UPDATE
                  /*  0 */["update: ",    " User (id: '####' name:'####' email:'####') successfully updated (name: '####' email: '####' description: '####'"],
                  /*  1 */["update: ",    "[130]## Userid required"],
                  /*  2 */["update: ",    "[131]## Userid '####' not found"],
                  /*  3 */["update: ",    "[132]## Access denied to User id '####'"], 
                  /*  4 */["update: ",    " ####"] 
                 ],[//DEL
                  /*  0 */["del: ",       "User (name: '####' id:'####') successfully deleted"], 
                  /*  1 */["del: ",       "[140]## Userid required"], 
                  /*  2 */["del: ",       "[141]## User id '####' not found"], 
                  /*  3 */["del: ",       "[142]## User id '####' is used and cannot be deleted"], 
                  /*  4 */["del: ",       " #### "] 
                 ],[//LOGIN
                  /*  0 */["login: ",     "User ('####' email:'####') successfully logged in"], 
                  /*  1 */["login: ",     "[150]## email and password required"], 
                  /*  2 */["login: ",     "[151]## already logged in"], 
                  /*  3 */["login: ",     "[152]## Too many attempts - user temporarily blocked"], 
                  /*  4 */["login: ",     "[153]## wrong email or password"], 
                  /*  5 */["login: ",     "[154]## User '####' email address '####' not verified"], 
                  /*  6 */["login: ",     " #### "]
                 ],[//LOGOUT
                  /*  0 */["logout: ",    "User ('####' email:'####') successfully logged out"], 
                  /*  1 */["logout: ",    "[155]## not logged in"],
                  /*  2 */["logout: ",    " #### "]
                 ],[//SENDMAIL
                 /*  0 */["sendMail: ",   "User ('####' email:'####') mail successfully sent"], 
                 /*  1 */["sendMail: ",   "[160]## user id required"],
                 /*  2 */["sendMail: ",   "[161]## user id '####' not found"],
                 /*  3 */["sendMail: ",   "[162]## user '####' id '####' useraccount already activated ####"],
                 /*  4 */["sendMail: ",   "[163]## user '####' id '####' mail already sent ####"],
                 /*  5 */["sendMail: ",   " #### "]
                 ],[//ACTIVATE
                 /*  0 */["activate: ",   "User ('####' email:'####') account successfully activated ####"], 
                 /*  1 */["activate: ",   "[170]## missing user id "],
                 /*  2 */["activate: ",   "[171]## user id '####' not found"],
                 /*  3 */["activate: ",   "[172]## user id '####' already activated ####"],
                 /*  4 */["activate: ",   "[173]## user id '####' activation without mail"],
                 /*  5 */["activate: ",   " #### "]
                ],[//GETPIC
                 /*  0 */["getpic: ",     "[180]## User picture '####' not found"],
                 /*  1 */["getpic: ",     "[181]## no userid - sending default picture"],
                 /*  2 */["getpic: ",     " #### "]
                ],[//SETPIC
                 /*  0 */["setpic: ",     "User id '####' picture successfully updated"],
                 /*  1 */["setpic: ",     "[185]## User id required"],
                 /*  2 */["setpic: ",     "[186]## User id '####' not found"],
                 /*  3 */["setpic: ",     "[187]## missing picture"],
                 /*  4 */["setpic: ",     "[188]## Picture exceeds maximum file size (#### MB)"],
                 /*  5 */["setpic: ",     "[189]## Access denied to User id '####'"],
                 /*  6 */["setpic: ",     " #### "]
                ],[//PWCHANGE
                /*  0 */["pwChange: ",    "User id '####' password successfully changed"],
                /*  1 */["pwChange: ",    "[190]## User id, email, old password and new password required"],
                /*  2 */["pwChange: ",    "[191]## User id '####' not found"],
                /*  3 */["pwChange: ",    "[192]## email or old password wrong"],
                /*  4 */["pwChange: ",    "[193]## minimum length for password 8 characters"],
                /*  5 */["pwChange: ",    " #### "]
            ]
]
//** Build Logger-Message 
const logMsgSet = ( funcNo, msgNo, ...args ) => {

    let msg = MSGTAB[funcNo][msgNo][1];
    for ( let arg of args ){ 
        msg = msg.replace( '####', arg );
    }    
    return MODUL + MSGTAB[funcNo][msgNo][0] + msg;    
}
//** Build User-Message 
const msgSet = ( funcNo, msgNo, ...args ) => {

    let msg = MSGTAB[funcNo][msgNo][1];
    for ( let arg of args ){ 
        msg = msg.replace( '####', arg );
    }    
    return msg;    
}
// ** Password ------------------------------------------------------------------
const pwEncrypt = async ( password ) => await bcrypt.hash( password, 5 );
const pwCompare = async ( password, hash) => await bcrypt.compare(password, hash);

/*-------------------------------------------------------------------------------------------------------
 * DATABASE FUNCTIONS
 *-------------------------------------------------------------------------------------------------------
 */
  /********************************************************************************* 
 * create() - create new user
 */
async function create( req, res ) {

    if ( !req.body.name || !req.body.email || !req.body.password ){

        log.logger( logMsgSet( CREATE, 2 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 2 ) } ) ); 
    }
    try{
        let password = req.body.password;
        if( ENCRYPT ) {
            password = await pwEncrypt( req.body.password );
        }
        const user = await userModel.create({

    		name: req.body.name,
            description: req.body.description,
    		email: req.body.email,
    		password: password, 
            picTime: '.' + Date.now(),
            picture: { contentType: "image/png", data: fs.readFileSync( './default/userDefault.png' ) }
        });
        log.logger( logMsgSet( CREATE, 0, user.name, user.email ), req );
        res.status(201).json( jsonRet.retObj( false, await userModel.getById(user._id), {} ) );
        return;
    }
    catch ( error ) { 

        if (error.code === 11000 ){ 
            log.logger( logMsgSet( CREATE, 1, req.body.email ), req );
            res.status( 409 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 1, req.body.email ) } ) 
            ); 
        }
        else{
            log.logger( logMsgSet( CREATE, 3, error.message ), req );
            res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        }
        return;
    }
}
/********************************************************************************* 
 * get() - route to get user by id, email or name 
 */
async function get( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    if( req.body.userid ){

        await getById( req, res );

    } else if ( req.body.email ){

            await getByEmail( req, res );

    } else if ( req.body.name ){

                await getByName( req, res );

    } else{

        log.logger( logMsgSet( GET, 0 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[GET], msg: msgSet( GET, 0 ) } ) 
        ); 
    }
    return;        
}
/********************************************************************************* 
 * getById() - get user by id 
 */
async function getById( req, res ) {
    try {
        const user = await userModel.getById( req.body.userid );

        if ( !user ){

            log.logger( logMsgSet( GETBYID, 0, req.body.userid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYID], msg: msgSet( GETBYID, 0, req.body.userid ) } ) 
            );
            return;
        } 
        res.status(200).json( jsonRet.retObj( false, user, {} ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYID, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * getByEmail() - get user by mailaddress 
 */
async function getByEmail( req, res ) {
    try {
        const user = await userModel.getByEmail( req.body.email );

        if ( !user ){
        
            log.logger( logMsgSet( GETBYEMAIL, 0, req.body.email ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYEMAIL], msg: msgSet( GETBYEMAIL, 0, req.body.email ) } ) 
            );
            return;
        } 
        else{
            res.status(200).json( jsonRet.retObj( false, user, {} ) );
            return;
        }  
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYEMAIL, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * getByName() - get user by name
 */
async function getByName( req, res ) {
    try {
        const user = await userModel.getByName( req.body.name );

        if ( !user ){
        
            log.logger( logMsgSet( GETBYNAME, 0, req.body.name ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYNAME], msg: msgSet( GETBYNAME, 0, req.body.name ) } ) 
            );
            return;
        } 
        else{
            res.status(200).json( jsonRet.retObj( false, user, {} ) );
            return;
        }  
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYNAME, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * find() - find users by Name, Email and/or description (case insensitiv) 
 */
 async function find( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};
    
    if ( !req.body.name && !req.body.email && !req.body.description ){

        log.logger( logMsgSet( FIND, 0 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[FIND], msg: msgSet( FIND, 0 ) } ) ); 
    }
    try {
        // ** only count if parameter changed
        if( lastName !== req.body.name || lastEmail !== req.body.email || 
            lastDescription !== req.body.description || pageSize !== req.body.pageSize ){

            if( req.body.pageSize )    
                pageSize = req.body.pageSize;

            xCount = await userModel.count( { name: req.body.name, email: req.body.email, 
                                              description: req.body.description } );                
            lastName = req.body.name;
            lastEmail = req.body.email;
            lastDescription = req.body.description;
                
            lastPageNo = ( ( xCount - ( xCount % pageSize) ) / pageSize + 
                            ( ( xCount % pageSize ) > 0 ) ) -1;
        }
        // ** find page with users -------------------------------------------------
        let page = parseInt(req.body.page || 0);
        if( page > lastPageNo )
            page = lastPageNo;

        let users = [];    
        if( lastPageNo >= 0 && xCount > 0 ){
            users = await userModel.find( { name: lastName, email: lastEmail, description: lastDescription }, 
                                            page, pageSize );
        }        
        res.status(200).json( jsonRet.retObj( false, users, {}, page, lastPageNo, xCount ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( FIND, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * update() - update user data by id
 */
 async function update( req, res ) {

    if( !req.body.userid ){

        log.logger( logMsgSet( UPDATE, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 1 ) } ) 
        ); 
    }
    try{
        const oldUser = await userModel.getById( req.body.userid )
        
        if ( !oldUser ){

            log.logger( logMsgSet( UPDATE, 2, req.body.userid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 2, req.body.userid ) } ) 
            );
            return;
        } 

        if ( !isO.isOwner( req, req.body.userid ) ){

            log.logger( logMsgSet( UPDATE, 3, req.body.userid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 3, req.body.userid ) } ) 
            );
            return;
        } 

        const user = await userModel.update( req.body.userid, {
            
            name: req.body.name,
            description: req.body.description,
            email: req.body.email
        });
        
        log.logger( logMsgSet( UPDATE, 0, req.body.userid, oldUser.name, oldUser.email, user.name, user.email, user.description ), req );
        res.status(200).json( jsonRet.retObj( false, user, {} ) );
        return;
    }
    catch ( error ) { 
        
        log.logger( logMsgSet( UPDATE, 4, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * del() - delete user by id 
 */
 async function del( req, res ) {

    if( !req.body.userid ){

        log.logger( logMsgSet( DEL, 1 ), req );
        return res.status( 400 ).json( 
        jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 1 ) } ) ); 
    }
    
    backDel ( req.body.userid );

    res.status(200).json( jsonRet.retObj( false, {}, {} ) );
    return;
}
/********************************************************************************* 
 * backDel() - delete user by id as background process
 */
 async function backDel ( userid, req ){

    try{    
        // ** Check if user is in use
        if ( await recipeModel.checkRef( { author: userid } ) ){
            log.logger( logMsgSet( DEL, 3, userid ), req );
            return; 
        }
        // ** no - delete user
        const user = await userModel.del( userid );
        if ( !user ){
            log.logger( logMsgSet( DEL, 2, userid ), req );
        }    
        else{    
            log.logger( logMsgSet( DEL, 0, user.name, userid ), req );
        }    
        return;
    }
    catch( error) {

        log.logger( logMsgSet( DEL, 4, error.message ), req );
        return;
    };
}

/********************************************************************************* 
 * logout() - user logout 
 */
 async function logout( req, res ) {

    if( !req.session.userid ){
        log.logger( logMsgSet( LOGOUT, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[LOGOUT], msg: msgSet( LOGOUT, 1 ) } ) 
        ); 
    }
    try{
        const user = await userModel.getById( req.session.userid );

        req.session.destroy();
        log.logger( logMsgSet( LOGOUT, 0, user.name, user.email ), req );
        res.status(200).json( jsonRet.retObj( false, {}, {} ) );
        return; 
    }
    catch( error ){
        log.logger( logMsgSet( LOGOUT, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
 }
/********************************************************************************* 
 * checkAttempts() - count user login attempts 
 */
const checkAttempts = ( req ) => {

    // ** Check if more then 3 attempts
    if ( req.session.attempt ) {
        req.session.attempt++;
        if( req.session.attempt > 3 ){

            jail.lockUp( req );
            return true;
        }
    }    
    else{
        req.session.attempt = 1;
    }
    return false;
}
/********************************************************************************* 
 * login() - user login 
 */
 async function login( req, res ) {

    // ** Check if already logged in
    if( req.session.userid ){
        log.logger( logMsgSet( LOGIN, 2 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 2 ) } ) 
        ); 
    }
    // ** Check if user is in jail
    if( jail.isInJail( req  ) ){
        log.logger( logMsgSet( LOGIN, 3 ), req );
        return res.status( 400 ).json( 
               jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 3 ) } ) 
        ); 
    }
    // ** Check if email & password in body
    if( !req.body.email || !req.body.password ){

        log.logger( logMsgSet( LOGIN, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 1 ) } ) 
        ); 
    }
    try{
        const user = await userModel.getByEmail( req.body.email, true );
        // ** Check email address 
        if ( !user ){

            // ** Check if more then 3 attempts
            if ( checkAttempts( req ) ) {
                log.logger( logMsgSet( LOGIN, 3 ), req );
                return res.status( 400 ).json( 
                       jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 3 ) } ) 
                ); 
            }    
            log.logger( logMsgSet( LOGIN, 4 ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 4 ) } ) 
            ); 
        }
        // ** check password
        if ( ( !ENCRYPT && user.password !== req.body.password ) || ( ENCRYPT && !await pwCompare( req.body.password, user.password ) ) ){

            // ** Check if more then 3 attempts
            if ( checkAttempts( req, res ) ) {
                log.logger( logMsgSet( LOGIN, 3 ), req );
                return res.status( 400 ).json( 
                        jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 3 ) } ) 
                ); 
            }    
            log.logger( logMsgSet( LOGIN, 4 ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 4 ) } ) 
            ); 
        }
        // ** check if email address is verified
        if ( user.verified === null ){

            log.logger( logMsgSet( LOGIN, 5, user.name, user.email ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[LOGIN], msg: msgSet( LOGIN, 5, user.name, user.email ) } ) 
            ); 
        }
        // ** OK - login..
        req.session.userid = user._id;
        const lastVisit = user.lastLogin;
        userModel.setLastLogin( user._id );
        userModel.setLastIp( user._id, req );

        // ** create JWT-Token  
        const token = jwt.sign(
            { user: user._id, email: user.email, log: Date.now() },
              process.env.s_SECRET2, 
            {
              algorithm: "HS256", 
              expiresIn: "8h",
            }
          );
        log.logger( logMsgSet( LOGIN, 0, user.name, user.email ), req );
        res.status(200).json( jsonRet.retObj( false, { token: token, _id: user._id, name: user.name, lastLogin: lastVisit }, {} ) );
        return; 
    }
    catch( error ){
        log.logger( logMsgSet( LOGIN, 6, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;

    }
 }
/********************************************************************************* 
 * sendMail() - send activation mail to user
 */
async function sendActivationMail( req, res ){

    // ** get providerdata from server.env
    const mailAccount = {

        host: `${process.env.s_mail_host}`,
        port: parseInt(process.env.s_mail_port),
        secure: `${process.env.s_mail_secure}` === 'true' ? true : false,
        auth: {
            user: `${process.env.s_mail_user}`,
            pass: `${process.env.s_mail_passw}`
        }
    }
    // ** Check if userid, subject, mailText & mailHtml is in body
    if( !req.body.userid ){

        log.logger( logMsgSet( SENDMAIL, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[SENDMAIL], msg: msgSet( SENDMAIL, 1 ) } ) 
        ); 
    }
    try{
        const user = await userModel.getById( req.body.userid, true );
        // ** Check if user exist
        if( !user ){

            log.logger( logMsgSet( SENDMAIL, 2, req.body.userid ), req );
            return res.status( 400 ).json( 
                    jsonRet.retObj( true, {}, { type: ERRTYPE[SENDMAIL], msg: msgSet( SENDMAIL, 2, req.body.userid ) } ) 
            ); 
        }
        // ** Check if user is already activated
        if( user.verified ){
            log.logger( logMsgSet( SENDMAIL, 3, user.name, user._id, user.verified.toLocaleString() ), req );
            return res.status( 400 ).json( 
                    jsonRet.retObj( true, {}, { type: ERRTYPE[SENDMAIL], msg: msgSet( SENDMAIL, 3, user.name, user._id, user.verified.toLocaleString() ) } ) 
            ); 
        }
        // ** Check if email is already sent
        if( user.lastLogin && !req.body.RESENDMAIL ){
            log.logger( logMsgSet( SENDMAIL, 4, user.name, user._id, user.lastLogin.toLocaleString() ), req );
            return res.status( 400 ).json( 
                    jsonRet.retObj( true, {}, { type: ERRTYPE[SENDMAIL], msg: msgSet( SENDMAIL, 4, user.name, user._id, user.lastLogin.toLocaleString() ) } ) 
            ); 
        }
        // ** send mail
        const actLink = `${process.env.s_URL}`.includes('localhost') ? process.env.s_URL + ':' + process.env.s_PORT : process.env.s_URL;
        const textMail = fs.readFileSync( './default/activationTextMail.txt' ).toString()
                           .replaceAll( '#USER#', user.name )
                           .replaceAll( '#APP#', process.env.s_APPNAME )
                           .replaceAll( '#SERVER#', process.env.s_SERVER )
                           .replaceAll( '#LINK#', actLink + `/user/activate/${user._id}` );

        const htmlMail = fs.readFileSync( './default/activationHtmlMail.html' ).toString()
                           .replaceAll( '#USER#', user.name )
                           .replaceAll( '#APP#', process.env.s_APPNAME )
                           .replaceAll( '#SERVER#', process.env.s_SERVER )
                           .replaceAll( '#LINK#', actLink + `/user/activate/${user._id}` );

        const transporter = nodemailer.createTransport( mailAccount );
        let info = await transporter.sendMail( {

            from: `${process.env.s_sender}`,
            to: `${user.name} <${user.email}>`,
            subject: req.body.subject || `Activate your ${process.env.s_APPNAME}-account on ${process.env.s_SERVER}`,
            text: req.body.mailTxt  || textMail,
            html: req.body.mailHtml || htmlMail,  
            attachments: [{
                filename: 'logo.png',
                path: './default/logo.png', 
                cid: 'logoimg' 
               }]
        } ); 

        userModel.setLastLogin( user._id );
        log.logger( logMsgSet( SENDMAIL, 0, user.name, user.email ), req );

        if( mailAccount.host === 'smtp.ethereal.email'){

            res.status(200).json( jsonRet.retObj( false, {
                
                messageId: info.messageId, 
                result: info.response,
                preview: nodemailer.getTestMessageUrl( info )  
            }, {} ) );
        }
        else{
            res.status(200).json( jsonRet.retObj( false, {
                
                info: info.messageId,
                result: info.response
            }, {} ) );
        }
        return;
    }
    catch( error ){
        log.logger( logMsgSet( SENDMAIL, 5, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * activate() - Useraccount activation
 */
 async function activate( req, res ){

    // ** Check userid
    if( req.params['0'] === '' ){
        log.logger( logMsgSet( ACTIVATE, 1 ), req );
        return res.status( 400 ).json( "" );
    }
    try{    
        const user = await userModel.getById( req.params[0], true );
        // ** Check if user exist
        if( !user ){

            log.logger( logMsgSet( ACTIVATE, 2, req.params[0] ), req );
            return res.status( 400 ).json( "" );
        }
        // ** Check if user already activated
        if( user.verified ){

            log.logger( logMsgSet( ACTIVATE, 3, user._id, user.verified.toLocaleString() ), req );
            return res.status( 400 ).json( "" );
        }
        // ** Check if email sent
        if( !user.lastLogin ){

            log.logger( logMsgSet( ACTIVATE, 4, user._id ), req );
            return res.status( 400 ).json( "" );
        }
        // ** Ok - activate account
        const appLink = `${process.env.s_URL}`.includes('localhost') ? process.env.s_URL + ':' + process.env.s_PORT : process.env.s_URL;
        const welcome = fs.readFileSync( './default/activationWelcome.html' ).toString()
                           .replaceAll( '#USER#', user.name )
                           .replaceAll( '#APP#', process.env.s_APPNAME )
                           .replaceAll( '#SERVER#', process.env.s_SERVER )
                           .replaceAll( '#LINK#', appLink );


        userModel.setVerified( user._id );
        log.logger( logMsgSet( ACTIVATE, 0, user.name, user.email, ( new Date() ).toLocaleString() ), req );
        return res.status( 200 ).send( welcome );
}
    catch( error ){

        log.logger( logMsgSet( ACTIVATE, 5, error.message ), req );
        res.status( 500 ).json( "" ); 
        return;
    }
}
/********************************************************************************* 
 * setPic() - upload Userimage 
 */
 async function setPic( req, res ){

    console.log("setPic() userid",req.body.userid,"\n",req.params[0],req.body.ptime);


    // ** Check userid
    if( !req.body.userid ){
        log.logger( logMsgSet( SETPIC, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 1 ) } ) 
        ); 
    }
    // ** Check if file attachment
    if ( !req.files || Object.keys( req.files ).length === 0 || !req.files.picture) {
        log.logger( logMsgSet( SETPIC, 3 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 3 ) } ) 
        ); 
    }    
    try{    

        // ** Check if user is himself
        if( !isO.isOwner( req, req.body.userid ) ){

            log.logger( logMsgSet( SETPIC, 5, req.body.userid ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 5, req.body.userid ) } ) 
            ); 
        }

        let user = await userModel.getById( req.body.userid, true );
        // ** Check if user exist
        if( !user ){

            log.logger( logMsgSet( SETPIC, 2, req.body.userid ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 2, req.body.userid ) } ) 
            ); 
        }
        user.picture.data = req.files.picture.data;
        user.picture.contentType = req.files.picture.mimetype;
        if( req.body.ptime )
           user.picTime = req.body.ptime;
        else   
           user.picTime = "." + Date.now(); 

        // ** Check if image too big
        if ( req.body.uploadBreak ) {
            log.logger( logMsgSet( SETPIC, 4, process.env.s_PICMAXSIZE ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 4, process.env.s_PICMAXSIZE ) } ) 
            ); 
        }    
        user = await userModel.update( user._id, user );
        log.logger( logMsgSet( SETPIC, 0, req.body.userid ), req );
        res.status(200).json( jsonRet.retObj( false, await userModel.getById( user._id ) , {} ) );
        return;
    }
    catch( error ){

        log.logger( logMsgSet( SETPIC, 6, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}    
/********************************************************************************* 
 * getPic() - Userimage holen
 */
 async function getPic( req, res ){

    // ** send default picture if is no userid
    if( !req.params[0] || req.params[0] === '' ){
        log.logger( logMsgSet( GETPIC, 1 ), req );
        return res.status( 200 ).header( "Content-Type", "image/png" ).sendFile( 'userDefault.png', { root: './default/' } );
    }
    //-------------------------------------------------------
    let userid = req.params[0];
    if( userid.includes('.') ){
        userid = userid.substring(0, userid.lastIndexOf('.'));
    }
    //-------------------------------------------------------

    try{    
        const user = await userModel.getById( userid, true );
        // ** Check if user exist
        if( !user ){

            log.logger( logMsgSet( GETPIC, 0, req.params[0] ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETPIC], msg: msgSet( GETPIC, 0, req.params[0] ) } ) 
            );

        }
        res.status( 200 ).header( "Content-Type", user.picture.contentType ).send( user.picture.data );
        return;
    }
    catch( error ){

        log.logger( logMsgSet( GETPIC, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}    
/********************************************************************************* 
 * pwChange() - change password
 */
 async function pwChange( req, res ) {

    // ** check parameter
    if( !req.body.userid || !req.body.email || !req.body.oldPassword || !req.body.newPassword ){

        log.logger( logMsgSet( PWCHANGE, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[PWCHANGE], msg: msgSet( PWCHANGE, 1 ) } ) 
        ); 
    }
    try{
        let user = await userModel.getById( req.body.userid, true );
        
        // ** get user
        if ( !user ){

            log.logger( logMsgSet( PWCHANGE, 2, req.body.userid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[PWCHANGE], msg: msgSet( PWCHANGE, 2, req.body.userid ) } ) 
            );
            return;
        } 
        // ** check email 
        if( req.body.email !== user.email ){

            log.logger( logMsgSet( PWCHANGE, 3 ), req );
            res.status(400).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[PWCHANGE], msg: msgSet( PWCHANGE, 3 ) } ) 
            );
            return;
        }
        // ** check password length
        if( req.body.newPassword.length < 8 ){

            log.logger( logMsgSet( PWCHANGE, 4 ), req );
            res.status(400).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[PWCHANGE], msg: msgSet( PWCHANGE, 4 ) } ) 
            );
            return;
        }
        // ** check old password
        if ( ( !ENCRYPT && user.password !== req.body.oldPassword ) || ( ENCRYPT && !await pwCompare( req.body.oldPassword, user.password ) ) ){

            log.logger( logMsgSet( PWCHANGE, 3 ), req );
            res.status(400).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[PWCHANGE], msg: msgSet( PWCHANGE, 3 ) } ) 
            );
            return;
        }
        // ** update password
        user.password = req.body.newPassword;
        if( ENCRYPT ) {
            user.password = await pwEncrypt( req.body.newPassword );
        }
        user = await userModel.update( user._id, user );
        log.logger( logMsgSet( PWCHANGE, 0, user._id ), req );
        res.status(200).json( jsonRet.retObj( false, user, {} ) );
        return;
    }
    catch ( error ) { 
        
        log.logger( logMsgSet( UPDATE, 5, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}

 export default {

    create,
    get,
    find,
    update,
    del,
    login,
    logout,
    sendActivationMail,
    activate,
    getPic,
    setPic,
    pwChange
}
