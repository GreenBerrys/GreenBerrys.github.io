import React, { useState, useEffect } from "react";
import ratingsApi from "../lib/ratingsApi.js";
import userApi from "../lib/userApi.js";
import "./Rating.css";


function Rating( { recipe, setRecipe } ) {

    const RATING = {

        state: 0,
        error: false,
        count: 0,
        result: { 
            _id: null,
            recipeid: null,
            authorid: null,
            rate: 0,
            avg: { users: 0, avgRate: 0}
        }
    }

    const [ init, setInit ] = useState( false );// Flag for component initialized
    const [ rating, setRating] = useState( RATING );
    // eslint-disable-next-line no-unused-vars
    const [ rate, setRate ] = useState(0);
    const [ hover, setHover ] = useState(0);
    
        // set flag for initialized
    useEffect( () => {
       
        setInit( () => true );
    
    },[]);
    
    useEffect(() => {
        
        if(init){
        }    
        return () => {
        };
    },[init]);
    
const onRatingClick = (index=0) => {

    if ( rating.state === 0 ){
        setRating( (prevRate ) => ( { ...prevRate, state: 1 } ) );    
    }
    else{
        setRating( (prevRate ) => ( { ...prevRate, state: 2 } ) );    
        ratingsApi.create({recipeid: recipe.result._id, userid: userApi.getUser()._id, rate: index }, (data) => {

                if( !data.error ){

                    setRecipe( (prev) => ( { ...prev, canRate: false, 
                                            result: { ...prev.result, ratings: data.result.avg } } 
                    ) );
                }
                else{

                    setRecipe( (prev) => ( { ...prev, error: data.error, 
                                                      errType: data.errType, 
                                                      errCode: data.errCode,
                                                      errMsg: data.errMsg } )  
                    );

                }
                setRating( (prevRate ) => ( { ...prevRate, state: 0 } ) );    
        });
    }
}

// =============================================================================================    
  switch ( rating.state ) {

    case 0:
        return (
            <span className="rating" onClick={ onRatingClick } title="Rezept bewerten">
                {recipe.result.ratings.users} {recipe.result.ratings.users === 1 ? "Bewertung" : "Bewertungen" } 
                <span>{'★'.repeat( Math.round( recipe.result.ratings.avgRate ) )}</span>
                <span>{'★'.repeat( 5 - Math.round( recipe.result.ratings.avgRate ) )}</span>
                ({ recipe.result.ratings.avgRate })
            </span>
      );
    case 1:
        return (
            <div className="ratingIn" >
                <div>Rezept bewerten:</div>
                <div>
                {[...Array(5)].map((star, index) => {
                    index += 1;
                    return(
                        <button 
                            type="button" 
                            key={index}
                            className={ index <= (hover || rate) ? "starOn" : "starOff" }
                            onClick={ () => onRatingClick(index) }
                            onMouseEnter={() => setHover(index) }
                            onMouseLeave={() => setHover(rate) }
                            onTouchStart={() => setHover(index) }
                            onTouchEnd={() => setHover(rate) }
                            onTouchMove={() => setHover(index) }
                        >
                        <span>&#9733;</span>    
                        </button>    
                    )})

                }
                </div>

            </div>
      );
    case 2:
        return (

             <div className="ratingIn" >  
                 <div className="rateBusy">
                    speichere...
                     {/* <BusyIndicator showClass={"busyIndicatorR"}/> */}
                  </div>
             </div>
      );
    default:    

  }
}

export default Rating;