'use strict';

angular.module('qldarchApp').service('RelationshipOptions', function RelationshipOptions($http, $q, $filter, Auth, Uris, AggArchObjs, RelationshipLabels, Utils) {
  return {
    types: function() {
      return RelationshipLabels.load().then(function(types) {
        return Object.keys(types).map(function(k){
          return {id: k, text: types[k]};
        });
      });
    },

    entities: function() {
      //var entities = [];
      if (!Auth.isEditor()) return $q.when([]);
      return AggArchObjs.loadAll({
        exctype: ['article','interview'],
        deleted: false,
        size: 10000
      }).then(function(result) {
        return Utils.makeSelectOptions(result, true, function(s, d){
          d.label = s.label;
          d.type = s.type;
          d.architect = s.architect;
          return d;
        });
      });

    },

    all : function() {
      var self = this;
      return $q.all([self.types(), self.entities()]).then(function(result) {
        //console.log('load relationship labels');
        return {
          types: result[0],
          entities: result[1]
        };
      });
    }
  };
});