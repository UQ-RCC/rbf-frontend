'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('relationships.create', {
    url : '/create?type&archobjId&archobjType',
    templateUrl : 'views/relationships/relationships.create.html',
    resolve : {
      types : [ 'RelationshipLabels', function(RelationshipLabels) {
        return RelationshipLabels.load().then(function(response) {
          return response;
        });
      } ],
      architects : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAllArchitects();
      } ],
      firms : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAllFirms();
      } ],
      structures : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAllProjects();
      } ],
      architectsFirms : [ 'architects', 'firms', function(architects, firms) {
        var entities = [];
        Array.prototype.push.apply(entities, architects);
        Array.prototype.push.apply(entities, firms);
        return entities;
      } ]
    },
    controller : 'RelationshipsCreateCtrl'
  });
});