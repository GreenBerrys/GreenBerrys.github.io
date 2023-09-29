/********************************************************************************* 
 * Comment Controller
 */
import queryString from "node:querystring";
import commentModel from "../models/commentModel.js";
import recipeModel from "../models/recipeModel.js";
import userModel from "../models/userModel.js";

import jsonRet from "../utils/buildJSONret.js"; 
import log from "../utils/logger.js";
import isO from "../utils/isOwner.js";

// ------------------------------------------------------------------------------------------[ find() ]--
let lastRecipe = null, lastAuthor = null, lastText = "", pageSize = process.env.s_PAGESIZE, lastPageNo = 0;
let xCount = 0;
/*-------------------------------------------------------------------------------------------------------
 * Messages
 *-------------------------------------------------------------------------------------------------------
 */
const MODUL = "commentController.";

const             CREATE = 0,     GETBYID = 1,   FIND = 2,      UPDATE = 3,    DEL = 4;
const ERRTYPE = [ "CreateError", "SearchError", "SearchError", "UpdateError", "DeleteError"];

const MSGTAB = [ [//CREATE  Function       Message
                  /*  0 */ ["create: ",   " Comment '####' successfully created" ],
                  /*  1 */ ["create: ",   "[610]## Recipe and Author id required" ],  
                  /*  2 */ ["create: ",   "[611]## Recipe id '####' not found" ],  
                  /*  3 */ ["create: ",   "[612]## Auhthor id '####' not found" ],  
                  /*  4 */ ["create: ",   " ####"] 
                 ],[//GETBYID 
                  /*  0 */["getById: ",   "[620]## Comment id '####' not found"], 
                  /*  1 */["getById: ",   " ####"], 
                 ],[//FIND   
                  /*  0 */["find: ",      "[650]## Recipe id, author id or text required"], 
                  /*  1 */["find: ",      "[651]## No Comment '####' found"], 
                  /*  2 */["find: ",      " ####"], 
                 ],[//UPDATE
                  /*  0 */["update: ",    "Comment '####' successfully updated"],
                  /*  1 */["update: ",    "[660]## Comment id '####' not found"],
                  /*  2 */["update: ",    "[660]## Access denied to comment id ####"], 
                  /*  3 */["update: ",    " ####"], 
                ],[//DELETE
                  /*  0 */["del: ",       "Comment '####' successfully deleted"], 
                  /*  1 */["del: ",       "[670]## Comment id required"], 
                  /*  2 */["del: ",       "[671]## Comment id '####' not found"], 
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
 * create() - create new Comment
 */
async function create( req, res ) {

    if ( !req.body.recipeid || !req.body.authorid){

        log.logger( logMsgSet( CREATE, 1 ), req );
        return req.res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 1 ) } ) ); 
    }
    try{
        // ** Check if recipe exists
        if( !await recipeModel.getById( req.body.recipeid ) ){
            log.logger( logMsgSet( CREATE, 2, req.body.recipeid ), req );
            return req.res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 2, req.body.recipeid ) } ) ); 
    
        }
        // ** Check if author exists
        if( !await userModel.getById( req.body.authorid ) ){
            log.logger( logMsgSet( CREATE, 3, req.body.authorid ), req );
            return req.res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 3, req.body.authorid ) } ) ); 
    
        }
        // ** Create new comment
        const comment = await commentModel.create( {
        
            recipe: req.body.recipeid,
            author: req.body.authorid,
            written: Date.now(),
            text: req.body.text
        } );

        // ** Update Comments count  in recipe
        const count = await commentModel.commentCount( req.body.recipeid );

        recipeModel.update( req.body.recipeid, { comments: count } );

        log.logger( logMsgSet( CREATE, 0, comment._id ), req );
        res.status(200).json( jsonRet.retObj( false, { comment, count: count }, {} ) );
        return;
    }
    catch ( error ) { 

        log.logger( logMsgSet( CREATE, 4, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * get() - get comment by id 
 */
async function get( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    try {
        const comment = await commentModel.getById( req.body.commentid );

        if ( !comment ){

            log.logger( logMsgSet( GETBYID, 0, req.body.commentid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYID], msg: msgSet( GETBYID, 0, req.body.commentid ) } ) 
            );
            return;
        } 
        res.status(200).json( jsonRet.retObj( false, comment, {} ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYID, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * find() - find comments by recipe, author and/or text
 */
 async function find( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    if ( !req.body.recipeid && !req.body.authorid && !req.body.text){

        log.logger( logMsgSet( FIND, 0 ), req );
        return req.res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[FIND], msg: msgSet( FIND, 0 ) } ) ); 
    }
    try {
        // ** only count if parameter changed
        if( lastRecipe !== req.body.recipeid || lastAuthor !== req.body.authorid || 
            lastText !== req.body.text || pageSize !== req.body.pageSize ){

            if( req.body.pageSize )    
                pageSize = req.body.pageSize;

            lastRecipe = req.body.recipeid;
            lastAuthor = req.body.authorid;
            lastText = req.body.text;

            xCount = await commentModel.count( { recipe: lastRecipe, author: lastAuthor, 
                                                 text: lastText } );                
                
            lastPageNo = ( ( xCount - ( xCount % pageSize) ) / pageSize + 
                            ( ( xCount % pageSize ) > 0 ) ) -1;
        }
        // ** find page with comments -------------------------------------------------
        let page = parseInt(req.body.page || 0);
        if( page > lastPageNo )
            page = lastPageNo;

        let comments = [];    
        if( lastPageNo >= 0 && xCount > 0 ){
            comments = await commentModel.find( { recipe: lastRecipe, author: lastAuthor, text: lastText }, 
                                                  page, pageSize );
        }        
        res.status(200).json( jsonRet.retObj( false, comments, {}, page, lastPageNo, xCount ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( FIND, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * update() - update comment data by id    (only text)
 */
 async function update( req, res ) {

    try{

        let comment = await commentModel.getById(req.body.commentid);

        if ( !comment ){

            log.logger( logMsgSet( UPDATE, 1, req.body.commentid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 1, req.body.commentid ) } ) 
            );
            return;
        } 
        if( !isO.isOwner(req, comment.author) ){
            log.logger( logMsgSet( UPDATE, 2, req.body.commentid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 2, req.body.commentid ) } ) 
            );
            return;
        }

        comment = await commentModel.update( req.body.commentid, 
            {
                text: req.body.text
            } );
        
        log.logger( logMsgSet( UPDATE, 0, req.body.commentid ), req );
        res.status(200).json( jsonRet.retObj( false, comment, {} ) );
        return;
    }
    catch ( error ) { 
        
        log.logger( logMsgSet( UPDATE, 3, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * del() - delete comment by id 
 */
 async function del( req, res ) {

    if ( !req.body.commentid ){

        log.logger( logMsgSet( DEL, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 1 ) } ) ); 
    }
    try{
        const comment = await commentModel.del( req.body.commentid );
        if ( !comment ){
            log.logger( logMsgSet( DEL, 2, req.body.commentid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 2, req.body.commentid ) } ) 
            );
            return;
        }    
        res.status(200).json( jsonRet.retObj( false, comment, {} ) );
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
