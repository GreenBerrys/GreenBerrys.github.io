import React from "react";
import "./RecipeDetailInstructions.css";

/********************************************************************************************
 * 
 */
function RecipeDetailInstructions( { recipe, setRecipe } ) {

return (
    <div>
    {!recipe.editMode ?    
        <div className="recipeDetailInstructions">
            <h2>Zubereitung:</h2>
            <ul>
                {
                    // recipe.result.instruction.replaceAll("\n\n", "\n\n#")
                    //         .split("#")
                    //         .map((txt, i) => txt !== "\n\n" && txt !== "\n" ? 
                    //                          <li key={i}>{'👉🏼'} {txt}</li> : <li key={i}> {txt} </li>)

                    recipe.result.instruction.replaceAll("\n\n", '#')
                            .split("#")
                            .map((txt, i) => txt.length > 0 && (txt[0] !== '\n' && txt.length > 1) ? <li key={i}>{'👉🏼'} {txt}</li> : <li key={i}> {txt} </li> )
                }
            </ul>
        </div>
     :
        <div className="recipeDetailInstructionsEdit">
            <h2>Zubereitung:</h2>
            <div>
                {
                  <textarea defaultValue={recipe.result.instruction}  
                   onChange={ (e) => setRecipe( { ...recipe, result: { ...recipe.result, instruction: e.target.value }, dataChanged: true } ) } 
                  >
                  </textarea>
                }
            </div>
        </div>
    }    
    </div>
);
}
export default RecipeDetailInstructions;

