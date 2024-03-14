import React, { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import userApi from "../lib/userApi";
import BusyIndicator from "../components/BusyIndicator.jsx";
import ModalWin from "../components/ModalWin.jsx";
import PageNav from "../components/PageNav.jsx";
import "./AuthorsView.css";
import attention from "../Images/attention.png";
import { SERVER } from "../config.js";


const  back = { page: 0, scrollPos: 0, pos: 0, filter: null };

const scrollHandler = () => back.pos = window.pageYOffset;

/********************************************************************************************
 * 
 */
function Authors() {

const [users, setUsers] = useState({
    
                            error: false,
                            page: -1,
                            lastPage: -1,
                            count: 0,
                            result: []
});


let { filter } = useParams(null);           // search parameter 

const [init, setInit] = useState(false);// Flag for component initialized
const pageEnd = useRef(0);              // reference to the pageend (Position)
const scrollTo = useRef(0);             // windowsposition to scroll
const busy = useRef(true);

// set flag for initialized
useEffect( () => {
    setInit( () => true );
},[]);

useEffect(() => {
    
    // install Handler for recording windows position
    if(init){
        window.addEventListener('scroll', scrollHandler, { passive: true });
    }
    // remove Handler and save windowsposition
    return () => {
        if(init){
            window.removeEventListener('scroll', scrollHandler);
            back.scrollPos = back.pos;
        }
    };
},[init]);

// Get users if filter changed
useEffect(() => {

    if(init){  

        if( back.filter !== filter ){
            back.filter = filter;
            back.page = 0;
            back.scrollPos = 1;
        }
        busy.current = true;
        setUsers({...users}, {result: []})
        userApi.find( {filter: back.filter, page: back.page } , (data) => {
                                                                            
                        busy.current = false;
                        setUsers(data); 
        }); 
    }    
// eslint-disable-next-line react-hooks/exhaustive-deps
},[filter,init]);

// Scroll to pageend after pageUp to previous page 
// or last position after browser go to previous pos
useEffect(() => {

    if(init){  

        switch(scrollTo.current){
            case 0:                 // scroll to last position
                window.scrollTo( { top: back.scrollPos, behavior: 'auto' } );
                break;
            case 1:                 // scroll to top
                window.scrollTo( { top: 0, behavior: 'auto' } );
                break;
            case 2:                 // scroll to bottom
                window.scrollTo( { top: pageEnd.current.offsetTop , behavior: 'auto' } );
                break;
            default:
                break;
        }
    }

// eslint-disable-next-line react-hooks/exhaustive-deps
},[users.page, filter]);       

// *** goto next page
const pageDown = () => { 
    
    scrollTo.current = 1;
    back.page = users.page +1;
    busy.current = true;
    setUsers({...users}, {result: []})
    userApi.find( { filter: filter, page: back.page }, (data) => {

                                busy.current = false;
                                setUsers(data) 
    } );
}
// *** goto previous page
const pageUp = () => {

    scrollTo.current = 2;
    back.page = users.page -1;
    busy.current = true;
    setUsers({...users}, {result: []})
    userApi.find( {filter: filter, page: back.page }, (data) => {
        
                                busy.current = false;
                                setUsers(data)  
    });
}
// *** read userpage
const setPage = ( pageNo = 0 ) => {

    scrollTo.current = 1;
    back.page = pageNo;
    busy.current = true;
    setUsers({...users}, {result: []})
    userApi.find( { filter: filter, page: back.page }, (data) => {

                                busy.current = false;
                                setUsers(data) 
    } );
}


if( !busy.current ){
    return (
        <div>
            { !users.error ?
                <div>
                    {users.count === 0 &&
                        <h2><br></br><br></br>Keine Autoren gefunden..</h2>
                    }    

                    <PageNav page = {users.page} lastPage = {users.lastPage } 
                             setPage = {setPage} pageUp = { pageUp } pageDown = { pageDown }
                    />
                    <div className="authorsView">
                        {   users.result.map((user, index) => {
                                return (  
                                            <div className="authorCard">
                                                <Link to= { { pathname: '/recipes/authorid='+user._id } } className="author" key={index}>
                                                        <img src={SERVER + 'user/picture/' + user._id + user.picTime } alt={"userpic"}/>
                                                        <div>{user.name}</div>
                                                </Link>
                                            </div>
                                        );
                            })
                        }
                    </div>

                    <PageNav page = {users.page} lastPage = {users.lastPage } 
                             setPage = {setPage} pageUp = { pageUp } pageDown = { pageDown }
                    />
                <span ref={pageEnd}></span>
                </div>
            : 
            <ModalWin>
                <img src={attention} alt="achtung" style={{width: 70, margin: "auto" }}/>
                <div>
                    <p style={{color: 'red'}}>
                        ({users.errCode}):&nbsp;{users.errType}<br></br>
                        {users.errMsg}
                     </p>
                    <p><button onClick={() => setUsers( { error:false, count: 0, result: [] } ) }>Ok</button></p>
                </div>
            </ModalWin>        
            }    
        </div>    
    );
    }
 else{
    return( <BusyIndicator/>);
 }   
}
export default Authors;

