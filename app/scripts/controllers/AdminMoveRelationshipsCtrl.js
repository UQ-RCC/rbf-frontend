'use strict';

angular.module('qldarchApp').controller('AdminMoveRelationshipsCtrl', function($scope, $http, Uris, $state, toaster, $filter, all) {
  /* globals $:false */
  $scope.move = function(from, to) {
    $http({
      method : 'POST',
      url : Uris.WS_ROOT + 'relationships/move',
      headers : {
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      withCredentials : true,
      transformRequest : function(obj) {
        return $.param(obj, true);
      },
      data : {
        from : from.id,
        to : to.id
      }
    }).then(function() {
      $state.go('main');
      toaster.pop('success', 'Relationships moved', 'You have moved relationships');
    }, function() {
      toaster.pop('error', 'Error occured', 'Sorry, we couldn\t move relationships');
    });
  };
  $scope.entitySelect = {
    placeholder : 'Architect, Project, Firm or Other',
    dropdownAutoWidth : true,
    multiple : false,
    data : all
  };

});