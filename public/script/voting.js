(function() {
    var app = angular.module('votingModule', ['loginModule']);
    app.config(function($locationProvider) {
        $locationProvider.html5Mode(true).hashPrefix('!');
    });
    app.controller('MainController', ['$scope', '$rootScope', '$location', 'loginStatus', function($scope, $rootScope, $location, loginStatus) {
        var pollOptionColors = [
            {color: '#337ab7', highlight: '#286090'}, // Bootstrap "btn-primary" and :hover colors
            {color: '#5cb85c', highlight: '#449d44'}, // Bootstrap "btn-success" and :hover colors
            {color: '#f0ad4e', highlight: '#ec971f'}, // Bootstrap "btn-warning" and :hover colors
            {color: '#d9534f', highlight: '#c9302c'}, // Bootstrap "btn-danger" and :hover colors
            {color: '#5bc0de', highlight: '#31b0d5'}  // Bootstrap "btn-info" and :hover colors
        ];
        $scope.getColor = function(index) {
            var colorIndex = index % pollOptionColors.length;
            return pollOptionColors[colorIndex].color;
        }
        var ctx;
        var chart;
        var getPoll = function() {
            var pollSearch = $location.search();
            $scope.hasPollSearch = !jQuery.isEmptyObject(pollSearch);
            if ($scope.hasPollSearch) {
                jQuery.post("get-poll", pollSearch, function(data) {
                    $scope.getPollMessageError = data.error;
                    $scope.getPollMessage = data.message;
                    if (!data.error) {
                        if (chart) {
                            chart.destroy;
                            (function($) {
                                $("#chart-well").html("");
                            }(jQuery));
                        }
                        $scope.pollLink = $location.absUrl();
                        $scope.poll = data.poll;
                        var chartData = [];
                        var hasVotes = false;
                        data.poll.options.forEach(function(element, index, array) {
                            var colorIndex = index % pollOptionColors.length;
                            var value = element.voters.length;
                            if (value > 0) {hasVotes = true;}
                            var label = element.option;
                            chartData.push({
                                value: value,
                                color: pollOptionColors[colorIndex].color,
                                highlight: pollOptionColors[colorIndex].highlight,
                                label: label
                            });
                        });
                        if (hasVotes) {
                            (function($) {
                                $("#chart-well").html('<canvas id="chart" width="400px" height="400px"></canvas>');
                                ctx = $("#chart").get(0).getContext("2d");
                                chart = new Chart(ctx).Doughnut(chartData);
                            }(jQuery));
                        } else {
                            $("#chart-well").html('<p>This poll does not have any votes yet!</p>');
                        }
                    } else {
                        $scope.pollViewMessage = data.message;
                    }
                    $scope.$apply();
                });
            }
        };
        $scope.addVote = function(index) {
            jQuery.post("add-vote", {index: index, pollID: $scope.poll._id}, function(data) {
                getPoll();
            });
        };
        $scope.submitNewOption = function(newOption) {
            $scope.newOption = {value: ''};
            jQuery.post("add-option", {option: newOption, pollID: $scope.poll._id}, function(data) {
                getPoll();
            });
        }
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
                    $location.search({});
                    getPoll();
                }
                $scope.$apply();
            });
        };
        
        // Function to view a poll from the "My Polls" list:
        $scope.viewPoll = function(id) {
            $location.search({poll: id});
            getPoll();
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
                        $location.search({poll: data.pollID});
                        getPoll();
                    }
                    $scope.$apply();
                }
            }, "json");
        };
        // Commands to run on load
        $scope.reset();
        checkMyPolls();
        $rootScope.$on('$includeContentLoaded', function() {
            getPoll();
        });
    }]);
})();
