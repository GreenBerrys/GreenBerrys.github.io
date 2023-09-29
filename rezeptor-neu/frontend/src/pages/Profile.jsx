import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import userApi from "../lib/userApi.js";
import Busy from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import { Switch, Case} from "../components/Switch.jsx";
import { SERVER, PICMAXSIZE } from "../config.js";
import attention from "../Images/attention.png";
import "./Profile.css";

/********************************************************************************************
 * 
 */
function Profile() {

const userPicFile = useRef();
const navigate = useNavigate();

const [init, setInit] = useState(false);

const [user, setUser] = useState({

        state: 0,
        _id: userApi.getUser()._id,
        name: "",
        description: "",
        email: "",
        picTime: "",
        picture: SERVER + "user/picture/" + userApi.getUser()._id,
        lastLogin: Date.now(),
        error: false,
        errCode: 0,
        errType: "",
        errMsg: "",
        dataChanged: false,
        picChanged: false,
        oldEmail: ""
});

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {

    if(init){
        window.scrollTo( { top: 0, behavior: 'auto' } );

        userApi.get( { userid: user._id } , ( data ) => {

                setUser( { ...user, state: 0 ,  ...data.result, oldEmail: data.result.email } );
        })
    }
    return () => {
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
},[init]);

// *** Inputhandler
const changeHandler = ( event ) => setUser( { ...user, [event.target.name]: event.target.value, dataChanged: true } );

// 
const saveUserData = () => {

    userApi.update( { userid: user._id, name: user.name, email: user.email, description: user.description }, (data) => {
     
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
            setUser( { ...user, state: 0 , ...data.result, picture: SERVER + "user/picture/" + data.result._id,
                       picChanged: false, dataChanged: false, error: false,
                       oldEmail: data.result.email 
                       } );
        }

    });
}

// *** save changes

const submitHandler = ( event ) => {

    event.preventDefault();
    setUser( { ...user, state: 2 } );   // *** enable busyindicator

    if( user.picChanged ){          // ******** Save userpicture if changed
      
        userApi.picUpload( user._id, userPicFile.current.files[0], ( result ) => {

            if( result.error ){
                setUser({ ...user,
                        state: 0,
                        error: result.error,
                        errCode: result.errCode,
                        errType: result.errType,
                        errMsg: result.errMsg
                });
            }
            else{
                if( user.dataChanged ){ // ********** Save userdata if changed

                    saveUserData();
                }
                else{
                    setUser( { ...user, state: 0, picture: SERVER + "user/picture/" + user._id, picChanged: false, error: false, picTime: result.result.picTime } );
                }
            }
        })
        
    }
    else{ // ********** Save only userdata 
        saveUserData();
    }
}

const pictureClick = (event) => userPicFile.current.click();

const pictureChange = (event) =>{

    if(userPicFile.current.files.length > 0){

        setUser( { ...user, picture: URL.createObjectURL( userPicFile.current.files[0] ), picChanged: true } );
    }
  }

const changePassword = (event) => setUser( { ...user, state: 1 } );

const showRecipes = (event) =>  navigate("/recipes/authorid=" + user._id);        


// ======================================================================== CHANGE PASSWORD

const pw1 = useRef();
const pw2 = useRef();
const pw3 = useRef();
    
const [pw, setPw] = useState({

    opassword: "",
    password: "",
    passrept: ""

});    

const savePassword = (event) => {

    event.preventDefault();
    setUser( { ...user, state: 2 } );

    userApi.pwChange( { userid: user._id, email: user.oldEmail, oldPassword: pw.opassword, newPassword: pw.password }, (result) => {
     
        if( result.error ){
            setUser({ ...user,
                    state: 1,
                    error: result.error,
                    errCode: result.errCode,
                    errType: result.errType,
                    errMsg: result.errMsg
            });
        }
        else{
            setUser( { ...user, state: 0, error: false } );
        }

    });

}
const cancelPassword = (event) => {

    setUser( { ...user, state: 0 } );
}

const pwChangeHandler = ( event ) => setPw( { ...pw, [event.target.name]: event.target.value } );

const pwValid = ( event ) => pw.password !== pw.passrept ?
                    event.target.setCustomValidity( 'Wiederholung stimmt nicht überein!' ) :
                    event.target.setCustomValidity( '' );

const pwShow = ( event ) => {
   
    if( pw1.current.type === 'text' ){
        pw1.current.type = pw2.current.type = pw3.current.type = 'password';
        event.target.innerText = 'Passwort anzeigen';
    } 
    else{
        pw1.current.type = pw2.current.type = pw3.current.type = 'text';
        event.target.innerText = 'Passwort verstecken';
    }
}                    

