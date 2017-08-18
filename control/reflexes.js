/**
 * Created by chad on 5/18/17.
 */

//ToDo: this is causing a catch error
const talk = require('/home/pi/dev/r2d2talk')({preload: true});

const ledmatrix = require('../hardware/ledmatrix'),
    compass = require('../hardware/compass'),
    range = require('../hardware/range'),
    rover = require('../hardware/j5');
//www = require('../www/app.js');

/*
 r2.load()
 .then(() => {
 talk("hello")
 })
 .then(() => {
 ledmatrix.setColor("green", 2000) //todo: this isn't working
 })
 .catch((err) => console.log("r2d2talk error: " + err));
 */



//todo: move this to a 'command' module??
function rangeAttack(countdown, distance) {
    let ranges = [];

    range.on('data', (data) => {
        console.log('range:' + data.location + " reported " + data.distance);
        ranges.push(data.distance);
    });

    let timer = countdown;

    setTimeout(() => {

        clearInterval(t);

        t = setInterval(() => {

            if (ranges.length <= 1)
                return;

            let sum = 0;

            //Attempt at a debouncing to average out random values
            for (let i = 0; i < ranges.length; i++)
                sum += parseInt(ranges[i], 10);

            let avg = sum / ranges.length;
            if (avg < distance) {
                console.log("average: " + avg);
                rover.shoot(15);            //Shoot for 15 seconds, make this a parameter?

            }
            ranges = [];

        }, 400);


    }, timer * 1000);

    let t = setInterval(() => console.log("countdown: " + timer--), 1000);
}


class ProximityResponse {

    constructor(locations, distanceTrigger, interval, alarmWord) {
        this._locations = locations;                //An array of sensor names
        this._distanceTrigger = distanceTrigger;    //when to go off
        this._interval = interval;                  //how often to alarm
        this._triggers = new Array(locations.length);
        this._alarmWord = alarmWord;
        this._alarmActive = false;
        this._lastWarning = new Date();
    }

    start() {
        range.on('data', (data) => {

            this._locations.forEach((location, index) => {
                if (data.location === location)
                    if (data.distance <= this._distanceTrigger && data.distance > 0)
                        this._triggers[index] = true;
                    else if (data.distance > this._distanceTrigger)
                        this._triggers[index] = false;
                    else
                        console.error("Invalid range sensor data: " + JSON.stringify(data));
            });

            //console.log(this._triggers);


            if (this._triggers.every(e => e === true))
                this._alarmActive = true;
            else
                this._alarmActive = false;

        });


        //        if (this._triggers.every(e => e === true))
        let t = setInterval(() => {
            if(this._alarmActive === true){
                let now = new Date();
                if (now - this._lastWarning > this._interval){
                    emote("red", this._alarmWord, true);
                    this._lastWarning = now;
                }
            }
        }, 200)


    }

/*
    _old_warning() {
        let t = setInterval(() => {
            //emote("red", this._alarmWord);

            console.log("proximity warning: %s is %s ", this._locations, this._distanceTrigger);
            clearInterval(t);
            setTimeout(() => this._warning(), this._interval)
        }, 200)
    }
*/

}

//ToDo: Deprecate this?
function tooClose(distance, interval) {

//ToDo: rewrite this to work on any number of sensors instead of just a fixed 2
    let triggerActive = {
        left: false,
        right: false
    };

    range.on('data', (data) => {

        //console.log('range:' + data.location + " reported " + data.distance);

        if (data.distance < distance) {
            if (data.location === "front left")
                triggerActive.left = true;
            else if (data.location === "front right")
                triggerActive.right = true;
            else
                console.log("Invalid range sensor location: " + JSON.stringify(data));

        }
        else if (data.distance > distance) {
            if (data.location === "front left")
                triggerActive.left = false;
            else if (data.location === "front right")
                triggerActive.right = false;
            else
                console.log("Invalid range sensor location: " + JSON.stringify(data));
        }
    });

    function warning() {
        let t = setInterval(() => {
            if (triggerActive.left === true && triggerActive.right === true) {
                emote("red","front");
            }
            else if (triggerActive.left === true) {
                emote("red", "left");
            }
            else if (triggerActive.right === true) {
                emote("red", "right");
            }

            clearInterval(t);
            setTimeout(() => warning(), interval)
        }, 200)
    }

    warning();

}

let lastEmote = new Date();
let emoteInterval = {
    color: 100,
    words: 5000,
    motion: 1000
};

//to do: use Date() to limit how often thsi can go off from diff alarms
function emote(color, words, motion){
    let now = new Date();

    console.log("proximity alert %s", words);

    if(color)
        if(now - lastEmote > emoteInterval.color)
            ledmatrix.setColor(color, 100, null);

        if(words)
            if(now - lastEmote > emoteInterval.words)
                talk(words)
                    .catch((err)=>console.error("emote talk error: " + err));

    //Only stop motion if the Rover is moving
    if (rover.moving)
        if(now - lastEmote > emoteInterval.motion)
            if(motion)
                rover(off);

    lastEmote = now;
}

//let frontRight = new ProximityResponse(["front right"], 15, 2500, "front");


function controllerTest() {
    console.log("Calling start");
    rover.rf.start(0.5);
    setTimeout(function () {
        console.log("calling stop");
        rover.rf.stop()
    }, 5000);
}

//talk("hello");

function init() {
    talk("hello")
        .catch((err)=>console.error("talk error: " + err));

    let front = new ProximityResponse(["front right", "front left"], 15, 2500, "front").start();
    let back = new ProximityResponse(["rear right", "rear left"], 15, 2500, "rear").start();
    [["front right"], ["front left"], ["rear right"], ["rear left"]].forEach(e => new ProximityResponse(e, 15, 2500, e).start());

//        new ProximityResponse(["front right"], 15, 2500, "front right").start();

    //tooClose(15, 2500); //ToDo: put this back in once the module is fixed to work with more sensors
    console.log("reflexes loaded")
}

//catch((err) => console.error("Reflex onReady error: " + JSON.stringify(err)));


exports.init = init;