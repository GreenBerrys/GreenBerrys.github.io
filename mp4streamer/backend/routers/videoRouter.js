import express from "express";
import video from "../controllers/videoController.js"
import m from "../middleware/isLoggedInM.js"

const router = express.Router();

const ARGS = process.argv;
const DLM = ARGS[1][1] !== ':' ? '/' : '\\';
const BUILDDIR = ARGS[1][1] !== ':' ? '/' + ARGS[1].substring( 1, ARGS[1].lastIndexOf( `${DLM}backend` ) ) + `${DLM}frontend${DLM}build` :
                                           ARGS[1].substring( 2, ARGS[1].lastIndexOf( `${DLM}backend` ) )  + `${DLM}frontend${DLM}build`;


/********************************************************************************* 
 * get pictures
 */ 
router.get( "/poster/*", m.isLoggedIn, video.getPoster );
router.get( "/fanart/*", m.isLoggedIn, video.getFanart);
router.get( "/ethumb/:recno/:epino", m.isLoggedIn, video.getEpisodeThumb);

/********************************************************************************* 
 * get episodes
 */ 
router.get( "/episodes/*", m.isLoggedIn, video.getEpisodes);

/********************************************************************************* 
 * get directors
 */ 
router.get( "/directors/", m.isLoggedIn, video.getDirectors);

/********************************************************************************* 
 * get actors
 */ 
router.get( "/actors/", m.isLoggedIn, video.getActors);

/********************************************************************************* 
 * get genres
 */ 
router.get( "/genres/", m.isLoggedIn, video.getGenres);

/********************************************************************************* 
 * get tags
 */ 
router.get( "/tags/", m.isLoggedIn, video.getTags);

/********************************************************************************* 
 * stream video
 */ 
router.get( "/stream/:recno/:epino", m.isLoggedIn, video.getStream);
router.get( "/stream/:recno", m.isLoggedIn, video.getStream);

/********************************************************************************* 
 * find movies
 */ 
router.get( "/find/", m.isLoggedIn, video.find );   
router.get( "/find/*", m.isLoggedIn, video.find ); 

/********************************************************************************* 
 * get movie
 */ 
router.get ( "/", m.isLoggedIn, video.getOne);

router.get( "/*", (req, res) =>{

    res.sendFile( 'index.html', {root: BUILDDIR } )
    return;
} );

export default router;
