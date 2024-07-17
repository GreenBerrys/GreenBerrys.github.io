/********************************************************************************************************* 
 * 
 *  slideshow.js  (c) 2024 by Frank Hermann
 * 
 *  Universelle Klasse zum erzeugen von Slideshows.
 *  Erstellt eine Slideshow mit Vergrößerungsglass und drei Standardeffekten für die Seitenübergänge.
 *  Erzeugt automatisch die benötigten HTML-Tags und erstellt einen eigenen Style-Abschnitt mit der ID "_slideShow-CSS".
 *  Falls beim initialisieren bereits ein Style-Abschnitt mit dieser ID existiert wird der enthaltene CSS-Code an das
 *  Ende rangehängt. Dadurch kann man die von slideshow erzeugten CSS-Regeln überschreiben. 
 * 
 *  EINBINDEN MIT:     '<script src="slideshow.js"> </script>'
 * 
 *  ERZEUGEN EINER SLIDESHOW;
 *   
 *    Im Html-Code einen <div> - Tag mit einer ID anlegen: 
 * 
 *        z.B. < div id="mySlideshow" >< /div >
 * 
 *    Im <script> - Abschnitt ein entsprechendes slideshow-Objekt initialisieren:
 * 
 *        new slideshow( id, Dateiliste (, {Slideshow-Parameter}, {Button-parameter}, {Vergrößerungsglass-parameter} ) )  
 *  
 *        z.B:
 * 
 *           const eineShow = new slideshow( "mySlideshow", [ "bild1.jpg", "bild2.jpg", "bild3.jpg" ] );
 * 
 *           const eineShow = new slideshow( "mySlideshow", [ "bild1.jpg", "bild2.jpg", "bild3.jpg" ], { effect: "flip", width: "60vw" }, { hoverColor: "red" } );
 *
 *           const eineShow = new slideshow( "mySlideshow", [ "bild1.jpg", "bild2.jpg", "bild3.jpg" ], {}, {}, { activateOn: "rightClick" } );
 * 
 *    Alle Parameter werden als Objekte übergeben und sind optional.
 * 
 *  PARAMETER:
 * 
 *        Slideshow-Parameter:  effect:          Effect beim blättern zwischen den Bildern: "none" / "flip" / "fade" / "shift".   
 *                              width:           Breite als String analog CSS z.B "60vw" oder "200px".  
 *                              minWidth:        Mindestbreite als String analog CSS z.B "60vw" oder "200px".  
 *                              maxWidth:        Maximalbreite.
 *                              height:          Höhe.
 *                              minHeight:       Mindesthöhe.  
 *                              maxHeight:       Maximalhöhe.
 *                              margin:          Ränder analog CSS d.h. margin: oben rechts unten links. 
 *                              boxShadow:       Schatten analog zu CSS box-shadow.   
 *                              borderRadius:    Eckenrundung analog zu css border-radius.
 * 
 *        Button-Parameter:     size:            Buttongröße (am Besten zwischen 10 und 20).
 *                              color:           Schriftfarbe.  
 *                              backgroundColor: Hintergrundfarbe.
 *                              hoverColor:      Farbe wenn die Mouse über den Button fährt.
 *                              borderRadius:    Eckenrundung analog zu css border-radius.
 *
 *        Vergrößerungsglass:   enabled:         Vergrößerungsglass an/aus:      true / false
 *                              activateOn:      Maustaste zum an-/ausschalten:  linke Maustaste = "leftClick"  
 *                                                                               rechte Maustaste = "rightClick"
 *                              zoom:            Zoomfaktor: "1" = ca. doppelte Größe (hängt von der Bildgröße in der Datei ab).
 *                              width:           Breite analog CSS.
 *                              minWidth:        Mindestbreite als String analog CSS z.B "60vw" oder "200px".  
 *                              Height:          Höhe analog CSS.
 *                              minHeight:       Mindesthöhe.  
 *                              border:          Rahmen analog CSS border.
 *                              borderRadius:    Eckenrundung analog zu css border-radius.
 *
 * 
 *  Als letzte Parameter können zwei Callback-Funktion übergeben werden:
 * 
 *  Die erste  Callback-Funktion wird bei jedem Bildwechsel mit der Nummer des aktuellen Bildes aufgerufen.
 * 
 *      z.B.  const eineShow = new slideshow( "mySlideshow", [ "bild1.jpg", "bild2.jpg", "bild3.jpg" ], {}, {}, {}, callbackFunc );
 * 
 *      ruft bei jedem Bildwechsel die callback-Function auf:  ( Bildnr ) => { console.log("Bild Nr.", Bildnr ); } 
 *
 *
 *  Die zweite  Callback-Funktion wird bei jeder Größenänderung mit der Breite und Höhe in Pixeln des aktuellen Bildes aufgerufen.
 * 
 *      z.B.  const eineShow = new slideshow( "mySlideshow", [ "bild1.jpg", "bild2.jpg", "bild3.jpg" ], {}, {}, {}, null, callbackFunc );
 * 
 *      ruft bei jeder Größenänderung die callback-Function auf:  ( Breite, hoehe ) => { console.log("Size", Breite, hoehe ); } 
 *
 * 
*/
class slideshow {

