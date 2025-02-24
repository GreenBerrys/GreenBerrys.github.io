import { showFilter } from "./NavMenu.jsx";
import "./SearchHelp.css";

export default function SearchHelp(){

const sample1  = () => showFilter( '*berlin', 'title', false );
const sample2a = () => showFilter( 'titel==der', 'title', false );
const sample2b = () => showFilter( 'titel==*der', 'title', false );
const sample3a = () => showFilter( 'titel!=der', 'title', false );
const sample3b = () => showFilter( 'titel!=*der', 'title', false );
const sample4  = () => showFilter( 'regie==*wim && title==*paris', 'title', false );
const sample5  = () => showFilter( 'regie==*wim && title==*berlin || title==*paris', 'title', false );
const sample6  = () => showFilter( 'jahr==>1979 && jahr==<1985', 'title', false );



return(
    <div id="shelpWin"><h3>Suchhilfe: <br></br></h3>


    <table>
        <tbody>
            <tr>
                <td><b>xyz</b></td>
                <td colSpan="2"><b>Beliebige Zeichenfolge</b></td>
            </tr>
            <tr>
                <td></td>
                <td colSpan="2">
                    Findet alle Filme deren Titel mit der Zeichenfolge "xyz" <b>beginnen</b> (wenn im Auswahlfeld daneben "Titel" eingestellt ist).
                </td>
            </tr>
            <tr>
                <td><b>*</b></td>
                <td><b>Asterisk</b></td>
                <td><code onClick={sample1}>(präfix)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<b>*</b>berlin</code></td>
            </tr>
            <tr>
                <td></td>        
                <td colSpan="2">
                    Findet alle Filme deren Titel die Zeichenfolge "berlin" <b>enthält</b> (wenn im Auswahlfeld daneben "Titel" eingestellt ist).
                </td>
            </tr>
            <tr><td colSpan="3"></td></tr>
            <tr>
                <td><b>==</b></td>
                <td><b>gleich</b></td>
                <td><code onClick={sample2a}>titel<b>==</b>der</code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample2b}>titel<b>==</b>*der</code></td>
            </tr>
            <tr>
                <td></td>        
                <td  colSpan="2">
                    Findet alle Filme deren Titel mit der Zeichenfolge "der" beginnt bzw. in deren Titel das Wort "der" vorkommt. <b>Unabhängig</b> von der Einstellung im Auswahlfeld daneben.
                </td>
            </tr>
            <tr>
                <td><b>!=</b></td>
                <td><b>ungleich</b></td>
                <td><code onClick={sample3a}>titel<b>!=</b>der</code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample3b}>titel<b>!=</b>*der</code></td>
            </tr>
            <tr>
                <td></td>        
                <td  colSpan="2">
                    Findet alle Filme deren Titel <b>nicht</b> mit der Zeichenfolge "der" beginnt bzw. in deren Titel <b>nicht</b> das Wort "der" vorkommt. <b>Unabhängig</b> von der Einstellung im Auswahlfeld daneben.
                </td>
            </tr>
            <tr><td colSpan="3"></td></tr>
            <tr>
                <td ><b>&&</b></td>        
                <td><b>und</b></td>
                <td><code onClick={sample4}>regie==*wim <b>&&</b> titel==*paris</code><br></br><code onClick={sample6}>jahr==&gt;1979 <b>&&</b> jahr==&lt;1985</code></td>
            </tr>
            <tr>
                <td></td>
                <td colSpan="2">
                    Verknüpft mehrere Suchbegriffe.<br></br> Findet alle Filme vom Regisseur "wim" in dessen Filmtitel die Zeichenfolge "paris" vorkommt.
                    Findet im zweiten Beispiel alle Filme vom Anfang der 80er Jahre.
                </td>
            </tr>
            <tr>                                        
                <td><b>||</b></td>        
                <td><b>oder</b></td>
                <td><code onClick={sample5}>regie==*wim && titel==*berlin <b>||</b> titel==*paris</code></td>
            </tr>
            <tr>
                <td></td>        
                <td colSpan="2">
                    Verknüpft mehrere Suchbegriffe.<br></br> Findet alle Filme vom Regisseur "wim" in dessen Titel die Zeichenfolge "berlin" oder "paris" vorkommt.
                </td>
            </tr>
        </tbody>
    </table>
</div>
)
}