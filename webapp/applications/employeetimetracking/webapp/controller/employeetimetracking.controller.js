sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    '../utils/formatter',
    'sap/ui/core/date/UI5Date'
],

    /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */

    function (Controller, JSONModel, MessageBox, formatter, UI5Date) {

        "use strict";
        return Controller.extend("vaspp.employeetimetracking.controller.employeetimetracking", {
            formatter: formatter,
            onInit: function () {
                var that = this;
                this.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(this.onObjectMatched, this);
                that.getUserDetails();
            },
            getUserDetails: function () {
                var that = this;
                var url = 'deswork/api/users?populate[0]=p_tasks&populate[1]=p_appointments';
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        var arr = [];
                        response = JSON.parse(response);
                        var oModel = new sap.ui.model.json.JSONModel();
                        for (var i = 0; i < response.length; i++) {
                            
                                for (var k = 0; k < response[i].p_appointments.length; k++) {
                                    response[i].p_appointments[k].startDate = UI5Date.getInstance(response[i].p_appointments[k].startDate);
                                    response[i].p_appointments[k].endDate = UI5Date.getInstance(response[i].p_appointments[k].endDate);
                                  
                                }
                        }
                        
                        oModel.setData(response);
                        that.getView().setModel(oModel);
                    }
                });
            },
            onObjectMatched: function (oEvent) {
                var that = this;
                that.getView().setModel(new JSONModel({}));
            },

            handleAppointmentSelect: function (oEvent) {
                var oAppointment = oEvent.getParameter("appointment"),
                    sSelected;
                if (oAppointment) {
                    sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                    var info = oAppointment.getTitle() + " - " + oAppointment.getText() + "\n";
                    MessageBox.information(info, {
                        styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
                    });
                } else {
                    var aAppointments = oEvent.getParameter("appointments");
                    var sValue = aAppointments.length + " Appointments selected";
                    MessageBox.show(sValue);
                }
            },
            handleSelectionFinish: function (oEvent) {
                var aSelectedKeys = oEvent.getSource().getSelectedKeys();
                this.byId("PC1").setBuiltInViews(aSelectedKeys);
            }
        });

    });    