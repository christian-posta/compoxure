'use strict';

var expect = require('expect.js');
var async = require('async');
var request = require('request');
var _ = require('lodash');
var http = require('http');
var cheerio = require('cheerio');
var config = require('../common/testConfig.json');
var stubServer = require('../common/stubServer');
var pcServer = require('../common/pcServer');

describe("Page Composer with Browser Extension config enabled", function(){
    var stubServerPort = 5011;
    var pageComposerPort = 5010;

    this.timeout(5000);
    this.slow(3000);

    before(function(done){
        async.series([
            initStubServer,
            initPageComposer
        ], done);
    });

    function createEventHandler() {
        return {
            logger: function(level, message, data) {
            },
            stats: function(type, key, value) {
            }
        }
    }

    function initStubServer(next) {
        stubServer.init('pageComposerTest.html', stubServerPort, 'localhost')(next);
    }

    function initPageComposer(next) {
        pcServer.init(pageComposerPort, 'localhost', createEventHandler(), null, true)(next);
    }

    function getPageComposerUrl(path, search) {

        var url = require('url').format({
            protocol: 'http',
            hostname: 'localhost',
            port: pageComposerPort,
            pathname: path,
            search: search
        });

        return url;
    }

    context('Browser extension', function() {
        var template =
            "<div id='declarative' cx-replace-outer='true' cx-url='{{server:local-extension}}/browser-extension-backend' cx-cache-ttl='1' cx-cache-key='replace:browser-extension' cx-timeout='1s' class='block'>" +
            "Content to be replaced via a directive" +
            "</div>";

        it('should parse POST requests generated by compoxure browser extension', function(done) {
            var requestOpts = {
                headers: {'Content-Type': 'text/compoxure'},
                body: template
            };
            request.post(getPageComposerUrl('browser-extension'), requestOpts, function(err, response, content) {
                expect(content).to.be('Browser extension working');
                done();
            });
        });

        it('should not parse POST requests without proper Content-Type', function(done) {
            var requestOpts = {
                body: template
            };
            request.post(getPageComposerUrl('browser-extension'), requestOpts, function(err, response, content) {
                expect(content).to.be('Service http://localhost:5011/browser-extension-not-parsed responded with status code 404');
                done();
            });
        });
    });
});
