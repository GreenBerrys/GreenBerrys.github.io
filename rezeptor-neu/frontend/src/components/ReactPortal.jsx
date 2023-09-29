import { useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

// --------------> Create and append Wrappernode  
function createWrapperToBody( wrapperId ) {

    const wrapper = document.createElement( 'div' );
    wrapper.setAttribute( "id", wrapperId );
    document.body.appendChild( wrapper );
    return wrapper;
}

// -------------->  Set a default value for wrapperId prop if none provided
function ReactPortal({ children, wrapperId = "react-portal-wrapper" }) {

    const [wrapperElement, setWrapperElement] = useState(null);

    useLayoutEffect( () => {
        
        let wrapper = document.getElementById( wrapperId );
        let systemCreated = false;

        // If element is not found with wrapperId, create and append to body
        if ( !wrapper ) {
            systemCreated = true;
            wrapper = createWrapperToBody( wrapperId );
        }
        setWrapperElement( wrapper );

        // cleanup
        return () => {
            // delete the programatically created element
            if ( systemCreated && wrapper.parentNode ) {
                wrapper.parentNode.removeChild( wrapper );
            }
        }
    }, [wrapperId]);

    // wrapperElement state will be null on the very first render.
    if (wrapperElement === null) return null;

    return createPortal( children, wrapperElement );
}

export default ReactPortal;