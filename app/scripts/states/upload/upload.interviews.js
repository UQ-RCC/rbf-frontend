'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('upload.interviews', {
    url : '/interviews?interviewId',
    resolve : {
      interview : [ '$stateParams', 'ArchObj', function($stateParams, ArchObj) {
        $stateParams.id = $stateParams.id || $stateParams.interviewId;
        delete $stateParams.interviewId;
        if (!$stateParams.id) return {};
        return ArchObj.loadInterviewObj($stateParams.id).then(function(data) {
          return data;
        }).catch(function() {
          //console.log('unable to load interview ArchObj with relationship labels');
          return {};
        });
      } ],
      person : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAllPerson();
      } ]
    },
    templateUrl : 'views/upload/upload.interviews.html',
    controller : 'UploadInterviewsCtrl'
  });
});