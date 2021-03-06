'use strict';


// Declare app level module which depends on filters, and services
angular.module('tasks-trello', [
        'ngRoute',
        'tasks-trello.filters',
        'tasks-trello.services',
        'tasks-trello.directives',
        'tasks-trello.controllers',
        'kinvey'
    ]).

    config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
        $routeProvider.when('/home', {templateUrl: 'partials/home.html', controller: 'HomeController'});
        $routeProvider.when('/orgs/:id', {templateUrl: 'partials/org.html', controller: 'OrgsController'});
        $routeProvider.when('/boards/:id', {templateUrl: 'partials/board.html', controller: 'BoardsController'});
        $routeProvider.otherwise({redirectTo: '/home'});
    }]).

    run(['$location', '$kinvey', function($location, $kinvey) {

        // Kinvey initialization starts
        var promise = $kinvey.init({
            appKey : 'kid_eVQkjJSxtq',
            appSecret : 'cb383640e85b4d37ac5fbf4c81466677'
        });
        promise.then(function() {
            //angular.bootstrap(document, ['tasks-trello']);
            // Kinvey initialization finished with success
            console.log("Kinvey init with success");
            determineBehavior($kinvey, $location);
        }, function(errorCallback) {
            // Kinvey initialization finished with error
            console.log("Kinvey init with error: " + JSON.stringify(errorCallback));
            determineBehavior($kinvey, $location);
        });
    }]);

//function selects the desired behavior depending on whether the user is logged or not
function determineBehavior($kinvey, $location) {
    var promise = $kinvey.User.me();
    promise.then(function(response) {
        console.log("$location.$$url: " + $location.$$url);
        if (response !== null) {
            console.log("activeUser not null determine behavior");
            if ($location.$$url !== '/home') {
                $location.path('/home');
            }
        } else {
            console.log("activeUser null redirecting");
            if ($location.$$url !== '/login') {
                $location.path('/login');
            }
        }
    }, function(res) {
        console.log("activeUser null redirecting");
        if ($location.$$url !== '/login') {
            $location.path('/login');
        }
    });
}
