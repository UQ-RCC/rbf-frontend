'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('user.contents', {
    abstract : true,
    url : '/contents',
    controller: function(){},
    templateUrl : 'views/user/user.contents.html'
  });
  $stateProvider.state('user.contents.owned', {
    url : '/owned',
    controller : 'UserContentsCtrl',
    templateUrl : 'views/user/user.contents.list.html',
    resolve : {
      contents : function(AggArchObjs, Auth) {
        return AggArchObjs.loadAll({owner: Auth.user.id, size: 2000, deleted: false});
      },
      userId: function(Auth) {
        return Auth.user.id;
      }
    }
  });
  $stateProvider.state('user.contents.all', {
    url : '/all',
    controller : 'UserContentsCtrl',
    templateUrl : 'views/user/user.contents.list.html',
    resolve : {
      contents : function(AggArchObjs, Auth) {
        if (Auth.user.role !== 'admin') return [];
        return AggArchObjs.loadAll({size: 5000, deleted: false});
      },
      userId: function() {
        return;
      }
    }
  });
});