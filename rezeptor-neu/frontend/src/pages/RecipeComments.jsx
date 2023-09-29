import React, { useState, useEffect, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import commentApi from "../lib/commentApi.js";
import userApi from "../lib/userApi.js";
import Comment from "../components/RecipeComment.jsx";
import BusyIndicator from "../components/BusyIndicator.jsx";
import { Switch, Case} from "../components/Switch.jsx";
import PageNav from "../components/PageNav.jsx";
import Context from "../AppContext.js";
import "./RecipeComments.css";
import newButton from "../Images/newComment.png";



const  back = { scrollPos: 0, pos: 0 };

const scrollHandler = () => back.pos = window.pageYOffset;
/********************************************************************************************
 * 
 */
function RecipeComments() {

const TMPCOMMENT = {

    _id: null,
    recipe: { _id: null, name: ""},
    author: { _id: null, name: ""},
    text: ""
};

let { filter } = useParams(null);           // Recipe ID
const { auth } = useContext( Context );     // Login state
const pageEnd = useRef();                   // reference to the pageend (Position)
const [init, setInit] = useState(false);    // Flag for component initialized
const [winYPos, setwinYPos] = useState(false);                  // call windowscroll to previous position
const [tmpComment, setTmpComment] = useState( TMPCOMMENT );     // edit buffer

const [comments, setComments] = useState({

    error: false,
    state: 0,
    editMode: 0,
    page: 0,
    count: 0,
    scrollPos: 0,
    result: [{ 
        _id: null,
        recipe: { _id: null, name: ""},
        author: { _id: null, name: "", description: "", picTime: ""},
        written: Date.now(),
        text: ""
    }]
});

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    if(init){
        window.scrollTo( { top: 0, behavior: 'auto' } );
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }    
    return () => {
        if(init){
            window.removeEventListener('scroll', scrollHandler);
        }
    };
},[init]);

