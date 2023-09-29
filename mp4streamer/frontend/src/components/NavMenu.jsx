import "./NavMenu.css";
import React, { useState, useContext } from "react";
import logo from "../Images/logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import Context from "../AppContext.js";
import { AUTOLOGIN } from "../config.js";

function NavMenu() {

    const { auth } = useContext( Context );
    const [ showLinks, setShowLinks ] = useState(false);
    const [ search, setSearch ] = useState ({ 

            searchFor: "",
            searchIn: "title"

        }
    );
    const navigate = useNavigate();
  
    const handleShowLinks = () => {
      setShowLinks( showLinks => !showLinks );
    };
  
    const showLinksOff = () => {
        setShowLinks( false );
    };

    const changeHandler = ( event ) => setSearch( { ...search, [event.target.name]: event.target.value } );
    
    const submitHandler = (event) => {
  
        event.preventDefault();
        search.searchFor = search.searchFor.trim();
        let searchString = search.searchIn + '=';
        search.searchFor.length > 0 ? searchString += search.searchFor : searchString += '*';
        navigate("/videos/" + searchString);  
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
                        <option value="plot" readOnly>Plot</option>
                        <option value="director" readOnly>Regisseur</option>
                        <option value="genre" readOnly>Genre</option>
                        <option value="year" readOnly>Jahr</option>
                        <option value="country" readOnly>Land</option>
                </select>

                <button>🔎</button>
            </form>

            {/***** MENU **********/}


            <ul className="navbar_links">
                { 
                    !AUTOLOGIN &&
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
            </ul>
            {/***** HAMBURGER **********/}
            <button className="navbar_burger" onClick={ handleShowLinks }>
                <span></span>
          </button>
        </nav>
    );
  }
  
export default NavMenu;
