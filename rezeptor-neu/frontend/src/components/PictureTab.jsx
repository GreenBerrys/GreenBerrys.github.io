import React from "react";
import "./PictureTab.css"

function PictureTab( { pictures } ) {


  return (
    
    <ul className="pictureTab">

        { pictures.map( ( pic, id ) => (
            <li key={id}>
                <img src={ pic } alt="" />
            </li>
        ))}

    </ul>

  )  
}

export default PictureTab;