'use strict';

describe('Directive: Timeline', function () {

  // load the directive's module
  beforeEach(module('angularApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-timeline></-timeline>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the Timeline directive');
  }));
});
