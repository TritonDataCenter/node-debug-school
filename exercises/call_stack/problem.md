When a core dump is generated from a running Node.js program, it is possible
to examine its callstack to determine the current function being executed at
the time the core file was created.

However, most native debuggers do not display proper function names, arguments
and other critical information about JavaScript stack frames because they do
not understand V8's internal data structures, and how JavaScript functions are
compiled at runtime.

In this exercise, you will learn how mdb, with the help of its v8 module,
allows developers to display JavaScript stack frames information.

Use mdb to examine the call stack from a Node.js process' core dump, including
JavaScript functions names. The core file is located at {coreFilePath}.

Once you get the call stack that includes JavaScript functions names, copy and
paste the callstack into a file named callstack.txt and run:
```
$ {appname} verify callstack.txt
```

The lesson will be marked 'completed' if you got the callstack right!

# HINTS

mdb's command to display the current callstack is `::stack`.

In order to augment mdb with the ability to examine V8's internal data
structures, load the v8 module with the command that you learned during the
previous exercise:
```
::load v8
```

Then, you'll have access to a new command named similarly to `::stack`. You
can search for available commands with the `::dcmds` command.
