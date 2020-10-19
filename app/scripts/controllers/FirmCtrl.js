'use strict';

angular.module('qldarchApp').controller('FirmCtrl', function($scope, $filter, firm, firms, architects, ArchObj, $state, Utils) {
  $scope.firm = firm;

  $scope.architectSelect = {
    placeholder : 'Select an Architect',
    dropdownAutoWidth : true,
    multiple : true,
    data : Utils.makeSelectOptions(architects)
  };

  $scope.firm.type = 'firm';

  $scope.updateFirm = function(data) {
    if (data.id) {
      ArchObj.updateFirm(data).then(function() {
        $state.go('firm.summary', {
          firmId : data.id
        });
      }).catch(function(error) {
        //console.log('Failed to save', error);
        $state.go('firm.summary.edit', {
          firmId : data.id
        });
      });
    } else {
      ArchObj.createFirm(data).then(function() {
        $state.go('firm.summary', {
          firmId : data.id
        });
      }).catch(function(error) {
        //console.log('Failed to save', error);
        $state.go('firm.summary.edit', {
          firmId : data.id
        });
      });
    }
  };

  var dataFirmSelect = Utils.makeSelectOptions(firms);

  if (angular.isDefined(firm.precededby)) {
    $scope.firm.$precededByFirms = {
      id : firm.precededby.id,
      text : firm.precededby.label
    };
  } else {
    $scope.firm.$precededByFirms = null;
  }

  $scope.precededBySelect = {
    placeholder : 'Select a Firm',
    dropdownAutoWidth : true,
    multiple : false,
    data : dataFirmSelect
  };

  if (angular.isDefined(firm.succeededby)) {
    $scope.firm.$succeededByFirms = {
      id : firm.succeededby.id,
      text : firm.succeededby.label
    };
  } else {
    $scope.firm.$succeededByFirms = null;
  }

  $scope.succeededBySelect = {
    placeholder : 'Select a Firm',
    dropdownAutoWidth : true,
    multiple : false,
    data : dataFirmSelect
  };

  $scope.clearStartYear = function() {
    firm.start = '';
  };

  $scope.clearEndYear = function() {
    firm.end = '';
  };

  $scope.cancel = function() {
    if (firm.id) {
      $state.go('firm.summary');
    } else {
      $state.go('firms.australian');
    }
  };
});