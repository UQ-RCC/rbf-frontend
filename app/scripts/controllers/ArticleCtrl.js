'use strict';

angular.module('qldarchApp').controller('ArticleCtrl', function($scope, $http, $q, article, ArchObj, $state, toaster, Uris, relationshipOptions, File) {
  $scope.article = article;
  $scope.relationshipOptions = relationshipOptions;

  $scope.cancel = function(article) {
    $state.go('article', {
      articleId : article.id
    });
  };

  $scope.delete = function(article) {
    return $q.all(_.map(article.media, function(m){ 
      return File.delete(m.id);
    }));
  };

  $scope.updateArticle = function(data) {
    if (data.id) {
      ArchObj.updateArticle(data).then(function() {
        $state.go('article', {
          articleId : data.id
        });
      }).catch(function(error) {
        //console.log('Failed to save', error);
        $state.go('article.edit', {
          articleId : data.id
        });
      });
    } else {
      ArchObj.createArticle(data).then(function(response) {
        $state.go('article', {
          articleId : response.id
        });
      }).catch(function(error) {
        //console.log('Failed to save', error);
        $state.go('article.edit', {
          articleId : data.id
        });
      });
    }
  };

  $scope.createRelationship = function(data, payload, articleId) {
    payload.source = 'article';
    payload.article = articleId;
    return $http({
      method : 'PUT',
      url : Uris.WS_ROOT + 'articlerelationship',
      headers : {
        'Content-Type' : 'application/x-www-form-urlencoded'
      },
      withCredentials : true,
      transformRequest : function(obj) {
        return $.param(obj);
      },
      data : payload
    }).then(function(response) {
      toaster.pop('success', 'Article relationship created');
      //console.log('created interview relationship id: ' + response.data.id);
      return response.data;
    }, function(response) {
      toaster.pop('error', 'Error occured', response.data.msg);
      //console.log('error message: ' + response.data.msg);
    });
  };

  $scope.deleteRelationship = function(relationship) {
    var r = window.confirm('Delete this article relationship?');
    if (!r) return;
    return $http.delete(Uris.WS_ROOT + 'relationship/' + relationship.id, {
      withCredentials : true
    }).then(function(response) {
      toaster.pop('success', 'Article relationship deleted');
      //console.log('deleted interview relationship id: ' + response.data.id);
      return response.data;
    }, function(response) {
      toaster.pop('error', 'Error occured', response.data.msg);
      //console.log('error message: ' + response.data.msg);
    });
  };


});