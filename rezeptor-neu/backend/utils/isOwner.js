import jwt from "jsonwebtoken";
import log from "../utils/logger.js";
import jsonRet from "../utils/buildJSONret.js"; 


/********************************************************************************* 
 * isOwner() - check if user is record-owner
 */
const isOwner = ( req, userID ) => {

    return String(userID) === jwt.verify(req.headers['x-access-token'], process.env.s_SECRET2 )['user']; 
}
export default{

    isOwner,
}
