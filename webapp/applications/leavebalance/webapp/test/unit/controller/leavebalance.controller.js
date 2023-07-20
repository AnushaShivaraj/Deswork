/*global QUnit*/

sap.ui.define([
	"vaspp/leavebalance/controller/leavebalance.controller"
], function (Controller) {
	"use strict";

	QUnit.module("leavebalance Controller");

	QUnit.test("I should test the leavebalance controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
