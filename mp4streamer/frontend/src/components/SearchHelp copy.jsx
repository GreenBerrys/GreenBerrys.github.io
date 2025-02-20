import { showFilter } from "./NavMenu.jsx";
import "./SearchHelp.css";

export default function SearchHelp(){

const sample1  = () => showFilter( '*berlin', 'title', false );
const sample2a = () => showFilter( 'titel==der', 'title', false );
const sample2b = () => showFilter( 'titel==*der', 'title', false );
const sample3a = () => showFilter( 'titel!=der', 'title', false );
const sample3b = () => showFilter( 'titel!=*der', 'title', false );
const sample4  = () => showFilter( 'regie==*wim && title==*berlin', 'title', false );
const sample5  = () => showFilter( 'regie==*wim && title==*berlin || title==*paris', 'title', false );
const sample6  = () => showFilter( 'jahr==>1979 && jahr==<1985', 'title', false );



return(
    <div id="shelpWin"><h3>Suchhilfe: <br></br></h3>
    <table>
        <tbody>
            <tr>
                <th><b>xyz</b></th>
                <td><b>Beliebige Zeichenfolge</b></td>
            </tr>
            <tr>
                <th></th>
                <td>
                    Findet alle Filme deren Titel mit der Zeichenfolge "xyz" beginnt (wenn im Auswahlfeld daneben "Titel" eingestellt ist).
                </td>
            </tr>
            <tr><th></th><td></td></tr>
            <tr>
                <th><b>*</b></th>
                <td><b>Asterisk</b> (präfix)&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample1}><b>*</b>berlin</code></td>
            </tr>
            <tr>
                <th></th>        
                <td>
                    Findet alle Filme in deren Titel die Zeichenfolge "berlin" vorkommt (wenn im Auswahlfeld daneben "Titel" eingestellt ist).
                </td>
            </tr>
            <tr><th></th><td></td></tr>
            <tr><th></th><td></td></tr>
            <tr>
                <th><b>==</b></th>
                <td><b>gleich</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample2a}>titel<b>==</b>der</code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample2b}>titel<b>==</b>*der</code></td>
            </tr>
            <tr>
                <th></th>        
                <td>
                    Findet alle Filme deren Titel mit der Zeichenfolge "der" beginnt bzw. in deren Titel das Wort "der" vorkommt. <b>Unabhängig</b> von der Einstellung im Auswahlfeld daneben.
                </td>
            </tr>
            <tr><th></th><td></td></tr>
            <tr>
                <th><b>!=</b></th>
                <td><b>ungleich</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample3a}>titel<b>!=</b>der</code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample3b}>titel<b>!=</b>*der</code></td>
            </tr>
            <tr>
                <th></th>        
                <td>
                    Findet alle Filme deren Titel <b>nicht</b> mit der Zeichenfolge "der" beginnt bzw. in deren Titel <b>nicht</b> das Wort "der" vorkommt. <b>Unabhängig</b> von der Einstellung im Auswahlfeld daneben.
                </td>
            </tr>
            <tr><th></th><td></td></tr>
            <tr>                                        
                <th><b>&&</b></th>        
                <td><b>und</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample4}>regie==*wim <b>&&</b> titel==*berlin</code>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample6}>jahr==&gt;1979 <b>&&</b> jahr==&lt;1985</code></td>
           </tr>
            <tr>
                <th></th>        
                <td>
                    Verknüpft mehrere Suchbegriffe.<br></br> Findet alle Filme vom Regisseur "wim" in dessen Filmtitel die Zeichenfolge "berlin" vorkommt.<br></br>
                    Findet im zweiten Beispiel alle Filme vom Anfang der 80er Jahre.
                </td>
            </tr>
            <tr><th></th><td></td></tr>
            <tr>                                        
                <th><b>||</b></th>        
                <td><b>oder</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<code onClick={sample5}>regie==*wim && titel==*berlin <b>||</b> titel==*paris</code></td>
            </tr>
            <tr>
                <th></th>        
                <td>
                    Verknüpft mehrere Suchbegriffe.<br></br> Findet alle Filme vom Regisseur "wim" in dessen Titel die Zeichenfolge "berlin" oder "paris" vorkommt.
                </td>
            </tr>
        </tbody>
    </table>
</div>
)
}