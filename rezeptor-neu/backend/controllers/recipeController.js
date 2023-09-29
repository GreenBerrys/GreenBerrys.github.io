/********************************************************************************* 
 * Ricipe Controller
 */
import queryString from "node:querystring";
import recipeModel from "../models/recipeModel.js";
import userModel from "../models/userModel.js";
import ingredientModel from "../models/ingredientModel.js";
import commentModel from "../models/commentModel.js";
import ratingModel from "../models/ratingModel.js";
import jsonRet from "../utils/buildJSONret.js"; 
import log from "../utils/logger.js";
import isO from "../utils/isOwner.js";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config( { path: "./server.env" } );

// ------------------------------------------------------------------------------------------[ find() ]--
let lastName = "", lastAuthor = null, lastDescription = "";
let lastInstruktion = "", lastKeyword = "", lastIngredient = null;
let pageSize = process.env.s_PAGESIZE, lastPageNo = 0;
let xCount = 0;

/*-------------------------------------------------------------------------------------------------------
 * Messages
 *-------------------------------------------------------------------------------------------------------
 */
const MODUL = "recipeController.";

const             CREATE = 0,    GET = 1,        GETBYID = 2,  GETBYNAME = 3, FIND = 4,      UPDATE = 5,    DEL = 6;
const ERRTYPE = [ "CreateError", "SearchError", "SearchError", "SearchError", "SearchError", "UpdateError", "DeleteError",
                  "getPicture", "setPicture" ];
const             GETPIC = 7,   SETPIC = 8;                  

