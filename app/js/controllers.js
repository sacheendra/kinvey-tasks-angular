'use strict';

/* Controllers */

angular.module('tasks-trello.controllers', []).

    controller('LoginController', ['$scope', '$kinvey', '$location', function($scope, $kinvey, $location) {
        $scope.login = function () {
            var isFormInvalid = false;

            //check is form valid
            if ($scope.loginForm.email.$error.email || $scope.loginForm.email.$error.required) {
                $scope.submittedEmail = true;
                isFormInvalid = true;
            } else {
                $scope.submittedEmail = false;
            }
            if ($scope.loginForm.password.$error.required) {
                $scope.submittedPassword = true;
                isFormInvalid = true;
            } else {
                $scope.submittedPassword = false;
            }
            if (isFormInvalid) {
                return;
            }

            console.log("call login");
            //Kinvey login starts
            var promise = $kinvey.User.login({
                username: $scope.username,
                password: $scope.password
            });
            promise.then(
                function (response) {
                    //Kinvey login finished with success
                    $scope.submittedError = false;
                    $location.path('/home');
                },
                function (error) {
                    //Kinvey login finished with error
                    $scope.submittedError = true;
                    $scope.errorDescription = error.description;
                    console.log("Error login " + error.description);//
                }
            );
        }
    }]).

    controller('SignUpController', ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
        $scope.signUp = function () {
            console.log("signup");
            var isFormInvalid = false;

            //check is form valid
            if ($scope.registrationForm.email.$error.email || $scope.registrationForm.email.$error.required) {
                $scope.submittedEmail = true;
                isFormInvalid = true;
            } else {
                $scope.submittedEmail = false;
            }
            if ($scope.registrationForm.password.$error.required) {
                $scope.submittedPassword = true;
                isFormInvalid = true;
            } else {
                $scope.submittedPassword = false;
            }
            if (isFormInvalid) {
                return;
            }

            //Kinvey signup starts
            var promise = $kinvey.User.signup({
                username: $scope.email,
                password: $scope.password,
                email: $scope.email
            });
            console.log("signup promise");
            promise.then(
                function () {
                    //Kinvey signup finished with success
                    $scope.submittedError = false;
                    console.log("signup success");
                    $location.path("/home");
                },
                function(error) {
                    //Kinvey signup finished with error
                    $scope.submittedError = true;
                    $scope.errorDescription = error.description;
                    console.log("signup error: " + error.description);
                }
            );
        }
    }]).

    controller('MenuController', ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {
        $scope.logout = function () {
            console.log("logout");

            //Kinvey logout starts
            var promise = $kinvey.User.logout();
            promise.then(
                function () {
                    //Kinvey logout finished with success
                    console.log("user logout");
                    $kinvey.setActiveUser(null);
                    $location.path("/login");
                },
                function (error) {
                    //Kinvey logout finished with error
                    alert("Error logout: " + JSON.stringify(error));
                });
        }

        $scope.loggedIn = function() {
            return $kinvey.getActiveUser();
        }
    }]).

    controller('HomeController', ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {

    }]).

    controller('BoardsController', ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {

    }]);
