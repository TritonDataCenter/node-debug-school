function Foo() {}
var foos = [];
for (var i = 0; i < 10; ++i) {
    var foo = new Foo();
    foo.bar = i;
    foos.push(foo);
}
console.log(process.pid);
undef();

