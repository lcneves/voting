(function() {
    var app = angular.module('loginModule', []);
    app.factory('loginStatus', function() {
        var service = {};
        service.data = '';
        service.getLogin = function() {
            return jQuery.post("check", function(data) {
                if (data) {
                    service.data = "Logged in as " + data;
                } else {
                    service.data = "Not logged in";
                }
                return service.data;
            });
        };
        return service;
    });
    app.controller('RegisterController', ['$scope', function($scope) {
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.message = "Message!";
        $scope.register = function() {
            jQuery.post("register", $scope.user, function(data) {
                $scope.message = data;
                $scope.user = {
                    username: '',
                    password: ''
                };
                $scope.$apply();
            });
        };
    }]);
    app.controller('LoginController', ['$scope', 'loginStatus', function($scope, loginStatus) {
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.message = "Message!";
        loginStatus.getLogin().then(function() {
            $scope.status = loginStatus.data;
            $scope.$apply();
        });
        $scope.login = function() {
            jQuery.post("login", $scope.user, function(data) {
                $scope.user = {
                    username: '',
                    password: ''
                };
                if (data.message) {
                    $scope.message = data.message;
                    $scope.$apply();
                } else {
                    window.location.href = "/";
                }
            });
        };
    }]);
})();