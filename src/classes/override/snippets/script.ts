export const snippet : string = `'use strict';

var base = module.superModule;

// expose same methods as base
Object.keys(base).forEach(function (key) {
    module.exports[key] = base[key];
});

function foo() {
    // code
}

module.exports.foo = foo;
`;