useEffect(() => {

    if(init){  
     
        if(filter){    
           readPage();       
        }                                      
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[filter, init]);

useEffect(() => {           // Scroll window to position

    if(init){  
        switch( comments.scrollPos){

            case 0:
                window.scrollTo( { top: 0, behavior: 'auto' } );
                break;
            case 1:    
                window.scrollTo( { top: pageEnd.current.offsetTop, behavior: 'auto' } );
                break;
            case 2:    
                window.scrollTo( { top: back.scrollPos, behavior: 'auto' } );
                break;
            default:
        }
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[winYPos]);

const readPage = (page = 0, scroll = 0) =>{         // Read one Page

    
    setComments( (prevComments) => ( { ...prevComments, state: 2 } ) )
    commentApi.find( filter, page, (data) => {
    
        if( !data.error ){
            setComments( (prevComments) => ( { ...prevComments, ...data, state: 0, scrollPos: scroll } ), 
                                           setwinYPos( (ypos) => !ypos ) ); 
        }
        else{
            setComments( (prevComments) => ( { ...prevComments, ...data, state: 0, scrollPos: scroll } ) ); 

        }    
        
    } ); 
} 

// =======================================================================
const changeEditmode = (event) => {
    
    if ( !comments.editMode ){
        setComments( ( prevComments ) => ( { ...prevComments, editMode: 1 } ) );
    }
    else{
        setComments( ( prevComments ) => ( { ...prevComments, editMode: 0 } ) );
    }
}

// =================================================================================
const saveComment = (event) => {

    if( tmpComment.text.length ){

        back.scrollPos = back.pos;
        changeEditmode();
        setComments( ( prevComments ) => ( { ...prevComments, state: 2 } ) );

        if( !tmpComment._id ){

            commentApi.create( tmpComment,
                
                            (result) => {

                                if( !result.error){
                                    readPage( comments.lastPage +1, 1);
                                }
                                else{
                                    setComments( ( prevComments) => ({ ...prevComments, 

                                                error: true, 
                                                errCode: result.errCode, errType: result.errType, errMsg: result.errMsg,
                                                state: 0 } ) );
                                }
                            });
        }
        else{
            commentApi.update( tmpComment,
            
                            (result) => {

                                if( !result.error){
                                    readPage( comments.page, 2);
                                }
                                else{
                                    setComments( ( prevComments) => ({ ...prevComments, 

                                                error: true, 
                                                errCode: result.errCode, errType: result.errType, errMsg: result.errMsg,
                                                state: 0 } ) );
                                }
                            });
        }
    }
}
// goto next page
const pageDown = () => { 
    
    readPage(Number(comments.page) +1, 0);
}
// goto previous page
const pageUp = () => {

    readPage(Number(comments.page) -1, 1);
}
// ====================================================================
const commentChangeHandler = ( event ) => setTmpComment( (prevComment) => ({ ...prevComment, text: event.target.value }) );


const newComment = ( ) => {

    setTmpComment( { ...TMPCOMMENT, recipeid: filter.split('=')[1], authorid: userApi.getUser()._id } );
    changeEditmode();
}
const editComment = ( comment ) => {

    setTmpComment( { ...TMPCOMMENT, ...comment } );
    changeEditmode();
}

// ==================================================================

switch ( comments.state ) {

    case 0: 
        return (
            <div className="recipeComments">
                <div>
                    { (!comments.error && auth) && 
                      <>  
                        { !comments.editMode ?
                            <>
                                <div className="recipeNewCommentButton" onClick={ newComment }>
                                        <img src={newButton} alt="neu"></img>
                                    <div>
                                    Kommentar schreiben
                                    </div> 
                                </div>   
                            </>    
                        :
                            <>
                                <div className="recipeCommentInputContainer">
                                    <div>
                                        <textarea className="recipeCommentInput" 
                                                  onChange={ commentChangeHandler } 
                                                  defaultValue={ tmpComment.text }
                                                  placeholder="Hier deinen Senf dazugeben"
                                                  autoFocus>
                                        </textarea>
                                    </div>
                                    <div>
                                        <button onClick={ saveComment }>Speichern</button>   
                                        &nbsp;&nbsp;&nbsp;
                                        <button onClick={ changeEditmode }>Abbruch</button>   
                                    </div>
                                </div>
                            </>    
                        }   
                    </>
                    }   
                    {comments.count ?
                    <>
                        <h4>{comments.result['0'].recipe.name}&nbsp;&nbsp;(Seite { Number(comments.page) + 1 } von { Number(comments.lastPage) + 1 }):
                        </h4>
                        {comments.lastPage > 0 &&
                            <PageNav page = {comments.page} lastPage = {comments.lastPage } 
                            setPage = { readPage } pageUp = { pageUp } pageDown = { pageDown }
                            />
                        }    
                        { comments.result.length &&
                        <ul>
                            {
                                comments.result.map( (comment, index ) => {
                        
                                    return (
                                        <li key={index}>
                                            <Comment data = { comment } auth = { auth } userid = { userApi.getUser()._id } edit = { editComment }/>
                                        </li>
                                    );
                                })
                            }    
                        </ul>
                        }
                    </>
                    :
                    <h3><p>Keine Kommentare vorhanden</p></h3>
                    }
                    {comments.lastPage > 0 &&
                        <PageNav page = {comments.page} lastPage = {comments.lastPage } 
                        setPage = { readPage } pageUp = { pageUp } pageDown = { pageDown }
                    />
                    }    

                </div>
                <div ref={pageEnd}></div>
                { comments.error &&

                    <div className="errorMsg">
                        <Switch val={ comments.errCode } style={{color: 'red'}}>
                            <Case val = { -298 }>
                                <h2 style={{color: 'red'}}>Bild ist zu groß!</h2>
                                <p> Bildgröße überschreitet die max. Dateigröße von MB.</p>
                                <p> Kochrezept konnte nicht gespeichert werden. </p>
                                <p> <button onClick={() => setComments( { ...comments,error:false } ) } >Ok</button></p>
                            </Case>
                            <Case default>
                                <h2 style={{color: 'red'}}>{comments.errType}</h2>
                                <p>({comments.errCode}):&nbsp;{comments.errMsg}</p>
                                <p> <button onClick={() => setComments( { ...comments,error:false } ) } >Ok</button></p>
                            </Case>
                        </Switch>
                    </div>
                }
            </div>    
        );
    case 2:
        return (
            <BusyIndicator/>  

        );
    default:
}


}
export default RecipeComments;

