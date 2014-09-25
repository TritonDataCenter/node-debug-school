In the previous exercise, we learned how to get the list of all objects on the
JavaScript heap by using `::findjsobjects`.

In this exercise, we're going to learn:
* How to find all objects of a specific type.
* How to pipe an mdb command's input to another mdb command's output, in a
similar way to how it's done in a UNIX shell.
* How to examine individual JavaScript objects' content using mdb.

With mdb, it is possible to find all objects that have a specific constructor.
For instance, to find all JS objects with the constructor "SomeConstructor",
enter the following command:

```
::findjsobjects -c SomeConstructor
```

The output should display only one object's address. The reason is that
`::findjsobjects` always displays the _representative_ object if more than one
object that matches the filter is present in the heap. To actually display all
objects represented by this representative object, you will need to pipe
`::findjsobjects`'s output to `::findjsobjects` _again_:

```
::findjsobjects -c SomeConstructor | ::findjsobjects
```

The output should list more than one object's address.

Now, armed with the ability to pipe commands together, it is possible to
display the content of all objects of a given type by piping the last
`::findjsobjects` output to `::jsprint`:

```
::findjsobjects -c SomeConstructor | ::findjsobjects | ::jsprint
```

To complete this exercise, load the core file at {coreFilePath} with mdb, and
find the maximum value for the property `bar` of all objects of type `Foo`.
Then verify your solution by running:
```
$ {appname} verify max-value
```
where max-value is the maximum number you found in mdb's output.
