
var app = angular.module("arCloudApp", []);

app.controller("signupCtrl", function ($scope, $timeout, $window) {

    $scope.isSaving = false;
    $scope.invalidForm = false;
    $scope.techNameAvailable = true;
    $scope.pwdMatch = true;



    $scope.signup = function (form) {

        $scope.techNameAvailable = true;
        $scope.pwdMatch = true;

        // first checking the built in HTML validation: 
        // required fields, email format, password pattern, tech name pattern

        // techname subdomain regex:
        // https://stackoverflow.com/questions/7930751/regexp-for-subdomain

        // password (must contain a capital letter, lowercase letter, a number and be at least 8 characters long) regex:
        // https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a

        if (form.$invalid) {
            $scope.invalidForm = true;
        } else if ($scope.pwd != $scope.confirmPwd) {
            $scope.pwdMatch = false;
        } else {
            // Now checking if tech name is already taken or not
            Parse.Cloud.run("isTechNameAvailable", { techName: $scope.techName }).then(isAvailable => {
                $scope.techNameAvailable = isAvailable;
                $scope.$apply();

                if (isAvailable) {
                    createUserAndCustomer();
                }
            }, error => {
                console.log(error);
            });
        }
    }

    function createUserAndCustomer() {
        $scope.isSaving = true;

        const user = new Parse.User()
        user.set('username', $scope.email);
        user.set('email', $scope.email);
        user.set('password', $scope.pwd);

        user.signUp().then((user) => {
            console.log('User signed up', user);

            // creating a customer object
            const Customer = Parse.Object.extend('Customer');
            const newCustomer = new Customer();

            // ACL: only this user and admins can write to this object (anyone can read)
            var customerACL = new Parse.ACL();
            customerACL.setPublicReadAccess(true);
            customerACL.setRoleWriteAccess("admin", true);
            customerACL.setWriteAccess(Parse.User.current().id, true);
            newCustomer.setACL(customerACL);

            newCustomer.set('displayName', $scope.displayName);
            newCustomer.set('techName', $scope.techName);
            // newCustomer.set('logo', new Parse.File("resume.txt", { base64: btoa("My file content") }));
            newCustomer.set('websiteUrl', $scope.website);

            newCustomer.save().then(result => {
                console.log('Customer created', result);

                user.set("customer", result);
                user.save().then(result => {
                    $timeout(() => {
                        let loc = $window.location;
                        let redirectTo;
                        if (loc.href.includes("localhost") || loc.href.includes("127.0.0.1")) {
                            redirectTo = `${loc.protocol}//${$scope.techName}.localhost:3000/studio`;
                        } else {
                            redirectTo = `https://${$scope.techName}.polyview3d.com/studio`
                        }
                        // redirecting...
                        $scope.isSaving = false;
                        loc.href = redirectTo;
                    }, 3000);

                }, error => {
                    console.error('Error while saving user with customer details: ', error);
                    $scope.isSaving = false;
                });
            }, error => {
                console.error('Error while creating Customer: ', error);
                $scope.isSaving = false;
            });
        }).catch(error => {
            console.error('Error while signing up user', error);
            $scope.isSaving = false;
        });
    }

});