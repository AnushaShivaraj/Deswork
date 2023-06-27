sap.ui.define([

    "sap/ui/core/mvc/Controller",
    "VASPP/manageleaves/utils/formatter",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, formatter, MessageBox) {
        "use strict";

        return Controller.extend("VASPP.manageleaves.controller.AppliedLeaves", {
            formatter: formatter,

            onInit: function () {
                var that = this;
                that.getUserDetails();
            },

            // Binding the data 
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
                        console.log(response.id);
                        console.log(response);
                        that.callLeaveHistory(response.id);
                    }
                });
            },

            callLeaveHistory: function (userId) {
                var arr = [];
                var that = this;
                var url = "/deswork/api/p-leaves?populate=*";
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        console.log(response);
                        var i;
                        for (i = 0; i < response.data.length; i++) {
                            if (parseInt(userId) === parseInt(response.data[i].attributes.requestedById)) {
                                arr.push(response.data[i]);
                                console.log(arr);
                            }
                        }
                        var oModel2 = new sap.ui.model.json.JSONModel(arr);
                        that.getView().setModel(oModel2, "leavehistory");
                        console.log(that.getView().getModel("leavehistory").getData());
                    }
                });

            },

            //NAVIGATING BACK TO LEAVE ENTRY

            handleNavBack: function () {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteApplyLeaves");
            },

            
            //DELETE THE LEAVE REQUEST    

            deleteRow: function (oEvent) {
                var that=this;
                var oTable = this.getView().byId("ItemDetailsTable");
                 var oItems = oEvent.getParameter("listItem");
                var oItem = oEvent.getParameter("listItem").getBindingContext("leavehistory").getProperty().id;
                MessageBox.confirm("Are you sure you want to Delete the Leave Request?", {
                    actions: ["Yes", "No"],
                    emphasizedAction: "Yes",
                    onClose: function (oEvent) {
                        if (oEvent == "Yes") {
                            $.ajax({
                              url: "/deswork/api/p-leaves/" + oItem,
                              method: "DELETE",
                              headers: {
                                    "Content-Type": "application/json"
                                },
                              success: function (response) { 
                              response = JSON.parse(response);  
                              oTable.removeItem(oItems);                   
                              MessageBox.success("Leave Request has been deleted");
                             },
                         });
                        }
                     }
                  });
            },
       
        });
    });