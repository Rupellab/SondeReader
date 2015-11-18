/*jslint indent: 4, maxlen: 100 */
/*global angular */

(function (ng) {
    'use strict';

    var app = ng.module('SondeReader', [
        'ui.router',
        'ngMaterial'
    ]);

    app.config(['$stateProvider', '$urlRouterProvider', function (
        $stateProvider,
        $urlRouterProvider
    ) {
        console.log('setting routes');

        $stateProvider.state('home', {
            url: '/home',
            controller: 'TestController',
            templateUrl: 'partials/home.html'
        });

        $stateProvider.state('settings', {
            url: '/settings',
            controller: 'TestController',
            templateUrl: 'partials/settings.html'
        });

        $urlRouterProvider.otherwise('/home');
    }]);

    app.controller('TestController', ['$scope', function (self) {
        self.hello = 'World';
    }]);
}(angular));
