import React, { useState, useEffect, useRef } from "react";
import userApi from "../lib/userApi.js";
import "./Registration.css";
import Busy from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import { Switch, Case} from "../components/Switch.jsx";
import attention from "../Images/attention.png";


/********************************************************************************************
 * 
 */
function Registration() {

const [init, setInit] = useState(false);
const pw1 = useRef(); 
const pw2 = useRef(); 

const [user, setUser] = useState({

        state: 0,
        name: "",
        email: "",
        password: "",
        passrept: "",
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
        user.password = user.passrept = "";
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[init]);

const changeHandler = ( event ) => setUser( { ...user, [event.target.name]: event.target.value } );

const pwValid = ( event ) => user.password !== user.passrept ?
                    event.target.setCustomValidity( 'Wiederholung stimmt nicht überein!' ) :
                    event.target.setCustomValidity( '' );

const pwShow = ( event ) => {
   
    if( pw1.current.type === 'text' ){
        pw1.current.type = pw2.current.type ='password';
        event.target.innerText = 'Passwort anzeigen';
    } 
    else{
        pw1.current.type = pw2.current.type = 'text';
        event.target.innerText = 'Passwort verstecken';
    }
}                    
const submitHandler = ( event ) => {

    event.preventDefault();
    setUser( { ...user, state: 1 } );

    userApi.create( { name: user.name, email: user.email, password: user.password }, (data) => {
     
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
            userApi.sendMail( data.result._id, (result) => {

                    if(result.error){
                        setUser({ ...user,
                            state: 2,
                            error: result.error,
                            errCode: result.errCode,
                            errType: result.errType,
                            errMsg: result.errMsg
                        });
                    }
                    else{
                        setUser( { ...user, state: 9 ,  ...result.result } );
                    }
            })
        }
    })

}
// ========================================================================
switch( user.state ){

    case 0:                 // -----------------------------------> Data Input & create new User
        return (
            <div>
                <div className="registration">
                        <h1>Registrierung</h1>
                        <h3>Bitte eingeben:</h3>
                        <form action="" method="" onSubmit={submitHandler}>
                            <input  type="text" name="name" id="name" placeholder="Dein name" 
                                    minLength="3" maxLength="25" required autoFocus
                                    defaultValue={user.name}  onChange={ changeHandler } 
                            />
                            <label  htmlFor="name">Name:</label>
                            <input  type="email"  name="email"  id="email" placeholder="Deine Email-Adresse" 
                                    maxLength="30" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" required
                                    defaultValue={user.email} onChange={ changeHandler } 
                            />
                            <label  htmlFor="email">E-Mail:</label>
                            <input  type="password" name="password" id="password" placeholder="Passwort" 
                                    minLength="8" maxLength="20" required autoComplete="off"
                                    ref={pw1} defaultValue={user.password} onChange={ changeHandler } 
                            />
                            <label  htmlFor="password">Password:</label>
                            <input  type="password" name="passrept" id="passrept" placeholder="Passwort Wiederholung" 
                                    minLength="8" maxLength="20" required autoComplete="off"
                                    ref={pw2} defaultValue={user.passrept} onKeyUp={pwValid} onChange={ changeHandler } 
                            />
                            <label  htmlFor="passrept">Wiederholung:</label>
                            <p>
                            <button className="okButton" type="submit" id="submitButton">Abschicken</button>    
                            <button className="showButton" type="button" id="show" 
                                    onClick={pwShow}>Passwort anzeigen
                            </button>
                            </p>
                        </form>
                </div>
                { user.error &&    // -----------------------------------> Database error
                    <ModalWin>
                        <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                        <div>
                            <Switch val={ user.errCode }>
                                <Case val={-100}>
                                    <p style={{color: 'red'}}>
                                        Unter dieser E-Mail Adresse <br></br>
                                        ist bereits ein Benutzer registriert!
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
    case 2:                 // -----------------------------------> E-Mail provider error
        return (
            <ModalWin>
                <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                <div>
                    <p style={{color: 'red'}}><br></br><br></br>
                        ({user.errCode}):&nbsp;E-Mail Provider<br></br>
                        {user.errMsg}
                    </p>
                    <p><button onClick={() => setUser( { ...user, error: false, state: 0} ) }>Ok</button></p>
                </div>    
            </ModalWin>
        );        
    case 9:                 // -----------------------------------> all operations successfully completed
        return (
            <h1 style={{color: 'green'}}><br></br>
                An "{user.email}" wurde eine Aktivierungsmail gesendet<br></br><br></br>
                Bitte schau in deine Mails<br></br><br></br>
                 <>                                                   {/* show link to Ethereal preview if exist */}
                {user.preview ? <a href={user.preview} target={"_blank"} rel={"noreferrer"}>E-Mail ansehen</a> : <br></br>}
                </>
            </h1>
        );        
    default:
    }
}
export default Registration;

