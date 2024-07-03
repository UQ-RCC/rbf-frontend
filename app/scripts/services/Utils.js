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

  this.levenshteinDistance = function(a,b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Calculate Levenshtein distance
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
  }
  

});