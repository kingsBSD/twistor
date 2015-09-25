angular.module("app",["ngRoute"])
.config(function($locationProvider, $routeProvider) {
	$locationProvider
	.html5Mode(true);

	$routeProvider
	.when("/search", {
		reloadOnSearch: false
	})
	.otherwise({
		redirectTo: "/search",
		reloadOnSearch: true
	});
})
.controller("ctrl", ["$scope", "$location", "$http", "$anchorScroll", function ($scope, $location, $http, $anchorScroll) {

	console.log($location.url());

	$scope.cold = {
		takes: [5,10,20,50],
		sorts: [
			{name: "tweet time", val: "tweet_time"},
			{name: "deletion time", val: "delete_time"},
			{name: "tweet => delete gap", val: "time_diff"}
		]
	};

	$scope.hot = {
		screen_name: ""
	};

	$scope.opts = {
		skip: 0,
		take: 20,
		sort: "tweet_time",
		asc: false,
		id: null
	};

}]);
