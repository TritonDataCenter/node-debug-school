In the previous exercise, we learned how to get the current callstack of a
Node.js process. Another great tool to get a birds eye view of the process'
state is the `::findjsobjects` command.

`::findjsobjects` displays the list of all objects that exists in the
JavaScript objects heap, and group them by constructor name.

To complete this exercise, load the core file located at {coreFilePath} with
mdb, and find the number of JavaScript objects on the heap with the
constructor `Foo`. Once you found it, run the following command line:
```
$ {appname} verify number
```
where `number` is the number of objects you found with `::findjsobjects`.

# HINTS

Don't forget that you'll need to load mdb's v8 module to have access to
`::findjsobjects` within mdb:
```
::load v8
```
