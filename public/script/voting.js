(function() {
    var app = angular.module('votingModule', ['loginModule']);
    app.controller('MainController', ['$scope', 'loginStatus', function($scope, loginStatus) {
        loginStatus.getLogin().then(function() {
            $scope.status = loginStatus.data;
            $scope.$apply();
        });
    }]);
})();