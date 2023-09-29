import React from "react";
import { Link } from "react-router-dom";
import "./RecipeCard.css";
import { SERVER } from "../config.js";
import Ratings from "./RatingStars.jsx"

function RecipeCard( { recipe } ) {

return (

    <div className="card">
       
        <h3>{recipe.name}</h3>
        <Link to={ { pathname: `/recipe/recipeid=${recipe._id} ` } }>
            <img src={SERVER+"recipe/picture/" + recipe._id + recipe.picTime} alt="..."/>
        </Link>

        <div>
            <Ratings users = { recipe.ratings.users } 
                    avgRate = { recipe.ratings.avgRate }/>
            <div className="recipeCardComment">
                <Link to={ { pathname: `/comments/recipeid=${recipe._id}` } }>
                    {recipe.comments} {recipe.comments === 1 ? "Kommentar" : "Kommentare" }
                </Link>         
            </div>
        </div>

        <span className="cardTxt">
            <p >{recipe.description}</p>
        </span>
</div>

  );
}

export default RecipeCard;
