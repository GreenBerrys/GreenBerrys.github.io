import React from "react";
import "./RatingStars.css";

function RatingStars( { users, avgRate, comments } ) {

  return (
        
    <span className="ratingstars">
        {users} {users === 1 ? "Bewertung" : "Bewertungen" } 
        <span>{'★'.repeat( Math.round( avgRate ) )}</span>
        <span>{'★'.repeat( 5 - Math.round( avgRate ) )}</span>
        ({ avgRate }) 
    </span> 
  );
}

export default RatingStars;