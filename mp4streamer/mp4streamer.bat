@echo off
%~d0
cd \mp4streamer\backend
if not exist database\movies.json (
	..\node mkJSONbase.js
)
..\node server.js
