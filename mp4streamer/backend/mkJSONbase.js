"use strict";
/*******************************************************************************************************
 * mkJSONbase.js - JSON-Datei aus MP4-Bestand als "Datenbank" erzeugen
 */
import fs, { writeFileSync } from 'fs';
import xml2js, { parseString } from 'xml2js';
import dotenv from "dotenv";
import readline from 'readline';
import Lnk from "@recent-cli/resolve-lnk";
import { entityTrans } from "./utils/transCode.js";
// import { title } from 'process';

dotenv.config( { path: "./server.env" } );

const SAVEDRVLETTER = `${process.env.s_SAVEDRVLETTER}`.toLowerCase() === 'true' ? true : false;
 
const rl = readline.createInterface( { input: process.stdin, output: process.stdout } );
const ARGS = process.argv;
const DLM = ARGS[1][1] !== ':' ? '/' : '\\';
const MP4ROOT = ARGS[1][1] !== ':' ? '/' + ARGS[ 1 ].substring( 1, ARGS[ 1 ].lastIndexOf( DLM ) ) + '/public' :
                                           ARGS[ 1 ].substring( 2, ARGS[ 1 ].lastIndexOf( DLM ) ) + '/public';

// --------------------------------------------------------------------------------
const input = ( prompt ) => {
    return new Promise( ( resolve, reject ) => {
        rl.question( prompt, ( input ) => resolve( input ) );
    } );
}
// --------------------------------------------------------------------------------
const tableSort = ( table, actors=null ) => {
    for( const section of table){

        section.items = section.items.sort(
    
            (a,b) => {
                
                if( actors === null ){

                    const str1 = a.toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");
                    const str2 = b.toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");
                    if( str1 < str2 )
                        return -1;
                    if( str1 > str2 )
                        return 1;
                    return 0;
                }
                else{
                    const str1 = a[0].toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");
                    const str2 = b[0].toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");
                    if( str1 < str2 )
                        return -1;
                    if( str1 > str2 )
                        return 1;
                    return 0;
                }    
            });
    }
    
    return table.sort(
    
        (a,b) => {
    
            const str1 = a.section.toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");
            const str2 = b.section.toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");
            
            if( str1 < str2 )
                return -1;
            if( str1 > str2 )
                return 1;
            return 0;
        });
}
// --------------------------------------------------------------------------------
const transGen = ( genArray ) => {

    let str = "";

    for ( const el of genArray ){ 
        str = str + el.trim() + ", ";
    }    
    str = str.substring( 0, str.length-2 );

    return ( str.replaceAll('Fantasy', 'Fantasie')
                .replaceAll('Documentary', 'Dokumentation')
                .replaceAll('Mini-Series', 'Mini-Serie')
                .replaceAll('Sci-Fi', 'Science Fiction')
                .replaceAll('War', 'Krieg')
                .replaceAll('Dokumentarfilm', 'Dokumentation')
                .replaceAll('Music', 'Musik')
                .replaceAll('History', 'Geschichte')
                .replaceAll('Historie', 'Geschichte')
                .replaceAll('Romance', 'Liebesfilm')
                .replaceAll('Crime', 'Krimi')
                .replaceAll('Politics', 'Politik')
                .replaceAll('Adventure', 'Abenteuer')
                .replaceAll('Documentary', 'Dokumentation')
                .replaceAll('Documentation', 'Dokumentation')
                .replaceAll(' &amp;', ',')
    );
}
// =====================================================================================================

/*
if( !fs.existsSync( MP4ROOT ) )
    help(`Quellverzeichnis "${MP4ROOT}" nicht gefunden!`);

const ok = await input(`\nVerzeichnis "${MP4ROOT}" wird eingelesen.\n` +
    '\nAktion ausführen (j/n) ? ' 
   );
if( ok !== 'j'){
console.log("Vorgang abgebrochen..");
process.exit(0);
}
*/
let movies=[];

const tags = [];
const genres = [];
const directors = [];
const actors = [];

console.log(`\nLese "${MP4ROOT}"..`); 

movies = await scanTree( MP4ROOT, movies );

console.log("\n");
//----------------------------------------------------------------
// 
if( !movies.length ){
    console.log( '   Keine Filme im Verzeichnis public gefunden!\n   Bitte zuerst das Verzeichnis mit den Filmen dorthin verlinken/verknüpfen..\n');
    process.exit(-1);  
  }
