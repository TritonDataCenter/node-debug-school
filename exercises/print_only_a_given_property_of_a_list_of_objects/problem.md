To complete this exercise, load the core file at {coreFilePath} with mdb, and
find the value of the property `bar` of all objects of type `Foo`. Copy and
paste mdb's output in a file and then verify your solution by running:
```
$ {appname} verify solution.txt
```
where `solution.txt` is the file that contains mdb's output.

# HINTS

In the previous exercise, we learned how to inspect all objects with a given
type.

In this exercise, you can use `::jsprint`'s ability to display the content of
only one property:
```
address::jsprint some-property
```
will only display the property `some-property` of the object at address
`address`.
