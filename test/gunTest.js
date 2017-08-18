/**
 * Created by chad on 6/24/17.
 */

const rover = require('../hardware/j5');
const keypress = require('keypress');


rover.init();
console.log("Press 's' to start gun, 'd' to stop.");

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    //console.log('got "keypress"', key);
    process.stdout.clearLine();


    if (key && key.ctrl && key.name === 'c') {
        process.exit();
    }

    if (key && key.name === 's'){
        console.log(" key command to start");
        rover.gun.start();
    }

    if (key && key.name === 'd'){
        console.log(" key command to stop");
        rover.gun.stop();
    }

});

process.stdin.setRawMode(true);
process.stdin.resume();