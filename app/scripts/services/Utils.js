'use strict';

angular.module('qldarchApp').service('Utils', function Utils() {
  
  this.makeSelectOptions = function(entities, isMixed, extraFn) {
    var results = [];
    extraFn = extraFn || function(s,d){return d;};
    angular.forEach(entities, function(e) {
      if (!e.label || !e.label.trim()) return;
      var re = {
        id : e.id, 
        text : e.label + (isMixed ? ' ('+e.typelabel+')' : '')
      };
      re = extraFn(e, re);
      if (re) results.push(re);
    });
    return {
      results : results
    };
  };

  this.findEntity = function (entities_, id) {
    var entities = entities_;
    if (!entities.length) entities = entities.results;
    var i, len = entities.length || 0;
    for (i=0; i<len; ++i) {
      if (entities[i].id == id) return entities[i];
    }
  };

});