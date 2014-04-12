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
            return true;
        }
    }]).

    controller('HomeController', ['$scope', '$kinvey', "$location", "$rootScope", function($scope, $kinvey, $location, $rootScope) {
        $scope.orgs = []

        $scope.addOrg = function() {
            console.log("test");
            if($scope.orgCreateForm.organization.$error.required)
                return;

            var promise = $kinvey.DataStore.save('organizations', {
                name: $scope.organization,
                owner: $kinvey.getActiveUser(),
                members: [$kinvey.getActiveUser()],
                admins: []
            }, {
                exclude: ['owner', 'members', 'admins'],
                relations: {owner: 'users', members: 'users', admins: 'users'}
            });

            promise.then(function(response) {
                $scope.orgs.push(response);
            });
        }

        $scope.deleteOrg = function(index) {
            var org = $scope.orgs[index];
            if(org.owner._id !== $kinvey.getActiveUser()._id)
                return;

            var promise = $kinvey.DataStore.destroy('organizations', $scope.orgs[index]._id);

            promise.then(function() {
                $scope.orgs.splice(index, 1);
            });

        }

        $scope.gotoOrg = function(index) {
            var org = $scope.orgs[index];

            $location.path("/orgs/"+org._id);
        }

        $scope.getOrgs = function() {
            var prom = $kinvey.User.me();
            prom.then(function(resp) {
                var query = new $kinvey.Query();
                query.contains('members._id', [resp._id]);
                var promise = $kinvey.DataStore.find('organizations', query, {
                    relations : { members: 'users' }
                });
                promise.then(function(orgs) {
                    for(var i;i<orgs.length;i++){
                        $scope.orgs.push(orgs[i]);
                    }
                });
            });
        }

        $scope.getOrgs();
    }]).

    controller('BoardsController', ['$scope', '$kinvey', "$location", function($scope, $kinvey, $location) {

    }]).

    controller('OrgsController', ['$scope', '$kinvey', '$location', '$routeParams', function($scope, $kinvey, $location, $routeParams) {
        $scope.boards = []
        $scope.users = []
        $scope.org = null

        $scope.addBoard = function() {
            console.log($scope.boardCreateForm);
            if($scope.boardCreateForm.board.$error.required)
                return;

            var prom = $kinvey.DataStore.get('organizations', $routeParams.id, {
                relations: {owner:'users', admins: 'users'}
            });

            prom.then(function(resp) {
                var user = $kinvey.getActiveUser();
                var admin = false;
                if(resp.owner._id === user._id)
                    admin = true;
                for(var i=0;i<resp.admins.length;i++) {
                    if(resp.admins[i]._id === user._id)
                        admin = true;
                }
                if(admin === false)
                    return;

                var promise = $kinvey.DataStore.save('boards', {
                    name: $scope.board,
                    owner: resp
                }, {
                    exclude: ['owner'],
                    relations: {owner: 'organizations'}
                });

                promise.then(function(response) {
                    $scope.boards.push(response);
                });
            });
        }

        $scope.deleteBoard = function(index) {

            var prom = $kinvey.DataStore.get('organizations', $routeParams.id, {
                relations: {owner:'users', admins: 'users'}
            });

            prom.then(function(resp) {
                var user = $kinvey.getActiveUser();
                var admin = false;
                if(resp.owner._id === user._id)
                    admin = true;
                for(var i;i<resp.admins.length;i++) {
                    if(resp.admins[i]._id === user._id)
                        admin = true;
                }
                if(admin === false)
                    return;

                var promise = $kinvey.DataStore.destroy('boards', $scope.boards[index]._id);

                promise.then(function() {
                    $scope.boards.splice(index, 1);
                });
            });

        }

        $scope.getBoards = function() {
                var query = new $kinvey.Query();
                query.equalTo('owner._id', $routeParams.id);
                var promise = $kinvey.DataStore.find('boards', query, {
                    relations : { owner: 'organizations' }
                });
                promise.then(function(boards) {
                    for(var i;i<boards.length;i++){
                        $scope.boards.push(boards[i]);
                    }
                });
        }

        $scope.getOrg = function() {
            var prom = $kinvey.DataStore.get('organizations', $routeParams.id, {
                relations: {owner:'users', admins: 'users', members: 'users'}
            });
            prom.then(function(response) {
                $scope.org = response;
            });
        }

        $scope.getUsers = function() {
            var prom = $kinvey.DataStore.find('users');
            prom.then(function(response) {
                for(var i;i<response.length;i++) {
                    $scope.users.push(response[i]);
                }
            });
        }

        $scope.addMember = function(index) {
            $scope.org.members.push($scope.users[index]);
            var promise = $kinvey.DataStore.save('organizations', $scope.org, {
                excludes: ['owner', 'admins', 'members'],
                relations: {owner: 'users', admins: 'users', members: 'users'}
            });
            promise.then(function(response) {
                $scope.org = response;
            });
        }

        $scope.removeMember = function(index) {
            for(var j;j<$scope.org.members.length;j++) {
                if($scope.org.members[j]._id === $scope.users[index]._id) {
                    $scope.org.members.slice(j, 1);
                    break;
                }
            }
            var promise = $kinvey.DataStore.save('organizations', $scope.org, {
                excludes: ['owner', 'admins', 'members'],
                relations: {owner: 'users', admins: 'users', members: 'users'}
            });
            promise.then(function(response) {
                $scope.org = response;
            });
        }

        $scope.addAdmin = function(index) {
            $scope.org.admins.push($scope.users[index]);
            var promise = $kinvey.DataStore.save('organizations', $scope.org, {
                excludes: ['owner', 'admins', 'members'],
                relations: {owner: 'users', admins: 'users', members: 'users'}
            });
            promise.then(function(response) {
                $scope.org = response;
            });
        }

        $scope.removeAdmin = function(index) {
            for(var j;j<$scope.org.admins.length;j++) {
                if($scope.org.admins[j]._id === $scope.users[index]._id) {
                    $scope.org.admins.slice(j, 1);
                    break;
                }
            }
            var promise = $kinvey.DataStore.save('organizations', $scope.org, {
                excludes: ['owner', 'admins', 'members'],
                relations: {owner: 'users', admins: 'users', members: 'users'}
            });
            promise.then(function(response) {
                $scope.org = response;
            });
        }

        $scope.isMember = function(index) {
            for(var i;i<$scope.org.members;i++) {
                if($scope.org.members[i]._id === $scope.users[index]._id)
                    return true;
            }

            return false;
        }

        $scope.isAdmin = function(index) {
            if($scope.org.owner._id === $scope.users[index]._id)
                return true;
            for(var i;i<$scope.org.admins;i++) {
                if($scope.org.admins[i]._id === $scope.users[index]._id)
                    return true;
            }

            return false;
        }

        $scope.getOrg();
        $scope.getUsers();
        $scope.getBoards();
    }]);
