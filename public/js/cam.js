var camera; 
var current_token;

ERROR_NETWORK = "https://user-images.githubusercontent.com/24841626/43708951-e86d62b2-996b-11e8-9d2c-ee2599db49e7.png"
NO_VIDEO = "https://as2.ftcdn.net/jpg/01/99/04/05/500_F_199040577_dJ1AmSFOohclmMFoC2MZFy1FdvxVSluw.jpg" 

function clear_canvas() {
    var canvas = document.getElementById("cam-image");
    ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

}

function set_canvas(image, token) {
    var canvas = $("#cam-" + token);
     
    if (canvas.length == 0) {
        canvas = document.createElement("canvas"); 
        canvas.id = `cam-${token}`;
        canvas.height = 540;
        canvas.width = 900; 
        document.body.appendChild(canvas);
    } 
    if (!camera[token]['is_stream']) {
        var ctx = canvas.getContext("2d");
        var img = new Image;
        img.onload = function() {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = image;
        camera[token]['is_stream'] = true; 
    }
}

function cam(id) {
    console.log(id);
    current_id = id;
    for (var tk in camera) {
        if (camera[tk]['id'] == id && camera[tk]['active']) {
            //document.location = "/camera?id=" + id; 
            document.getElementById("btn-video").style.display = "block";

            // create snapshot request to ws://<pi-camera>:8080
            var ws = new WebSocket(`ws://${camera[tk]['ip']}:8080/`);
            ws.onopen = function(evt) {
                ws.send("SNAPSHOT");
            }
            //while (ws.readyState != 1) {};
            //ws.send("SNAPSHOT");
        }
    }
}

function view_video(id) {
    document.location = "/camera?id=" + id;
}

function cam_backup(token) {
    if (!camera[token]['active']) return;
    
    // stop current camera
    if (current_token ) {
        $document.getElementById(`#cam-${current_token}`).hidden = true;
    } 
    
    current_token = token; 


    if (camera[token]['uri'] == '') 
    {
        set_canvas(NO_VIDEO, token); 
    }
    else {
        var uri = camera[token]['uri'];
        var canvas = $(`#cam-${token}`);
        if (canvas.length == 0) { 
            // create new element 
            var canvas = document.createElement("canvas");
            canvas.setAttribute("id", `cam-${token}`);
            document.body.appendChild(canvas);

            // Create h264 player
            var wsavc = new WSAvcPlayer(canvas, "webgl", 1, 35);
            wsavc.connect(uri);
            camera[token]['wsavc'] = wsavc; 
            console.log(camera[token]);            
        } else {
            if (!camera[token]['is_stream']) {
                console.log(camera[token]);
                var wsavc = camera[token]['wsavc']; 
                wsavc.playStream();
                camera[token]['is_stream'] = true; 
            }
            document.getElementById(`cam-${token}`).hidden = false; 
        }
    }
}

function httpGet()
{
    var theUrl = location.origin + "/data";
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

/*window.onload = function() {
    //camera = JSON.parse(httpGet());
   */

//window.setInterval('refresh()', 5000);

// Refresh or reload page.
function refresh() {
    var is_set = false; 
    camera = JSON.parse(httpGet());
    
    // update cam status
    for (var tk in camera) {
        document.getElementById("circle-" + tk).style.backgroundColor = camera[tk]['color'];
    }

    // update info status
    if (camera[current_token]['active']) {
        is_set = true;
        document.getElementById("number").innerHTML = "Number of transport : " + camera[current_token]['count'];
    }
    else {
        if (is_set) {
            is_set = false;
            document.getElementById("number").innerHTML = "";
            set_canvas(uri);
        } 
    }
}
