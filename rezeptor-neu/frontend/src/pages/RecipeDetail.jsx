import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import recipeApi from "../lib/recipeApi.js";
import ingredientApi from "../lib/ingredientApi.js";
import userApi from "../lib/userApi.js";
import ratingsApi from "../lib/ratingsApi.js"
import Head from "../components/RecipeDetailHead.jsx";
import Ingredients from "../components/RecipeDetailIngredients.jsx";
import Instructions from "../components/RecipeDetailInstructions.jsx";
import BusyIndicator from "../components/BusyIndicator.jsx";
import { SERVER, PICMAXSIZE } from "../config.js";
import { Switch, Case} from "../components/Switch.jsx";
import Context from "../AppContext.js";
import "./RecipeDetail.css";
import ModalWin from "../components/ModalWin.jsx";
import editButton from "../Images/edit.png";
import showButton from "../Images/show.png";
import delButton from "../Images/delete.png";
import saveButton from "../Images/save.png";
import attention from "../Images/attention.png";

const  back = { scrollPos: 0, pos: 0 };

const scrollHandler = () => back.pos = window.pageYOffset;

/********************************************************************************************
 * 
 */
function RecipeDetail() {

const RECIPE = {

    state: 0,
    error: false,
    editMode: 0,
    editLineNo: -1,
    picChanged: false,    
    dataChanged: false,
    canRate: false,
    picTime: "",
    picture: SERVER + "recipe/picture/",
    pictureObj: null,
    result: { 
        _id: null,
        name: "",
        author: { _id: "", name: "", picTime: "" },
        category: { _id: null, name: "" },
        country: { _id: null, name: "" },
        description: "",
        ingredients: [{
                ingRef: {_id: null, name: ""},
                note: "",
                quantity: 0.0,
                unit: "",
                ingChanged: false,
        }],
        instruction: "",
        keywords: "",
        portions: 1,
        ratings: { users: 0, avgRate: 0 },
        time: { prepare: 0, cook: 0 },
        comments: 0
    }
}


const { auth } = useContext( Context );
const navigate = useNavigate();
let { filter } = useParams(null);           // Recipe ID

const [recipe, setRecipe] = useState( RECIPE );

const [delMsg, setDelMsg] = useState( false );

const [init, setInit] = useState(false);// Flag for component initialized

// set flag for initialized
useEffect( () => {
   
    setInit( () => true );

},[]);

useEffect(() => {
    if(init){
        back.pos = 0;
        window.scrollTo( { top: 0, behavior: 'auto' } );
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }    
    return () => {
        if(init){
            window.removeEventListener('scroll', scrollHandler);
        }
    };
},[init]);

//-------------------------------------------------> 
const [ renew, setRenew] = useState(false);

useEffect( ()=> {

    if( init ){
      setRecipe( (prevRecipe) => ( { ...prevRecipe, editMode: 1, state:0 } ) );            
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[renew])

// Get recipes if ID changed or create new empty recipe
useEffect(() => {

    if(init){  

        if(filter && filter !== 'NEW' && filter !== 'RENEW'){       // *** Load existing Recipe ***********************

            setRecipe( { ...recipe, state: 2 } )
            recipeApi.get( filter , ( data ) => {

                setRecipe( { ...RECIPE, ...data, state: 0, picture: SERVER + "recipe/picture/" + data.result._id, picTime: data.result.picTime } ); 

                // **** check if rating possible

               if( auth && !data.error && ( data.result.author._id !== userApi.getUser()._id ) ){

                    ratingsApi.find( `recipeid=${data.result._id}&userid=${userApi.getUser()._id}`,0, (ratedata) => {
                    
                        if( !ratedata.error ){ 

                            if( ratedata.count === 0 ){
                                setRecipe( (prevRecipe) => ( { ...prevRecipe, canRate: true } ) );
                            }    
                        }
                        else{
                            setRecipe( (prevRecipe) => ( { ...prevRecipe, error: ratedata.error, errType: ratedata.errType,
                                                                          errCode: ratedata.errCode, errMsg: ratedata.errMsg,
                                                        } ) );
                        }
                    });
                }
            } ); 
        }                                       // *** Create new recipe *****************
        else{
            setRecipe( () => ( { ...RECIPE, 
                                 result: { ...RECIPE.result, ingredients: [], 
                                 author: { _id: userApi.getUser()._id, name: userApi.getUser().name, picTime: "" } } 
                                } ),
                       setRenew( (prevRenew) => !prevRenew )             // wait for rerender    
                     );
        }
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[filter, init]);

// =======================================================================
// ***** Reset WindowYposition after switching between edit-/show-mode 
useEffect( ()=> {

    if( init ){
        window.scrollTo( { top: back.pos, behavior: 'auto' } );
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[recipe.editMode])


const changeEditmode = () => {
    
    back.scrollPos = back.pos;
    setRecipe ( (prevRecipe) => ({...prevRecipe, editMode: !prevRecipe.editMode}));
}

// =================================================================================
const saveRecipe = async (event) => {


    setRecipe( {...recipe, state: 2});

    if( recipe.dataChanged || !recipe.result._id){

        const tmpRecipe = { 

            recipeid: recipe.result._id,
            name: recipe.result.name, 
            authorid: recipe.result.author._id,  
            description: recipe.result.description,
            keywords: recipe.result.keywords,
            portions: recipe.result.portions,
            instruction: recipe.result.instruction,
            time:  recipe.result.time,
            ratings: recipe.result.ratings, 
            ingredients: [],

        }
        
        // *** save new or changed ingredients

        for ( let ingNo = 0; ingNo < recipe.result.ingredients.length; ingNo++ ){

            let tmpIng = recipe.result.ingredients[ingNo];

            if( tmpIng.ingChanged ){

                const savedIng = await ingredientApi.createSync( { name: tmpIng.ingRef.name, unit: tmpIng.unit } );
                recipe.result.ingredients[ingNo].ingRef._id = savedIng.result._id;

                tmpRecipe.ingredients.push( {

                        ingRef: savedIng.result._id,
                        quantity: tmpIng.quantity,
                        unit: tmpIng.unit,
                        note: tmpIng.note
                })
                recipe.result.ingredients[ingNo].ingChanged = false;
            }
            else{
                tmpRecipe.ingredients.push( {

                    ingRef: tmpIng.ingRef._id,
                    quantity: tmpIng.quantity,
                    unit: tmpIng.unit,
                    note: tmpIng.note
                })
            }
        }

        // *** save recipe

        if( recipe.result._id ){
            recipeApi.update( tmpRecipe, (data) => {

                if( !data.error ){

                    setRecipe( (prevRecipe) => ( { ...prevRecipe, dataChanged: false, editMode: 0 } ) );
                    saveRecipePic( data.result._id, recipe.pictureObj );
                }
                else{

                    setRecipe( { ...recipe, state: 0, 
                                    error: data.error, errCode: data.errCode, errType: data.errType, errMsg: data.errMsg } );
                }
            })
        }
        else{
            recipeApi.create( tmpRecipe, (data) => {

                if( !data.error ){

                    setRecipe( (prevRecipe) => ( { ...prevRecipe, dataChanged: false, editMode: 0,
                                                   result: { ...prevRecipe.result, _id: data.result._id } } ) );
                    saveRecipePic( data.result._id, recipe.pictureObj );
                }
                else{
                    setRecipe( { ...recipe, state: 0, 
                                    error: data.error, errCode: data.errCode, errType: data.errType, errMsg: data.errMsg } );
                }
            })
        }    
    }
    else{
        saveRecipePic( recipe.result._id, recipe.pictureObj );
    }
}
// =================================================================================
const saveRecipePic = (recipeid, picobj) => {

    // **** saving picture

    if( recipe.picChanged ){

       recipeApi.picUpload( recipeid, picobj, (data) =>{
        
        if( !data.error ){

            setRecipe( (prevRecipe) => ( { ...prevRecipe, state: 0, 
                                        picChanged: false, picTime: data.result.picTime, picture: SERVER + "recipe/picture/" + data.result._id } ) );
        }
        else{
            setRecipe( { ...recipe, state: 0,
                         error: data.error, errCode: data.errCode, errType: data.errType, errMsg: data.errMsg } );
        }
      });    
    }    
    else{
        setRecipe( (prevRecipe) => ( { ...prevRecipe, state: 0 } ) );
    }
}
// ==============================================0
const deleteRecipe = () => {

    setDelMsg( false );

    recipeApi.del( recipe.result._id, (data) => {

        if( !data.error ){

            navigate("/recipes/authorid=" + userApi.getUser()._id); 
        }
        else{

            setRecipe( { ...recipe, state: 0, 
                            error: data.error, errCode: data.errCode, errType: data.errType, errMsg: data.errMsg } );
        }
    })
}
// ==================================================================

switch ( recipe.state ) {

    case 0: 
        return (
            <div className="recipeDetail">
                <div>
                    <div>

                        { ( auth && userApi.getUser()._id === recipe.result.author._id) &&
                            <>  
                                { recipe.editLineNo === -1 &&

                                    <div className={!recipe.editMode ? "imgButton editButton" : "imgButton showButton" } onClick={ changeEditmode }>
                                        <img src={recipe.editMode ? showButton : editButton} alt="edit"></img>
                                        <div>
                                        {  recipe.editMode ? 'Ansehen' : 'Bearbeiten' } 
                                        </div>
                                    </div>   
                                }
                                {( recipe.editLineNo === -1 && ( recipe.picChanged || recipe.dataChanged ) )  &&
                                    <div className="imgButton saveButton" onClick={ saveRecipe }>
                                         <img src={saveButton} alt="speichern"></img>
                                        <div>
                                         Speichern
                                        </div> 
                                    </div>   
                                }

                                {( !recipe.editMode && !recipe.picChanged && !recipe.dataChanged && recipe.result._id )  &&
                                    <div className="imgButton delButton" onClick={ () => setDelMsg( true ) }>
                                         <img src={delButton} alt="loeschen"></img>
                                        <div>
                                        L&ouml;schen
                                        </div> 
                                    </div>   
                                }
                            </>
                        } { (  (recipe.result._id || filter === 'NEW' || filter === 'RENEW' ) ) && 
                            <>
                                <Head recipe = { recipe } setRecipe = { setRecipe }/> 

                                <Ingredients recipe = { recipe } setRecipe = { setRecipe } />

                                <Instructions recipe = { recipe } setRecipe = { setRecipe }/>
                           </>     
                        }  
                    </div>
                    {(!recipe.error && delMsg) && 
                        
                        <ModalWin>
                            <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                            <div>
                                <p>
                                    Soll "{recipe.result.name}" wirklich gel&ouml;scht werden?
                                </p>
                                <p> 
                                    <button onClick={ deleteRecipe } >Ja</button> 
                                    <button onClick={ () => setDelMsg(  false ) } >Nein</button>
                                </p>
                             </div>
                        </ModalWin>
                    }
                    { recipe.error &&
                        <ModalWin>
                            <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                            <div>
                                 <Switch val={ recipe.errCode } style={{color: 'red'}}>
                                    <Case val = { -298 }>
                                        <h2 style={{color: 'red'}}>Bild ist zu groß!</h2>
                                        <p> Bildgröße überschreitet die max. Dateigröße von {PICMAXSIZE} MB.</p>
                                        <p> Bild konnte nicht gespeichert werden. </p>
                                        <p> <button onClick={() => setRecipe( { ...recipe,error:false } ) } >Ok</button></p>
                                    </Case>
                                    <Case val = { -20 }>
                                        <h2 style={{color: 'red'}}>Kein Rezeptname!</h2>
                                        <p> Bitte einen Namen für das Rezept vergeben.</p>
                                        <p> Kochrezept konnte nicht gespeichert werden. </p>
                                        <p> <button onClick={() => setRecipe( { ...recipe,error:false } ) } >Ok</button></p>
                                    </Case>
                                    <Case default>
                                        <p style={{color: 'red'}}>
                                            ({recipe.errCode}):&nbsp;{recipe.errType}<br></br>
                                            {recipe.errMsg}
                                        </p>
                                        <p> <button onClick={() => setRecipe( { ...recipe,error:false } ) } >Ok</button></p>
                                    </Case>
                                </Switch>
                            </div>    
                        </ModalWin>                            
                    }
                </div>
            </div>    
        );
    case 2:
        return (
            <BusyIndicator />  

        );
    default:
}


}
export default RecipeDetail;

