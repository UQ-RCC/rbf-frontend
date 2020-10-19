'use strict';
angular.module('qldarchApp').directive('validdate', function (){ 
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ctrl) {
      ctrl.$validators.validdate = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }
        var parts = viewValue.split('-');
        while (parts.length < 3) parts.unshift('01');
        var d = new Date(+parts[2], parts[1] - 1, +parts[0]);
        return !!d && d.getMonth() == parts[1] - 1 && d.getDate() == +parts[0] && d.getFullYear() == +parts[2];
      };
    }
  };
});