/*
 * Copyright (c) 2016 GrokSoft LLC - All Rights Reserved
 */

'use strict';


(function () {
    var app = angular.module('ngIssues', []);

    app.controller('NgIssuesController', ['$scope', '$http', function ($scope, $http) {
        var ngIssues = this;
        var showing  = true;    // State for toggle all
        var date     = new Date();
        date.setDate(date.getDate() - 7);
        var service = "https://api.github.com/repos/angular/angular.js/issues?since=" + date.toISOString() + "&assignee=*";
        this.issues = [];

        // Get the issues
        $http.get(service).success(function (issues) {
            ngIssues.issues = issues;
            console.log("Data Read %d items since %s", issues.length, date.toISOString());
        });

        /**
         * Get the beginning date of the search
         *
         * @returns The date in readable format i.e. Wed Aug 10 2016
         */
        this.getDate = function () {
            return date.toDateString();
        };

        /**
         *  Toggle all the collapse elements
         */
        this.toggleAllCollapse = function () {
            var chevron      = $('#chevron');
            var allCollapsed = $('[data-toggle="collapse"]');
            if (showing) {
                allCollapsed.collapse('hide');
                chevron.removeClass('glyphicon-chevron-up');
                chevron.removeClass('glyphicon-chevron-up');
                chevron.addClass('glyphicon-chevron-down');
            }
            else {
                allCollapsed.collapse('show');
                chevron.removeClass('glyphicon-chevron-down');
                chevron.addClass('glyphicon-chevron-up');
            }
            showing = !showing;

            // Stop the finger
            /*            $('#finger2').removeClass('bounce-right');
             $('#finger2').addClass('hidden');*/
        };

        this.toggleSingleRow = function () {
            var sel = $('issue');
            if (sel.hasClass('col-lg-6')) {
                sel.removeClass('col-lg-6');
                sel.addClass('col-lg-12');
                $('.col-switcher').attr('src', "images/col-1.png");
            }
            else {
                sel.removeClass('col-lg-12');
                sel.addClass('col-lg-6');
                $('.col-switcher').attr('src', "images/col-2.png");
            }
        }
    }]);

    app.controller('IssueController', ['$scope', function ($scope) {
        var ctrl         = this;
        var issue;
        var allCollapsed = $('[data-toggle="collapse"]');

        /**
         * Set the issue for use in the get functions
         * @param issue
         */
        $scope.setIssue = function (issue) {
            ctrl.issue = issue;
        };

        /**
         * Get the users login name
         * @param issue
         * @returns {issue.user.login}
         */
        this.getUser = function () {
            return ctrl.issue.user.login;
        };

        /**
         * Get assignees login name
         * @param issue
         * @returns {issue.assignee.login}
         */
        this.getAssignee = function () {
            return ctrl.issue.assignee.login;
        };

        /**
         * Get the body of the issue
         *returns {issue.body}
         */
        $scope.getBody = function () {
            return ctrl.issue.body;
        };

        // Cycle the collapse so it shows properly when using "in"
        allCollapsed.collapse('hide');
        allCollapsed.collapse('show');
    }]);

    app.directive("issue", function () {
        return {
            restrict    : "E",   // By Attribute <div project-specs>
            templateUrl : "issue.html",
            controller  : 'IssueController',
            controllerAs: "issueCtrl"
        };
    });

    app.directive('markdown', function (showdown) {
        var converter = new showdown.Converter();
        return {
            restrict: 'A',
            link    : function (scope, element, attrs) {
                function renderMarkdown() {
                    var htmlText = converter.makeHtml(scope.$eval(attrs.markdown) || '');
                    element.html(htmlText);
                }

                scope.$watch(attrs.markdown, renderMarkdown);
                renderMarkdown();
            }
        };
    });

    app.factory('showdown', ['$window',
        function ($window) {
            return $window.showdown;
        }
    ]);
})();