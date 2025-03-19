/****************************************************************************
 * plotTrans() - remove special characters
 */
export const entityTrans = ( text) => {

    return( String(text).replaceAll( '&quot;', '\"' ).replaceAll( '&apos;', "\'" ).
                         replaceAll( "&amp;", "&" ).  
                         replaceAll( "&lt;", "<" ).replaceAll( "&gt;", ">" ).
                         replaceAll( "&#x0D;", "\n" )
    );
}
