import jwt from "jsonwebtoken";
import log from "../utils/logger.js";
import is from "../utils/isLoggedIn.js";
import jsonRet from "../utils/buildJSONret.js"; 


/********************************************************************************* 
 * isLoggedInM() - check if user logged in
 */
 const isLoggedInM = ( req, res, next ) => {

    try{

        //console.log("req.session.userid",req.session.userid);
        //console.log("req.headers['x-access-token']",req.headers['x-access-token']);

        if( !req.session.userid || !req.headers['x-access-token'] ||
            req.session.userid !== jwt.verify(req.headers['x-access-token'], process.env.s_SECRET2 )['user'] ){

                log.logger( `ERROR: isLoggedInM(id:"${req.session.userid}") access denied`, req );
                res.status(403).json( 
                    jsonRet.retObj( true, {}, { type:"AccessError", msg:` access denied` } ) 
                );    
                return;
        }

        log.logger( `isLoggedInM(id:"${req.session.userid}") access ok`, req );
        next();
    }   
    catch( error ){
        log.logger( `ERROR: isLoggedInM(id:"${req.session.userid}") access denied : ${error.message}`, req );
        res.status(403).json( 
            jsonRet.retObj( true, {}, { type:"AccessError", msg:` access denied` } ) 
        );    
        return;
    }
}
export default{

    isLoggedInM,
}
