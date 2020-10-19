'use strict';

angular.module('qldarchApp').controller('UserContentsCtrl', function($scope, $filter, contents, userId) {
  var DEFAULT_IMAGE_ROW_COUNT = 5;
  $scope.imageRowDisplayCount = DEFAULT_IMAGE_ROW_COUNT;
  $scope.contents = contents;
  $scope.reverseSort = false;
  $scope.orderByField = 'label';
  $scope.getLink = function(c) {
    if (c.type === 'person' && c.architect) return 'architect.summary({ architectId: c.id })';
    else if (c.type === 'firm') return 'firm.summary({ firmId: c.id })';
    else if (c.type === 'structure') return 'structure.summary({ structureId: c.id })';
    else if (c.type === 'article') return 'article({ articleId: c.id })';
    else if (c.type === 'interview') return 'interview({interviewId:c.id})';
    else return 'other.summary({ otherId: c.id })';
  };
  $scope.headers = [
    {name: 'label', label: 'Label'},
    {name: 'typelabel', label: 'Type'},
    {name: 'pubts', label: 'Published'}
  ];
  if (!userId) {
    $scope.headers.unshift({name: 'ownername', label: 'Owner'});
  }
  $scope.changeSort = function(name) {
    if ($scope.orderByField === name) {
      $scope.reverseSort = !$scope.reverseSort;
    } else {
      $scope.reverseSort = false;
      $scope.orderByField = name;
    }
  };
  $scope.sortIconClass = function(name) {
    if ($scope.orderByField !== name) return 'hidden';
    if ($scope.reverseSort) return 'fa fa-caret-up';
    else return 'fa fa-caret-down';
  };
});