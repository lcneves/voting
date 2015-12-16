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
			var postData = JSON.stringify($scope.form);
			console.log(postData);
			
			jQuery.ajax({
				type: "POST",
				url: "new-poll",
				data: $scope.form,
				contentType: "application/json",
				success: function(data) {
					$scope.reset();
					if (data.message) {
						$scope.message = data.message;
						$scope.$apply();
					}
				},
				failure: function(errMsg) {
					$scope.message = errMsg;
					$scope.$apply();
				}
			});
        /*
			jQuery.post("new-poll", postData, function(data) {
				$scope.reset();
				if (data.message) {
					$scope.message = data.message;
					$scope.$apply();
				}
			}, "json");
			
			jQuery.ajax({
				type: "POST",
				url: "new-poll",
				data: $scope.form,
				contentType: "application/json",
				dataType: "json",
				success: function(data) {
					$scope.reset();
					if (data.message) {
						$scope.message = data.message;
						$scope.$apply();
					}
				},
				failure: function(errMsg) {
					$scope.message = errMsg;
					$scope.$apply();
				}
			});
        */
        }
        $scope.reset();
    }]);
})();
