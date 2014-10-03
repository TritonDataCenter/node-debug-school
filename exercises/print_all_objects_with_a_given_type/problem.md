To complete this exercise, load the core file at {coreFilePath} with mdb, and
find the minimum value for the property `bar` of all objects of type `Foo`.
Then verify your solution by running:
```
$ {appname} verify min-value
```
where `min-value` is the minimum number you found in mdb's output.

# HINTS

In the previous exercise, we learned how to get the list of all objects on the
JavaScript heap by using `::findjsobjects`.

In this exercise, we're going to learn how to inspect these objects. We'll
also see how mdb supports pipelines, similarly to most UNIX shells.

We'll start by going through the same steps as the previous exercise. Load the
core file at {coreFilePath} by entering the following command line in your
shell:
```
$ mdb {coreFilePath}
```

Then, load mdb's v8 module with:

```
> ::load v8
```

Finally, enter:

```
> ::findjsobjects
```

You should be presented with a list of objects grouped by __properties
signatures__.

For instance, the following line of output:
```
  OBJECT #OBJECTS   #PROPS CONSTRUCTOR: PROPS
8b1081d9      456        0 Object
```
means that there are 456 objects on the heap with the same properties, and
that their constructor is named 'Object'.

Why is there only one object address then? This single object address is the
address of a __representative object__. You can get the actual full list of
objects with the following command:
```
> address::findjsobjects
```
where `address` is the address of the representative object.

Now that you can find the list of __all__ objects with a specific type, it's
time to use mdb's ability to pipe commands into each other.

To display the content of an object, mdb's v8 provides you with the
`::jsprint` command. It can be used on a single object like following:
```
> address::jsprint
```
or `::findjsobjects`' output can be piped to its input:
```
> address::findjsobjects | ::jsprint
```