const MSGTAB = [ [//CREATE  Function       Message
                  /*  0 */ ["create: ",   " Recipe '####' successfully created" ],
                  /*  1 */ ["create: ",   "[200]## Recipe '####' already exists" ], 
                  /*  2 */ ["create: ",   "[201]## Author id '####' not found" ], 
                  /*  3 */ ["create: ",   "[202]## Country id '####' not found" ], 
                  /*  4 */ ["create: ",   "[203]## Category id '####' not found" ], 
                  /*  5 */ ["create: ",   "[204]## Ingredient id '####' not found" ], 
                  /*  6 */ ["create: ",   " ####"] 
                 ],[//GET
                  /*  0 */ ["get: ",      "[210]## Recipe id or Name required"],
                 ],[//GETBYID 
                  /*  0 */["getById: ",   "[220]## Recipe id '####' not found"], 
                  /*  1 */["getById: ",   " ####"] 
                 ],[//GETBYNAME
                  /*  0 */["getByName: ", "[240]## Recipe '####' not found"], 
                  /*  1 */["getByName: ", " ####"]
                 ],[//FIND   
                  /*  0 */["find: ",      "[250]## name, author, country, category, description, instruktion, keyword or ingredient required"], 
                  /*  1 */["find: ",      "[251]## No recipes with #### found"], 
                  /*  2 */["find: ",      " ####"]
                 ],[//UPDATE
                  /*  0 */["update: ",    "Recipe '####' successfully updated"],
                  /*  1 */["update: ",    "[260]## Recipe id required"],
                  /*  2 */["update: ",    "[261]## Recipe id '####' not found"],
                  /*  3 */["update: ",    "[262]## Access denied to Recipe id ####"], 
                  /*  4 */["update: ",    " ####"] 
                 ],[//DELETE
                  /*  0 */["del: ",       "Recipe '####' successfully deleted"], 
                  /*  1 */["del: ",       "[270]## Recipe id required"], 
                  /*  2 */["del: ",       "[271]## Recipe id '####' not found"], 
                  /*  3 */["del: ",       "[272]## Access denied to Recipe id ####"],
                  /*  4 */["del: ",       " #### "]
                ],[//GETPIC
                 /*  0 */["getpic: ",      "[290]## Recipe picture '####' not found"],
                 /*  1 */["getpic: ",      "[291]## no recipeid - sending default picture"],
                 /*  2 */["getpic: ",      " #### "]
                 ],[//SETPIC
                 /*  0 */["setpic: ",      "Recipe id '####' picture successfully updated"],
                 /*  1 */["setpic: ",      "[295]## Recipe id required"],
                 /*  2 */["setpic: ",      "[296]## Recipe id '####' not found"],
                 /*  3 */["setpic: ",      "[297]## missing picture"],
                 /*  4 */["setpic: ",      "[298]## Picture exceeds maximum file size (#### MB)"],
                 /*  5 */["setpic: ",      "[299]## Access denied to Recipe id ####"],
                 /*  6 */["setpic: ",      " #### "]
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
 * create() - create new recipe
 */
async function create( req, res ) {

    try{
        // ** Check author
        if( req.body.authorid ){
            if( !await userModel.getById( req.body.authorid ) ) {
                log.logger( logMsgSet( CREATE, 2, req.body.authorid ), req );
                res.status( 400 ).json( 
                    jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 2, req.body.authorid ) } ) 
                ); 
                return;    
            }
        }
        // ** Check country
        if( req.body.countryid ){
            if( !await countryModel.getById( req.body.countryid ) ) {
                log.logger( logMsgSet( CREATE, 3, req.body.countryid ), req );
                res.status( 400 ).json( 
                    jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 3, req.body.countryid ) } ) 
                ); 
                return;    
            }
        }
        // ** Check category
        if( req.body.categoryid ){
            if( !await categoryModel.getById( req.body.categoryid ) ) {
                log.logger( logMsgSet( CREATE, 4, req.body.categoryid ), req );
                res.status( 400 ).json( 
                    jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 4, req.body.categoryid ) } ) 
                ); 
                return;    
            }
        }
        // ** Check ingredients
        if( req.body.ingredients ){
            /*
            // --------------------- ONLY FOR TESTING WITH POSTMAN
            let test = [];
            for(let item of req.body.ingredients)
                test.push(JSON.parse(item))            
            //console.log("test=",test);
            req.body.ingredients = test;
            // --------------------- ONLY FOR TESTING WITH POSTMAN
            */
            for(let ingredient of req.body.ingredients ){
                if( !await ingredientModel.getById( ingredient.ingRef ) ) {
                    log.logger( logMsgSet( CREATE, 5, ingredient.ingRef ), req );
                    res.status( 400 ).json( 
                        jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 5, ingredient.ingRef ) } ) 
                    ); 
                    return;    
                }
            }
        }
        const recipe = await recipeModel.create({

    		name: req.body.name                 || "",
    		author: req.body.authorid             || null,
            description: req.body.description   || "",
            instruction: req.body.instruction   || "",
            keywords: req.body.keywords         || "",
            portions: req.body.portions         || 1,       
            time: req.body.time                 || {prepare: 0, cook: 0},
            ingredients: req.body.ingredients   || [],
            ratings: { users: 0, avdRate: 0 },
            picTime: '.' + Date.now(),
            picture: { contentType: "image/png", data: fs.readFileSync( './default/recipeDefault.png' ) }
        });
        log.logger( logMsgSet( CREATE, 0, recipe.name ), req );
        res.status(201).json( jsonRet.retObj( false, await recipeModel.getById(recipe._id), {} ) );
        return;
    }
    catch ( error ) { 

        if (error.code === 11000 ){ 
            log.logger( logMsgSet( CREATE, 1, req.body.name ), req );
            res.status( 409 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[CREATE], msg: msgSet( CREATE, 1, req.body.name ) } ) 
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
 * get() - route to get recipe by id or name     ******* ACHTUNG!!!!!!!!!!!!!!!!
 */
 async function get( req, res ) {

    //console.log("controller get", req.url)

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};
    
    if( req.body.recipeid ){

        await getById( req, res );

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
 * getById() - get recipe by id 
 */
async function getById( req, res ) {
    try {
        const recipe = await recipeModel.getById( req.body.recipeid );

        if ( !recipe ){

            log.logger( logMsgSet( GETBYID, 0, req.body.recipeid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYID], msg: msgSet( GETBYID, 0, req.body.recipeid ) } ) 
            );
            return;
        } 
        res.status(200).json( jsonRet.retObj( false, recipe, {} ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYID, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * getByName() - get recipe by name
 */
async function getByName( req, res ) {
    try {
        const recipe = await recipeModel.getByName( req.body.name );

        if ( !recipe ){
        
            log.logger( logMsgSet( GETBYNAME, 0, req.body.name ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYNAME], msg: msgSet( GETBYNAME, 0, req.body.name ) } ) 
            );
            return;
        } 
        else{
            res.status(200).json( jsonRet.retObj( false, recipe, {} ) );
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
 * find() - find recipes by name, author, country, category, ingredient and/or description
 */
 async function find( req, res ) {

    //console.log("controller find", req.url)

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    if ( !req.body.name && !req.body.authorid && 
         !req.body.description && !req.body.instruktion && !req.body.keyword && !req.body.ingredient  ){

        log.logger( logMsgSet( FIND, 0 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[FIND], msg: msgSet( FIND, 0 ) } ) ); 
    }
    try {
        // ** only count if parameter changed
        if( lastName !== req.body.name || lastAuthor != req.body.authorid || 
            lastDescription !== req.body.description || lastInstruktion !== req.body.instruction ||
            lastKeyword !== req.body.keyword || lastIngredient !== req.body.ingredient || pageSize != req.body.pageSize ){

            if( req.body.pageSize )    
                pageSize = req.body.pageSize;

            lastName = req.body.name;
            lastAuthor = req.body.authorid;
            lastDescription = req.body.description;
            lastInstruktion = req.body.instruction;
            lastKeyword = req.body.keyword;
            lastIngredient = req.body.ingredient;
    
            xCount = await recipeModel.count( { 
                    
                    name: lastName, author: lastAuthor, 
                    description: lastDescription, instruktion: lastInstruktion, keyword: lastKeyword, 
                    ingredient: lastIngredient
            } ); 
            
            lastPageNo = ( ( xCount - ( xCount % pageSize) ) / pageSize + 
            ( ( xCount % pageSize ) > 0 ) ) -1;
        }
        // ** find page with recipes -------------------------------------------------
        let page = parseInt(req.body.page || 0);
        if( page > lastPageNo )
            page = lastPageNo;

        let recipes = [];    
        if( lastPageNo >= 0 && xCount > 0){
            recipes = await recipeModel.find( { 
                
                name: lastName, author: lastAuthor, 
                description: lastDescription, instruktion: lastInstruktion, keyword: lastKeyword, 
                ingredient: lastIngredient
            }, page, pageSize );
        }        
        res.status(200).json( jsonRet.retObj( false, recipes, {}, page, lastPageNo, xCount ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( FIND, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * update() - update recipe data by id
 */
 async function update( req, res ) {

    if( !req.body.recipeid ){

        log.logger( logMsgSet( UPDATE, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 1 ) } ) 
        ); 
    }
    try{
        if( !isO.isOwner(req, req.body.authorid) ){  
            log.logger( logMsgSet( UPDATE, 3, req.body.recipeid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 3, req.body.recipeid ) } ) 
            );
            return;
        }

        const recipe = await recipeModel.update( req.body.recipeid, {
            
    		name: req.body.name,
    		author: req.body.authorid,
            description: req.body.description,
            portions: req.body.portions,       
            instruction: req.body.instruction,
            time: req.body.time,
            keywords: req.body.keywords,
            ingredients: req.body.ingredients,
        });
        
        if ( !recipe ){

            log.logger( logMsgSet( UPDATE, 2, req.body.recipeid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 2, req.body.recipeid ) } ) 
            );
            return;
        } 
        log.logger( logMsgSet( UPDATE, 0, req.body.name ), req );
        res.status(200).json( jsonRet.retObj( false, recipe, {} ) );
        return;
    }
    catch ( error ) { 
        
        log.logger( logMsgSet( UPDATE, 4, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * del() - delete recipe by id 
 */
 async function del( req, res ) {

    if( !req.body.recipeid ){

        log.logger( logMsgSet( DEL, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 1 ) } ) 
        ); 
    }
try{

    let recipe = await recipeModel.getById( req.body.recipeid );

    if ( !recipe ){
    
        log.logger( logMsgSet( DEL, 2, req.body.recipeid ), req );
        res.status(404).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 2, req.body.recipeid ) } ) 
        );
        return;
    } 

    if( !isO.isOwner( req, recipe.author._id ) ){

        log.logger( logMsgSet( DEL, 3 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 3 ) } ) 
        ); 
    }

    recipe = await recipeModel.update( req.body.recipeid, {
        
        deleted: true
    });

    backDel ( req.body.recipeid );
    log.logger( logMsgSet( DEL, 0, req.body.recipeid ), req );
    res.status(200).json( jsonRet.retObj( false, {}, {} ) );
    return;
    }
