/**
 * Created by chad on 3/25/17.
 */

const rover = require('../hardware/j5');

let motorState = {rfOn: false, rbOn: false, lfOn: false, lbOn: false};


function gameControlOld(command) {
    //console.log(command.control);
    //console.log(motorState);
    switch (command.control) {
        case 'rfOn':
            //if right going backward, turn it off
            if (motorState.rbOn == true) {
                motorState.rbOn = false;
                rover.rb.stop();
                console.log("rb to rf");
            }
            //if rf isn't moving, turn it on
            if (motorState.rfOn == false) {
                motorState.rfOn = true;
                rover.rf.start();
                console.log("rf to high");
            }

            break;
        case 'rfOff':
            if (motorState.rfOn == true) {
                motorState.rfOn = false;
                rover.rf.stop();
                console.log("rf to low");
            }
            break;

        case 'rbOn':
            //if right going forward, turn it off
            if (motorState.rfOn == true) {
                motorState.rfOn = false;
                rover.rf.stop();
                console.log("rf to rb");
            }
            //if rb isn't moving, turn it on
            if (motorState.rbOn == false) {
                motorState.rbOn = true;
                rover.rb.start();
                console.log("rb to high");
            }
            break;

        case 'rbOff':
            if (motorState.rbOn == true) {
                motorState.rbOn = false;
                rover.rb.stop();
                console.log("rb to low");
            }
            break;

        case 'lfOn':
            //if left going backward, turn it off
            if (motorState.lbOn == true) {
                motorState.lbOn = false;
                rover.lb.stop();
                console.log("rb to rf");
            }
            //if lb isn't moving, turn it on
            if (motorState.lfOn == false) {
                motorState.lfOn = true;
                rover.lf.start();
                console.log("lb to high");
            }
            break;

        case 'lfOff':
            if (motorState.lfOn == true) {
                motorState.lfOn = false;
                rover.lf.stop();
                console.log("lf to low");
            }
            break;

        case 'lbOn':
            //if left going forward, turn it off
            if (motorState.lfOn == true) {
                motorState.lfOn = false;
                rover.lf.stop();
                console.log("changing rf to rb");
            }
            if (motorState.lbOn == false) {
                motorState.lbOn = true;
                rover.lb.start();
                console.log("lb to high");
            }
            break;
        case 'lbOff':
            if (motorState.lbOn == true) {
                motorState.lbOn = false;
                rover.lb.stop();
                console.log("lb to low");
            }
            break;
        case 'heartbeat':
            console.log('heartbeat');
            break;
        default:
            console.log("unrecognized control message: " + command.control);
    }
}


function gameControl(command) {
    //console.log(command.control);
    //console.log(motorState);
    switch (command.control) {
        case 'rfOn':
            rover.rb.stop();
            rover.rf.start();
            break;
        case 'rfOff':
            rover.rf.stop();
            break;
        case 'rbOn':
            rover.rf.stop();
            rover.rb.start();
            break;
        case 'rbOff':
            rover.rb.stop();
            break;

        case 'lfOn':
            rover.lb.stop();
            rover.lf.start();
            break;
        case 'lfOff':
            rover.lf.stop();
            break;
        case 'lbOn':
            rover.lf.stop();
            rover.lb.start();
            break;
        case 'lbOff':
            rover.lb.stop();
            break;
        case 'shootOn':
            rover.gun.start();
            break;
        case 'shootOff':
            rover.gun.stop();
            break;
        case 'heartbeat':
            console.log('heartbeat');
            break;
        default:
            console.log("unrecognized control message: " + command.control);

    }
}

module.exports = gameControl;