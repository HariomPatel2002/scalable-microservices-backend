const fs = require('fs');

if(!adminService.src.config.config.json){
    fs.createFile(adminService.src.config.config.json);
}

if(!authService.src.config.config.json){
    fs.createFile(authService.src.config.config.json);
}

if(!)

