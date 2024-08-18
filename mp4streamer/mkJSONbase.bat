@echo off
set NODE_ENV=production
%~d0
cd \mp4streamer\backend
..\node mkJSONbase.js
cd \
pause