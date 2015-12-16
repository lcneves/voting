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
            return {name: ''};
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
            var postObject = {
                question: $scope.form.question,
                options: JSON.stringify($scope.form.options)
            };
            jQuery.post("new-poll", postObject, function(data) {
                if (data.message) {
                    $scope.messageError = data.error;
                    $scope.message = data.message;
                    if (!data.error) {$scope.reset();}
                    $scope.$apply();
                }
            }, "json");
        };
        $scope.reset();
    }]);
})();
