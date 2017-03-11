/**
 * Created by chad on 3/4/17.
 */

'use strict';

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

class Command {
    constructor(name, onFunc, offFunc){
    this.name = name;
    this.on = onFunc;
    this.off = offFunc;

    return this;
    }

    //arrow functions below to pass `this` through each level
    move(t, speed, cb){

        if (arguments.length <3 && typeof speed == 'function'){
            cb = speed;
            speed = null;
        }
        //todo: test this
        else
            if (arguments.length ==1 && typeof t == 'function'){
                cb = t;
                t = null;
                speed = null;
            }

        //todo: fix my promise setup to return a reject here
        if (hwReady == false)
            return;

        if (isNaN(t)) t = 1;

        let pulseDuration = 100; //how long to time each pulse in ms
        let pulseOn = false;
        let running = true;

        let timer;

        let pulse = ()=> {
            if (running == false)        //this might be redundant
                return false;

            pulseOn = !pulseOn;
            let duration = pulseOn == true ? Math.round(pulseDuration * speed) : Math.round(pulseDuration * (1 - speed));
            let state = ()=> (pulseOn == true ? this.on() : this.off());

            timer = setTimeout(() => {
                state();
                //console.log("I am " + (pulseOn == true ? "on" : "off" ) + " for " + duration);
                pulse();
            }, duration);
        };

        console.log(this.name + (speed ? " at " + speed + " speed": "" ) + " for " + t + " seconds");

        this.on();

        if (speed)
            if (!isNaN(speed))  //make sure it is a number
                pulse();

        if (cb)
            setTimeout( ()=> {
                    running = false;
                    clearTimeout(timer);
                    this.off();
                    cb();
                }
                , t * 1000);
        else
            return new Promise((resolve) => {
                setTimeout( ()=> {
                        running = false;
                        clearTimeout(timer);
                        this.off();
                        resolve();
                    }
                    , t * 1000);
            });
    }

}

let forward = new Command(
    "forward",
    function(){
        rf.high();
        lf.high();
    },
    function(){
        rf.low();
        lf.low();
    });

let backward = new Command("backward", ()=>{rb.high();lb.high();}, ()=>{lb.low(); rb.low()});
let spinright = new Command("spinright", ()=>{lf.high();rb.high();}, ()=>{lf.low(); rb.low()});
let spinleft = new Command("spinleft", ()=>{rf.high();lb.high();}, ()=>{rf.low(); lb.low()});


//todo: prototype this and use to create other functions
//todo: see why this doesn't seem to work below 50%
function oldForward(t, speed, cb) {
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
            state ^= 0x01;
            rf.write(state);
            lf.write(state);
            //console.log("I am " + (pulseOn == true ? "on" : "off" ) + " for " + duration + "ms");
            pulse();
        }, duration);
    }

    console.log("Forward: rf & lf" + (speed ? " at " + speed : "" ) + " for " + t + " seconds");

    rf.high();
    lf.high();

    if (speed)
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


function oldBackward(t) {
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

        //todo: remove this
        //newForward.move(1, 0.5, ()=>console.log("done"));
    });
}

function onReady(cb) {

    if (cb)
        emitter.on('hwReady', () => {
            console.log("starting");
            hwReady = true;
            cb();
        });
    else
        return new Promise((resolve) => {
            emitter.on('hwReady', () => {
                hwReady = true;
                resolve();
            });
        });
}

exports.init = init;

//todo: figure out why I always get a `this.on is not a function` when I try to export forward.move

exports.forward = forward;
exports.backward = backward;
exports.shoot = shoot;
exports.onReady = onReady;
