sap.ui.define([
    "sap/ui/core/mvc/Controller"
    // "VASPP/manageleaves/util/utils"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";
        return Controller.extend("VASPP.manageleaves.controller.BalanceLeaves", {
            onInit: function () {
                var that = this;
                that.getUserDetails();
            },
            getUserDetails: function () {
                var that = this;
                var url = 'deswork/api/users/me?populate=*';
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel = new sap.ui.model.json.JSONModel(response);
                        that.getView().setModel(oModel, "userModel");
                        that.callBalanceLeave(response.id);
                    }
                });
            },

            callBalanceLeave: function (userId) {
                var arr = [];
                var that = this;
                var url = 'deswork/api/p-balance-leaves?populate=*&filters[userId][$eq]=' +userId;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "balanceleave");
                    }
                });
            },
            handleNavBack: function () {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteApplyLeaves");
            }     
        });
    });