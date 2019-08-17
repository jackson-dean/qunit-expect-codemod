module.exports = function(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.CallExpression).forEach(path => {
    if (path.value.callee.name === "test") {
      const hasExpectCall =
        path.value.arguments[1].body.body[0].expression &&
        path.value.arguments[1].body.body[0].expression.callee &&
        path.value.arguments[1].body.body[0].expression.callee.object &&
        path.value.arguments[1].body.body[0].expression.callee.object.name ===
          "assert" &&
        path.value.arguments[1].body.body[0].expression.callee.property &&
        path.value.arguments[1].body.body[0].expression.callee.property.name ===
          "expect";

      if (hasExpectCall) {
        return;
      }

      let numAsserts = path.value.arguments[1].body.body.filter(node => {
        if (
          (node.expression &&
            node.expression.callee &&
            node.expression.callee.object &&
            node.expression.callee.object.callee &&
            node.expression.callee.object.callee.object &&
            node.expression.callee.object.callee.object.name === "assert") ||
          (node.expression &&
            node.expression.callee &&
            node.expression.callee.object &&
            node.expression.callee.object.name === "assert")
        ) {
          return true;
        }
      }).length;

      path.value.arguments[1].body.body.unshift(
        `assert.expect(${numAsserts});`
      );
    }
  });

  return root.toSource({
    quote: "single",
    wrapColumn: 80,
    trailingComma: {
      objects: true,
      arrays: true,
      functions: false
    }
  });
};
