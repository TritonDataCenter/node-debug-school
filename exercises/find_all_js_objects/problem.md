In the previous exercise, we learned how to get the current callstack of a
Node.js process. Another great tool to get a birds eye view of the process'
state is the `::findjsobjects` command.

`::findjsobjects` displays the list of all objects that exist in the
JavaScript objects heap, and group them by __properties signature__. Each
group is represented by a __representative object__. As we'll see in a later
exercise, each representative object can be used to access all objects in the
group.

The list of __representative objects__ is displayed with the following format:
```
  OBJECT #OBJECTS   #PROPS CONSTRUCTOR: PROPS
address         X        Y ConstructorName
```

The output above means that:
* There are X number of objects with the same __properties signature__.
* Their _representative object_ is at address ``address``.
* Their constructor is ``ConstructorName``.

To complete this exercise, load the core file located at {coreFilePath} with
mdb, and find the number of JavaScript objects on the heap that are instances
of the  class `Foo`. Once you found it, run the following command line:
```
$ {appname} verify number
```
where `number` is the number of objects you found with `::findjsobjects`.

# HINTS

First, don't forget that you'll need to load mdb's v8 with the command `::load
v8` to be able to use `::findjsobjects`.

Second, one very important thing to be aware of is that  when looking for the
number of instances of a class, you should keep in mind that __there can be
more than one group of objects with the same constructor name__, and that some
groups do not represent actual JavaScript objects.

For instance, it is likely that the following JavaScript program:
```
function MyClass() {
    this.foo = 42;
}

var myInstance = new MyClass();
```
will produce the following output when using `::findjsobjects` in mdb:
```
  OBJECT #OBJECTS   #PROPS CONSTRUCTOR: PROPS
address         1        1 MyClass
otherAddress    1        1 MyClass
```

Here, you can see two groups of objects with the same constructor name, each
represented by different __representative objects__. The reason is that in
addition to actual instances, V8 creates internal objects with the same
constructor name to represent "classes". These objects do not have the same
properties as actual instances. Because __objects are grouped by their
properties signature, and not by constructor name__ as it would seem at first
glance, they are not in the same group.
