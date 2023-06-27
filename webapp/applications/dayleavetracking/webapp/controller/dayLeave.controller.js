sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],

    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */

    function (Controller, JSONModel, MessageToast, MessageBox) {

        "use strict";
        return Controller.extend("vaspp.dayleavetracking.controller.dayLeave", {
            onInit: function () {
                var that = this;
                that.callBalanceLeave();
            },
            callBalanceLeave: function () {
                var arr = [];
                var that = this;
                var today = new Date();
                var date = today.getDate();
                var month = today.getMonth() +  1;
                var year = today.getFullYear();
                if(date < 10) {
                    date = "0" + date;
                }
                if(month) {
                    month = "0" + month;
                }
				var result = date + "-" + month + "-" + year;
                that.getView().byId("_IDGenPage2").setTitle(result + " Leave tracking");
                var url = "/deswork/api/p-leaves?populate=*&filters[status][$eq]=Approved&filters[startDate][$eq]=" + result;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "dayLeaveTrack");
                    }
                });
            },
            handleNavBackpress: function () {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteApplyLeaves");
            }       
        });

    });    