// ========================================================================
switch( user.state ){

    case 0:                 // -----------------------------------> Data Input & create new User
        return (
            <div>
                <div className="profile">
                    <br></br>
                    <form action="" method="">
                        <div>
                            { !user.picChanged ?
                                <img src={ user.picture + user.picTime } alt={"userpic"} onClick={pictureClick}></img>
                            :
                                <img src={ user.picture} alt={"userpic" } onClick={pictureClick}></img>
                            }
                            <input type="file" accept="image/*" 
                                style={{display: 'none'}} onChange={pictureChange}
                                ref={userPicFile} 
                            /> 
                        </div>
                        <div>
                            <div>
                                <label  htmlFor="name">Name:</label>
                                <input  type="text" name="name" id="name" placeholder="Dein name" 
                                        minLength="3" maxLength="25" required 
                                        defaultValue={user.name}  onChange={ changeHandler } 
                                />
                            </div>
                            <div>
                                <label  htmlFor="description">Motto:</label>
                                <input  type="text"  name="description"  id="description" placeholder="Dein Motto" 
                                        maxLength="50" 
                                        defaultValue={user.description} onChange={ changeHandler } 
                                />
                            </div>
                            <div>
                                <label  htmlFor="email">Email:</label>
                                <input  type="email"  name="email"  id="email" placeholder="Deine Email-Adresse" 
                                        maxLength="30" pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" required
                                        defaultValue={user.email} onChange={ changeHandler } 
                                />
                            </div>
                            <div>
                                <label  htmlFor="chngPassword">&nbsp;</label>
                                <button type="button" id="chngPassword" onClick={ changePassword }>Passwort &auml;ndern</button>    
                            </div>
                        </div>        
                    </form>
                    <button type="button"  onClick={ showRecipes }>Meine Rezepte</button>    
                    {(user.dataChanged || user.picChanged) && 
                        <button type="button" onClick={ submitHandler } > &Auml;nderungen speichern</button>
                    }
                </div>
                { user.error &&    // -----------------------------------> error
                    <ModalWin>
                        <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                        <div>
                            <Switch val={ user.errCode } style={{color: 'red'}}>
                                <Case val = { 11000 }>
                                    <p style={{color: 'red'}}>
                                        Unter dieser E-Mail Adresse <br></br>
                                        ist bereits ein Benutzer registriert!
                                    </p>
                                    <p><button onClick={() => setUser( { ...user, error: false} ) }>Ok</button></p>
                                </Case>
                                <Case val = { -188 }>
                                    <p style={{color: 'red'}}>
                                        Bild übersteigt die maximal zulässige Dateigröße ({PICMAXSIZE} MB)!<br></br>
                                        Bitte kleineres Bild nehmen..
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
    case 1:                  // -----------------------------------> Change password
        return (
            <div>
                <div className="pwchange">
                    <br></br>
                    <h3>Passwort &auml;ndern:</h3>
                    <form action="" method="" onSubmit={savePassword}>
                      <div>
                        <div>
                            <input  type="password"  name="opassword"  id="opassword" placeholder="Altes Passwort" 
                                    minLength="8" maxLength="20" required autoComplete="off"
                                    ref={pw1} defaultValue={pw.opassword} onChange={ pwChangeHandler } 
                            />
                            <label  htmlFor="opassword">altes Passwort:</label>
                        </div>
                        <div>
                            <input  type="password" name="password" id="password" placeholder="Neues Passwort" 
                                    minLength="8" maxLength="20" required autoComplete="off"
                                    ref={pw2} defaultValue={pw.password} onChange={ pwChangeHandler } 
                            />
                            <label  htmlFor="password">neues Passwort:</label>
                        </div>
                        <div>
                            <input  type="password" name="passrept" id="passrept" placeholder="Passwort Wiederholung" 
                                    minLength="8" maxLength="20" required autoComplete="off"
                                    ref={pw3} defaultValue={pw.passrept} onKeyUp={pwValid} onChange={ pwChangeHandler } 
                            />
                            <label  htmlFor="passrept">Wiederholung:</label>
                        </div>
                        <p>
                        <button className="okButton" type="submit" id="submitButton">Speichern</button>    
                        <button className="cancelButton" type="button" id="cancelButton"
                                onClick={cancelPassword}>Abbruch</button>    
                        <button className="showButton" type="button" id="show" 
                                onClick={pwShow}>Passwort anzeigen
                        </button>
                        </p>
                        </div>  
                    </form>
                </div>
                { user.error &&    // -----------------------------------> error
                    <ModalWin>
                        <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                        <div>
                            <Switch val={ user.errCode } style={{color: 'red'}}>
                                <Case val = { -192 }>
                                    <p style={{color: 'red'}}>
                                        Altes Passwort ist falsch! <br></br>
                                    </p>
                                    <p><button onClick={() => setUser( { ...user, error: false} ) }>Ok</button></p>
                                </Case>
                                <Case default>
                                    <p style={{color: 'red'}}>
                                        {user.errCode}:&nbsp;{user.errType}<br></br>
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
    case 2:                 // -----------------------------------> Show busy indicator
        return (
            <Busy/>
        );        
    default:
    }
}
export default Profile;

