import React, { useRef }  from "react";
import { Link } from "react-router-dom";
import { SERVER } from "../config.js";
import RatingStars from "../components/RatingStars.jsx"
import Rating from "../components/Rating.jsx"
import "./RecipeDetailHead.css";


/********************************************************************************************
 * 
 */
function RecipeDetailHead( { recipe, setRecipe } ) {

const recipePicFile = useRef();

const pictureClick = (event) => recipePicFile.current.click();

const pictureChange = (event) =>{

    if(recipePicFile.current.files.length > 0){

        setRecipe( { ...recipe, picture: URL.createObjectURL( recipePicFile.current.files[0] ), picChanged: true, pictureObj: recipePicFile.current.files[0] } );
    }
  }

const changeHandler = (event) => setRecipe( { ...recipe, result: { ...recipe.result, [event.target.name]: event.target.value }, dataChanged: true } );

const timeChangeHandler = (event) => setRecipe( { ...recipe, result: { ...recipe.result, time: {...recipe.result.time, [event.target.name]: event.target.value } }, dataChanged: true } );

// ************************************************************************************

return (
    <div>
    {!recipe.editMode ?   
        <div className="recipeDetailHead">
            { !recipe.picChanged ?
                <img src={ recipe.picture + recipe.picTime } alt={"recipec"} className="recipeDetailHeadImage"/>
            :
                <img src={ recipe.picture} alt={"recipepic" } className="recipeDetailHeadImage"/>
            }
            <div className="recipeDetailHeadContainer">
                <img src= { SERVER + "user/picture/" + recipe.result.author._id + recipe.result.author.picTime } alt="Author"  className="recipeDetailHeadAuthorImage"/>
                <div className="recipeDetailHeadContainerRight">
                    <h2 className="recipeDetailHeadName">{recipe.result.name}</h2>
                    {recipe.canRate ?
                        <>
                            <Rating recipe = { recipe } setRecipe = { setRecipe }/>
                        </>
                        :
                        <>
                            <RatingStars users = { recipe.result.ratings.users } 
                                        avgRate = { recipe.result.ratings.avgRate }
                            />
                        </>
                    }

                <div className="recipeDetailHeadComments">
                    <Link to={ { pathname: `/comments/recipeid=${recipe.result._id}` } }>
                        {recipe.result.comments} {recipe.result.comments === 1 ? "Kommentar" : "Kommentare" }
                    </Link>         
                </div>


                    <p className="recipeDetailHeadAuthor">von {recipe.result.author.name}</p>
                    <p className="recipeDetailHeadDescription">{recipe.result.description}</p>    
                    <p className="recipeDetailHeadKeywords">{recipe.result.keywords}</p>    
                </div>
            </div>
            <div className="recipeDetailHeadTimes">
                <span>{'⏱'}&nbsp;Vorbereitungszeit&nbsp;ca.:&nbsp;{recipe.result.time.prepare}&nbsp;Min.</span>
                <span>{'👨‍🍳'}&nbsp;Kochzeit&nbsp;ca.:&nbsp;{recipe.result.time.cook}&nbsp;Min.</span>
            </div> 
        </div>
     :
        <div className="recipeDetailHead">   
            { !recipe.picChanged ?
                <img src={ recipe.picture + recipe.picTime } onClick={ pictureClick } alt={"recipec"} className="recipeDetailHeadImage recipeDetailHeadImageInput"/>
            :
                <img src={ recipe.picture} alt={"recipepic" } onClick={ pictureClick } className="recipeDetailHeadImage recipeDetailHeadImageInput"/>
            }
            <input type="file" accept="image/*" style={{display: 'none'}} onChange={ pictureChange } ref={recipePicFile}/> 
            <div className="recipeDetailHeadContainer">
                <div className="recipeDetailHeadContainerRight">
                    <div>
                        <input type="text" name="name" defaultValue={recipe.result.name} 
                            onChange={changeHandler} placeholder="Name des Rezeptes" 
                            className="recipeDetailHeadNameInput"
                            autoFocus={ recipe.result.name.trim().length === 0 && "autoFocus" }
                            >
                        </input>
                        <RatingStars users = { recipe.result.ratings.users } 
                                avgRate = { recipe.result.ratings.avgRate }
                        />
                        <div className="recipeDetailHeadCommentsNoLink">
                                {recipe.result.comments} {recipe.result.comments === 1 ? "Kommentar" : "Kommentare" }
                        </div>
                        <p className="recipeDetailHeadAuthor">von {recipe.result.author.name}</p>
                        <textarea name="description" defaultValue={recipe.result.description} 
                            onChange={changeHandler} placeholder="Kurzbeschreibung des Rezeptes"
                            className="recipeDetailHeadDescriptionInput"
                        >
                        </textarea>
                        <input type="text" name="keywords" defaultValue={recipe.result.keywords} 
                            onChange={changeHandler} placeholder="Stichworte"
                            className="recipeDetailHeadKeywordsInput"
                        >
                        </input>
                    </div>
                </div>
            </div>
            <div className="recipeDetailHeadTimes">
                <span>{'⏱'}&nbsp;Vorbereitungszeit&nbsp;ca.:&nbsp;
                    <input type="number" name="prepare" defaultValue={recipe.result.time.prepare}
                        onChange={timeChangeHandler} >
                    </input>&nbsp;Min.
                </span>
                <span>{'👨‍🍳'}&nbsp;Kochzeit&nbsp;ca.:&nbsp;
                    <input type="number" name="cook" defaultValue={recipe.result.time.cook}
                        onChange={timeChangeHandler} >
                    </input>&nbsp;Min.
                </span> 
            </div> 
        </div>
    }   
    </div>
);
}
export default RecipeDetailHead;

