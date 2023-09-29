import React, { useState, useRef } from "react";
import "./RecipeDetailIngredients.css";

/********************************************************************************************
 * 
 */
function RecipeDetailIngredients( { recipe, setRecipe } ) {

const decPortions = (event) => {
    if( recipe.editMode )
        setRecipe( { ...recipe, result: { ...recipe.result, portions: recipe.result.portions > 1 ? recipe.result.portions -1 : recipe.result.portions }, dataChanged: true } );
    else    
        setRecipe( { ...recipe, result: { ...recipe.result, portions: recipe.result.portions > 1 ? recipe.result.portions -1 : recipe.result.portions } } );
}
const incPortions = (event) => {
    if( recipe.editMode )
        setRecipe( { ...recipe, result: { ...recipe.result, portions: recipe.result.portions +1 }, dataChanged: true } );
    else
        setRecipe( { ...recipe, result: { ...recipe.result, portions: recipe.result.portions +1 } } );
}

const portionCalc = (val, portions) => {

    if ( val === 0  )
        return "";

    switch (Math.round( val * portions * 100 ) % 100){

        case 25:
            return (' ' + Math.floor(Math.round( val * portions * 100 ) / 100) + '¼').replace(' 0','');
        case 50:
            return (' ' + Math.floor(Math.round( val * portions * 100 ) / 100) + '½').replace(' 0','');
        case 75:
            return (' ' + Math.floor(Math.round( val * portions * 100 ) / 100) + '¾').replace(' 0','');
        default:
            return '' + (Math.round( val * portions * 100 ) / 100);    
    }

}
// ============================================================ EDITING ============================


// -------------------------------------------------> Drag & Drop Handling
const [dragging, setDragging] = useState(false);
const dragItem = useRef();

const handleDragStart = ( event, index ) =>{

    //event.target.style.dropEffect="move";
    setDragging( true) ;
    dragItem.current = index;
}
const handleDragEnter = ( event, index ) => {
  
    if(recipe.editLineNo === -1){
        const tmpList = [ ...recipe.result.ingredients ];
        const item = tmpList[ dragItem.current ];
        tmpList.splice( dragItem.current, 1 );
        tmpList.splice( index, 0, item) ;

        dragItem.current = index;
        setRecipe( { ...recipe, result: { ...recipe.result, ingredients: tmpList }, dataChanged: true } );
    }    
  };

// -------------------------------------------------> Editorfunctions

// *** save ingredient
const saveIngHandler = ( event, index ) => {

    if( recipe.result.ingredients[index].ingRef.name.trim().length > 0 ){
        recipe.result.ingredients[index].quantity = recipe.result.ingredients[index].quantity / recipe.result.portions; 
        setRecipe( { ...recipe, editLineNo: -1 } );  
    }    
    else{
        setRecipe( { ...recipe, editLineNo: -1, 
                     result: { ...recipe.result, ingredients: recipe.result.ingredients.filter( (ing, i) => i !== index ) }, dataChanged: true } ); 
    }    
};
// *** edit ingredient
const editIngHandler = ( event, index ) => {
    recipe.result.ingredients[index].quantity = recipe.result.ingredients[index].quantity * recipe.result.portions; 
    setRecipe( { ...recipe, editLineNo: index } );  
};
// *** add new ingredient
const newIngHandler = ( event, index ) => {
 
    if( recipe.result.ingredients.length === 0 )
        index = -1;

    recipe.result.ingredients.splice( index+1, 0, { ingRef: {_id: null, name: ""},  quantity: 1.0, unit: "", note: "", ingChanged: true } );
    setRecipe( { ...recipe, dataChanged: true ,editLineNo: index+1 } );
};
// *** move ingredient up
const moveIngUpHandler = ( event, index ) => {

    if(index > 0){
        const tmpList = recipe.result.ingredients.filter( (ing, i) => i !== index );
        tmpList.splice( index-1, 0 , recipe.result.ingredients[ index ] );
        setRecipe( { ...recipe, result: { ...recipe.result, ingredients: tmpList }, dataChanged: true } ); 
     }   
};
// *** move ingredient down
const moveIngDownHandler = ( event, index ) => {

    if(index < recipe.result.ingredients.length -1){
        const tmpList = recipe.result.ingredients.filter( (ing, i) => i !== index );
        tmpList.splice( index+1, 0 , recipe.result.ingredients[ index ] );
        setRecipe( { ...recipe, result: { ...recipe.result, ingredients: tmpList }, dataChanged: true } ); 
     }   
};
// *** switch between ingredient / title
const titleIngHandler = ( event, index ) => {

    if( recipe.result.ingredients[index].quantity === -1){
        recipe.result.ingredients[index].quantity = 0.0;
        recipe.result.ingredients[index].note = "";
    }
    else{
        recipe.result.ingredients[index].quantity = -1;
        recipe.result.ingredients[index].note = "Title";
    }
    setRecipe( { ...recipe, dataChanged: true } ); 
};
// *** delete ingredient
const delIngHandler = ( event, index ) => {

    setRecipe( { ...recipe, result: { ...recipe.result, ingredients: recipe.result.ingredients.filter( (ing, i) => i !== index ) }, dataChanged: true } ); 
};
// =======================================================================
return (
    <div>
    {!recipe.editMode ?
        <div className="recipeDetailIngredients">
            <h2>
                <button onClick={ decPortions  } value={ recipe.result.portions }>-</button>
                <span>
                Zutaten&nbsp;f&uuml;r&nbsp;{ recipe.result.portions }&nbsp;Portionen: 
                </span>
                <button onClick={ incPortions } value={ recipe.result.portions }>+</button>
            </h2>
            <ul>     
            {
                recipe.result.ingredients.map((ingredient, index) => {
                    return (
                        <li key={index}>
                            {ingredient.quantity !== -1 ? (
                                <div>
                                    <span>
                                        {ingredient.ingRef.name}
                                    </span>    
                                    <span>
                                        { portionCalc( ingredient.quantity, recipe.result.portions ) }
                                    </span>
                                    <span>
                                        {ingredient.unit}
                                    </span>
                                    <span>
                                        {ingredient.note}
                                    </span>               
                                </div>
                            ) : (
                                <h3>{ingredient.ingRef.name}</h3>                      
                            )}
                        </li>
                    );
                })
            }
            </ul> 
        </div>
    :
    <div className="recipeDetailIngredientsEdit">
        <h2>
            <button onClick={ decPortions  } value={ recipe.result.portions }>-</button>
            <span>
            Zutaten&nbsp;f&uuml;r&nbsp;{ recipe.result.portions }&nbsp;Portionen: 
            </span>
            <button onClick={ incPortions } value={ recipe.result.portions }>+</button>
        </h2>
        {
            recipe.result.ingredients.length === 0  &&
            <button className="addFirstIngredient" onClick={ (e) => newIngHandler( e, 0 ) } >Neue Zutat</button>
        }
        <ul>     
        {
            recipe.result.ingredients.map((ingredient, index) => {
                return (
                    <li key={index}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={(e) => handleDragEnter(e, index)}
                        onDragLeave={() => setDragging( false ) }
                        onDrop={() => setDragging( false ) }
                        onDragOver={(e) => e.preventDefault()}
                        className="IngredientLine"
                    >
                        {recipe.editLineNo === index ?
                        <>
                            <div className="ingEditLine">
                                <input 
                                    autoFocus
                                    type="text" 
                                    name="name"
                                    placeholder="Zutatenname"
                                    defaultValue={ingredient.ingRef.name}
                                    onChange={(e) => { ingredient.ingRef.name = e.target.value; 
                                                       ingredient.ingChanged = true;
                                                       setRecipe( {...recipe, dataChanged: true } ) } 
                                                    }
                                >
                                </input>
                                <input  
                                    type="number" 
                                    name="quantity"
                                    min="1.0" 
                                    step="0.1" 
                                    defaultValue={ingredient.quantity}
                                    onChange={(e) => { ingredient.quantity = e.target.value; 
                                                       ingredient.ingChanged = true;
                                                       setRecipe( {...recipe, dataChanged: true } ) } 
                                                    }
                                >
                                </input>
                                <input  
                                    type="text" 
                                    name="unit"
                                    placeholder="Mengeneinheit"
                                    defaultValue={ingredient.unit}
                                    onChange={(e) => { ingredient.unit = e.target.value; 
                                                       ingredient.ingChanged = true;
                                                       setRecipe( {...recipe, dataChanged: true } ) } 
                                                    }
                                >
                                </input>
                                <input  
                                    type="text" 
                                    name="note"
                                    placeholder="Anmerkungen"
                                    defaultValue={ingredient.note}
                                    onChange={(e) => { ingredient.note = e.target.value; 
                                                       ingredient.ingChanged = true;
                                                       setRecipe( {...recipe, dataChanged: true } ) } 
                                                    }
                                >
                                </input>
                                <button className="saveIngButton" onClick={(e)=>saveIngHandler(e,index)}>&#x2714;</button>
                            </div>
                        </>
                        :
                        <>
                            {ingredient.quantity !== -1 ? (
                                <div>
                                    <span>
                                        {ingredient.ingRef.name}
                                    </span>    
                                    <span>
                                        { portionCalc( ingredient.quantity, recipe.result.portions ) }
                                    </span>
                                    <span>
                                        {ingredient.unit}
                                    </span>
                                    <span>
                                        {ingredient.note}
                                    </span>               
                                </div>
                            ) : (
                                <h3>{ingredient.ingRef.name}</h3>                      
                            )}
                            {(recipe.editLineNo === -1 && !dragging) &&
                                <div className="buttonContainer">
                                    <button title="Zeile darunter zufügen" onClick={ (e) => newIngHandler(e,index) }>+</button>
                                    <button title="Zutat bearbeiten" onClick={ (e) => editIngHandler(e,index) }>&#x270E;</button>
                                    <button title="Zeile hochschieben" onClick={ (e) => moveIngUpHandler(e,index) }>&#8593;</button>
                                    <button title="Zeile runterschieben" onClick={ (e) => moveIngDownHandler(e,index) }>&#8595;</button>
                                    <button title="Zeile als Überschrift" onClick={ (e) => titleIngHandler(e,index) }>T</button>
                                    <button title="Zeile löschen" onClick={ (e) => delIngHandler(e,index) }>&#10007;</button>
                                </div>
                            }
                        </>
                        }
                    </li>
                );
            })
        }
        </ul> 
    </div>    
    }
    </div>
);
}
export default RecipeDetailIngredients;