// ==========================================================
// Sort alphab.
movies.sort((a,b) => {

    const str1 = a.title.toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");
    const str2 = b.title.toUpperCase().replaceAll("Ö","OE").replaceAll("Ü","UE").replaceAll("Ä","AE").replaceAll("À","A");

    if( str1 < str2 ) return -1;
    if( str1 > str2 ) return 1;
    return 0;  
});

for(let i = 0; i < movies.length; i++)
    movies[i].recno = i;

//----------------------------------------------------------------
// write tables

const indexCount = ( indexTab ) => indexTab.reduce( ( entries, section ) => entries + section.items.length, 0 );
const numForm = ( num ) => " ".repeat( 8 - String( num ).length ) + num;

await writeJSON("./Database/movies.json", movies);
console.log(`${ numForm( movies.length ) } Filme/Serien gefunden. Datei "Database/movies.json erstellt`);
await writeJSON( "./Database/genres.json", tableSort( genres ) );
console.log(`${ numForm( indexCount( genres) ) } Genre gefunden. Datei "Database/genres.json erstellt`);
await writeJSON( "./Database/tags.json", tableSort( tags ) );
console.log(`${ numForm( indexCount( tags ) ) } Tags gefunden. Datei "Database/tags.json erstellt`);
await writeJSON( "./Database/directors.json", tableSort( directors ) );
console.log(`${ numForm( indexCount( directors ) ) } Regisseure/innen gefunden. Datei "Database/directors.json erstellt`);
await writeJSON( "./Database/actors.json", tableSort( actors, 1 ) );
console.log(`${ numForm( indexCount( actors ) ) } Darsteller/innen gefunden. Datei "Database/actors.json erstellt\n`);

// ==========================================================
// Create News-Table
const newsTab =[];

const dateVal = ( dnum ) => ( new Date( dnum.getFullYear(), dnum.getMonth(), dnum.getDate(), dnum.getHours(), dnum.getMinutes() ) ).getTime();

movies.sort((a,b) => b.mtimeMs - a.mtimeMs );
for( let i = 0, pageSize = process.env.s_PAGESIZE; i < movies.length && newsTab.length < pageSize; i++){

    newsTab.push( { btimeMs: dateVal ( new Date( movies[ i ].btimeMs ) ), 
                    mtimeMs: dateVal( new Date( movies[ i ].mtimeMs ) ), 
                    recno: movies[ i ].recno, 
                    posterStamp: movies[ i ].posterStamp,
                    fanartStamp: movies[ i ].fanartStamp,
                    title: movies[ i ].title } );
}
await writeJSON("./Database/news.json", newsTab);

process.exit(0);

/****************************************************************************
 * scan directories
 */
async function scanTree( path, movies ){

    const msg = `scanning ${ path.length > 45 ? '...' + path.substring( path.length - 42 ) : path }`
    process.stdout.write( ' '.repeat( 55 - msg.length ) + msg + '\r' );

    try{
        const fileList = fs.readdirSync( path );

        for (const file of fileList) {
            
            let name = `${path}/${file}`;

            // Handle win junctions
            if( ARGS[1][1] === ':' && name.toUpperCase().endsWith( ".LNK" ) ){

                if( !SAVEDRVLETTER )
                    name = ARGS[1][0] + ( await Lnk.resolve( name ) ).substring(1);
                else
                    name = ( await Lnk.resolve( name ) );
            }

            if (fs.statSync(name).isDirectory()) {

                movies = await getMovies( name+'/', movies );
                await scanTree(name, movies);
            }    
        }    
        return movies;
    }
    catch( err ){
        console.log( "error", err.message );
    }
}

/****************************************************************************
 * change name parts
 */
