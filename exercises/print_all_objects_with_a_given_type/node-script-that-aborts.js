function Foo() {}
var foos = [];
var minValue = 4242;
var maxValue = minValue + 10;
for (var i = minValue; i < maxValue; ++i) {
    var foo = new Foo();
    foo.bar = i;
    foos.push(foo);
}
console.log(process.pid);
undef();

