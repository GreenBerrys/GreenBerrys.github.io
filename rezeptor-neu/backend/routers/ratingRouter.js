import express from "express";
import rating from "../controllers/ratingController.js"
import isL from "../middleware/isLoggedInM.js"

const router = express.Router();

/********************************************************************************* 
 * create new rating
 */ 
router.post( "/", isL.isLoggedInM, rating.create );
/********************************************************************************* 
 * find rating by recipe or author
 */ 
router.get( "/find", rating.find );   
/********************************************************************************* 
 * get rating by id 
 */ 
router.get( "/", rating.get );   
/********************************************************************************* 
 * patch rating data
 */ 
router.patch( "/", isL.isLoggedInM, rating.update );
/********************************************************************************* 
 * delete rating
 */ 
router.delete( "/", isL.isLoggedInM, rating.del );
/********************************************************************************* 
 * unknown path
 */
 router.use( "*", notFound );
 // -------------------------------------------------------------------------------
 async function notFound( req, res ){
     return res.status( 404 ).sendFile( 'urlNotFound.html' , { root: './default/' } );
 }
 
 export default router;
