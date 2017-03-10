/**
 * Created by chad on 3/4/17.
 */


/***** Johnny Five Setup *****/

const five = require("johnny-five"),
    Raspi = require("raspi-io");


const board = new five.Board({
    io: new Raspi()
});


const EventEmitter = require('events');
class MyEmitter extends EventEmitter {
}
const emitter = new MyEmitter();

let led, rf, rb, lf, lb, sound, disc;
let hwReady = false;

board.on("ready", function () {
    led = new five.Led('GPIO21');    //LED        | PIN40 | GPIO21 | green wire
    rf = new five.Pin('GPIO17');     //RF        | PIN11 | GPIO17 | green wire
    rb = new five.Pin('GPIO27');     //RB        | PIN13 | GPIO27 | red wire
    lf = new five.Pin('GPIO22');     //LF        | PIN15 | GPIO22 | white wire
    lb = new five.Pin('GPIO4');      //LB        | PIN7  | GPIO4  | yellow wire
    disc = new five.Pin('GPIO12');   //disc        | PIN21 | GPIO12 | white wire

    //initialize all the pins
    rf.low();
    rb.low();
    lf.low();
    lb.low();
    disc.low();

    emitter.emit('hwReady');
});

/***** Motor controls *****/

//todo: prototype this and use to create other functions
function forward(t, speed, cb) {
    if (hwReady == false)
        return false;

    if (isNaN(t)) t = 1;

    let pulseDuration = 100; //how long to time each pulse in ms
    let pulseOn = false;
    let running = true;
    let state = 0x00;
    let timer;

    function pulse() {
        if (running = false)        //this might be redundant
            return;

        pulseOn = !pulseOn;
        let duration = pulseOn == true ? Math.round(pulseDuration * speed) : Math.round(pulseDuration * (1 - speed));

        timer = setTimeout(() => {
            rf.write(state ^= 0x01);
            lf.write(state ^= 0x01);
            console.log("I am " + (pulseOn == true ? "on" : "off" ) + " for " + duration);
            pulse();
        }, duration);
    }

    console.log("Forward: pulsing rf & lf" + (speed ? " at" + speed:"" ) + " for " + t + " seconds");

    rf.high();
    lf.high();

    if(speed)
        if (!isNaN(speed))  //make sure it is a number
            pulse();

    if (cb)
        setTimeout(function () {
                running = false;
                clearTimeout(timer);
                rf.low();
                lf.low();
                cb(true);
            }
            , t * 1000);
    else
        return new Promise((resolve) => {
            setTimeout(function () {
                    running = false;
                    clearTimeout(timer);
                    rf.low();
                    lf.low();
                    resolve(true);
                }
                , t * 1000);
        });
}


function backward(t) {
    if (hwReady == false)
        return;

    if (isNaN(t)) t = 1;
    console.log("Backward: toggling rb & lb for " + t + " seconds");
    rb.high();
    lb.high();
    setTimeout(function () {
            rb.low();
            lb.low();
        }
        , 1000);
}


function shoot(t) {
    if (hwReady == false)
        return;

    if (isNaN(t)) t = 10;
    console.log("Toggling disc launcher on for " + t + " seconds");
    disc.high();
    setTimeout(function () {
            disc.low();
        }
        , t * 1000);
}

function off() {
    console.log("Turning everything off");
    //re-initialize all the pins
    rf.low();
    rb.low();
    lf.low();
    lb.low();
    disc.low();
}

/***** Exports functions *****/

function init() {
    emitter.on('hwReady', () => {
        hwReady = true;
        led.blink(1000);
        console.log("Johnny Five hardware initialized");
    });
}

exports.init = init;
exports.forward = forward;
exports.shoot = shoot;
exports.emitter = emitter;