    constructor ( ID, PICTURES=[ "SlideshowPicture.jpg", "SlideshowPicture.jpg" ], slideshowbox = {}, buttons = {}, glass = {}, 
                                                                                   noCallBack = null, resizeCallBack = null ) {
                 
        const sboxLayout = Object.assign( {}, { effect: "none", width: "60vw", height: "auto", margin: "auto", 
                                                minWidth: "none", maxWidth: "none", minHeight: "none", maxHeight: "none",
                                                boxShadow: "1px 3px 7px 3px darkgrey", borderRadius: "0" } , slideshowbox );
        
        const buttonLayout = Object.assign( {}, { size: "16px", color: "red", backgroundColor: "darkgray", hoverColor: "black", 
                                                  borderRadius: "3px 3px 3px 3px"}, buttons );

        const glassLayout = Object.assign( {}, { zoom: "1", width: "350px", height: "250px",  minHeight: "none", maxHeight: "none",
                                                 border: "3px solid #000", borderRadius: "5%", enabled: true, activateOn: "leftClick" }, glass );      
                                
        this.#effect = sboxLayout.effect;
        this.#zoomSize = parseFloat( glassLayout.zoom ) > 0.0 ? parseFloat( glassLayout.zoom ) : 1;
        this.#glassEnabled = glassLayout.enabled;
        this.#glassSwitch = glassLayout.activateOn === "rightClick" ? "contextmenu" : "click";
        
        if( noCallBack !== null ) { this.#noCallback = noCallBack; }
        if( resizeCallBack !== null ) { this.#resizeCallback = resizeCallBack; }
        
        this.#createCSS( ID, sboxLayout, glassLayout, buttonLayout );
        this.#createHTML ( ID, PICTURES );

        // Initialize handlers after site is completely loaded
        document.addEventListener( 'readystatechange', this.#initHandling.bind( this ) );

    }

    static #stylesheet = null;     
    static #userCSS = "";
    #root = null;
    // -------------------------------------- slideshow
    #noCallback = null;
    #resizeCallback = null;

    #effect = 'flip';
    #slides = [];
    #slideNo = 0;
    // -------------------------------------- magnifier glass 
    #glassEnabled = true;
    #glassSwitch = "click";
    #zoomSize = 1;
    // -------------------------------------- magnifier glass (intern)
    #glass = null;
    #width = 0;
    #height = 0;
    #zoom = 0;
    #img = null;

    #imgClickHandler = null;
    #glassClickHandler = null;
    #imgMoveHandler = null;
    #glassMoveHandler = null;
    
    // ===============================> slideshow handling

    #sleep( time ) { return new Promise( ( resolve ) => setTimeout( resolve, time ) ); }

    #plusSlide( e, n ) {

        // Prevent any other actions that may occur when moving over the image 
        e.preventDefault();
        this.#showSlide( this.#slideNo + n );
    }

    #showSlide( no ) {
                
        const dir = no > this.#slideNo ? true : false;

        this.#removeGlass();

        if ( no >= this.#slides.length ) { no = 0 } 
        if ( no < 0 ) { no = this.#slides.length -1 } 
        
        const slideOldImg = this.#slides[ this.#slideNo ].getElementsByTagName( 'img' )[ 0 ];
        const slideNewImg = this.#slides[ no ].getElementsByTagName( 'img' )[ 0 ];

        slideNewImg.style.zIndex = "1";
        slideNewImg.style.visibility = "visible";

        /* slideshow effects */
        if ( no !== this.#slideNo ){

            switch( this.#effect ){

                case "flip":

                    slideOldImg.parentNode.classList.toggle("slideshow-flip");
                    slideNewImg.parentNode.classList.toggle("slideshow-flip");

                    slideOldImg.parentNode.style.overflow="visible";
                    slideNewImg.parentNode.style.overflow="visible";

                    if(dir) {
                        slideOldImg.className=( "slideshow-flipRout" );
                        slideNewImg.className=( "slideshow-flipRin" );
                    }
                    else {
                        slideOldImg.className=( "slideshow-flipLout" );
                        slideNewImg.className=( "slideshow-flipLin" );
                    }
                    this.#sleep( 950 ).then( () => { 
                                                      slideOldImg.style.visibility = "hidden"; 
                                                      slideOldImg.style.zIndex = "0";
                                                      slideOldImg.parentNode.classList.toggle("slideshow-flip");
                                                      slideNewImg.parentNode.classList.toggle("slideshow-flip");
                                                      slideOldImg.parentNode.style.overflow="hidden";
                                                      slideNewImg.parentNode.style.overflow="hidden";
                                                    } );
                    break;
                
                case "fade":
                    slideOldImg.className="slideshow-fadeout";
                    slideNewImg.className="slideshow-fadein";
                    this.#sleep( 1350 ).then( () => { slideOldImg.style.visibility = "hidden"; 
                                                      slideOldImg.style.zIndex = "0"; } );
                    break;

                case "shift":
                    slideNewImg.style.boxShadow='1px 3px 7px 3px darkgrey'; 
                    if( dir ){
                        slideOldImg.className="slideshow-shiftLout";
                        slideNewImg.className="slideshow-shiftLin";
                    }    
                    else {
                        slideOldImg.className="slideshow-shiftRout";
                        slideNewImg.className="slideshow-shiftRin";
                    }
                    this.#sleep( 950 ).then( () => { slideOldImg.style.visibility = "hidden"; 
                                                     slideOldImg.style.zIndex = "0"; 
                                                     slideNewImg.style.boxShadow='0';} );
                    break; 

