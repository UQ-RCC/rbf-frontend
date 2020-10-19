'use strict';
(function(angular) {

function EditorToolsController($scope, $element, $attrs, $q, $state, Auth, ArchObj) {
  var ctrl = this;
  
  ctrl.$onInit = function() {
    ctrl.label = ctrl.label || ctrl.state;
    ctrl.stateParamId = ctrl.stateParamId || (ctrl.state + 'Id');
    ctrl.stateHistory = ctrl.stateHistory || (ctrl.state + '.historylog');
    ctrl.stateSummary = ctrl.stateSummary || (ctrl.state + '.summary');
    ctrl.stateEdit = ctrl.stateEdit || (ctrl.stateSummary + '.edit');
    ctrl.stateDelete = ctrl.stateDelete || (ctrl.state + 's');
    ctrl.stateParams = {};
    ctrl.stateParams[ctrl.stateParamId] = ctrl.entity.id;
  };

  ctrl.allowEdit = function() {
    return Auth.isEditor() && !$state.includes(ctrl.stateEdit);
  };
  ctrl.isStateHistory = function() {
    return $state.includes(ctrl.stateHistory);
  };
  ctrl.allowHistory = function() {
    return Auth.user.role === 'admin';
  };
  ctrl.allowDelete = function() {
    return Auth.canDelete() || Auth.user.id === ctrl.entity.owner ;
  };

  ctrl.delete = function() {
    var r = window.confirm('Delete ' + ctrl.label + ' ' + ctrl.entity.label + '?');
    if (r === true) {
      ArchObj.delete(ctrl.entity.id).then(function() {
        $state.go(ctrl.stateDelete);
      });
    }
  };
  ctrl.publish = function() {
    ArchObj.update(ctrl.entity.id, {public: true}).then(function(data){
      ctrl.entity.pubts = data.pubts;
    });
  };
  ctrl.unpublish = function() {
    ArchObj.update(ctrl.entity.id, {public: false}).then(function(data){
      ctrl.entity.pubts = null;
    });
  };

}

angular.module('qldarchApp').component('editorTools', {
  templateUrl: 'views/components/editor-tools.component.html',
  controller: EditorToolsController,
  bindings: {
    entity: '<',
    label: '@',
    state: '@',
    stateParamId: '@',
    stateDelete: '@',
    stateSummary: '@',
    stateHistory: '@',
    stateEdit: '@',
    onDelete: '&'
  }
});

})(window.angular);
  
  