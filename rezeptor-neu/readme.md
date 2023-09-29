# Rezeptor
Rezeptor soll die Grundfunktionen einer Web-Seite zum Austausch von Kochrezepten abbilden. Eine erste Vorversion entstand im Rahmen eines Final-Projektes bei DCI. Das ist die letzte neucodierte Version. Als Datenbank wird MongoDB benutzt. Wegen der besseren Handhabbarkeit befinden sich im Unterverzeichnis "docker" zwei Scripte zum starten & stoppen der Datenbank als Docker-Container (siehe unten).

## Benötigte Software
NodeJS 16/18 => https://github.com/nodesource/distributions \
Docker 	=> https://docs.docker.com

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
### MongoDb-Datenbank
Zum starten bzw. stoppen der Datenbank im Verzeichnis **docker** `./start` bzw. `./stop` im Terminal eingeben.
Um die Datenbank mit Testdaten zu füllen kann man im Verzeichnis **backend** `node seed` im Terminal eingeben.
Die Daten der Datenbank werden im Verzeichnis **~/.mongodb/database** gespeichert.

### Starten
Zuerst die Datenbank mit `./start` im Verzeichnis **docker** starten.
Dann den Server mit `node server` im Verzeichnis **backend** starten.
Danach kann man mit einem Browser über die URL 'localhost:3100'
auf die Anwendung zugreifen.

### Von seed.js erzeugte Testbenutzer

| Name | E-Mail | Password |
| :------------ | :------------ | :------------ |
| Robert | robert@mail.com | 12345678
| Beate | beate@mail.com | 12345678
| Heike | heike@mail.com | 12345678
| Dieter | dieter@mail.com | 12345678
| August | august@mail.com | 12345678
| Maria | maria@mail.com | 12345678
| Jörg | joerg@mail.com | 12345678
| Halime | halime@mail.com | 12345678
| Okan | okan@mail.com | 12345678

## Konfigurationsdateien
| Verzeichnis  |Datei   |   |
| :------------ | :------------ | :------------ |
|  backend | server.env  | Serverkonfiguration
|  backend/database |   database.env| Datenbankkonfiguration (local)
|   | atlas.env  | Datenbankkonfiguration (remote) - wenn die Datei ".remote" in diesem Verzeichnis existiert (Atlas-Cloud)
|  frontend/src | config.js  | Frontendkonfguration
|  backend/default | activationHtmlMail.html  | Registrierungsmail
|  | activationTextMail.txt | Registrierungsmail
|  | activationWelcome.html | Aktivierungsbestätigung
|  | favicon.ico | Programmlogo
|  | logo.png | Programmlogo
|  | recipeDefault.png | Defaultbild für Rezepte
|  | userDefault.png | Defaultbild für Benutzer
|  | urlNotFound.html | Fehlerseite für ungültige URL

## Testen der Registrierung
Zum testen der Registrierung wird ein gültiger Mail-Provider benötigt. Für Testzwecke kann man Ethereal von der Seite 'https://ethereal.email/' benutzen. Dort kann man sich ohne Anmeldung einen Test-Account erstellen.
Die Daten aus dem Abschnitt 'Nodemailer configuration' (siehe dort) einfach in die 'server.env' eintragen bevor man den server startet (siehe Abschnitt 'ETHEREAL' -> s_mail_user & s_mail_passw) in der 'server.env'.

Zum echten verschicken von Mails kann man sich einen Account (SMTP-Relay) bei Mail Jet https://www.mailjet.com/ erstellen ( bis ca. 300 Mails/Monat kostenlos).



### [&lArr;&nbsp;Zur&uuml;ck zur Startseite](http://greenberrys.github.io)





