'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('upload.images', {
    url : '/image',
    templateUrl : 'views/files/photograph.html',
    resolve : {
      archobjs : [ 'AggArchObjs', function(AggArchObjs) {
        return AggArchObjs.loadAll({
          type: ['person','firm','structure'],
          deleted: false,
          size: 10000
        });
      } ]
    },
    controller : 'FilePhotographCtrl'
  });
});