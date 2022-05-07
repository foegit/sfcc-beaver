export const snippet : string =
`'use strict';

var base = module.superModule;

Object.keys(base).forEach(function (key) { // expose base methods
    module.exports[key] = base[key];
});

function {fName} () {
    // code
}

module.exports.{fName} = {fName};
`;