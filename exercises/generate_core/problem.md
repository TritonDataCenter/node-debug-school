When debugging a Node.js application in production, one of the requirements is
that the service should remain available during the investigation.

If the application didn't crash but has some undesirable behavior (e.g it's
leaking memory, or it's taking too much of the CPU time), you want to examine
the state of the running application without attaching to it with a debugger
that would pause the application, and thus interrupt the service.

One way to do this is by generating a core file from a running
Node.js application.

Use `gcore` to generate a core file from a running Node.js application.

Once you managed to use gcore to generate a core file from a running Node.js
application, run the following command line to verify your solution:
```
$ {appname} verify core-file
```
where 'core-file' is the path to the core file that has just been generated.
