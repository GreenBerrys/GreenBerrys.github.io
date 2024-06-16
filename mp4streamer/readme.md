# mp4streamer
Die Idee ist Verzeichnisse rekursiv abzusuchen und alle gefundenen MP4-Videos in einer JSON-Datei ('movies.json') einzutragen. Dabei werden von [Kodi](https://kodi.tv/) (über die [Export-Funktion](https://kodi.wiki/view/Import-export_library/Video)) erzeugte NFO-Dateien mit eingelesen. Die erzeugte JSON-Datei kann danach wie eine Datenbank durchsucht und die gefundenen Videos per streaming angesehen werden. 

## Benötigte Software
**NodeJS 18** => https://github.com/nodesource/distributions \
Binaries (ohne Installation) => https://nodejs.org/download/release/latest-v18.x \
(Für Windows nur nodevars.bat ausführen - siehe README.md)

## Installation & Start
### Backend erstellen
Im Verzeichnis **backend** im Terminal mit:
```
npm i
```
### Frontend erstellen
Im Verzeichnis **frontend** im Terminal mit :
```
npm i
npm run build
```
### JSON-Datei 'movies.json' erzeugen
Dazu muß das Tool **mkJSONbase.js** im Verzeichnis **backend** mit `node mkJSONbase` aufgerufen werden. mkJSONbase sucht das Unterverzeichnis **backend/public** ab. Verknüpfungen/symbolische Links auf andere Laufwerke und Verzeichnisse werden dabei mit abgesucht. Am einfachsten ist es, wenn man diese vorher im public-Verzeichnis anlegt.
Zum testen kann die Datei 'testdata.7z' in diesem Verzeichnis entpackt werden.

### Starten
Denn Server mit `node server` im Verzeichnis **backend** starten.
Danach kann man mit einem Browser über die URL 'localhost:3100'
auf die Anwendung zugreifen.

Username & password stehen in der 'server.env' im backend-Verzeichnis (Vorgabe: 'c99').
## Konfigurationsdateien
| Verzeichnis  |Datei   |   |
| :------------ | :------------ | :------------ |
|  backend | server.env  | Serverkonfiguration
|  frontend/src | config.js | Frontendkonfiguration

### Nützliche Tools zum schneiden & konvertieren
https://avidemux.sourceforge.net/ \
https://xmedia-recode.de/ \
https://handbrake.fr/ 

[Einstellungen in Avidemux zum hochskalieren von SD-Filmen](https://greenberrys.github.io/xAvidemuxCFG)


## Just for fun - als Datenträgerverzeichnis (Windows)

#### Einstellungen in der config.js (frontend\src):
```
export const SERVER = "http://localhost:3100/";
export const AUTOLOGIN = true;
```
#### Einstellungen in der **server.env** (backend):
```
PORT=3100
s_URL=http://localhost
s_AUTOLOGIN=true
s_SAVEDRVLETTER=false
s_AUTOSTART=true
```
#### Alles wie oben beschrieben mit "npm i" & "npm run build" erstellen.

- danach auf dem Datenträger das Verzeichnis "**mp4streamer**" anlegen.
- Unterverzeichnis "**backend**" dorthin kopieren.
- Unterverzeichnis "**frontend**" im Verzeichnis "mp4streamer" erstellen.
- Unterverzeichnis "**frontend\build**" dorthin kopieren.
- Die datei "**node.exe**" [(Windows-binary)](https://nodejs.org/download/release/latest-v18.x ) ins Verzeichnis "**mp4streamer**" kopieren.
- die beiden Batch-Dateien "**mp4streamer.bat**" und "**mkJSONbase.bat**"
  ins Hauptverzeichnis das Datenträgers kopieren.

- Verknüpfungen auf die Filmverzeichnisse des Datenträgers
  in "**backend\public**" erstellen.
	
- Zum schluß "mkJSONbase.bat" ausführen um die "movies.json" anzulegen.

Zum **starten mp4streamer.bat** ausführen (im Explorer klicken). \
Zum **aktualisieren mkJSONbase.bat** ausführen (im Explorer klicken).

### [&lArr;&nbsp;Zur&uuml;ck zur Startseite](http://greenberrys.github.io)

