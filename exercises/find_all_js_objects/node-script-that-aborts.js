function Foo() {}
var foos = [];
for (var i = 0; i < 42; ++i) {
    foos.push(new Foo());
}
console.log(process.pid);
undef();

