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
        $stateProvider.state('home', {
            url: '/home',
            controller: 'HomeController',
            templateUrl: 'partials/home.html'
        });

        $stateProvider.state('settings', {
            url: '/settings',
            controller: 'SettingsController',
            templateUrl: 'partials/settings.html'
        });

        $urlRouterProvider.otherwise('/home');
    }]);

    app.controller('HomeController', ['$scope', 'DataService', function (self, DataService) {
        DataService.getHumidity().then(function onSuccess(r) {
            self.humidity = r;
        });

        DataService.getMeteo().then(function onSuccess(r) {
            self.meteo = r;
        });
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

            if (!out) {
                return 'http://server.url';
            }

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

    app.factory('DataService', ['$http', '$mdToast', 'SettingsService', function (
        $http,
        $mdToast,
        SettingsService
    ) {
        var // Functions
            getUrl = SettingsService.getServerUrl,
            getMeteo,
            getHumidity;

        getMeteo = function () {
            return $http({
                method: 'GET',
                url: getUrl() + 'json.htm',
                params: {
                    type: 'devices'
                }
            }).then(function onSuccess(r) {
                var out = [];

                r.data.result.forEach(function (device) {
                    if (device.hasOwnProperty('Humidity') &&
                            device.hasOwnProperty('Barometer') &&
                            device.hasOwnProperty('Temp')) {
                        out.push({
                            id: parseInt(device.idx, 10),
                            humidity: parseInt(device.Humidity, 10),
                            temp: parseInt(device.Temp, 10),
                            pressure: parseInt(device.Barometer, 10)
                        });
                    }
                });

                return out;
            }, function onError() {
                $mdToast.showSimple('Impossible de récupérer les données !');
            });
        };

        getHumidity = function () {
            return $http({
                method: 'GET',
                url: getUrl() + 'json.htm',
                params: {
                    type: 'devices'
                }
            }).then(function onSuccess(r) {
                var out = [];

                r.data.result.forEach(function (device) {
                    if (device.hasOwnProperty('Humidity')) {
                        out.push({
                            id: parseInt(device.idx, 10),
                            humidity: parseInt(device.Humidity, 10)
                        });
                    }
                });

                return out;
            }, function onError() {
                $mdToast.showSimple('Impossible de récupérer les données !');
            });
        };

        return {
            getMeteo: getMeteo,
            getHumidity: getHumidity
        };
    }]);
}(angular));
