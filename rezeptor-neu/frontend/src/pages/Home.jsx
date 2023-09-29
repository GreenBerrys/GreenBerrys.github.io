import React, { useState, useEffect} from "react";
import Slider from "../components/PictureSlider.jsx";
import mosaic from "../Images/mosaik.png";

// -----------------------------------------------------------
import ofenkuerbis from "../Images/_ofenkuerbis.jpg";
import kartoffelsuppe from "../Images/_kartoffelsuppe.jpg";
import nudelauflauf from "../Images/_nudelauflauf.jpg";
import tacos from "../Images/_tacos.jpg";
import pexels5 from "../Images/_pexels5.jpg";
import pexels6 from "../Images/_pexels6.jpg";
import pexels10 from "../Images/_pexels10.jpg";
import lemon from "../Images/_lemon.jpg";
// -----------------------------------------------------------

const pictures = [ ofenkuerbis,kartoffelsuppe,nudelauflauf,tacos,pexels5,pexels6, pexels10, lemon ];


function Home() {

 const [init, setInit] = useState(false);// Flag for component initialized

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    
    if(init)
        window.scrollTo( { top: 0, behavior: 'auto' } );
    return () => {
    };
},[init]);

  return (
    <div>
        <h1>Rezeptor</h1>
        <p>ist eine Demo-Anwendung zum Austausch von und über Kochrezepte</p>
        <h3> Suchen, hochladen, teilen und noch wichtiger: kochen! </h3>

        {/* <Table pictures={pictures} />  {box-shadow: "1px 3px 7px 1px #7b6e60"} */}
        <img src={mosaic} alt="mosaic" style={{width:"65%", boxShadow: "10px 10px 20px 5px #7b6e60" }}></img>
        <br></br><br></br>
        <h1 >Worauf wartest du noch?</h1>
          <p>
            Suche dir schöne Rezepte, wir haben schon 28
          </p>
          <h4> Kommentare, Kochtipps und Rezepte teilen!</h4>
          <br></br><br></br>
            
        <Slider pics={pictures} /> 

        <br></br><br></br>
        <br></br><br></br>

    </div>
  );
}

export default Home;