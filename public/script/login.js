(function() {
    var app = angular.module('loginModule', []);
    app.factory('loginStatus', function() {
        var service = {};
        service.getLogin = function() {
            return jQuery.post("check", function(data) {
                hasCheckedLogin = true;
                service.data = username = data;
                return service.data;
            });
        };
        return service;
    });
    app.controller('RegisterController', ['$scope', function($scope) {
        $scope.user = {
            username: '',
            password: '',
            passwordRepeat: '',
            realname: ''
        };
        $scope.message = "";
        $scope.register = function() {
            var enteredUser = JSON.parse(JSON.stringify($scope.user));
            jQuery.post("register", enteredUser, function(data) {
                if (data === true) {
                    jQuery.post("login", enteredUser, function(data) {
                        window.location.href = "/";
                    });
                } else {
                    $scope.message = data;
                    $scope.user.password = '';
                    $scope.user.passwordRepeat = '';
                    $scope.$apply();
                }
            });
        };
    }]);
    
    app.controller('StatusController', ['$scope', 'loginStatus', function($scope, loginStatus) {
        $scope.receivedLogin = false;
        $scope.isLogged = false;
        $scope.user = '';
        loginStatus.getLogin().then(function() {
            $scope.receivedLogin = true;
            if (loginStatus.data) {
                $scope.user = loginStatus.data;
                $scope.isLogged = true;
            }
            $scope.$apply();
        });
    }]);
    
    app.controller('LoginController', ['$scope', function($scope) {
        $scope.user = {
            username: '',
            password: ''
        };
        $scope.message = "";
        $scope.login = function() {
            jQuery.post("login", $scope.user, function(data) {
                $scope.user.password = '';
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