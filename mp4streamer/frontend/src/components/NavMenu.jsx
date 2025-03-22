import "./NavMenu.css";
import React, { useState, useContext, useEffect } from "react";
import logo from "../Images/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { AUTOLOGIN } from "../config.js";
import SearchHelp from "./SearchHelp.jsx"
import Context from "../AppContext.js";

let searchSetter = null;
let oSearchFor = "";
let oSearchIn = "";

// called by the Videos componente to update the display
export const showFilter = ( searchFOR, searchIN = 'title', keep = true ) => { 
    
    searchFOR = searchFOR.replaceAll(".EQU.","==").replaceAll(".NOT.","!=").replaceAll(".AND.","&&").replaceAll(".OR.","||");

    searchSetter( { searchFor: searchFOR, searchIn: searchIN } );
    if( keep ){
        oSearchFor = searchFOR;
        oSearchIn = searchIN;
    }
}

// ===================================================================
export default function NavMenu() {

    const navigate = useNavigate();

    const { auth } = useContext( Context );
    const [ showLinks, setShowLinks ] = useState( false );
    const [ searchHelp, setSearchHelp ] = useState ( false ); 

    const [ search, setSearch ] = useState ({ 

        searchFor: "",
        searchIn: "title"
    });
    
    // export setter for showFilter
    useEffect( () => { searchSetter = setSearch; },[]);
    
    const handleShowLinks = () => setShowLinks( showLinks => !showLinks ); 
    const showLinksOff = () => setShowLinks( false ); 

    const changeHandler = ( event ) => setSearch( { ...search, [event.target.name]: event.target.value } ); 
    const submitHandler = (event) => {

        event.preventDefault();

        if( search.searchFor !== oSearchFor || search.searchIn !== oSearchIn ){

            search.searchFor = search.searchFor.trim();
            search.searchFor = search.searchFor.replaceAll("==",".EQU.").replaceAll("!=",".NOT.").replaceAll("&&",".AND.").replaceAll("||",".OR.");

            let searchString = search.searchIn + '=';
            search.searchFor.length > 0 ? searchString += search.searchFor : searchString += '*';

            navigate("/videos/" + searchString);
        }
    }

    return (
        <nav className={`navbar ${showLinks ? "show-nav" : "hide-nav"} `}>
            
            {/***** LOGO **********/}
            <NavLink to="/" className="navbar_logo">
                <img src={logo} alt="Logo" />
            </NavLink>

            {/***** SEARCH FIELD **********/}
            <form className="navbar_search" 
               onSubmit={ submitHandler }
            >
                <input name="searchFor" 
                    type="text" placeholder="Suchen.. (*><)abc" 
                    autoFocus
                    onChange={ changeHandler } 
                    value={ search.searchFor }
                />

                <select name="searchIn" 
                        onChange={ changeHandler } 
                        value={ search.searchIn }
                >
                        <option value="title" readOnly>Titel</option>
                        <option value="plot" readOnly>Handlung</option>
                        <option value="director" readOnly>Regie</option>
                        <option value="genre" readOnly>Genre</option>
                        <option value="year" readOnly>Jahr</option>
                        <option value="country" readOnly>Land</option>
                        <option value="tag" readOnly>Tag</option>
                </select>
                <button>&#128270;</button>
            </form>
            { auth &&
            <div id="shelpButton" onClick={ () => setSearchHelp( !searchHelp )} title="Suchhilfe an/aus">
                &nbsp;?&nbsp;&nbsp;
            </div>
            }
            { searchHelp && <SearchHelp setSearchHelp = { setSearchHelp }/> }    

            {/***** MENU **********/}
            <ul className="navbar_links">
                { 
                <>

                    {auth &&
                        <>
                            <li className="slideamination">
                                <NavLink to="/news"  onClick={ showLinksOff }>News</NavLink>
                            </li>
                            <li className="slideamination">
                                <NavLink to="/index/genres"  onClick={ showLinksOff }>Genres</NavLink>
                            </li>
                            <li className="slideamination">
                                <NavLink to="/index/tags"  onClick={ showLinksOff }>Tags</NavLink>
                            </li>
                            <li className="slideamination">
                                <NavLink to="/index/directors"  onClick={ showLinksOff }>Regie</NavLink>
                            </li>
                            <li className="slideamination">
                                <NavLink to="/index/actors"  onClick={ showLinksOff }>Darsteller</NavLink>
                            </li>
                            <li className="slideamination">
                                <div>&nbsp;&nbsp;&nbsp;</div>
                            </li>
                        </>
                    }
                    {!AUTOLOGIN &&
                    <>
                        {!auth ?
                            <>
                                <li className="slideamination">
                                    <NavLink to="/login"  onClick={ showLinksOff }>Anmelden</NavLink>
                                </li>
                            </>  
                            :
                            <>
                                <li className="slideamination">
                                    <NavLink to="/logout"  onClick={ showLinksOff }>Abmelden</NavLink>
                                </li>
                            </>
                        }
                    </>
                    }
                </>        
                }
            </ul>
                
            {/***** HAMBURGER **********/}
            <button className="navbar_burger" onClick={ handleShowLinks }>
                <span></span>
          </button>
        </nav>
    );
}
  