catch( error) {

        log.logger( logMsgSet( DEL, 4, error.message ), req );
        return;
    };
}
/********************************************************************************* 
 * backDel() - delete country by id as background process
 */
 async function backDel ( recipeid, req ){

    try{    
        
        const ratings = await ratingModel.delRecipeRatings(recipeid);
        log.logger( logMsgSet( DEL, 4, `Recipe '${recipeid}' ratings deleted : ${ratings.deletedCount}`), req);

        const comments = await commentModel.delRecipeComments(recipeid);
        log.logger( logMsgSet( DEL, 4, `Recipe '${recipeid}' comments deleted: ${comments.deletedCount}`), req);

        const recipe = await recipeModel.del( recipeid );
        log.logger( logMsgSet( DEL, 0, recipeid ), req );
        return;
    }
    catch( error) {

        log.logger( logMsgSet( DEL, 4, error.message ), req );
        return;
    };
}
/********************************************************************************* 
 * setPic() - upload recipeimage 
 */
 async function setPic( req, res ){

    // ** Check recipeid
    if( !req.body.recipeid ){
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
        let recipe = await recipeModel.getById( req.body.recipeid, true );
        // ** Check if recipe exist
        if( !recipe ){

            log.logger( logMsgSet( SETPIC, 2, req.body.recipeid ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 2, req.body.recipeid ) } ) 
            ); 
        }

        // ** check if user is recipe author
        if( !isO.isOwner( req, recipe.author._id ) ){

            log.logger( logMsgSet( SETPIC, 5, req.body.recipeid ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 5, req.body.recipeid ) } ) 
            ); 
        }

        recipe.picture.data = req.files.picture.data;
        recipe.picture.contentType = req.files.picture.mimetype;
        if( req.body.ptime )
           recipe.picTime = req.body.ptime;
        else   
           recipe.picTime = "." + Date.now(); 

        // ** Check if image too big
        if ( req.body.uploadBreak ) {
            log.logger( logMsgSet( SETPIC, 4, process.env.s_PICMAXSIZE ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[SETPIC], msg: msgSet( SETPIC, 4, process.env.s_PICMAXSIZE ) } ) 
            ); 
        }    
        recipe = await recipeModel.update( recipe._id, recipe );
        log.logger( logMsgSet( SETPIC, 0, req.body.recipeid ), req );
        res.status(200).json( jsonRet.retObj( false, await recipeModel.getById( recipe._id ), {} ) );
        return;
    }
    catch( error ){

        log.logger( logMsgSet( SETPIC, 6, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}    
/********************************************************************************* 
 * getPic() - Recipeimage holen
 */
 async function getPic( req, res ){

    // ** send default picture if is no userid
    if( !req.params[0] || req.params[0] === '' ){
        log.logger( logMsgSet( GETPIC, 1 ), req );
        return res.status( 200 ).header( "Content-Type", "image/png" ).sendFile( 'recipeDefault.png', { root: './default/' } );
    }
    //-------------------------------------------------------
    let picid = req.params[0];
    if( picid.includes('.') ){
        picid = picid.substring(0, picid.lastIndexOf('.'));
    }
    //-------------------------------------------------------

    try{    
        const recipe = await recipeModel.getById( picid, true );
        // ** Check if recipe exist
        if( !recipe ){

            log.logger( logMsgSet( GETPIC, 0, req.params[0] ), req );
            return res.status( 400 ).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETPIC], msg: msgSet( GETPIC, 0, req.params[0] ) } ) 
            );
        }
        res.status( 200 ).header( "Content-Type", recipe.picture.contentType ).send( recipe.picture.data );
        return;
    }
    catch( error ){

        log.logger( logMsgSet( GETPIC, 2, error.message ), req );
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
    setPic,
    getPic
}
