/**
 * Created by chad on 1/24/17.
 */
const ledmatrix = require("sense-hat-led");
//var Promise = require('promise');

const color = {
    red: [255, 0, 0],
    green: [0, 255, 0],
    blue: [0, 0, 255],
    purple: [102,0,204],
    pink: [255,0,255],
    orange: [255,128,0],
    yellow: [255,255,0],
    black: [0, 0, 0],
    white: [255,255,255]
};

//playing with promises

function setColor(color, t, cb) {

    if (!t)
            t=0;

    //nodeback
    if (cb) {
        setTimeout(
            function () {
                ledmatrix.clear(color);
                return cb;
            }, t)

    }

    else{
        //promise version
        return new Promise(function (resolve) {
            setTimeout(
                function () {
                    ledmatrix.clear(color);
                    resolve(color);
                }, t)
        })
    }

}

exports.init = function () {

    console.log("LED Matrix loaded");

    setColor(color.white, 500)
        .then(function (result) {
            return setColor(color.red, 500)
        })
        .then(function (result) {
            return setColor(color.green, 500)
        })
        .then(function (result) {
            return setColor(color.blue, 500)
        })
        .then(function (result) {
            return setColor(color.black, 500)
        })
        .catch((e)=>console.log(e));

};

/****Call back version ********/
/*
exports.initOld = function () {

    console.log("LED Matrix loaded");
    ledmatrix.clear(red);


    setTimeout(function () {
            ledmatrix.clear(green);
            setTimeout(function () {
                    ledmatrix.clear(blue);
                    setTimeout(function () {
                            ledmatrix.clear(black);
                        },
                        1000);
                },
                1000);
        },
        1000);

};
*/
exports.setColor = setColor;