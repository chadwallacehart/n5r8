/**
 * Created by chad on 3/11/17.
 */

const foo = require('./importTest');

foo.init();
foo.bar.move(1,()=>console.log("done"));