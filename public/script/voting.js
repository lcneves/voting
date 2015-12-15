(function() {
    var app = angular.module('votingModule', ['loginModule']);
    app.controller('MainController', ['$scope', 'loginStatus', function($scope, loginStatus) {
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
    app.controller('PollFormController', ['$scope', function($scope) {
        var makeOption = function() {
            var option = {
                name: '',
                voters: []
            }
            return option;
        }
        $scope.reset = function() {
            var optionOne = makeOption();
            var optionTwo = makeOption();
            $scope.form = {
                question: '',
                options: [
                    optionOne,
                    optionTwo
                ]
            }
        }
        $scope.addOption = function() {
            var newOption = makeOption();
            $scope.form.options.push(newOption);
        }
        $scope.submit = function() {
            jQuery.post("new-poll", $scope.form, function(data) {
                $scope.reset();
                if (data.message) {
                    $scope.message = data.message;
                    $scope.$apply();
                } else {
                    window.location.href = "/";
                }
            });
        }
        $scope.reset();
    }]);
})();