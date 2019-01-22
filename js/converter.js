var app = angular.module('ConverterModule', []);

/**
 * Ticker example related service methods.
 */
app.factory('tickerService', function ($http, $timeout, $log) {

    return {
        /**
         * Update ticker Euro
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
        }
    };
});

/**
 * Converter business logic.
 */
app.controller('ConverterCtrl', function ($scope, $log, tickerService) {

    "use strict";

    $scope.amount = 1;
    $scope.currency = 'EUR';
    $scope.exchangerateeur = 0;
    $scope.exchangerateusd = 0;
    $scope.direction = 'FROMBTC';
    $scope.updateerror = '';

    // Update exchange rate periodically.
    tickerService.getTickerInfoPeriodically(function (success, exchangerateeur, exchangerateusd, exchangerateupdate) {
        if (success) {
            $scope.exchangerateeur = exchangerateeur;
            $scope.exchangerateusd = exchangerateusd;
            $scope.exchangerateupdate = exchangerateupdate;
            $scope.updateerror = '';
        } else {
            // Update error.
            $scope.updateerror = 'Cannot update, Coindesk connection error';
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
    }


});
