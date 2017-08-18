/**
 * Created by chad on 3/11/17.
 */

class Command{
    constructor(name, cmd1, cmd2){
        this.name = name;
        this.one = cmd1;
        this.two = cmd2;
    }

    name(){
        this.name = this.name.toUpperCase();
    }

    move(t, cb){
        name();
        console.log("This is "+ this.name );
        this.one();
        setTimeout(()=>{
            this.two();
            cb();
        }, t*1000);
    }
}


function init() {
    a = ()=>console.log("ronan");
    b = ()=>console.log("neev");

    console.log("something else I need");
    exports.bar = new Command("test",a,b);
}

exports.text = "random";
exports.init = init;
