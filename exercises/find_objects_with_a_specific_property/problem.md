In the previous exercise, we learned how to find all JS objects on the heap
that have a given constructor.

In this exercise, we're going to learn how to find all JS objects on the heap
that have a specific property.

`::findjsobjects` has a `-p` option that allows us to specify which property
`::to look for in objects we want to find.

To complete this exercise, load the core file at {coreFilePath} with mdb, and
find the name of the file that stored the code that generated this core file.

Then verify your solution by running:
```
$ {appname} verify file-name
```
where `file-name` is the name of the file you found in mdb's output.

# HINTS

A Node.js application is run by executing `node` and passing it the name of
the JavaScript file that contains the code that should run. On most operating
systems, processes usually have a concept of arguments that have been passed
to them when they started, commonly called `argv`.
