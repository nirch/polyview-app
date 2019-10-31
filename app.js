
var app = angular.module("arCloudApp", []);

app.controller("signupCtrl", function($scope, $location) {
   
    $scope.signup = function() {
        const data = {
            email: $scope.email,
            pwd: $scope.pwd,
            confirm: $scope.confirmPwd,
            displayName: $scope.displayName,
            techName: $scope.techName,
            website: $scope.website
        }
        alert(JSON.stringify(data));
    }

});