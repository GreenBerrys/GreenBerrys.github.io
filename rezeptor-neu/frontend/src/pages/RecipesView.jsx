import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import recipeApi from "../lib/recipeApi";
import RecipeCard from "../components/RecipeCard";
import BusyIndicator from "../components/BusyIndicator.jsx";
import PageNav from "../components/PageNav.jsx";
import ModalWin from "../components/ModalWin.jsx";
import attention from "../Images/attention.png";
import "./RecipesView.css";

const  back = { page: 0, scrollPos: 0, pos: 0, filter: null };

const scrollHandler = () => back.pos = window.pageYOffset;

/********************************************************************************************
 * 
 */
function Recipes() {

const [recipes, setRecipes] = useState({
    
                            error: false,
                            page: -1,
                            lastPage: -1,
                            count: 0,
                            result: []
});


let { filter } = useParams(null);           // search parameter 

const [init, setInit] = useState(false);// Flag for component initialized
const pageEnd = useRef(0);              // reference to the pageend (Position)
const scrollTo = useRef(0);             // windowsposition to scroll
const busy = useRef(true);

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    
    // install Handler for recording windows position
    if(init){
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }
    // remove Handler and save windowsposition
    return () => {
        if(init){
            window.removeEventListener('scroll', scrollHandler);
            back.scrollPos = back.pos;
        }
    };
},[init]);

// Get recipes if filter changed
useEffect(() => {

    if(init){  

        if( back.filter !== filter ){
            back.filter = filter;
            back.page = 0;
            back.scrollPos = 1;
        }
        busy.current = true;
        setRecipes({...recipes}, {result: []})
        recipeApi.find( {filter: back.filter, page: back.page } , (data) => {
                                                                            
                        busy.current = false;
                        setRecipes( data ); 
        }); 
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[filter,init]);

// Scroll to pageend after pageUp to previous page 
// or last position after browser go to previous pos
useEffect(() => {

    if(init){  

        switch(scrollTo.current){
            case 0:                 // scroll to last position
                window.scrollTo( { top: back.scrollPos, behavior: 'auto' } );
                break;
            case 1:                 // scroll to top
                window.scrollTo( { top: 0, behavior: 'auto' } );
                break;
            case 2:                 // scroll to bottom
                window.scrollTo( { top: pageEnd.current.offsetTop , behavior: 'auto' } );
                break;
            default:
                break;
        }
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[recipes.page, filter]);       

// *** goto next page
const pageDown = () => { 
    
    scrollTo.current = 1;
    back.page = recipes.page +1;
    busy.current = true;
    setRecipes({...recipes}, {result: []})
    recipeApi.find( { filter: filter, page: back.page }, (data) => {

                                busy.current = false;
                                setRecipes(data) 
    } );
}
// *** goto previous page
const pageUp = () => {

    scrollTo.current = 2;
    back.page = recipes.page -1;
    busy.current = true;
    setRecipes({...recipes}, {result: []})
    recipeApi.find( {filter: filter, page: back.page }, (data) => {
        
                                busy.current = false;
                                setRecipes(data)  
    });
}
// *** read recipepage
const setPage = ( pageNo = 0 ) => {

    scrollTo.current = 1;
    back.page = pageNo;
    busy.current = true;
    setRecipes({...recipes}, {result: []})
    recipeApi.find( { filter: filter, page: back.page }, (data) => {

                                busy.current = false;
                                setRecipes(data) 
    } );
}


if( !busy.current ){
    return (
        <div>
            { !recipes.error ?
                <div>
                    {recipes.count === 0 &&
                        <h2><br></br><br></br>Keine Rezepte gefunden..</h2>
                    }    
                    <PageNav page = {recipes.page} lastPage = {recipes.lastPage } 
                             setPage = {setPage} pageUp = { pageUp } pageDown = { pageDown }
                    />
                    <div className="cardView">
                        {   recipes.result.map((recipe, index) => {
                                return ( <RecipeCard key={index} recipe={recipe} /> );
                            })
                        }
                    </div>

                    <PageNav page = {recipes.page} lastPage = {recipes.lastPage } 
                             setPage = {setPage} pageUp = { pageUp } pageDown = { pageDown }
                    />
                <span ref={pageEnd}></span>
                </div>
            : 
                <ModalWin>
                    <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                    <div>
                        <p style={{color: 'red'}}>
                            ({recipes.errCode}):&nbsp;{recipes.errType}<br></br>
                            {recipes.errMsg}
                        </p>
                        <p><button onClick={() => setRecipes( { error:false, count: 0, result: [] } ) }>Ok</button></p>
                    </div>
                </ModalWin>        
            }    
        </div>    
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}
export default Recipes;

