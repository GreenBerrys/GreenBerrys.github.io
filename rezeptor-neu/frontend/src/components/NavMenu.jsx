import "./NavMenu.css";
import React, { useState, useContext } from "react";
import logo from "../Images/logo.svg";
import { NavLink, useNavigate } from "react-router-dom";
import Context from "../AppContext.js";
import userApi from "../lib/userApi";
import { useRef } from "react";

function NavMenu() {

    const { auth } = useContext( Context );
    const [showLinks, setShowLinks] = useState(false);
    const [search, setSearch] = useState ({ 

            searchFor: "",
            searchIn: "name"

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
        if( search.searchIn === "author"){
            search.searchFor = search.searchFor.trim();
            let searchString = 'name=';
            search.searchFor.length > 0 ? searchString += search.searchFor : searchString += '*';
            navigate("/authors/" + searchString);  
        }
        else{
            search.searchFor = search.searchFor.trim();
            let searchString = search.searchIn + '=';
            search.searchFor.length > 0 ? searchString += search.searchFor : searchString += '*';
            navigate("/recipes/" + searchString);  
        }
    }

    const newRecipeLink = useRef("/recipe/NEW");

    const newRecipeHandler = () => {

        showLinksOff();

        if(newRecipeLink.current === "/recipe/NEW")
            newRecipeLink.current = "/recipe/RENEW";
        else    
            newRecipeLink.current = "/recipe/NEW";
    }
     
    return (
        <nav className={`navbar ${showLinks ? "show-nav" : "hide-nav"} `}>
            
            {/***** LOGO **********/}
            <NavLink to="/" className="navbar_logo">
                <img src={logo} alt="Logo" />
            </NavLink>

            {/***** SEARCH FIELD **********/}
            <form className="navbar_search" 
               onSubmit={submitHandler}
            >
                <input name="searchFor" 
                    type="text" placeholder="Suchen.. (*)abc" 
                    autoFocus
                    onChange={changeHandler} 
                    value={search.searchFor}
                />

                <select name="searchIn" 
                        onChange={changeHandler} 
                        value={search.searchIn}
                        >
                        <option value="name" readOnly>Name</option>
                        <option value="description" readOnly>Beschr.</option>
                        <option value="author" readOnly>Autor</option>
                        <option value="keyword" readOnly>Stichwort</option>
                        {/* <option readOnly>Zutaten</option> */}

                        {/* {categories.map((cat, i) => <option key={i} readOnly>{cat.name}</option>)} */}
                </select>

                <button>🔎</button>
            </form>

            {/***** MENU **********/}
            <ul className="navbar_links">
                <li className="slideamination">
                    <NavLink to="/about" onClick={showLinksOff}>&Uuml;ber</NavLink>
                </li>

                { 
                    !auth ?
                    <>
                        <li className="slideamination">
                            <NavLink to="/login"  onClick={showLinksOff}>Anmelden</NavLink>
                        </li>
                        <li className="slideamination">
                            <NavLink to="/signin"  onClick={showLinksOff}>Registrieren</NavLink>
                        </li>
                    </>  
                    :
                    <>
                        <li className="slideamination">
                            <NavLink  to={ newRecipeLink.current } onClick={ newRecipeHandler }>Neues Rezept</NavLink> 
                        </li>
                        <li className="slideamination">
                            <NavLink to="/logout"  onClick={showLinksOff}>Abmelden</NavLink>
                        </li>
                        <li className="slideamination">
                            <NavLink to="/profile"  onClick={showLinksOff}>{ userApi.getUser().name }</NavLink>
                        </li>
                    </>
                }
          </ul>
            {/***** HAMBURGER **********/}
            <button className="navbar_burger" onClick={handleShowLinks}>
                <span></span>
          </button>
        </nav>
    );
  }
  
export default NavMenu;
