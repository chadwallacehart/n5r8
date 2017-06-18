/**
 * Created by chad on 3/7/17.
 */

const rover = require('../hardware/j5');


//let input = {[command: command, speed: speed]}

function commandParser(input){

    //todo: this won't work async
        switch (input.command){
            case "forward":
            case "f":
                rover.forward(input.duration, input.speed);
                return "forward" + ( input.duration ? (input.speed ? " for " + input.duration + " seconds at " + input.speed +" speed" :  " for " + input.duration + " seconds") : "");
            case "backward":
            case "b":
                rover.backward(input.duration, input.speed);
                return "backward" + (input.duration ? (input.speed ? " for " + input.duration + " seconds at " + input.speed +" speed" :  " for " + input.duration+ " seconds") : "");
            case "spinright":
            case "sr":
                rover.spinright(input.duration, input.speed);
                return "spinright" + (input.duration ? (input.speed ? " for " + input.duration + " seconds at " + input.speed +" speed" :  " for " + input.duration+ " seconds") : "");
            case "spinleft":
            case "sl":
                rover.spinleft(input.duration, input.speed);
                return "spinleft" + (input.duration ? (input.speed ? " for " + input.duration + " seconds at " + input.speed +" speed" :  " for " + input.duration+ " seconds") : "");
            case "off":
            case "o":
                rover.off();
                return "off";
            case "shoot":
            case "s":
                rover.shoot(input.duration);
                return "shooting " + input.duration ?  input.duration + " bullets" : "1 bullet";

        }

}

module.exports = commandParser;