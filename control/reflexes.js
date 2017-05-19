/**
 * Created by chad on 5/18/17.
 */

const ledmatrix = require('../hardware/ledmatrix'),
    compass = require('../hardware/compass'),
    range = require('../hardware/range'),
    rover = require('../hardware/j5'),
    www = require('../www/app.js');

//const r2 = require('/home/pi/dev/r2d2talk')();

const talk = require('/home/pi/dev/r2d2talk')().talk;

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


function tooClose(distance, interval) {

//ToDo: rewrite this to work on any number of sensors instead of just a fixed 2
    let triggerActive = {
        left: false,
        right: false
    };

    range.on('data', (data) => {

        //console.log('range:' + data.location + " reported " + data.distance);

        if (data.distance < distance) {
            if (data.location === "frontLeft")
                triggerActive.left = true;
            else if (data.location === "frontRight")
                triggerActive.right = true;
            else
                console.log("Invalid range sensor location: " + JSON.stringify(data));

        }
        else if (data.distance > distance) {
            if (data.location === "frontLeft")
                triggerActive.left = false;
            else if (data.location === "frontRight")
                triggerActive.right = false;
            else
                console.log("Invalid range sensor location: " + JSON.stringify(data));
        }
    });

    function warning() {
        let t = setInterval(() => {
            if (triggerActive.left === true && triggerActive.right === true) {
                talk("front");
            }
            else if (triggerActive.left === true) {
                talk("left");
            }
            else if (triggerActive.right === true) {
                talk("right");
            }

            clearInterval(t);
            setTimeout(() => warning(), interval)
        }, 200)
    }

    warning();

}



function controllerTest() {
    console.log("Calling start");
    rover.rf.start(0.5);
    setTimeout(function () {
        console.log("calling stop");
        rover.rf.stop()
    }, 5000);
}



rover.onReady()
    .then(() => {
        talk("hello");
        tooClose(15, 2500);
        console.log("loaded")
    })
    .catch((err)=>console.error("Reflex onReady error: " + JSON.stringify(err)));