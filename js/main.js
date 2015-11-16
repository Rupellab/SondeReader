/*jslint indent: 4, maxlen: 100 */
/*global angular */

(function (ng) {
    'use strict';

    var app = ng.module('SondeReader', [
        'ngMaterial'
    ]);

    app.controller('TestController', ['$scope', function (self) {
        self.hello = 'World';
    }]);
}(angular));
