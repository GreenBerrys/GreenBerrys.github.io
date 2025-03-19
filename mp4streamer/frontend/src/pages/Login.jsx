import React, { useState, useEffect, useRef, useContext } from "react";
import userApi from "../lib/userApi.js";
import "./Login.css";
import Busy from "../components/BusyIndicator.jsx";
import Message from "../components/Message.jsx";
import Context from "../AppContext.js";
import { useNavigate } from "react-router-dom";
import bimage from '../Images/BackgroundPicture.jpg'


/********************************************************************************************
 * 
 */
function Login() {

const { auth, setAuth, setEdit } = useContext( Context );

const [init, setInit] = useState(false);
const pw = useRef(); 
const navigate = useNavigate();
  
const [user, setUser] = useState({

        state: 0,
        error: false,
        errMsg: "",
        edit: false
});

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    if(init)
        if( auth )
            navigate("/videos/*");  

        window.scrollTo( { top: 0, behavior: 'auto' } );
    return () => {
        user.password = "";
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[init]);

const changeHandler = ( event ) => setUser( { ...user, [event.target.name]: event.target.value } );

const pwShow = ( event ) => {
   
    if( pw.current.type === 'text' ){
        pw.current.type = 'password';
        event.target.innerText = 'Passwort anzeigen';
    } 
    else{
        pw.current.type = 'text';
        event.target.innerText = 'Passwort verstecken';
    }
}                    
const submitHandler = ( event ) => {

    event.preventDefault();
    setUser( { ...user, state: 1 } );

    userApi.login( { user: user.user, password: user.password }, (data) => {
     
        if( data.error ){
            setUser({ ...user,
                    state: 0,
                    error: true,
                    errMsg: data.errMsg
            });
            sessionStorage.removeItem("User");
        }
        else{
            setUser( { state:9, error:false, errMsg:"", edit: data.result[0].edit } )
            sessionStorage.setItem('User', JSON.stringify( { auth: true, edit: data.result[0].edit } ) );
            setAuth( () => true );
            setEdit( () => data.result[0].edit );
            navigate("/videos/*",{ replace: true });   
        }
    })

}
// ========================================================================
switch( user.state ){

    case 0:                 // -----------------------------------> Data Input & login
        return (
            <div style={ {  backgroundImage: `url(${bimage})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat', width: '100vw', height: '90vh', position: 'fixed', top: '30px' } }>
                
                <div className="login">
                        <h1>Anmeldung</h1>
                        <h3>Bitte eingeben:</h3>
                        <form action="" method="" onSubmit={submitHandler}>
                            <input  type="text"  name="user"  id="user" placeholder="Username" 
                                    maxLength="30" required
                                    defaultValue={user.user} onChange={ changeHandler } autoFocus
                            />
                            <label  htmlFor="user">Username:</label>
                            <input  type="password" name="password" id="password" placeholder="Passwort" 
                                    required autoComplete="off"
                                    ref={pw} defaultValue={user.password} onChange={ changeHandler } 
                            />
                            <label  htmlFor="password">Password:</label>
                            <p>
                            <button className="okButton" type="submit" id="submitButton">Abschicken</button>    
                            <button className="showButton" type="button" id="show" 
                                    onClick={pwShow}>Passwort anzeigen
                            </button>
                            </p>
                        </form>
                </div>
                
                { user.error && <Message txt={ user.errMsg } func={ ()=>setUser( { ...user, error: false} ) }/> }    
            </div>
        );
    case 1:                 // -----------------------------------> Show busy indicator
        return (
            <Busy/>
        );        
    case 9:                 // -----------------------------------> all operations successfully completed
        return (
            <h1 style={{color: 'green'}}><br></br>
                Hi
            </h1>

        );        
    default:
    };
}
export default Login;

