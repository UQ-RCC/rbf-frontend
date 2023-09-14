'use strict';

angular.module('qldarchApp').controller(
    'StructureCtrl',
    function($scope, structure, designers, ArchObj, firms, architects, $filter, buildingTypologies, $state, $q, $stateParams, Utils) {
      /* globals $:false */
      $scope.structure = structure;
      $scope.designers = designers;
      /*
      $scope.toDate = function(datestr) {
        if (!datestr) return;
        var parts = datestr.split('-');
        while (parts.length < 3) parts.unshift('01');
        
        return new Date(parts.reverse().join('-'));
      };
      */
      (function(){
        if ($scope.structure && $scope.structure.completion) {
          var completionpd = $scope.structure.completionpd;
          var parts = $scope.structure.completion.split('-');
          if (completionpd >= 365) {
            parts.splice(1);
          } else if (completionpd >= 28) {
            parts.splice(2);
          }
          $scope._completion = parts.reverse().join('-');
        }
      })();

      $scope.structure.type = 'structure';

      $scope.structure.associatedEntities = [];

      $scope.structure.$associatedFirm = null;
      if (angular.isDefined(designers.firms)) {
        $scope.structure.$associatedFirm = [];
        angular.forEach(designers.firms, function(firm) {
          var firmobj = {
            id : firm.subject,
            text : firm.subjectlabel
          };
          $scope.structure.$associatedFirm.push(firmobj);
          firmobj.relationshipid = firm.relationshipid;
          $scope.structure.associatedEntities.push(firmobj);
        });
      }
      if (angular.isDefined($stateParams.firmId)) {
        $scope.structure.$associatedFirm = [];
        var firm = $.grep(firms, function(f) {
          return JSON.stringify(f.id) === $stateParams.firmId;
        });
        var firmobj = {
          id : firm[0].id,
          text : firm[0].label
        };
        $scope.structure.$associatedFirm.push(firmobj);
      }

      $scope.firmSelect = {
        placeholder : 'Select a Firm',
        dropdownAutoWidth : true,
        multiple : true,
        allowClear : true,
        data : Utils.makeSelectOptions(firms)
      };

      $scope.structure.$associatedArchitects = null;
      if (angular.isDefined(designers.architects)) {
        $scope.structure.$associatedArchitects = [];
        angular.forEach(designers.architects, function(architect) {
          var architectobj = {
            id : architect.subject,
            text : architect.subjectlabel
          };
          $scope.structure.$associatedArchitects.push(architectobj);
          architectobj.relationshipid = architect.relationshipid;
          $scope.structure.associatedEntities.push(architectobj);
        });
      }
      if (angular.isDefined($stateParams.architectId)) {
        $scope.structure.$associatedArchitects = [];
        var architect = $.grep(architects, function(a) {
          return JSON.stringify(a.id) === $stateParams.architectId;
        });
        var architectobj = {
          id : architect[0].id,
          text : architect[0].label
        };
        $scope.structure.$associatedArchitects.push(architectobj);
      }

      $scope.architectSelect = {
        placeholder : 'Select an Architect',
        dropdownAutoWidth : true,
        multiple : true,
        data : Utils.makeSelectOptions(architects)
      };

      $scope.structure.$typologies = null;
      if (angular.isDefined(structure.typologies)) {
        $scope.structure.$typologies = [];
        angular.forEach(structure.typologies, function(typo) {
          for ( var typology in buildingTypologies) {
            if (typo === buildingTypologies[typology]) {
              $scope.structure.$typologies.push({
                id : typology,
                text : buildingTypologies[typology]
              });
            }
          }
        });
      }

      $scope.typologySelect = {
        placeholder : 'Select a Building Typology',
        dropdownAutoWidth : true,
        multiple : true,
        query : function(options) {
          var data = {
            results : []
          };
          for ( var typology in buildingTypologies) {
            data.results.push({
              id : typology,
              text : buildingTypologies[typology]
            });
          }
          options.callback(data);
        }
      };

      $scope.$watch('structure.location', function(location) {
        if (angular.isDefined(location)) {
          clearTimeout($scope.typingTimer);
          $scope.typingTimer = setTimeout(function() {
           // $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyByxzrKtppGuOxwzav-P52wTcfXcG1IJz0&address=' + $scope.structure.location,
	      $.getJSON('https://nominatim.openstreetmap.org/search?q=' + $scope.structure.location+'&format=json',
                function(data) {
              /*    if (data.results.length === 1) {
                    if ((structure.latitude !== data.results[0].geometry.location.lat) ||
                        (structure.longitude !== data.results[0].geometry.location.lng)) {
                      structure.latitude = data.results[0].geometry.location.lat;
                      structure.longitude = data.results[0].geometry.location.lng;
                      $('#LAT').val(data.results[0].geometry.location.lat);
                      $('#LNG').val(data.results[0].geometry.location.lng);
                    }
                  }*/
		   if (data.length > 0) {
			 if ((structure.latitude !== data[0].lat) || (structure.longitude !== data[0].lon)) {
				structure.latitude = data[0].lat;
				structure.longitude = data[0].lon;
				$('#LAT').val(data[0].lat);
				$('#LNG').val(data[0].lon);
			 }
		  }
                });
          }, 2000);
        }
      });

      $scope.updateStructure = function(data) {
        var promises = [];
        var promise;
        (function(d){
          if (!d) return;
          //var yyyymmdd = d.replace(/\D*/g,'');
          var parts = d.split('-');
          // completionpd is a precision delta in days, eg:
          // 0 means that the date is accurate to the date/day
          // 30 means that the date is accurate to the month
          if (parts.length === 3) {
            data.completionpd = 0;
          } else if (parts.length === 2) {
            data.completionpd = (new Date(+parts[1], parts[0] - 1, 0)).getDate();
          } else if (parts.length === 1) {
            var y = +parts[2];
            data.completionpd = !(y%(y%25?4:16)) ? 366 : 365;
          }
          data.completion = parts.reverse().join('-');
        })($scope._completion);
        if (data.id) {
          promise = ArchObj.updateStructure(data).then(function(res) {
            return res;
          }).catch(function(error) {
            //console.log('Failed to save', error);
            $state.go('structure.summary.edit', {
              structureId : data.id
            });
            return error;
          });
          promises.push(promise);
        } else {
          promise = ArchObj.createStructure(data).then(function(res) {
            return res;
          }).catch(function(error) {
            //console.log('Failed to save', error);
            $state.go('structure.summary.edit', {
              structureId : data.id
            });
            return error;
          });
          promises.push(promise);
        }
        $q.all(promises).then(function() {
          if (angular.isDefined($stateParams.firmId)) {
            $state.go('firm.structures', {
              firmId : $stateParams.firmId
            }, {
              reload : true,
              inherit : false
            });
          } else if (angular.isDefined($stateParams.architectId)) {
            $state.go('architect.structures', {
              architectId : $stateParams.architectId
            }, {
              reload : true,
              inherit : false
            });
          } else if (structure.id) {
            $state.go('structure.summary', {
              structureId : data.id
            }, {
              reload : true,
              inherit : false
            });
          } else {
            $state.go('structures.australian');
          }
        });
      };

      $scope.clearCompletionDate = function() {
        structure.completion = '';
      };

      $scope.cancel = function() {
        if (structure.id) {
          $state.go('structure.summary');
        } else if (angular.isDefined($stateParams.firmId)) {
          $state.go('firm.structures', {
            firmId : $stateParams.firmId
          });
        } else if (angular.isDefined($stateParams.architectId)) {
          $state.go('architect.structures', {
            architectId : $stateParams.architectId
          });
        } else {
          $state.go('structures.australian');
        }
      };
    });
