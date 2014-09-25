var common = require('./common.js');

function Foo() {}
var foos = [];
for (var value = common.minValue; value < common.maxValue; ++value) {
    var foo = new Foo();
    foo.bar = value;
    foos.push(foo);
}
console.log(process.pid);
undef();

