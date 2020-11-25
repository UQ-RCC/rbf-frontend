'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('article', {
    url : '/article?articleId',
    templateUrl : 'views/article.html',
    resolve : {
      article : [ '$stateParams', 'ArchObj', function($stateParams, ArchObj) {
        return ArchObj.load($stateParams.articleId).then(function(data) {
          return data;
        });
      } ],
      relationshipOptions : [ 'Auth', 'RelationshipOptions', function(Auth, RelationshipOptions) {
        return Auth.status().then(function(){
          return RelationshipOptions.all();
        });
      } ]
    },
    controller : 'ArticleCtrl'
  });
});