When a core dump is generated from a running Node.js program, it is possible to examine its callstack to determine
the current function being executed at the time the core file was created.

Use mdb to examine the call stack from a Node.js process' core dump. The core
file is located at {coreFilePath}.

Once you get the call stack, copy and paste the callstack into a file named callstack.txt and run:
```
$ {appname} verify callstack.txt
```

The lesson will be marked 'completed' if you got the callstack right!