                default:
                    slideOldImg.style.visibility = "hidden"; 
                    slideOldImg.style.zIndex = "0";
                    break;  
            }
        }
        this.#slideNo = no;
        if( this.#noCallback !== null ) { this.#noCallback( no ); }
        this.#createGlass( slideNewImg );
    } 

    #setImgContainers ( slides ) {

        // use width & height from the first image
        const slideImg = slides[ 0 ].getElementsByTagName( 'img' )[ 0 ];

        this.#root.style.width = slideImg.width + 'px';
        this.#root.style.height = slideImg. height + 'px';

        for ( let i = 0; i < slides.length; i++ ) {
            slides[ i ].style.width = slideImg.width + 'px';
            slides[ i ].style.height = slideImg.height + 'px';
        }
    }

    // ===============================> magnifier glass handling

    #updateGlass( e ) {

        this.#glass.style.visibility === "hidden";
        this.#setImgContainers( this.#slides );
        this.#zoom = this.#zoomSize + ( this.#img.naturalWidth + this.#img.naturalHeight ) / 
                                      ( this.#img.width + this.#img.height );
        this.#glass.style.backgroundSize = ( this.#img.width * this.#zoom ) + "px " + 
                                           ( this.#img.height * this.#zoom ) + "px";
        this.#width = this.#glass.offsetWidth / 2;
        this.#height = this.#glass.offsetHeight / 2;

        if( this.#resizeCallback !== null ) { this.#resizeCallback( this.#img.offsetWidth, this.#img.offsetHeight ); }
    }

    #removeGlass() {

        if( this.#glass !== null ) {
            this.#glass.style.visibility = "hidden";

            if( this.#glassEnabled ) {
                // Remove mouse-handler
                this.#glass.removeEventListener( "mousemove", this.#glassMoveHandler );
                this.#img.removeEventListener( "mousemove", this.#imgMoveHandler );
                this.#glass.removeEventListener( this.#glassSwitch, this.#glassClickHandler );
                this.#img.removeEventListener( this.#glassSwitch, this.#imgClickHandler );
            }    
            this.#glass.remove();
            this.#glass = null;
        }
    }

    #createGlass( slideImage ) {

        this.#img = slideImage;

        this.#zoom = this.#zoomSize + ( this.#img.naturalWidth + this.#img.naturalHeight ) / 
                                      ( this.#img.width + this.#img.height );

        // Create magnifier glass
        this.#glass = document.createElement( "DIV" );
        this.#glass.setAttribute( "class", "slideshow-glass" );
        this.#glass.style.visibility = "hidden";

        // Insert magnifier glass
        this.#img.parentNode.insertBefore( this.#glass, this.#img );

        // Set background properties for the magnifier glass
        this.#glass.style.backgroundImage = "url('" + this.#img.src + "')";
        this.#glass.style.backgroundRepeat = "no-repeat";
        this.#glass.style.backgroundSize = ( this.#img.width * this.#zoom ) + "px " + 
                                           ( this.#img.height * this.#zoom ) + "px";
        
        this.#width = this.#glass.offsetWidth / 2;
        this.#height = this.#glass.offsetHeight / 2;

        if ( this.#glassEnabled ) {

            // Install handler for mouse-moving the magnifier glass over the image 
            this.#glassMoveHandler = this.#moveGlass.bind( this );
            this.#glass.addEventListener( 'mousemove', this.#glassMoveHandler );
            this.#imgMoveHandler = this.#moveGlass.bind( this );
            this.#img.addEventListener( 'mousemove', this.#imgMoveHandler );

            // Install handler for turning glass on/off 
            if ( this.#glassSwitch === "contextmenu" ) {
                this.#glassClickHandler = this.#mouseRightClick.bind( this );
                this.#imgClickHandler = this.#mouseRightClick.bind( this );
            }    
            else {
                this.#glassClickHandler = this.#mouseLeftClick.bind( this );
                this.#imgClickHandler = this.#mouseLeftClick.bind( this );
            }    
            this.#glass.addEventListener( this.#glassSwitch, this.#glassClickHandler );
            this.#img.addEventListener( this.#glassSwitch, this.#imgClickHandler );
        }
    }

    #mouseLeftClick( e ) {

        // Prevent any other actions that may occur when moving over the image 
        e.preventDefault();

        this.#glass.style.visibility === "hidden" ? this.#glass.style.visibility = "visible" : 
                                                    this.#glass.style.visibility = "hidden"; 
    }
    #mouseRightClick( e ) {

        // Prevent any other actions that may occur when moving over the image 
        e.preventDefault();

        this.#glass.style.visibility === "hidden" ? this.#glass.style.visibility = "visible" : 
                                                    this.#glass.style.visibility = "hidden"; 
        return( false );
    }
    #moveGlass( e ) {

        const IMG = this.#img, WIDTH = this.#width, HEIGHT = this.#height, ZOOM = this.#zoom;  

        let pos, x, y;

        // Prevent any other actions that may occur when moving over the image 
        e.preventDefault();

        // Get the cursor's x and y positions and the Y-pageoffset if window was scrolled down
        pos = this.#getCursorPos( e );
        x = pos.x;
        y = pos.y;

        // Prevent the magnifier glass from being positioned outside the image
        if ( x > IMG.width - ( WIDTH / ZOOM ) ) {
             x = IMG.width - ( WIDTH / ZOOM );
        }
        if ( x < WIDTH / ZOOM ) { x = WIDTH / ZOOM; }
        
        if ( y > IMG.height - ( HEIGHT / ZOOM ) ) {
             y = IMG.height - ( HEIGHT / ZOOM );
        }
        if ( y < HEIGHT / ZOOM ) { y = HEIGHT / ZOOM; }

        // Set the position of the magnifier glass
        let left = x - WIDTH;
        if( x + WIDTH > IMG.width ) { 
            left = IMG.width - this.#glass.offsetWidth; 
        }
        else if ( x - WIDTH < 0 ) { left = 0; };

        let top = y - HEIGHT;
        if( y + HEIGHT > IMG.height ) { 
            top = IMG.height - this.#glass.offsetHeight; 
        }
        else if ( y - HEIGHT < 0 ) { top = 0; }
        
        this.#glass.style.left = left + "px";
        this.#glass.style.top = top + "px";

        // Display what the magnifier glass "sees"
        this.#glass.style.backgroundPosition = "-" + ( ( x * ZOOM ) - WIDTH ) + "px -" + 
                                                     ( ( y * ZOOM ) - HEIGHT ) + "px";
    }
    #getCursorPos( e ) {
     
        let a, x = 0, y = 0;

        // Get the x and y positions of the image
        a = this.#img.getBoundingClientRect();
        
        // Calculate the cursor's x and y coordinates, relative to the image
        x = e.pageX - a.left;
        y = e.pageY - a.top;
        
        // Consider any page scrolling
        x = x - window.scrollX;  //.pageXOffset;
        y = y - window.scrollY;  //.pageYOffset;
        
        return { x : x, y : y };
    }
    
    // ===============================> initialization

    #initHandling() {    
        
        if ( document.readyState === "complete" ) {

            this.#slides = this.#root.getElementsByClassName( 'slideshow-slide' );

            this.#setImgContainers( this.#slides );
            this.#showSlide( this.#slideNo );

            // reinit glass after windowresizing 
            window.addEventListener( 'resize', this.#updateGlass.bind( this ), { passive: true } );

            // next/previous slide button
            const prevButton = document.getElementById( `slideshow-${this.#root.id}-prev` );
            prevButton.addEventListener( 'click', (e) => this.#plusSlide( e, -1 ) );
            const nextButton = document.getElementById( `slideshow-${this.#root.id}-next` );
            nextButton.addEventListener( 'click', (e) => this.#plusSlide( e, 1 ) );
        }
    }

    #createCSS( ID, sboxLayout, glassLayout, buttonLayout ) {

        const commonStyle =  
            '\n\n.slideshow {' +
            '\n    box-sizing: border-box;' +
            '\n    display: block;' +
            '\n    position: relative;' +
            '\n}' +
            '\n.slideshow-slide {' +
            '\n    position: absolute;' +
            '\n    overflow: hidden;' +
            '\n}' +
            '\n.slideshow-slide img {' +
            '\n    position: absolute;' +
            '\n    top: 0;' +
            '\n    visibility: hidden;' +
            '\n    backface-visibility: hidden;' +
            '\n}' +
            '\n.slideshow-prev, .slideshow-next {' +
            '\n    cursor: pointer;' +
            '\n    position: absolute;' +
            '\n    width: auto;' +
            '\n    font-weight: bolder;' +
            '\n    font-size: 20px;' +
            '\n    transition: 0.6s ease;' +
            '\n    user-select: none;' +
            '\n    z-index: 3;' +
            '\n    top: calc((100% - 50px) / 2);' +
            '\n}' +
            '\n.slideshow-prev {' +
            '\n    left: 0;' +
            '\n}' +
            '\n.slideshow-next {' +
            '\n    right: 0;' +
            '\n}' +
            '\n.slideshow-glass {' +
            '\n    position: absolute;' +
            '\n    cursor: none;' +
            '\n    z-index: 4;' +
            '\n}\n' +
            '\n/* --- Effects --- */\n' +
            '\n.slideshow-flip { ' +
            '\n    perspective: 1000px;' + 
            '\n    transform-origin: center center 0;' + 
            '\n    transform-style: preserve-3d;' + 
            '\n}' + 
            '\n.slideshow-fadein { animation: slideshow-fadein 1.4s; }' +
            '\n    @keyframes slideshow-fadein { from {opacity: 0} to {opacity: 1} }' + 
            '\n.slideshow-fadeout { animation: slideshow-fadeout 1.4s; }' +
            '\n    @keyframes slideshow-fadeout { from {opacity: 1} to {opacity: 0} }' + 
            '\n' + 
            '\n.slideshow-shiftRout { animation: slideshow-shiftRout 1s; }' +
            '\n    @keyframes slideshow-shiftRout { from {transform: translateX(0) } to {transform: translateX(100%)} }' +
            '\n.slideshow-shiftRin { animation: slideshow-shiftRin 1s; }' +
            '\n    @keyframes slideshow-shiftRin { from {transform: translateX(-100%)} to {transform: translateX(0)} }' +
            '\n.slideshow-shiftLout { animation: slideshow-shiftLout 1s; }' +
            '\n    @keyframes slideshow-shiftLout { from {transform: translateX(0)} to {transform: translateX(-100%)} }' +
            '\n.slideshow-shiftLin { animation: slideshow-shiftLin 1s; }' +
            '\n    @keyframes slideshow-shiftLin { from {transform: translateX(100%)} to {transform: translateX(0)} }' +
            '\n' + 
            '\n.slideshow-flipRout { animation: slideshow-flipRout 1s; }' +
            '\n    @keyframes slideshow-flipRout { from {transform: rotateY(0deg)} to {transform: rotateY(-180deg)} }' +
            '\n.slideshow-flipRin { animation: slideshow-flipRin 1s; }' +
            '\n    @keyframes slideshow-flipRin { from {transform: rotateY(180deg)} to {transform: rotateY(0deg)} }' +
            '\n.slideshow-flipLout { animation: slideshow-flipLout 1s; }' +
            '\n    @keyframes slideshow-flipLout { from {transform: rotateY(0deg)} to {transform: rotateY(180deg)} }' +
            '\n.slideshow-flipLin { animation: slideshow-flipLin 1s; }' +
            '\n    @keyframes slideshow-flipLin { from {transform: rotateY(-180deg)} to {transform: rotateY(0deg)} }' 
            
        // add new stylesheet for all slidebox-objects  
        if( !slideshow.#stylesheet ) {

            const cssOverwrite = document.head.querySelector("#_slideShow-CSS"); 

            if( cssOverwrite !== null ){ 

                slideshow.#stylesheet = cssOverwrite;
                slideshow.#userCSS = "\n\n/* ------ your CSS ------ */\n\n" + cssOverwrite.innerText; 
                slideshow.#stylesheet.innerHTML = commonStyle + slideshow.#userCSS;
            }    
            else {
                const styleNode = document.createElement( "style" );
                styleNode.id = "_slideShow-CSS";
                styleNode.appendChild( document.createTextNode( commonStyle ) );
                slideshow.#stylesheet = document.head.appendChild( styleNode );
            }    
        }

        const slideshowStyle = `\n\n/* -- ** ${ID} ** -- */` + 
        `\n#${ID} {` +
        `\n    margin: ${sboxLayout.margin};` +
         ( sboxLayout.boxShadow !== 'none' ? `\n    box-shadow: ${sboxLayout.boxShadow};` : "" ) +
         ( sboxLayout.borderRadius !== 'none' && sboxLayout.borderRadius !== '0' ? `\n    border-radius: ${sboxLayout.borderRadius};` : "" ) +
        `\n}\n` + 
        `\n#${ID} .slideshow-slide {` +
         ( sboxLayout.borderRadius !== 'none' && sboxLayout.borderRadius !== '0' ? `\n    border-radius: ${sboxLayout.borderRadius};` : "" ) +
        `\n}\n` + 
        `\n#${ID} .slideshow-slide img {` +
        `\n    width: ${sboxLayout.width};` +
        `\n    height: ${sboxLayout.height};` +
        ( sboxLayout.minWidth !== 'none' && sboxLayout.minWidth !== '0' ? `\n    min-width: ${sboxLayout.minWidth};` : "" ) +
        ( sboxLayout.maxWidth !== 'none' && sboxLayout.maxWidth !== '0' ? `\n    max-width: ${sboxLayout.maxWidth};` : "" ) +
        ( sboxLayout.minHeight !== 'none' && sboxLayout.minHeight !== '0' ? `\n    min-height: ${sboxLayout.minHeight};` : "" ) +
        ( sboxLayout.maxHeight !== 'none' && sboxLayout.maxHeight !== '0' ? `\n    max-height: ${sboxLayout.maxHeight};` : "" ) +
        ( sboxLayout.borderRadius !== 'none' && sboxLayout.borderRadius !== '0' ? `\n    border-radius: ${sboxLayout.borderRadius};` : "" ) +
        `\n}\n`; 

        const glassStyle =
        `\n#${ID} .slideshow-glass {` +
        `\n    width: ${glassLayout.width};` +
        `\n    height: ${glassLayout.height};` +
        ( glassLayout.minWidth !== 'none' && glassLayout.minWidth !== '0' ? `\n    min-width: ${glassLayout.minWidth};` : "" ) +
        ( glassLayout.minHeight !== 'none' && glassLayout.minHeight !== '0' ? `\n    min-height: ${glassLayout.minHeight};` : "" ) +
        `\n    border: ${glassLayout.border};` +
        ( glassLayout.borderRadius !== 'none' && glassLayout.borderRadius !== '0' ? `\n    border-radius: ${glassLayout.borderRadius};` : "" ) +
        `\n}\n`; 

        const buttonStyle =
        `\n#${ID} .slideshow-prev, #${ID} .slideshow-next {` +
        `\n    padding: ${buttonLayout.size};` +
        `\n    color: ${buttonLayout.color};` +
        `\n    background-color: ${buttonLayout.backgroundColor};` +
        `\n    border-radius: ${buttonLayout.borderRadius};` +
        `\n}\n`; 

        const buttonHoverStyle =
        `\n#${ID} .slideshow-prev:hover, #${ID} .slideshow-next:hover {` +
        `\n    background-color: ${buttonLayout.hoverColor};` +
        `\n}\n`; 

        const oldCSS = slideshow.#stylesheet.innerText;
        slideshow.#stylesheet.innerHTML = oldCSS.substr( 0, oldCSS.length - slideshow.#userCSS.length ) +
                                          slideshowStyle + glassStyle + buttonStyle + buttonHoverStyle +
                                          slideshow.#userCSS;

    }
    #createHTML ( ID, PICTURES )  {

        this.#root = document.getElementById( ID );
        this.#root.classList.add( "slideshow" );
        let slideDivs = "";
        for( const picture of PICTURES ){
            slideDivs += '\n<div class="slideshow-slide">' +
                         '\n    <img src="' + picture + '" alt="Slideshow Picture">' +
                         '\n</div>'
        }
        slideDivs += `\n    <a id="slideshow-${ID}-prev" class="slideshow-prev">&#10094;</a>` +
                     `\n    <a id="slideshow-${ID}-next" class="slideshow-next">&#10095;</a>`; 

        this.#root.innerHTML = slideDivs;
    }
 }
