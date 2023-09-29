/********************************************************************************* 
 * Category Controller
 */
import queryString from "node:querystring";
import ingredientModel from "../models/ingredientModel.js";
import recipeModel from "../models/recipeModel.js"
import jsonRet from "../utils/buildJSONret.js"; 
import log from "../utils/logger.js";


// ------------------------------------------------------------------------------------------[ find() ]--
let lastName = "", lastUnit = "", lastCategory = "", pageSize = process.env.s_PAGESIZE, lastPageNo = 0;
let xCount = 0;
/*-------------------------------------------------------------------------------------------------------
 * Messages
 *-------------------------------------------------------------------------------------------------------
 */
const MODUL = "ingredientController.";

const             CREATE = 0,    GET = 1,        GETBYID = 2,  GETBYNAME = 3, FIND = 4,      UPDATE = 5,    DEL = 6;
const ERRTYPE = [ "CreateError", "SearchError", "SearchError", "SearchError", "SearchError", "UpdateError", "DeleteError"];

const MSGTAB = [ [//CREATE  Function       Message
                  /*  0 */ ["create: ",   " Ingredient '####' found / successfully created" ],
                  /*  1 */ ["create: ",   " ####"] 
                 ],[//GET
                  /*  0 */ ["get: ",      "[510]## Ingredient id or Name required"],
                 ],[//GETBYID 
                  /*  0 */["getById: ",   "[520]## Ingredient id '####' not found"], 
                  /*  1 */["getById: ",   " ####"], 
                 ],[//GETBYNAME
                  /*  0 */["getByName: ", "[540]## Ingredient '####' not found"], 
                  /*  1 */["getByName: ", " ####"], 
                 ],[//FIND   
                  /*  0 */["find: ",      "[550]## Ingredient name, unit or category required"], 
                  /*  1 */["find: ",      "[551]## No ingredient '####' found"], 
                  /*  2 */["find: ",      " ####"], 
                 ],[//UPDATE
                  /*  0 */["update: ",    "Ingredient '####' successfully updated"],
                  /*  1 */["update: ",    "[560]## Ingredient id '####' not found"],
                  /*  2 */["update: ",    " ####"], 
                 ],[//DELETE
                  /*  0 */["del: ",       "Ingredient '####' successfully deleted"], 
                  /*  1 */["del: ",       "[570]## Ingredient id required"], 
                  /*  1 */["del: ",       "[571]## Ingredient id '####' not found"], 
                  /*  2 */["del: ",       "[572]## Ingredient id '####' is used and cannot be deleted"], 
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
 * create() - create new ingredient or get existing ingredient
 */
async function create( req, res ) {

    try{
        let ingredient = await ingredientModel.getByName( req.body.name, false );

        if( !ingredient ) {
            ingredient = await ingredientModel.create( {
            
                name: req.body.name             || "",
                unit: req.body.unit             || "",
                category: req.body.category     || ""
            
            } );
        }
        log.logger( logMsgSet( CREATE, 0, ingredient.name ), req );
        res.status(200).json( jsonRet.retObj( false, ingredient, {} ) );
        return;
    }
    catch ( error ) { 

        log.logger( logMsgSet( CREATE, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * get() - route to get ingredient by id or name 
 */
 async function get( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    if( req.body.ingredientid ){

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
 * getById() - get ingredient by id 
 */
async function getById( req, res ) {
    try {
        const ingredient = await ingredientModel.getById( req.body.ingredientid );

        if ( !ingredient ){

            log.logger( logMsgSet( GETBYID, 0, req.body.ingredientid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYID], msg: msgSet( GETBYID, 0, req.body.ingredientid ) } ) 
            );
            return;
        } 
        res.status(200).json( jsonRet.retObj( false, ingredient, {} ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYID, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * getByName() - get ingredient by name
 */
async function getByName( req, res ) {
    try {
        const ingredient = await ingredientModel.getByName( req.body.name );

        if ( !ingredient ){
        
            log.logger( logMsgSet( GETBYNAME, 0, req.body.name ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[GETBYNAME], msg: msgSet( GETBYNAME, 0, req.body.name ) } ) 
            );
            return;
        } 
        res.status(200).json( jsonRet.retObj( false, ingredient, {} ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( GETBYNAME, 1, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * find() - find ingredients by name, unit and/or category
 */
 async function find( req, res ) {

    req.url.includes('?') ? req.body =  queryString.parse(req.url.substring(req.url.indexOf('?')+1)) : req.body={};

    if ( !req.body.name && !req.body.unit && !req.body.category){

        log.logger( logMsgSet( FIND, 0 ), req );
        return req.res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[FIND], msg: msgSet( FIND, 0 ) } ) ); 
    }
    try {
        // ** only count if parameter changed
        if( lastName !== req.body.name || lastUnit !== req.body.unit || 
            lastCategory !== req.body.category || pageSize !== req.body.pageSize ){

            if( req.body.pageSize )    
                pageSize = req.body.pageSize;

            lastName = req.body.name;
            lastUnit = req.body.unit;
            lastCategory = req.body.category;

            xCount = await ingredientModel.count( { name: lastName, unit: lastUnit, 
                                                    category: lastCategory } );                
                
            lastPageNo = ( ( xCount - ( xCount % pageSize) ) / pageSize + 
                            ( ( xCount % pageSize ) > 0 ) ) -1;
        }
        // ** find page with ingredients -------------------------------------------------
        let page = parseInt(req.body.page || 0);
        if( page > lastPageNo )
            page = lastPageNo;

        let ingredients = [];    
        if( lastPageNo >= 0 && xCount > 0 ){
            ingredients = await ingredientModel.find( { name: lastName, unit: lastUnit, category: lastCategory }, 
                                            page, pageSize );
        }        
        res.status(200).json( jsonRet.retObj( false, ingredients, {}, page, lastPageNo, xCount ) );
        return;
    } 
    catch ( error ) { 

        log.logger( logMsgSet( FIND, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * update() - update ingredient data by id
 */
 async function update( req, res ) {

    try{
        const ingredient = await ingredientModel.update( req.body.ingredientid, 
            {
                name: req.body.name,
                unit: req.body.unit,
                category: req.body.category
            } );
        
        if ( !ingredient ){

            log.logger( logMsgSet( UPDATE, 1, req.body.ingredientid ), req );
            res.status(404).json( 
                jsonRet.retObj( true, {}, { type: ERRTYPE[UPDATE], msg: msgSet( UPDATE, 1, req.body.ingredientid ) } ) 
            );
            return;
        } 
        log.logger( logMsgSet( UPDATE, 0, req.body.name ), req );
        res.status(200).json( jsonRet.retObj( false, ingredient, {} ) );
        return;
    }
    catch ( error ) { 
        
        log.logger( logMsgSet( UPDATE, 2, error.message ), req );
        res.status( 400 ).json( jsonRet.retObj( true, {}, { error } ) ); 
        return;
    }
}
/********************************************************************************* 
 * del() - delete ingredient by id 
 */
 async function del( req, res ) {

    if ( !req.body.ingredientid ){

        log.logger( logMsgSet( DEL, 1 ), req );
        return res.status( 400 ).json( 
            jsonRet.retObj( true, {}, { type: ERRTYPE[DEL], msg: msgSet( DEL, 1 ) } ) ); 
    }

    backDel ( req.body.ingredientid );

    res.status(200).json( jsonRet.retObj( false, {}, {} ) );
    return;
}
/********************************************************************************* 
 * backDel() - delete ingredient by id as background process
 */
 async function backDel ( ingredientid, req ){

    try{    
        // ** Check if ingredient is in use
        if ( await recipeModel.checkRef( { ingredient: ingredientid } ) ){
            log.logger( logMsgSet( DEL, 3, ingredientid ), req );
            return; 
        }
        // ** no - delete ingredient
        const ingredient = await ingredientModel.del( ingredientid );
        if ( !ingredient ){
            log.logger( logMsgSet( DEL, 2, ingredientid ), req );
        }    
        else{    
            log.logger( logMsgSet( DEL, 0, ingredient.name ), req );
        }    
        return;
    }
    catch( error) {

        log.logger( logMsgSet( DEL, 4, error.message ), req );
        return;
    };
}

export default {

    create,
    get,
    find,
    update,
    del,
}
/********************************************************************************* 
 * sleep() - stop working for n seconds - only for testing  
 */
/*
async function  sleep(delay){
    console.log('');
    for (let i = 1; i <= delay; i++) {
      
        process.stdout.write("sleep: " + i + '\r');
        await new Promise( ( resolve ) => { setTimeout( resolve, 1000 ) } );
    }
    console.log('');
}
*/
