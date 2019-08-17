
qunit-expect-code-mod
==============================================================================

adds assert.expect(n) to test invocations

Installation
------------------------------------------------------------------------------

Install [`jscodeshift`](https://github.com/facebook/jscodeshift) to run the
codemod script:

```
npm install -g jscodeshift
```

Usage
------------------------------------------------------------------------------

```
jscodeshift -t https://rawgit.com/scalvert/qunit-expect-code-mod/master/qunit-expect-code-mod.js ./tests/
```
