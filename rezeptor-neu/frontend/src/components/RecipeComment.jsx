import "./RecipeComment.css";
import { SERVER } from "../config.js";

/********************************************************************************************
 * 
 */
function RecipeComment( { data, auth, userid, edit } ) {

return (
        data.author._id &&
        <div className="recipeComment">
            <div>
                <img src={ SERVER + "user/picture/" + data.author._id + data.author.picTime } alt={"..."}  ></img>
                <p> 
                    { data.author.name }
                </p>
            </div>
            <div>
                <p>
                vom&nbsp;
                    { (new Date(data.written)).toLocaleString('de-DE') }
                    { (auth && userid === data.author._id ) &&
                      <button onClick={ (e) => edit(data) }>Bearbeiten</button>  
                    }
                </p>    
                <span>
                    {data.text}
                </span>    
                <p>
                    { data.author.description.length ? '('+ data.author.description + ')' : "" }  
                </p>           
            </div>
        </div>    
);
}
export default RecipeComment;

