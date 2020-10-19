'use strict';

angular.module('qldarchApp').controller('RelationshipsCreateCtrl',
    function($scope, $http, Uris, toaster, types, $filter, architects, firms, structures, architectsFirms, $state, $stateParams, CreateRelationship, Utils) {

      $scope.relationship = {};

      var relationshiptypes = {
        results : []
      };

      for ( var type in types) {
        if ($stateParams.type === 'firm' && type === 'Employment') {
          relationshiptypes.results.push({
            id : type,
            text : types[type]
          });
        }
        if ($stateParams.type === 'structure' && type === 'WorkedOn') {
          relationshiptypes.results.push({
            id : type,
            text : types[type]
          });
        }
      }

      $scope.relationshiptypeSelect = {
        placeholder : 'Select a Relationship Type',
        dropdownAutoWidth : true,
        multiple : false,
        data : relationshiptypes
      };

      if ($stateParams.type === 'firm') {
        $scope.relationship.$type = {
          id : 'Employment',
          text : 'employed by'
        };
      }
      if ($stateParams.type === 'structure') {
        $scope.relationship.$type = {
          id : 'WorkedOn',
          text : 'worked on'
        };
      }

      var architectsSelect = Utils.makeSelectOptions(architects);

      var architectsFirmsSelect = Utils.makeSelectOptions(architectsFirms, true);

      var subjplaceholder;
      var subjdataselect;
      if ($stateParams.type === 'firm') {
        subjplaceholder = 'Select an Architect';
        subjdataselect = architectsSelect;
      } else {
        subjplaceholder = 'Select an Architect or a Firm';
        subjdataselect = architectsFirmsSelect;
      }

      $scope.subjSelect = {
        placeholder : subjplaceholder,
        dropdownAutoWidth : true,
        multiple : false,
        data : subjdataselect
      };

      var firmsSelect = Utils.makeSelectOptions(firms);
      var structuresSelect = Utils.makeSelectOptions(structures);

      var objplaceholder;
      var objdataselect;
      if ($stateParams.type === 'firm') {
        objplaceholder = 'Select a firm';
        objdataselect = firmsSelect;
      } else {
        objplaceholder = 'Select a Project';
        objdataselect = structuresSelect;
      }

      $scope.objSelect = {
        placeholder : objplaceholder,
        dropdownAutoWidth : true,
        multiple : false,
        data : objdataselect
      };

      $scope.relationship.$subject = null;
      $scope.relationship.$object = null;
      if ($stateParams.archobjType === 'structure') {
        angular.forEach(structures, function(structure) {
          if ($stateParams.archobjId === JSON.stringify(structure.id)) {
            $scope.relationship.$object = {
              id : structure.id,
              text : structure.label
            };
          }
        });
      } else if ($stateParams.type === 'firm' && $stateParams.archobjType === 'firm') {
        angular.forEach(firms, function(firm) {
          if ($stateParams.archobjId === JSON.stringify(firm.id)) {
            $scope.relationship.$object = {
              id : firm.id,
              text : firm.label
            };
          }
        });
      } else {
        angular.forEach(architectsFirms, function(entity) {
          if ($stateParams.archobjId === JSON.stringify(entity.id)) {
            $scope.relationship.$subject = {
              id : entity.id,
              text : entity.label
            };
          }
        });
      }

      function goToRelationships(archobjId, archobjType) {
        var params = {};
        if (archobjType === 'person') {
          params.architectId = archobjId;
          $state.go('architect.relationships', params);
        } else if (archobjType === 'firm') {
          params.firmId = archobjId;
          $state.go('firm.relationships', params);
        } else if (archobjType === 'structure') {
          params.structureId = archobjId;
          $state.go('structure.relationships', params);
        } else {
          params.otherId = archobjId;
          $state.go('other.relationships', params);
        }
      }

      $scope.createRelationship = function(relationship) {
        relationship.$source = 'structure';
        CreateRelationship.createRelationship(relationship).then(function() {
          toaster.pop('success', 'Relationship created');
          if ($stateParams.type === 'firm' && $stateParams.archobjType === 'firm') {
            $state.go('firm.employees', {
              firmId : $stateParams.archobjId
            });
          } else {
            goToRelationships($stateParams.archobjId, $stateParams.archobjType);
          }
        });
      };

      $scope.cancel = function() {
        if ($stateParams.type === 'firm' && $stateParams.archobjType === 'firm') {
          $state.go('firm.employees', {
            firmId : $stateParams.archobjId
          });
        } else {
          goToRelationships($stateParams.archobjId, $stateParams.archobjType);
        }
      };
    });