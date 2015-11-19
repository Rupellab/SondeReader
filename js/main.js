/*jslint indent: 4, maxlen: 100 */
/*global angular */

(function (ng) {
    'use strict';

    var // Constants
        LS_KEY_URL = 'serverUrl',
        REFRESH_INTERVAL = 60 * 2 * 1000, // 2 minutes

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

    app.controller('HomeController', ['$scope', '$interval', '$mdToast', 'DataService', function (
        self,
        $interval,
        $mdToast,
        DataService
    ) {
        var // Functions
            getNeeded,
            refresh;

        getNeeded = function () {
            DataService.getHumidity().then(function onSuccess(r) {
                self.humidity = r;
            });

            DataService.getMeteo().then(function onSuccess(r) {
                self.meteo = r;
            });
        };

        refresh = function () {
            DataService.refreshData().then(function () {
                getNeeded();
                $mdToast.showSimple('Données rafraichies.');
            });
        };

        $interval(refresh, REFRESH_INTERVAL);
        getNeeded();

        self.getLastRefresh = DataService.getLastRefresh;
        self.refresh = refresh;
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

    app.factory('DataService', ['$http', '$q', '$mdToast', 'SettingsService', function (
        $http,
        $q,
        $mdToast,
        SettingsService
    ) {
        var // Variables
            allData = null,
            lastRefresh,

            // Functions
            getUrl = SettingsService.getServerUrl,
            refreshData,
            getData,
            getMeteo,
            getHumidity,
            getLastRefresh;

        getData = function () {
            var deferred = $q.defer();

            if (allData) {
                deferred.resolve(allData);
            } else {
                refreshData().then(function (newData) {
                    allData = newData;
                    deferred.resolve(allData);
                });
            }

            return deferred.promise;
        };

        refreshData = function () {
            var deferred = $q.defer();

            $http({
                method: 'GET',
                url: getUrl() + 'json.htm',
                params: {
                    type: 'devices'
                }
            }).then(function onSuccess(r) {
                allData = {
                    meteo: [],
                    humidity: []
                };

                lastRefresh = Date.now();

                r.data.result.forEach(function (device) {
                    if (device.hasOwnProperty('Humidity') &&
                            device.hasOwnProperty('Barometer') &&
                            device.hasOwnProperty('Temp')) {
                        allData.meteo.push({
                            id: parseInt(device.idx, 10),
                            humidity: parseInt(device.Humidity, 10),
                            temp: parseInt(device.Temp, 10),
                            pressure: parseInt(device.Barometer, 10)
                        });
                    }

                    if (device.hasOwnProperty('Humidity')) {
                        allData.humidity.push({
                            id: parseInt(device.idx, 10),
                            humidity: parseInt(device.Humidity, 10)
                        });
                    }
                });

                deferred.resolve(allData);
            }, function onError() {
                $mdToast.showSimple('Impossible de récupérer les données !');
                deferred.reject();
            });

            return deferred.promise;
        };

        getMeteo = function () {
            return getData().then(function (all) {
                return all.meteo;
            });
        };

        getHumidity = function () {
            return getData().then(function (all) {
                return all.humidity;
            });
        };

        getLastRefresh = function () {
            return lastRefresh;
        };

        return {
            refreshData: refreshData,
            getMeteo: getMeteo,
            getHumidity: getHumidity,
            getLastRefresh: getLastRefresh
        };
    }]);
}(angular));
