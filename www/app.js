const express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io')(server);

const roverControl = require('../control/comandParser.js');
const gameControl = require('../control/gameControl.js');

//ToDo: move this into a module with debouncing?
const compass = require('../hardware/compass'),
    range = require('../hardware/range');

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

    .get('/rest/:commands', (req, res)=>{

        if (!req.params.commands){
            res.send("n4r8 rest interface")
        }
        else{
            let output = [];
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
        }
    })

    .get('/sensors', function (req, res, next) {
        res.sendFile(__dirname + '/public/html/sensors.html');
    })

    .get('/gamepad', function (req, res, next) {
        res.sendFile(__dirname + '/public/html/gamepad.html');
    })

;

//ToDo: setup environment vars
const port = process.env.PORT || 2368;

server.listen(port, function () {
    console.log('Server listening at port %d', port);
});


//p2p-socket.io tests
io.on('connection', function (socket) {

    console.log("socket connected");
    socket.emit('init', {data: 'Hello socket'});

    socket.on('touchui', function (data){
        //console.log(data);
        gameControl(data);
    });

    socket.on('webrtc', function (data){
        //console.log(data);

    });

    compass.on('data', (heading)=> {
        socket.emit('sensor', {type: "compass", heading: heading})});

    range.on('data', (data)=> {
        socket.emit('sensor', {type: "range", location: data.location, distance: data.distance})});
});