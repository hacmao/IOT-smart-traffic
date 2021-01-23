const sqlite3 = require('sqlite3');
const db = new sqlite3.Database("./database/db.sqlite")

var active_camera;

module.exports = db.all("SELECT * from camera",[], (err, rows) => {
    active_camera = rows;
    
});

//console.log(active_camera);


