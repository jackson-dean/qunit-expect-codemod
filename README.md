
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
jscodeshift -t https://raw.githubusercontent.com/jackson-dean/qunit-expect-codemod/master/qunit-expect-code-mod-codemod.js ./tests/
```
