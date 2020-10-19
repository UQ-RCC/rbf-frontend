'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('firm', {
    abstract : true,
    url : '/firm?firmId',
    templateUrl : 'views/firm/layout.html',
    resolve : {
      firm : [ '$stateParams', 'ArchObj', '$filter', function($stateParams, ArchObj, $filter) {
        if (!$stateParams.firmId) {
          return {};
        } else {
          return ArchObj.loadWithRelationshipLabels($stateParams.firmId).then(function(data) {
            data.media = $filter('orderBy')(data.media, function(media) {
              return (media.preferred || '');
            }, true);
            return data;
          }).catch(function() {
            //console.log('unable to load firm ArchObj with relationship labels');
            return {};
          });
        }
      } ],
      architects : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAllArchitects();
      } ],
      firms : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAllFirms();
      } ],
      allstructures : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAllProjects();
      } ]
    },
    controller : [ '$scope', 'firm', 'ArchObj', '$state', function($scope, firm, ArchObj, $state) {
      $scope.firm = firm;
    } ]
  });
});