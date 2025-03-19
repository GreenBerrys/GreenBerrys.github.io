import React from "react";
import attention from "../Images/attention.png";
import ModalWin from "./ModalWin.jsx";
import "./Message.css"

export default function Message( {txt, func} ){

    return(
        <ModalWin>
                <img className="messagePicture" src={ attention } alt="achtung" />
                <div>
                    <p className="messageBodyText" >
                            {txt}
                    </p>
                    <p><button className="MessageOkButton" onClick={ func }>Ok</button></p> 
                </div>
        </ModalWin>    
    );
}
