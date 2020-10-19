'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('other.interview', {
    url : '/interview/:interviewId?time',
    templateUrl : 'views/other/interview.html',
    controller : 'InterviewCtrl',
    resolve : {
      relationships : [ 'other', function(other) {
        return other.relationships;
      } ],
      interview : [ '$stateParams', 'ArchObj', function($stateParams, ArchObj) {
        return ArchObj.loadInterviewObj($stateParams.interviewId).then(function(data) {
          return data;
        }).catch(function() {
          //console.log('unable to load interview ArchObj with relationship labels');
          return {};
        });
      } ],
      relationshipOptions : [ 'RelationshipOptions', function(RelationshipOptions) {
        return RelationshipOptions.all();
      } ]
    }
  });
});