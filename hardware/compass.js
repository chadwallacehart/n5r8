/**
 * Created by chad on 1/27/17.
 */

const Readable = require('stream').Readable;
const util = require('util');

const nodeimu  = require('nodeimu');
const IMU = new nodeimu.IMU();

function headingCorrection(h, offset) {
    if (typeof offset ==='undefined')
        offset = 0;

    // Once you have your heading, you must then add your 'Declination Angle', which is the 'Error' of the magnetic field in your location.
    // Find yours here: http://www.magnetic-declination.com/
    const declinationAngle =  0.2563; //0.03106686;

    h += declinationAngle + offset;

    // Correct for when signs are reversed.
    if (h < 0)
        h += 2 * Math.PI;

    // Check for wrap due to addition of declination.
    if (h > 2 * Math.PI)
        h -= 2 * Math.PI;

    return h;
}

function headingToDegree(h) {
    // Convert radians to degrees for readability.
    return h * 180 / Math.PI;
}



//https://blog.yld.io/2016/01/13/using-streams/#.WIzRMUUrJ2M


class Compass extends Readable {
    constructor(opt) {
        super(opt);
    }
    _read() {
        let self = this;
    }
}

let intVar, lastHeading;

function getHeading(cb) {
    intVar = setInterval(function(){
        cb(null, IMU.getValue(fixHeading));
    }, compass.interval); //this._interval);
}

function fixHeading(err, heading) {
    if (err) console.log('error - no heading');
    else{
        let h = headingToDegree(headingCorrection(heading.tiltHeading));

        if ( Math.abs(h - lastHeading) > compass.changeThreshold || lastHeading == null) {
            compass.push(h.toFixed(0));
            lastHeading = h;

        }
    }
}

let compass = new Compass;

compass.interval = 500;
compass.changeThreshold = 1.1;
compass.init = function(){
    getHeading(function(err, heading) {
        if (err)
            compass.emitter.emit('error', err);
    });
};
compass.stop= function(){
    clearTimeout(intVar);
};

module.exports = compass;

