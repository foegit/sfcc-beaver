export const controller : string =
`'use strict';

var server = require('server');

server.extend(module.superModule);

server.append('{endpoint}', function(res, req, next) {
    
    next();
});


module.exports = server.exports();
`;