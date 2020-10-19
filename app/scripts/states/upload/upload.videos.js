'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('upload.videos', {
    url : '/video',
    templateUrl : 'views/files/video.html',
    resolve : {
      archobjs : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAll({
          type: ['person','firm','structure'],
          deleted: false,
          size: 10000
        });
      } ]
    },
    controller : 'FileVideoCtrl'
  });
});