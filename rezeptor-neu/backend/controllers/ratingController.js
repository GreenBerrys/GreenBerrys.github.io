/********************************************************************************* 
 * Rating Controller
 */
import queryString from "node:querystring";
import ratingModel from "../models/ratingModel.js";
import recipeModel from "../models/recipeModel.js";
import jsonRet from "../utils/buildJSONret.js"; 
import log from "../utils/logger.js";


// ------------------------------------------------------------------------------------------[ find() ]--
let lastRecipe = null, lastUser = null, pageSize = process.env.s_PAGESIZE, lastPageNo = 0;
let xCount = 0;
/*-------------------------------------------------------------------------------------------------------
 * Messages
 *-------------------------------------------------------------------------------------------------------
 */
const MODUL = "ratingController.";

const             CREATE = 0,     GETBYID = 1,   FIND = 2,      UPDATE = 3,    DEL = 4;
const ERRTYPE = [ "CreateError", "SearchError", "SearchError", "UpdateError", "DeleteError"];

const MSGTAB = [ [//CREATE  Function       Message
                  /*  0 */ ["create: ",   " Rating '####' successfully created" ],
                  /*  1 */ ["create: ",   "[710]## Recipe id, User id and rating required" ],  
                  /*  2 */ ["create: ",   "[711]## Recipe id '####' not found" ],  
                  /*  3 */ ["create: ",   "[712]## User id '####' not found" ], 
                  /*  4 */ ["create: ",   "[713]## User has already submitted a rating" ], 
                  /*  5 */ ["create: ",   "[714]## Don't rate your own recipe" ], 
                  /*  6 */ ["create: ",   " ####"] 
                 ],[//GETBYID 
                  /*  0 */["getById: ",   "[720]## Rating id '####' not found"], 
                  /*  1 */["getById: ",   " ####"], 
                 ],[//FIND   
                  /*  0 */["find: ",      "[750]## Recipe id and/or, user id required"], 
                  /*  1 */["find: ",      "[751]## No Rating '####' found"], 
                  /*  2 */["find: ",      " ####"], 
                 ],[//UPDATE
                  /*  0 */["update: ",    "Rating '####' successfully updated"],
                  /*  1 */["update: ",    "[760]## Rating id '####' not found"],
                  /*  2 */["update: ",    " ####"], 
                 ],[//DELETE
                  /*  0 */["del: ",       "Rating '####' successfully deleted"], 
                  /*  1 */["del: ",       "[770]## Rating id required"], 
                  /*  2 */["del: ",       "[771]## Rating id '####' not found"], 
                  /*  3 */["del: ",       " #### "], 
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
/*-------------------------------------------------------------------------------------------------------
 * DATABASE FUNCTIONS
 *-------------------------------------------------------------------------------------------------------
 */
/********************************************************************************* 
 * create() - create new rating
 */
async function create( req, res ) {

    if ( !req.body.recipeid || !req.body.userid || !req.body.rate){

        log.logger( logMsgSet( CREATE, 1 ), req );
        return req.res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 1 ) } ) ); 
    }
    try{
        // ** Check if recipe exists & get authorid
        const recipe = await recipeModel.getById( req.body.recipeid );
        if( !recipe ){
            log.logger( logMsgSet( CREATE, 2, req.body.recipeid ), req );
            return req.res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 2, req.body.recipeid ) } ) ); 
        }

        // ** Check if user is author
        if( req.session.userid && ( req.session.userid ==  recipe.author._id ) ){

            log.logger( logMsgSet( CREATE, 5 ), req );
            return req.res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 5 ) } ) ); 
        }   

        // ** Create new rating
        const rating = await ratingModel.create( {
        
            recipeid: req.body.recipeid,
            userid: req.body.userid,
            rate: req.body.rate
        } );
        // ** Update average rating in recipe
        const average = await ratingModel.average( req.body.recipeid );
       
        recipeModel.update( req.body.recipeid, { ratings: average } );

        log.logger( logMsgSet( CREATE, 0, rating._id ), req );
        res.status(200).json( jsonRet.retObj( false, { rating, avg: average }, {} ) );
        return;
    }
    catch ( error ) { 

        if (error.code === 11000 ){ 
            log.logger( logMsgSet( CREATE, 4, req.body.userid ), req );
            res.status( 409 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 4, req.body.userid ) } ) 
            ); 
        }
        else{
            log.logger( logMsgSet( CREATE, 6, error.message ), req );
            res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        }
        return;
    }
}
/********************************************************************************* 
 * get() - get rating by id 
 */
async function get( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    try {
        const rating = await ratingModel.getById( req.body.ratingid );

        if ( !rating ){

            log.logger( logMsgSet( GETBYID, 0, req.body.ratingid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYID], msg: msgSet( GETBYID, 0, req.body.ratingid ) } ) 
            );
            return;
        } 
        res.status(200).json( jsonRet.retObj( false, rating, {} ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYID, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * find() - find ratings by recipe and/or user
 */
 async function find( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    if ( !req.body.recipeid && !req.body.useridid ){

        log.logger( logMsgSet( FIND, 0 ), req );
        return req.res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[FIND], msg: msgSet( FIND, 0 ) } ) ); 
    }
    try {
        // ** only count if parameter changed
        if( lastRecipe !== req.body.recipeid || lastUser !== req.body.userid || 
            pageSize !== req.body.pageSize ){

            if( req.body.pageSize )    
                pageSize = req.body.pageSize;

            lastRecipe = req.body.recipeid;
            lastUser = req.body.userid;

            xCount = await ratingModel.count( { recipeid: lastRecipe, userid: lastUser } );                
                
            lastPageNo = ( ( xCount - ( xCount % pageSize) ) / pageSize + 
                            ( ( xCount % pageSize ) > 0 ) ) -1;
        }
        // ** find page with ratings -------------------------------------------------
        let page = req.body.page || 0;
        if( page > lastPageNo )
            page = lastPageNo;

        let ratings = [];    
        if( lastPageNo >= 0 && xCount > 0 ){
            ratings = await ratingModel.find( { recipeid: lastRecipe, userid: lastUser, page, pageSize } );
        }        
        res.status(200).json( jsonRet.retObj( false, ratings, {}, page, lastPageNo, xCount ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( FIND, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * update() - update rating data by id    (only text & Date)
 */
 async function update( req, res ) {

    try{
        const rating = await ratingModel.update( req.body.ratingid, 
            {
                text: req.body.rate
            } );
        
        if ( !rating ){

            log.logger( logMsgSet( UPDATE, 1, req.body.ratingid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 1, req.body.ratingid ) } ) 
            );
            return;
        } 
        log.logger( logMsgSet( UPDATE, 0, req.body.ratingid ), req );
        res.status(200).json( jsonRet.retObj( false, rating, {} ) );
        return;
    }
    catch ( error ) { 
        
        log.logger( logMsgSet( UPDATE, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * del() - delete rating by id 
 */
 async function del( req, res ) {

    if ( !req.body.ratingid ){

        log.logger( logMsgSet( DEL, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 1 ) } ) ); 
    }
    try{
        const rating = await ratingModel.del( req.body.ratingid );
        if ( !rating ){
            log.logger( logMsgSet( DEL, 2, req.body.ratingid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 2, req.body.ratingid ) } ) 
            );
            return;
        }    
        res.status(200).json( jsonRet.retObj( false, rating, {} ) );
        return;
    }
    catch ( error ){
        log.logger( logMsgSet( DEL, 3, error.message ), req );
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
}
