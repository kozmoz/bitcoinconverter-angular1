var app = angular.module('ConverterModule', []);

/**
 * Ticker example related service methods.
 */
app.factory('tickerService', function ($http, $timeout, $log) {

    return {
        /**
         * Update ticker Euro.
         */
        getTickerInfoPeriodically: function (callback) {
            function callWebservice() {

                $log.info('Update exchange rate info');

                $http.get('https://api.coindesk.com/v1/bpi/currentprice.json').success(function (data) {

                    var exchangerateeur = data.bpi.EUR.rate_float;
                    var exchangerateusd = data.bpi.USD.rate_float;
                    var exchangerateupdate = new Date(data.time.updatedISO);
                                callback(true, exchangerateeur, exchangerateusd, exchangerateupdate);

                }).error(function () {
                        callback(false)
                    });

                // Call this function periodically.
                $timeout(callWebservice, 60000);
            }

            callWebservice();
        },

        /**
         * Update current URL parameters.
         *
         * @param currency Currency code
         * @param direction Convert direction
         * @param amount Amount to convert
         */
        updateUrl: function (currency, direction, amount) {
            // Replaces the URL, leaves no history trace.
            if (history.replaceState) {
                history.replaceState({}, '', '?currency=' + currency + '&direction=' + direction + '&amount=' + amount);
            }
        },

        /**
         * Parse URL parameters.
         * http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values
         *
         * @returns {{}} Object with parsed parameters and values
         */
        getQueryParameters: function () {
            var result = {};
            var url = location.href;
            var qs = url.substring(url.indexOf('?') + 1).split('&');
            for (var i = 0; i < qs.length; i++) {
                qs[i] = qs[i].split('=');
                result[qs[i][0]] = decodeURIComponent(qs[i][1]);
            }
            return result;
        }
    };
});

/**
 * Converter business logic.
 */
app.controller('ConverterCtrl', function ($scope, $log, tickerService) {

    "use strict";

    // Look for default values, initialized by URL parameters.
    var queryParams = tickerService.getQueryParameters();

    // Initialize with URL parameter value or default.
    $scope.currency = queryParams.currency || 'EUR';
    $scope.direction = queryParams.direction || 'FROMBTC';
    $scope.amount = queryParams.amount || 1;
    $scope.exchangerateeur = 0;
    $scope.exchangerateusd = 0;
    $scope.updateerror = '';

    // Watch for changes, update URL parameters accordingly.
    $scope.$watch('currency + direction + amount', function () {
        tickerService.updateUrl($scope.currency, $scope.direction, $scope.amount);
    });

    // Update exchange rate periodically.
    tickerService.getTickerInfoPeriodically(function (success, exchangerateeur, exchangerateusd, exchangerateupdate) {
        if (success) {
            $scope.exchangerateeur = exchangerateeur;
            $scope.exchangerateusd = exchangerateusd;
            $scope.exchangerateupdate = exchangerateupdate;
            $scope.updateerror = '';
        } else {
            // Update error.
            $scope.updateerror = 'Cannot update, MTGox connection error';
        }
    });

    /**
     * Calculate total.
     */
    $scope.calculateResult = function () {

        if ($scope.direction == 'FROMBTC') {
            // Convert BTC to currency.
            if ($scope.currency == 'EUR') {
                return $scope.amount * $scope.exchangerateeur;
            } else {
                return $scope.amount * $scope.exchangerateusd;
            }
        } else {
            // Convert to currency to BTC.
            if ($scope.currency == 'EUR') {
                return $scope.amount / $scope.exchangerateeur;
            } else {
                return $scope.amount / $scope.exchangerateusd;
            }
        }
    };

});
