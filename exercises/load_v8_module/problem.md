mdb, for "modular debugger", allows you to load modules that extend its
capabilities.

In order to be able to properly inspect the state of a process that runs
JavaScript code via the V8 virtual machine, mdb has to be augmented with the
ability to examine V8's internal data structures.

To complete this exercise, load the v8 module from mdb's prompt, and paste the
output of the command to a file. Then, to verify your solution, run:
```
$ {appname} verify solution.txt
```
# HINTS

To be able to load mdb's v8 module, the debuggee needs to have v8 in its
address space. You will need to attach mdb to a running Node.js process, or
generate a core file from a Node.js process and load this core file with mdb.

For more information on how to generate a core file from a running Node.js
process, you can complete the previous exercises "GENERATE A CORE FROM A
RUNNING APP" and "GENERATE CORE WHEN AN APP CRASHES".

Once a core file is generated, it can be loaded with mdb by entering the
following command line:
```
$ mdb corefile
```

If you want to attach mdb to a running Node.js application, you can use
`pgrep` and mdb's `-p` command line option.

