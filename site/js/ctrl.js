angular.module("app",[]).controller("ctrl", ["$scope", "$http", "$anchorScroll", function ($scope, $http, $anchorScroll) {
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
		asc: false
	};

	$scope.search = function() { console.log("butts"); };

}]);
