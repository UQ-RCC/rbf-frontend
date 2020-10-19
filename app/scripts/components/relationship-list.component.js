'use strict';
(function(angular) {

function RelationshipListController($scope, $element, $attrs, $q, RelationshipOptions, Utils) {
  var ctrl = this;

  ctrl.$postLink = function() {
    ctrl.allowEdit = $attrs['allowEdit'] != null;
    ctrl.fieldPage = $attrs['fieldPage'] != null;
  };

  /**
   * Shows the add relationship box.
   * 
   * Shows the controls and pauses the audio.
   * 
   * @param {Object}
   *          exchange The exchange to add the relationship
   */
  ctrl.showAddRelationship = function() {
    RelationshipOptions.all().then(function(opt) {
      ctrl.isAddingRelationship = true;
      ctrl.relationship = {};
      ctrl.typesSelect = ctrl.typesSelect || {
        placeholder : 'Select a Relationship Type',
        dropdownAutoWidth : false,
        multiple : false,
        initSelection : true, // https://github.com/angular-ui/ui-select2/issues/153
        data : opt.types
      };
    
      ctrl.entitiesSelect = ctrl.entitiesSelect || {
        placeholder : 'Select an Entity',
        dropdownAutoWidth : false,
        multiple : false,
        initSelection : true,// https://github.com/angular-ui/ui-select2/issues/153
        data : opt.entities
      };

      if (ctrl.defaultSubjectId != null) {
        ctrl.relationship.subject = Utils.findEntity(opt.entities, ctrl.defaultSubjectId);
      }
      ctrl.onAdding();
    });
  };

  /**
   * Removes the add relationship box for an exchange.
   * 
   * @param {Object}
   *          exchange The exchange to close the exchange on
   */
  ctrl.hideAddRelationship = function() {
    ctrl.isAddingRelationship = false;
  };

  ctrl.showEditRelationships = function() {
    // Close any other ones that may be open
    // angular.forEach($scope.interview.transcript, function(exchange) {
    //   $scope.hideAddRelationship(exchange);
    // });
    ctrl.isEditingRelationships = true;
    ctrl.onEditing();
  };

  ctrl.hideEditRelationships = function() {
    ctrl.isEditingRelationships = false;
  };

  ctrl.addRelationship = function() {
    var data = ctrl.relationship;
    if (angular.isDefined(data)) {
      var payload = angular.copy(data);
      delete payload.subject;
      delete payload.type;
      delete payload.object;
      delete payload.from;
      delete payload.until;
      if (angular.isDefined(data.subject.id)) {
        payload.subject = data.subject.id;
      }
      if (angular.isDefined(data.type.id)) {
        payload.type = data.type.id;
      }
      if (angular.isDefined(data.object.id)) {
        payload.object = data.object.id;
      }
      if (data.from !== null && angular.isDefined(data.from) && data.from !== '') {
        payload.from = data.from.getFullYear();
      }
      if (data.until !== null && angular.isDefined(data.until) && data.until !== '') {
        payload.until = data.until.getFullYear();
      }

      $q.when(ctrl.onCreate({data: data, payload: payload})).then(function(r) {
        if (!r) return;
        r.subjectlabel = data.subject.label;
        r.subjecttype = data.subject.type;
        r.subjectarchitect = data.subject.architect;
        r.relationship = data.type.text;
        r.objectlabel = data.object.label;
        r.objecttype = data.object.type;
        r.objectarchitect = data.object.architect;
        r.relationshipid = r.id;
        r.fromyear = r.from;
        r.untilyear = r.until;
        ctrl.relationships = ctrl.relationships || [];
        ctrl.relationships.push(r);
        ctrl.onCreated({data:r});
      });
    }
    ctrl.hideAddRelationship();
  };

  ctrl.deleteRelationship = function(relationship, index) {
    $q.when(ctrl.onDelete({data: relationship})).then(function(r) {
      ctrl.relationships.splice(index, 1);
      if (ctrl.relationships.length === 0) ctrl.isEditingRelationships = false;
      ctrl.onDeleted({data:r});
    });
  };

}

angular.module('qldarchApp').component('relationshipList', {
  templateUrl: 'views/components/relationship-list.component.html',
  controller: RelationshipListController,
  bindings: {
    relationships: '<',
    //entities: '<',
    //types: '<',
    defaultSubjectId: '<',
    onCreate: '&',
    onDelete: '&',
    onAdding: '&',
    onEditing: '&',
    onCreated: '&',
    onDeleted: '&'
  }
});

})(window.angular);
  
  