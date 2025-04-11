import express from "express";
import video from "../controllers/videoController.js"
import m from "../middleware/isLoggedInM.js"

const router = express.Router();

const ARGS = process.argv;
const DLM = ARGS[1][1] !== ':' ? '/' : '\\';
const BUILDDIR = ARGS[1][1] !== ':' ? '/' + ARGS[1].substring( 1, ARGS[1].lastIndexOf( `${DLM}backend` ) ) + `${DLM}frontend${DLM}build` :
                                           ARGS[1].substring( 2, ARGS[1].lastIndexOf( `${DLM}backend` ) )  + `${DLM}frontend${DLM}build`;
/********************************************************************************* 
 * get/write pictures
 */ 
router.get( "/poster/:recno", video.getPoster );
router.post( "/poster/:recno", m.isLoggedIn, video.setPoster );
router.get( "/fanart/:recno", m.isLoggedIn, video.getFanart);
router.post( "/fanart/:recno", m.isLoggedIn, video.setFanart);
router.get( "/ethumb/:recno/:epino", m.isLoggedIn, video.getEpisodeThumb);
router.post( "/ethumb/:recno/:epino", m.isLoggedIn, video.setEpisodeThumb);

/********************************************************************************* 
 * get/write episodes
 */ 
router.get( "/episodes/:recno", m.isLoggedIn, video.getEpisodes);
router.post( "/episode/:recno/:epino", m.isLoggedIn, video.setEpisode);

/********************************************************************************* 
 * get/write lock
 */ 
router.get ( "/lock/:recno", m.isLoggedIn, video.getLock );
router.post ( "/lock/:recno", m.isLoggedIn, video.setLock );

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
 * get news
 */ 
router.get( "/news/", video.getNews);

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
 * put movie
 */ 
router.post( "/detail/:recno", m.isLoggedIn, video.putOne);

/********************************************************************************* 
 * get movie
 */ 
router.get( "/detail/:recno", video.getOne);

router.get( "/*", (req, res) =>{

    res.sendFile( 'index.html', {root: BUILDDIR } )
    return;
} );


export default router;
