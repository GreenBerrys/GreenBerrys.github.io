import React, { useState, useEffect, useRef, useContext } from "react";
import userApi from "../lib/userApi.js";
import "./Login.css";
import Busy from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import { Switch, Case} from "../components/Switch.jsx";
import attention from "../Images/attention.png";
import Context from "../AppContext.js";

/********************************************************************************************
 * 
 */
function Login() {

const { setAuth } = useContext( Context );
const [init, setInit] = useState(false);
const pw = useRef(); 

const [user, setUser] = useState({

        state: 0,
        name: "",
        email: "",
        password: "",
        error: false,
        errCode: 0,
        errType: "",
        errMsg: ""
});

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    if(init)
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

    userApi.login( { email: user.email, password: user.password }, (data) => {
     
        if( data.error ){
            setUser({ ...user,
                    state: 0,
                    error: data.error,
                    errCode: data.errCode,
                    errType: data.errType,
                    errMsg: data.errMsg
            });
        }
        else{
            setUser({ ...user, state: 9, ...data.result });
            userApi.setUser( data.result );
            sessionStorage.setItem('User', JSON.stringify(data.result));
            setAuth( true );
        }
    })

}
// ========================================================================
switch( user.state ){

    case 0:                 // -----------------------------------> Data Input & login
        return (
            <div>
                <div className="login">
                        <h1>Anmeldung</h1>
                        <h3>Bitte eingeben:</h3>
                        <form action="" method="" onSubmit={submitHandler}>
                            <input  type="email"  name="email"  id="email" placeholder="Deine Email-Adresse" 
                                    maxLength="30" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" required
                                    defaultValue={user.email} onChange={ changeHandler } autoFocus
                            />
                            <label  htmlFor="email">E-Mail:</label>
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
                { user.error &&  
                    <ModalWin>
                        <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                        <div>
                            <Switch val={ user.errCode } style={{color: 'red'}}>
                                <Case val = { -152 }>
                                    <p  style={{color: 'red'}}>
                                        Zu viele Anmeldeversuche!<br></br>
                                        Versuche es später erneut..
                                    </p>
                                    <p><button onClick={() => setUser( { ...user, error: false} ) }>Ok</button></p>
                                </Case>
                                <Case val = { -153 }>
                                    <p style={{color: 'red'}}>
                                        E-Mail Adresse oder Passwort falsch!<br></br>
                                        Bitte erneut eingeben..
                                    </p>
                                    <p><button onClick={() => setUser( { ...user, error: false} ) }>Ok</button></p>
                                </Case>
                                <Case val = { -154 }>
                                    <p style={{color: 'red'}}>
                                        E-Mail Adresse nicht bestätigt!<br></br>
                                        Bitte checke deine E-Mails..
                                    </p>
                                    <p><button onClick={() => setUser( { ...user, error: false} ) }>Ok</button></p>
                                </Case>
                                <Case default>
                                    <p style={{color: 'red'}}>
                                        ({user.errCode}):&nbsp;{user.errType}<br></br>
                                        {user.errMsg}
                                    </p>
                                    <p><button onClick={() => setUser( { ...user, error: false} ) }>Ok</button></p>
                                </Case>
                            </Switch>
                        </div>
                    </ModalWin>
                }    
            </div>
        );
    case 1:                 // -----------------------------------> Show busy indicator
        return (
            <Busy/>
        );        
    case 9:                 // -----------------------------------> all operations successfully completed
        return (
            <h1 style={{color: 'green'}}><br></br>
                Hi {user.name},<br></br><br></br>
                viel Spa&szlig; bei Rezeptor 
            </h1>
        );        
    default:
    };
}
export default Login;

