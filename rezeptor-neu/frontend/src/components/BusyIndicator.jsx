import React from "react";
import "./BusyIndicator.css"

function BusyIndicator( { showClass="busyIndicator" } ) {

  return (

        <div className={showClass}>
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
            <div></div><div></div><div></div>
        </div>


    )  
}
export default BusyIndicator;