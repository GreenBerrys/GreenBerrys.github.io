import React, { useState, useEffect} from "react";
import "./About.css";

function About() {

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
      <div className='aboutDci'>
        <h2> Rezeptor  (1.0)</h2>
        <p className="dtext">
        Rezeptor soll die Grundfunktionen einer Web-Seite zum Austausch von Kochrezepten abbilden.
        Eine erste Vorversion entstand im Rahmen unseres Final-Projektes bei DCI.
        Dies ist noch eine Testversion zum Austesten einzelner Funktionen und zur Fehlerbehebung.
        Vieles läßt sich auf jeden Fall noch verbessern.
        </p>  
        <p className="dtext">
            Viel Spass beim ausprobieren<br></br>
            Frank
        </p>
        <br></br><br></br><br></br><br></br>
        <h2 className="team">Unser DCI-Team</h2>
        <div className="profilConteiner">
            <div className="profil col-12">
                <div className="picstyle"> 
                    <img src="https://ca.slack-edge.com/T01E6N9JBNJ-U01DYPF8Y3H-31d7e4c1bce2-512"
                alt="" className="rounded-circle shadow-lg" style={{width: "230px", height: "230px"}} />
                <h3>Katerina Kazanovska</h3>
                </div>
                <p className="buttonstyle">
                <a href="https://github.com/RinaKazanovska" className="btn btn-secondary">GitHub<i className="bi bi-github"></i></a>
                <a href="https://www.linkedin.com/in/katerina-kazanovska-1921684b/" className="btn btn-secondary">LinkedIn<i className="bi bi-github"></i></a>
                </p>
            </div>
            <div className="profil col-12">
                <div className="picstyle"> 
                <img src="https://avatars.githubusercontent.com/u/72547097?s=460&u=5e9d06cbf9dd62f0606f598d74ec7c839f8c0068&v=4"
                    alt="" className="rounded-circle shadow-lg" style={{width: "230px", height: "230px"}}/>
                <h3>Christian Piñeros</h3>
                </div>
                <p className="buttonstyle">
                    <a href="https://github.com/capsgit" className="btn btn-secondary">GitHub<i className="bi bi-github"></i></a>
                    <a href="https://www.linkedin.com/in/christian-pineros-a971825b/" className="btn btn-secondary">LinkedIn<i className="bi bi-github"></i></a>
                </p>
            </div>
            <div className="profil col-12">
                <div className="picstyle"> 
                    <img src="https://ca.slack-edge.com/T01E6N9JBNJ-U01EA0XMGS2-ef4ac34e2617-512"
                    alt="" className="rounded-circle shadow-lg" style={{width: "230px", height: "230px"}}/>
                    <h3>Frank Hermann</h3>
                </div>
                <p className="buttonstyle">
                    <a href="https://github.com/GreenBerrys" className="btn btn-secondary">GitHub<i className="bi bi-github"></i></a>
                    <a href="https://www.linkedin.com/in/frank-hermann-88428b148" className="btn btn-secondary">LinkedIn<i className="bi bi-github"></i></a>
                </p>
            </div>
        </div>
      </div>    
    </div>
  );    
}

export default About;
