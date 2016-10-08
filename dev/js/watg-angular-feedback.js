/**
 * Created by Kemal on 07/30/15.
 */
(function() {
    "use strict";
    angular.module('watgFeedbackModule', [
        'ngRoute',
        //'watgFeedback.templates',
        "watgFeedbackModule.const",
        'watgRichtext',
        'watgFileuploadModule'
    ]);
}());

angular.module('watgFeedbackModule.const', [])

.constant('CONST_WATGXRESTAPIURL', 'http://10.10.9.98/watgxapirest/api')

.constant('CONST_RESOURCEURL', 'http://10.10.9.98:8080')

.constant('CONST_LOGSENABLED', true)

;
(function() {
    "use strict";
    var app = angular.module('watgFeedbackModule');
    app.config(['$routeProvider', '$httpProvider', appConfig]);
    app.run(appRun);

    function appConfig($routeProvider, $httpProvider) {
        //this is for CORS operations
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        if (!$httpProvider.defaults.headers.get) {
            $httpProvider.defaults.headers.get = {};
        }
        //disable IE ajax request caching
        $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
        //routes
        $routeProvider.when('/test', {
            templateUrl: 'src/app/tests/watgFeedbackTestView.html',
            controller: 'watgFeedbackTestController'
        }).otherwise({
            redirectTo: '/test'
        });
    }

    function appRun() {}
})();

(function() {
    "use strict";
    angular.module("watgFeedbackModule").controller("watgFeedbackTestController", ['$scope', '$window', 'CONST_WATGXRESTAPIURL', watgFeedbackTestController]);

    function watgFeedbackTestController($scope, $window, CONST_WATGXRESTAPIURL) {
        $scope.header = 'Feedback';
        $scope.maxAttachmentSize = (1024 * 1024) * 1;
        $scope.maxNumberOfAttachments = 2;
        $scope.getAppDevProjectByProjectNameUrl = CONST_WATGXRESTAPIURL + '/Feedback/GetAppDevProjectByProjectName';
        $scope.submitAppDevProjectFeedbackUrl = CONST_WATGXRESTAPIURL + '/Feedback/SubmitAppDevProjectFeedback';
        $scope.user = {
            FullName: 'Tolga Koseoglu'
        };
        console.log(navigator["vendor"]);
        navigator["appCodeName"];
        navigator["appName"];
        navigator["appMinorVersion"];
        navigator["cpuClass"];
        navigator["platform"];
        navigator["plugins"];
        navigator["opsProfile"];
        navigator["userProfile"];
        navigator["systemLanguage"];
        navigator["userLanguage"];
        navigator["appVersion"];
        navigator["userAgent"];
        navigator["onLine"];
        navigator["cookieEnabled"];
        navigator["mimeTypes"];
        for (var p in navigator) {
            console.log(p);
            console.log(navigator[p]);
        }
    }
}());

/**
 * Created by Kemal on 07/30/15.
 */