function chngName( parts ) {
    
    const name = String(parts).trim().split(" ");

    if( name.length >  1 ){
        return name[ name.length-1 ] + " " + name.slice( 0, name.length -1).join(" "); 
    }
    else{
        return name[0];
    }
}
/****************************************************************************
 * Push Table-Item
 */
 function pushItem( table, item, thumb=null ){

    if( item.length ){

        let sect = item[ 0 ].toUpperCase();
        let isx = table.findIndex( ( element ) => element.section === sect )

        if( isx === -1 ){
            table.push( { section: sect, items: [] } );
            isx = table.length -1; 
        }
        let itx =-1;
        if( thumb === null ){
            itx = table[ isx ].items.findIndex( ( element ) => element.toUpperCase() === item.toUpperCase() );
            if( itx === -1 )
                table[ isx ].items.push( item )
        }
        else{
            itx = table[ isx ].items.findIndex( ( element ) => element[0] === item );
            if( itx === -1 ){
                table[ isx ].items.push( [ item, thumb ] );
            }    
            else if( table[ isx ].items[ itx ][ 1 ] === "" ){
                table[ isx ].items[ itx ][ 1 ] = thumb;
            }    
        }
    }
}
/****************************************************************************
 * scan directory
 */
async function getMovies(dir, movies) {

    try{
        const fileList = fs.readdirSync(dir);

        const movieFiles = fileList.filter(mfile => mfile.toLowerCase().endsWith('.mp4'));
        let movie = {};

        if( dir [1] !== ':'){
            movie = { path: dir.substring( MP4ROOT.length+1, dir.length-1 ) };
        }
        else{
            if( !SAVEDRVLETTER && ARGS[1][1] === ':' )
                movie = { path: dir.substring( 2, dir.length-1 ) };
            else    
                movie = { path: dir.substring( 0, dir.length-1 ) };
        }
       
        // check for mp4-files

        if( movieFiles.length ){

            movie.lock = false;
            movie.lockKey = "";

            // Poster & fanart timestamp ( because the silly Firefox cache strategy !!.. 

            movie.posterStamp = Date.now();
            movie.fanartStamp = Date.now();

            // set video timestamp -------------------------------------
                
            const dstat = fs.statSync( dir );
            movie.btimeMs = dstat.birthtimeMs;
            movie.mtimeMs = dstat.mtimeMs;

            // check for single movies ---------------------------------------
            if( !fs.existsSync( dir + 'tvshow.nfo' ) ){

                for( const mp4File of movieFiles ){

                    let movName =  mp4File.substring( 0, mp4File.lastIndexOf('.') );

                    movie.file = movName + '.mp4'; 
                    movie.title = movName;
                    movie.poster = fs.existsSync( dir + movName + '-poster.jpg' ) ? movName + '-poster.jpg' : "";
                    movie.thumb =  fs.existsSync( dir + movName + '-thumb.jpg' ) ? movName + '-thumb.jpg' : "";
                    movie.fanart = fs.existsSync( dir + movName + '-fanart.jpg' ) ? movName + '-fanart.jpg' : "";
                    movie.year = "";
                    movie.subtitle = "";
                    movie.director = "";
                    movie.country = "";
                    movie.genre = "";
                    movie.tag = "";
                    movie.plot = "";
                    movie.actors = [];

                    if( movie.poster === "" && movie.thumb !== "" )
                        movie.poster = movie.thumb;

                    if( fs.existsSync( dir + movName + '.nfo' ) ){

                        const data = await readXML( dir + movName + '.nfo' );
    
                        if( data && data.movie ){
                            movie.title = data.movie.title ? entityTrans( String( data.movie.title ) ) : movName;
                            movie.subtitle = data.movie.subtitle ? String( data.movie.subtitle ) : "";
                            movie.director = data.movie.director ? entityTrans( data.movie.director.join(', ') ) : "";
                            movie.country = data.movie.country ? entityTrans( data.movie.country.join(', ') ) : "";
                            movie.year = data.movie.year ? String( data.movie.year ) : "";
                            movie.genre = data.movie.genre ? entityTrans( transGen( data.movie.genre ) ) : "";
                            movie.tag = data.movie.tag ? entityTrans( data.movie.tag.join(', ') ) : "";
                            movie.plot = data.movie.plot ? entityTrans( String( data.movie.plot ) ) : "";

                            // create genre-table                                
                            if( movie.genre.length ){

                                const tmptags = movie.genre.split( ", " );

                                for( const genre of tmptags )
                                    pushItem( genres, genre );
                            }
                            // create tag-table                                
                            if( movie.tag.length ){

                                const tmptags = movie.tag.split( ", " );

                                for( const tag of tmptags )
                                    pushItem( tags, tag );
                            }
                            // create director-table                                
                            if( movie.director.length ){

                                const tmptags = movie.director.split( ", " );

                                for( const director of tmptags )
                                    pushItem( directors, chngName( director ) );
                            }

                            // create actor-table                                
                            if( data.movie.actor )
                                for( const actor of data.movie.actor ){

                                    movie.actors.push( { name: entityTrans( actor.name ), role: entityTrans( actor.role ) } );
                                    pushItem( actors, chngName( actor.name ), actor.thumb ? actor.thumb[0] : "" );
                                } 
                        }
                        else{
                            console.log("Movie ERROR ---->",dir," : ",movName);
                        }
                    }
                    // append actor-table in movie plot
                    if( movie.actors.length ){
                      movie.plot = movie.plot + "\n\nDARSTELLER:\n";

                      for( const actor of movie.actors){
                            movie.plot = movie.plot + '\n  ' + actor.name + ': \"' + actor.role + '\"';
                      }
                    } 
                     
                    movie.serie = false;
                    movie.actors=[];
                    movies.push( { ...movie } );
                }
            }
            // scan serie
            else{
                    let data = await readXML( dir + 'tvshow.nfo' );

                    if( data.tvshow ){

                        movie.title = data.tvshow.title ? entityTrans( String( data.tvshow.title ) ) : "";
                        movie.subtitle = data.tvshow.subtitle ? String( data.tvshow.subtitle ) : "";
                        movie.director = data.tvshow.director ? entityTrans( data.tvshow.director.join(', ') ) : "";
                        movie.country = data.tvshow.country ? entityTrans( data.tvshow.country.join(', ') ) : "";
                        movie.year = data.tvshow.year ? String( data.tvshow.year ) : "";
                        movie.genre = data.tvshow.genre ? entityTrans( transGen( data.tvshow.genre ) ) : "";
                        movie.tag = data.tvshow.tag ? entityTrans( data.tvshow.tag.join(', ') ) : "";
                        movie.seasons = data.tvshow.season ? parseInt( data.tvshow.season ) : 0;
                        movie.episodes = data.tvshow.episode ? parseInt( data.tvshow.episode ) : 0;
                        movie.plot = data.tvshow.plot ? entityTrans( entityTrans( String( data.tvshow.plot ) ) ): "";
                        movie.actors = [];

                        // create genre-table                                
                        if( movie.genre.length ){

                            const tmptags = movie.genre.split( ", " );

                            for( const genre of tmptags )
                                pushItem( genres, genre );
                        }
                        // create tag-table                                
                        if( movie.tag.length ){

                            const tmptags = movie.tag.split( ", " );

                            for( const tag of tmptags )
                                pushItem( tags, tag );
                        }
                        // create director-table                                
                        if( movie.director.length ){

                            const tmptags = movie.director.split( ", " );

                            for( const director of tmptags )
                                pushItem( directors, chngName( director ) );
                        }
                        // create actor-table                                
                        if( data.tvshow.actor ){
                            for( const actor of data.tvshow.actor ){
                                movie.actors.push( { name: entityTrans( actor.name ), role: entityTrans( actor.role ), episode: 0 } );
                                pushItem( actors, chngName( actor.name ), actor.thumb ? actor.thumb[0] : "" );
                            }    
                        }
                    }

                    movie.poster = fs.existsSync( dir + 'poster.jpg' ) ? 'poster.jpg' : "";
                    movie.thumb =  fs.existsSync( dir + 'thumb.jpg' ) ? 'thumb.jpg' : "";
                    movie.fanart = fs.existsSync( dir + 'fanart.jpg' ) ? 'fanart.jpg' : "";

                    if( movie.poster === "" && movie.thumb !== "" )
                        movie.poster = movie.thumb;

                    movie.episoden = [];

                    for( let episode = 0; episode < movieFiles.length; episode++ ){

                        let tmp = {};
                        let movName =  movieFiles[episode].substring( 0, movieFiles[episode].lastIndexOf('.') );
        
                        tmp.file = movName + '.mp4'; 
                        tmp.title = movName;
                        tmp.thumb =  fs.existsSync( dir + movName + '-thumb.jpg' ) ? movName + '-thumb.jpg' : "";

                        // --------- 
                        if( tmp.thumb === "" && fs.existsSync( dir + movName + '-poster.jpg' ) )
                            tmp.thumb = movName + '-poster.jpg';
                        
                        if( movie.poster === "" && fs.existsSync( dir + movName + '-poster.jpg' ) )
                            movie.poster = movName + '-poster.jpg';

                        if( movie.fanart === "" && fs.existsSync( dir + movName + '-fanart.jpg' ) )
                            movie.fanart = movName + '-fanart.jpg';
                        // ---------

                        if( fs.existsSync( dir + movName + '.nfo' ) ){

                            const data = await readXML( dir + movName + '.nfo');
        
                            if( data && data.episodedetails ){
        
                                tmp.title = data.episodedetails.title ? entityTrans ( String( data.episodedetails.title ) ) : "";
                                tmp.subtitle = data.episodedetails.subtitle ? String( data.episodedetails.subtitle ) : "";
                                tmp.director = data.episodedetails.director ? entityTrans ( String( data.episodedetails.director ) ) : "";
                                tmp.season = data.episodedetails.season ? parseInt( data.episodedetails.season ) : 0;
                                tmp.episode = data.episodedetails.episode ? parseInt( data.episodedetails.episode ) : 0;
                                tmp.plot = data.episodedetails.plot ? entityTrans( String( data.episodedetails.plot ) ) : "";

                                // get actors from episode details
                                if( data.episodedetails.actor ){

                                    for( const actor of data.episodedetails.actor ){

                                        const name = entityTrans( actor.name );
                                        const role = entityTrans( actor.role );
                                        
                                        movie.actors.push( { name: name, 
                                                             role: role, 
                                                             episode: episode+1, 
                                                             title: `"${  tmp.title.length < 24 ? tmp.title : tmp.title.substring( 0, 23)+".."}"` 
                                                            } );

                                        pushItem( actors, chngName( name ), actor.thumb ? actor.thumb[0] : "" );
                                    }    
                                }
                            }
                            else{
                                console.log("Serie ERROR ---->",dir," : ",movName,"\n");
                            }
                        }
                        movie.episoden.push( tmp );
                    }
                    // sort epiodes
                    if( movie.episoden.length > 1 ){
                        movie.episoden.sort( ( a, b ) => ( a.season * 10000 + a.episode ) - ( b.season * 10000 + b.episode ) );
                    }
                    if( movie.actors.length ){

                        movie.plot = movie.plot + "\n\nDARSTELLER:";

                        
                        // get actors vom 'tvshow.nfo' (episode = 0)
                        for( const actor of movie.actors){

                            if( actor.episode === 0 ){

                                let isInEpisode = false;
                                
                                // check for duplicates in episoden.nfo's
                                for( const test of movie.actors ){

                                    if( test.episode !== 0 && actor.name === test.name ){
                                        isInEpisode = true;
                                        break;
                                    }
                                }
                                if( !isInEpisode )
                                    movie.plot = movie.plot + '\n  ' + actor.name + ': \"' + actor.role + '\"';
                            }
                        }
                        
                        let epino = 0;
    
                        // get actors vom episodes (episode > 0)
                        for( const actor of movie.actors){

                            if( epino !== actor.episode && actor.episode > 0 ){
                                movie.plot = movie.plot + `\n\nEpisode ${actor.episode}: ${actor.title}\n`;
                                epino = actor.episode;
                            }
                            if( actor.episode > 0)
                                movie.plot = movie.plot + '\n  ' + actor.name + ': \"' + actor.role + '\"';
                        }
                      } 
  
                    movie.serie = true;
                    movie.actors=[];
                    movies.push( { ...movie } );
            }
        }
        return movies;
    }
    catch(err){
        console.log("error",err.message);    
        process.exit(-1);    
    }
}
/****************************************************************************
 * write JSON-File
 */
async function writeJSON( path, data ){

    try{
        writeFileSync( path, JSON.stringify(data) );
    }
    catch( err ){
        console.log( "error", err.message );
    }
}
/****************************************************************************
 * read XML-File
 */
async function readXML( path ){

    try{

        let xml =  String( fs.readFileSync( path ) ).replaceAll( "& ", "&amp; " ).replaceAll( '&#8211;', ' - ' );
        //let xml =  String( fs.readFileSync( path ) ).replace( /[&]/g, '&#38;' ).replaceAll( '&#8211;', ' - ' );

        return await xml2js.parseStringPromise( xml ).then( (result) => { return result } );
    }
    catch( err ){
        console.log( "/n----------------------------\nerror: ", err.message );
    }
}
