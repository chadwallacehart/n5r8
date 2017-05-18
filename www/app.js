const express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

const roverControl = require('../control/comandParser.js');
const gameControl = require('../control/gameControl.js');
const loadWebRTC = require('../control/chromiumWebrtc.js');

let config = {preload: true};
const talk = require('/home/pi/dev/r2d2talk')(config);


//ToDo: move this into a module with debouncing?
const compass = require('../hardware/compass'),
    range = require('../hardware/range');

//console.log("process dir:" + process.cwd());

let webrtcRunning = false;

// Routing
app.use(express.static(__dirname + '/public'));

//added for CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app
    .get('/ping', function (req, res, next) {
        res.send('pong');
        console.log('ping');
    })

    //curl "http://192.168.100.29:2368/rest/forward-5-0.5;backward-1;spinright-2-0.66"

    .get('/', (req,res)=>{
        res.write('<p><a href="/rest">rest interface</a></p>');
        res.write('<p><a href="/gamepad">Gamepad interface for touch device</a></p>');
        res.write('<p><a href="/sensors">Sensor outpute</a></p>');
        res.write('<p><a href="/webrtc">WebRTC camera & audio</a></p>');
        res.end();

    })
    .get('/rest', (reg, res)=>{
        res.send('n5r8 rest interface. Command-Duration-Speed. Example: <a href="https://n5r8.local/rest/forward-5-0.5;backward-1;spinright-2-0.66">https://n5r8.local/rest/forward-5-0.5;backward-1;spinright-2-0.66</a>');
    })
    .get('/rest/:commands', (req, res)=>{

            let commands = req.params.commands.toLowerCase().split(';');

            res.setHeader('Content-Type', 'text/html');
            res.write("<p>"+"query string: " + JSON.stringify(commands) + "</p>");

            let index = 0;

            function parseCommand(command) {
                let params = command.split("-");
                let thisCommand = {};

                if (params[0])
                    thisCommand.command = params[0];
                if (params[1])
                    thisCommand.duration = params[1];
                if (params[2])
                    thisCommand.speed = params[2];

                setTimeout(() => {
                    res.write("<p>" + roverControl(thisCommand) + "</p>");
                    index++;
                    if(index === commands.length){
                        res.end("<p>"+"done"+"</p>");
                        console.log(JSON.stringify(commands));
                    }
                    else
                        parseCommand(commands[index]);
                }, (params[1] ? params[1] : 1) * 1000);

            }

            parseCommand(commands[index]);
    })

    .get('/sensors', function (req, res, next) {
        res.sendFile(__dirname + '/public/html/sensors.html');
    })

    .get('/gamepad', function (req, res, next) {
        if(webrtcRunning === false){
            loadWebRTC();
        }
        res.sendFile(__dirname + '/public/html/gamepad.html');
    })

    //Load Chromium to send the WebRTC stream and view it
    .get('/webrtc', function (req, res, next) {
        if(webrtcRunning === false){
            loadWebRTC();
        }
        res.sendFile(__dirname + '/public/html/webrtc-receiver.html');
    })

    //Send a WebRTC stream
    .get('/webrtc-send', function (req, res, next) {
        res.sendFile(__dirname + '/public/html/webrtc-sender.html');
    })

    //view the WebRTC stream
    .get('/webrtc-view', function (req, res, next) {
        res.sendFile(__dirname + '/public/html/webrtc-receiver.html');
    })

    //Say stuff
    .get('/talk/:words', (req, res, next)=> {
        let words = req.params.words;

        if(!req.params.words)
            words = "you need to enter something";

        talk(words);
        res.send("saying: " + words);
    })
;

//ToDo: setup environment vars
const port = process.env.PORT || 2368;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});


let senderReady = false;
let receiverReady = false;

io.on('connection', function (socket) {

    console.log("socket connected");
    socket.emit('init', {data: 'Hello socket'});

    socket.on('touchui', function (data){
        //console.log(data);
        gameControl(data);
    });


    socket.on('webrtc', function (message){
        console.log(socket.id + ' said: ', message);

        //todo: only allow one sender
        if(message === "sender-ready"){
            senderReady = true;

            if(receiverReady===true){
                console.log("Starting WebRTC call");
                socket.emit('webrtc', 'startCall');
            }
            else
                console.log("Receiver not ready for WebRTC call");

        }
        else if(message === "receiver-ready"){
            console.log("WebRTC receiver ready");
            receiverReady = true;

            if (senderReady === true) {
                console.log("Starting WebRTC call");
                socket.broadcast.emit('webrtc', 'startCall');
            }
            else
                console.log("Sender not ready for WebRTC call");

        }
        else if(message === "receiver-off"){
            console.log("WebRTC receiver off");
            receiverReady = false;
        }
        else if(message === "sender-off"){
            console.log("WebRTC sender off");
            senderReady = false;
        }
        else
            socket.broadcast.emit('webrtc', message);
    });



    //ToDo: remove this below
    /*
    socket.on('create or join', function(room) {
        console.log('Received request to create or join room ' + room);

        //ToDo: look into why this didn't work
        //let numClients = io.sockets.sockets.length;
        let numClients = Object.keys(io.sockets.sockets).length;
        console.log('Room ' + room + ' now has ' + numClients + ' client(s)');

        if (numClients === 1) {
            socket.join(room);
            console.log('Client ID ' + socket.id + ' created room ' + room);
            socket.emit('created', room, socket.id);
        } else if (numClients === 2) {
            console.log('Client ID ' + socket.id + ' joined room ' + room);
            // io.sockets.in(room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room, socket.id);
            io.sockets.in(room).emit('ready', room);
            socket.broadcast.emit('ready', room);
        } else { // max two clients
            socket.emit('full', room);
        }
    });

*/
    compass.on('data', (heading)=> {
        socket.emit('sensor', {type: "compass", heading: heading})});

    range.on('data', (data)=> {
        socket.emit('sensor', {type: "range", location: data.location, distance: data.distance})});
});