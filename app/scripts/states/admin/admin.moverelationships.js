'use strict';

angular.module('qldarchApp').config(function($stateProvider) {
  $stateProvider.state('admin.moverelationships', {
    url : '/moverelationships',
    controller : 'AdminMoveRelationshipsCtrl',
    templateUrl : 'views/admin/admin.moverelationships.html',
    resolve : {
      compobj : [ '$stateParams', 'GraphHelper', 'CompObj', function($stateParams, GraphHelper, CompObj) {
        if ($stateParams.id) {
          return CompObj.load($stateParams.id).then(function(data) {
            if (data.type === 'timeline') {
              data.dates = angular.copy(data.timelineevent);
              delete data.timelineevent;
            }
            if (data.type === 'map') {
              data.locations = angular.copy(data.structure);
              delete data.structure;
            }
            if (data.type === 'wordcloud') {
              data.documents = angular.copy(data.wordcloud);
              delete data.wordcloud;
            }
            return data;
          }).catch(function() {
            //console.log('unable to load CompObj');
            return {};
          });
        } else {
          return {};
        }
      } ],
      all : [ 'Auth', 'RelationshipOptions', function(Auth, RelationshipOptions) {
        return Auth.status().then(function(){
          return RelationshipOptions.entities();
        });
      } ]
    },
  });
});