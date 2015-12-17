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
    app.controller('MyPollsController', ['$scope', function($scope) {
        // Function to retrieve "My Polls"
        var checkMyPolls = function() {
            jQuery.post("my-polls", function(data) {
                $scope.MyPollsMessageError = data.error;
                $scope.MyPollsMessage = data.message;
                if (!data.error) {
                    $scope.MyPollsResults = JSON.parse(data.results);
                    if ($scope.MyPollsResults.length > 0) {$scope.hasPolls = true;}
                    else {$scope.hasPolls = false;}
                }
                $scope.$apply();
            });
        };
        
        // Function to delete a poll from the "My Polls" list:
        $scope.deletePoll = function(id) {
            var idObject = {id: id};
            jQuery.post("delete-poll", idObject, function(data) {
                $scope.MyPollsMessageError = data.error;
                $scope.MyPollsMessage = data.message;
                if (!data.error) {
                    checkMyPolls();
                }
                $scope.$apply();
            });
        };
        
        // The code below serves the "Add new poll" form
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
                    if (!data.error) {
                        $scope.reset();
                        checkMyPolls();
                    }
                    $scope.$apply();
                }
            }, "json");
        };
        
        $scope.reset();
        checkMyPolls();
    }]);
})();
