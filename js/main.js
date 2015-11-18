/*jslint indent: 4, maxlen: 100 */
/*global angular */

(function (ng) {
    'use strict';

    var // Constants
        LS_KEY_URL = 'serverUrl',

        // Variables
        app;

    app = ng.module('SondeReader', [
        'ui.router',
        'ngMaterial',
        'angular-locker'
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
            controller: 'SettingsController',
            templateUrl: 'partials/settings.html'
        });

        $urlRouterProvider.otherwise('/home');
    }]);

    app.controller('TestController', ['$scope', function (self) {
        self.hello = 'World';
    }]);

    app.controller('SettingsController', ['$scope', 'SettingsService', function (
        self,
        SettingsService
    ) {
        self.settings = {
            url: SettingsService.getServerUrl()
        };

        self.$watch('settings.url', function (newValue) {
            SettingsService.setServerUrl(newValue);
        });
    }]);

    app.factory('SettingsService', ['locker', function (locker) {
        var // Variables
            serverUrl,

            // Functions
            setServerUrl,
            getServerUrl;

        setServerUrl = function (newUrl) {
            locker.put(LS_KEY_URL, newUrl);
            serverUrl = newUrl;
        };

        getServerUrl = function () {
            var out = serverUrl;

            if (serverUrl.slice(-1) !== '/') {
                out += '/';
            }

            return out;
        };

        serverUrl = locker.get(LS_KEY_URL, null);

        return {
            setServerUrl: setServerUrl,
            getServerUrl: getServerUrl
        };
    }]);
}(angular));
