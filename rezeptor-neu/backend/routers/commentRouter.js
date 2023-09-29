import express from "express";
import comment from "../controllers/commentController.js"
import isL from "../middleware/isLoggedInM.js"

const router = express.Router();

/********************************************************************************* 
 * create new comment
 */ 
router.post( "/", isL.isLoggedInM, comment.create );
/********************************************************************************* 
 * find comments by recipe or author
 */ 
router.get( "/find", comment.find );   
/********************************************************************************* 
 * get comment by id 
 */ 
router.get( "/", comment.get );   
/********************************************************************************* 
 * patch comment data
 */ 
router.patch( "/", isL.isLoggedInM, comment.update );
/********************************************************************************* 
 * delete comment
 */ 
router.delete( "/", isL.isLoggedInM, comment.del );
/********************************************************************************* 
 * unknown path
 */
 router.use( "*", notFound );
 // -------------------------------------------------------------------------------
 async function notFound( req, res ){
     return res.status( 404 ).sendFile( 'urlNotFound.html' , { root: './default/' } );
 }
 
 export default router;