(function() {
    "use strict";
    angular.module("watgFeedbackModule").directive("watgFeedback", watgFeedback);
    var controller = ['$scope', "watgFeedbackService", function($scope, watgFeedbackService) {
        var boostrapCssPath = "dev/css/vendor.min.css";
        $scope.header = 'Feedback';
        $scope.isBusySubmittingFeedback = false;
        $scope.showConfirmation = false;
        $scope.form = {};
        $scope.max = 5;
        $scope.ratingValue = 0;
        $scope.stars = [];
        $scope.feebackContentResetCount = [];
        $scope.reset = function() {
            $scope.appDevProjectUI = {
                AppDevProjectId: 0,
                AppDevProjectName: '',
                AppDevProjectDescription: '',
                AppDevProjectVersion: '',
                FeedbackContent: '',
                Vendor: '',
                Platform: '',
                UserAgent: '',
                ScreenResolution: '',
                Rating: null,
                Files: []
            };
            $scope.watgFileuploadConfig = {
                Title: "Attachments",
                Files: [],
                MaxFileSize: 1024 * 1024 * 5,
                MaxNumberOfFiles: 5,
                AllowedFileExtensions: "png,jpg,doc,docx,pdf"
            };
            $scope.feedbackRichtextConfig = {
                height: $scope.feedbackInputHeight,
                multiLine: true,
                bootstrapCssPath: boostrapCssPath,
                showVariablesSelector: true,
                showFontSelector: true,
                showFontSizeSelector: true,
                showColorSelector: true,
                showBold: true,
                showItalic: true,
                showStrikeThrough: true,
                showUnderline: true,
                showUnorderedList: true,
                showOrderedList: true,
                showReduceIndent: true,
                showIndent: true,
                showLeftAlign: true,
                showCenterAlign: true,
                showRightAlign: true,
                showJustify: true,
                showUndo: true,
                showRedo: true,
                showInsertLink: true,
                showRemoveLink: true,
                showSourceCode: false
            };
        };
        $scope.getAppDevProjectByProjectName = function() {
            $scope.isBusy = true;
            watgFeedbackService.getAppDevProjectByProjectName($scope.getUrl + '/' + $scope.projectName).then(function(result) {
                $scope.appDevProjectUI.AppDevProjectId = result.AppDevProjectId;
                $scope.appDevProjectUI.AppDevProjectName = result.AppDevProjectName;
                $scope.appDevProjectUI.AppDevProjectDescription = result.AppDevProjectDescription;
                $scope.appDevProjectUI.AppDevProjectVersion = result.AppDevProjectVersion;
                $scope.isBusy = false;
            });
        };
        $scope.submitAppDevProjectFeedback = function() {
            $scope.isBusySubmittingFeedback = true;
            $scope.appDevProjectUI.Vendor = navigator["vendor"];
            $scope.appDevProjectUI.Platform = navigator["platform"];
            $scope.appDevProjectUI.UserAgent = navigator["userAgent"];
            $scope.appDevProjectUI.ScreenResolution = window.screen.availWidth + '*' + window.screen.availHeight;
            $scope.appDevProjectUI.Rating = $scope.ratingValue;
            if ($scope.urlReferrer) $scope.appDevProjectUI.FeedbackContent += "<br />(Previous page) " + $scope.urlReferrer;
            $scope.appDevProjectUI.Files = $scope.watgFileuploadConfig.Files;
            watgFeedbackService.submitAppDevProjectFeedback($scope.appDevProjectUI, $scope.submitUrl).then(function(result) {
                var transactionResult = result;
                if (transactionResult.HasError === true) console.error('Feedback Error ' + transactionResult.Message);
                $scope.showConfirmation = true;
                $scope.isBusySubmittingFeedback = false;
                $scope.reset();
            });
        };
        $scope.toggle = function(index) {
            $scope.ratingValue = index + 1;
        };
        $scope.$watch('ratingValue', function(oldValue) {
            if (oldValue) {
                updateStars();
            }
        });
        $scope.$watch('projectName', function(oldValue, newValue) {
            if (newValue) {
                $scope.getAppDevProjectByProjectName();
            }
        });
        $scope.$watch('appDevProjectUI.FeedbackContent', function(newValue) {
            if (newValue === "" || newValue === "<br>") $scope.form.inputForm.$setValidity("message", false);
            else $scope.form.inputForm.$setValidity("message", true);
        });

        function updateStars() {
            $scope.stars = [];
            for (var i = 0; i < $scope.max; i++) {
                $scope.stars.push({
                    filled: i < $scope.ratingValue
                });
            }
        }
        $scope.getAppDevProjectByProjectName();
        $scope.reset();
        updateStars();
    }];

    function watgFeedback() {
        return {
            restrict: 'E',
            templateUrl: 'src/app/directives/templates/watgFeedbackTemplate.html',
            scope: {
                projectName: '=',
                getUrl: '=',
                submitUrl: '=',
                userFullName: '=',
                urlReferrer: '=',
                logsEnabled: "=?",
                feedbackInputHeight: "=?",
                feedbackMaxNumberOfAttachments: "=?",
                feedbackAttachmentMaxSize: "=?",
                feedbackAttachmentImageMaxHeight: "=?",
                feedbackAttachmentImageMaxWidth: "=?"
            },
            controller: controller,
            link: function(scope) {
                if (!scope.feedbackInputHeight) scope.feedbackInputHeight = 100;
                if (!scope.feedbackAttachmentMaxSize) scope.feedbackAttachmentMaxSize = (1024 * 1024) * 2;
                if (!scope.feedbackAttachmentImageMaxHeight) scope.feedbackAttachmentImageMaxHeight = 1000;
                if (!scope.feedbackAttachmentImageMaxWidth) scope.feedbackAttachmentImageMaxWidth = 1000;
                if (!scope.feedbackMaxNumberOfAttachments) scope.feedbackMaxNumberOfAttachments = 5;
                if (!scope.logsEnabled) scope.logsEnabled = true;
                if (scope.logsEnabled) {
                    console.log(scope.projectName);
                    console.log(scope.getUrl);
                    console.log(scope.submitUrl);
                    console.log(scope.userFullName);
                    console.log(scope.urlReferrer);
                }
            }
        };
    }
})();

/**
 * Created by Kemal on 07/30/15.
 */
(function() {
    "use strict";
    angular.module("watgFeedbackModule").factory("watgFeedbackService", ["$http", watgFeedbackService]);

    function watgFeedbackService($http) {
        return {
            getAppDevProjectByProjectName: function(url) {
                return $http({
                    method: 'GET',
                    withCredentials: true,
                    url: url
                }).
                then(function(response) {
                    return response.data;
                });
            },
            submitAppDevProjectFeedback: function(vm, url) {
                console.log('Service 2 ' + url);
                var formData = new FormData();
                formData.append('FeedbackContent', vm.FeedbackContent);
                formData.append('Vendor', vm.Vendor);
                formData.append('Platform', vm.Platform);
                formData.append('UserAgent', vm.UserAgent);
                formData.append('ScreenResolution', vm.ScreenResolution);
                formData.append('Rating', vm.Rating);
                formData.append('AppDevProjectId', vm.AppDevProjectId);
                for (var i = 0; i < vm.Files.length; i++) {
                    formData.append("Files[" + i + "]", vm.Files[i]);
                }
                return $http({
                    url: url,
                    method: 'POST',
                    transformRequest: angular.identity,
                    data: formData,
                    withCredentials: true,
                    headers: {
                        'Content-Type': undefined
                    }
                }).
                then(function(response) {
                    console.timeEnd('Posting Note');
                    return response.data;
                });
            }
        };
    }
})();
