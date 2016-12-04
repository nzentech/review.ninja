'use strict';

var GitHubApi = require('github');

module.exports = {

    call: function(call, done) {
        var obj = call.obj;
        var fun = call.fun;
        var arg = call.arg || {};
        var token = call.token;
        var basicAuth = call.basicAuth;

        var github = new GitHubApi({
            protocol: config.server.github.protocol,
            version: config.server.github.version,
            host: config.server.github.api,
            pathPrefix: config.server.github.pathprefix,
            port: config.server.github.port
        });

        if(!obj || !github[obj]) {
            if(typeof done === 'function') {
                done('obj required/obj not found');
            }

            return;
        }

        if(!fun || !github[obj][fun]) {
            if(typeof done === 'function') {
                done('fun required/fun not found');
            }

            return;
        }

        if(token) {
            github.authenticate({
                type: 'oauth',
                token: token
            });
        }

        if(basicAuth) {
            github.authenticate({
                type: 'basic',
                username: basicAuth.user,
                password: basicAuth.pass
            });
        }

        github[obj][fun](arg, function(err, res) {

            var meta = null;

            try {
                meta = res.meta;
                meta.hasMore = !!github.hasNextPage(res.meta.link);
                delete res.meta;
            } catch (ex) {
                meta = null;
            }

            if(typeof done === 'function') {
                done(err, res, meta);
            }

        });

    }

};
