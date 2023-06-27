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
        return Controller.extend("vaspp.dayleavetracking.controller.leaveBalance", {
            onInit: function () {
                var that = this;
                this.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(this.onObjectMatched, this);
                that.callBalanceLeave();
                that. getEmployeeDetails();
            },
            callBalanceLeave: function () {
                var that = this;
                var date = new Date();
                var currentYear = date.getFullYear();
                var url = 'deswork/api/p-balance-leaves?populate=*&filters[year]][$eq]=' + currentYear;
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
            onPressWeekTracking: function() {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("weekLeave");
            },
            onPressDayTracking: function() {
                sap.ui.core.UIComponent.getRouterFor(this).navTo("dayLeave");
            },
            onObjectMatched: function (oEvent) {
                var that = this;
                that.getView().setModel(new JSONModel({}));               
            },
            onPressLeaveBalance: function() {
                var date = new Date();
                var currentYear = date.getFullYear();
                var currentMonth = date.getMonth();
                currentMonth = currentMonth + 1;
                if(currentMonth === 3) {
                    this.getUserDetails(currentYear);
                } else {
                    MessageBox.error("You can't revise current financial year holidays");
                }
            },
            getUserDetails: function(currentYear) {
               var that = this;
               var url = 'deswork/api/users?filters[confirmed][$eq]=true';
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
                        that.compareAndPostLeaveBalance(response, currentYear);
                    }
                });
            },
            compareAndPostLeaveBalance: function(userData, currYear) {
                var arr = [];
                var that = this;
                var previousYearData = that.getView().getModel("balanceleave").getData();
                var obj = {}, data = {}, i = 0;
                for(i = 0; i < userData.length; i++) {
                    for(var j = 0; j < previousYearData.length;j++) {
                        if(userData[i].id === previousYearData[j].attributes.userId) {
                            var carryForwardLeaves = previousYearData[j].attributes.balanceLeaves > 10 ? 10 : previousYearData[j].attributes.balanceLeaves;
                            var balanceLeaves = 20 + carryForwardLeaves;
                            var userId = userData[i].id;
                            var userName = userData[i].firstName + " " + userData[i].lastName;
                            var settings = {
                                "url": "/deswork/api/p-balance-leaves",
                                "method": "POST",
                                "timeout": 0,
                                "headers": {
                                  "Content-Type": "application/json"
                                },
                                "data": JSON.stringify({
                                  "data": {
                                    "year": currYear,
                                    "defaultLeaves": 20,
                                    "carryForwardLeaves": carryForwardLeaves,
                                    "balanceLeaves": balanceLeaves,
                                    "sickLeaves": 0,
                                    "paidLeaves": 0,               
                                    "unPaidLeaves": 0,
                                    "userId": userData[i].id,
                                    "userName": userData[i].firstName + " " + userData[i].lastName
                                  }
                                }),
                              };
                    
                              $.ajax(settings).done(function (response) {
                                response = JSON.parse(response);
                                if (response.error) {
                                  MessageBox.error(response.error.message);
                                }                   
                              });
                            j = previousYearData.length;
                        }
                    }
                }
            },

            dataUpdated: function(data) {
                var that = this;
                var updateUrl = '/deswork/api/p-balance-leaves';
                $.ajax({
                    url: '/deswork/api/p-balance-leaves',
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }, data: JSON.stringify(data),
                    success: function (response) {
                        sap.m.MessageToast.show(response);
                    }
                });
            },
            getEmployeeDetails: function () {
                var that = this;
                var today = new Date();
                var year = today.getFullYear();
                $.ajax({
                  url: "deswork/api/p-balance-leaves?populate=*&filters[year][$eq]=" + year,
                  type: "GET",
                  success: function (res) {
                    var response = JSON.parse(res);
                    console.log(response);
                    var theModel = new sap.ui.model.json.JSONModel(response.data);
                    that.getView().setModel(theModel, "EmployeeDetail");
                   },
                  error: function (res) {
                    console.log(res);
                    MessageBox.error(res + "Something went wrong");
                  },
                });
              },

            onEditleaves: function () {
                   var that = this;
                   if (!that.oEditLeaveDialog) {
                  that.oEditLeaveDialog = sap.ui.xmlfragment(
                    "vaspp.dayleavetracking.view.Edit",
                    that
                  );
                  that.getView().addDependent(that.oEditLeaveDialog);
                   }
             // Set the current year as default value
                    var oDate = new Date();
                    var oYearModel = new sap.ui.model.json.JSONModel({
                    year: oDate.getFullYear(),
                    });
                     that.oEditLeaveDialog.setModel(oYearModel, "year");
                    that.oEditLeaveDialog.open();
                },
        
              closeProjectDialog: function () {
                    this.oEditLeaveDialog.close();
                },
        
              onPress: function (oEvent) {
                    var that = this;
                    var today = new Date();
                    var year = today.getFullYear();
                    var selectedId = oEvent.getSource().getSelectedKey();
                    that.selectedId=selectedId; //this is done to make variable global i.e., we can use global variable even out of this particular function, in overall controller.
                    console.log(selectedId);
                   var url = "deswork/api/p-balance-leaves?populate=*&filters[year][$eq]=" +year +"&filters[id]][$eq]=" + selectedId;
                   $.ajax({
                       url: url,
                       type: "GET",
                       success: function (res) {
                           var response = JSON.parse(res);
                           console.log(response);
                           var oModel = new sap.ui.model.json.JSONModel(response.data[0]);
                           that.getView().setModel(oModel, "empDetails");
                           that.oEditLeaveDialog.setModel("empDetails");
                           },
                        });
                    },
        
              onSaveProject: function (oEvent) {
                     var that = this;
                     var today = new Date();
                     var year = today.getFullYear();
                     var employee = that.getView().getModel("empDetails").getData().attributes;
                 $.ajax({
                     url: "/deswork/api/p-balance-leaves",
                     type: "GET",
                     success: function (response) {
                         var res = JSON.parse(response);
                     
                         var obj = {
                            "data": {
                               year: employee.year,
                               defautLeaves: employee.defaultLeaves,
                               balanceLeaves: employee.balanceLeaves,
                               sickLeaves: employee.sickLeaves,
                               carryForwardLeaves: employee.carryForwardLeaves,
                               paidLeaves: employee.paidLeaves,
                               unPaidLeaves: employee.unPaidLeaves,
                               userId: employee.userId,
                               userName: employee.userName
                              }
                           };
                 $.ajax({
                     url: "/deswork/api/p-balance-leaves/" + that.selectedId,
                     type: "PUT",
                     headers: {
                        "Content-Type": "application/json",
                            },
                     data: JSON.stringify(
                          obj
                          ),
                     dataType: "json",
                     success: function () {
                          response = JSON.parse(response);
                          console.log(response);
                        if (response.error){
                           MessageBox.error("Error noticed");
                          } else {
                           that.getView().getModel("empDetails").updateBindings(true);
                           that.onInit();  //if model dont update at updateBindings(true) then give onInit()
                           MessageToast.show("Leave Edited Successfully!");
                           that.oEditLeaveDialog.close();
                           that.getView().getModel("empDetails").refresh();
                          }
                        },
                      });
                   },
                });
              }, 
              onDeleteleaves: function (evt) {
                var that = this;
                var table = this.getView().byId("leavesTracking");
                var selectedItems = table.getSelectedItems();
                if (selectedItems.length > 0) {
                    MessageBox.confirm(
                        "Are you sure you want to delete the selected Task?",
                        {
                            title: "Confirm Deletion",
                            icon: MessageBox.Icon.WARNING,
                            actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                            emphasizedAction: MessageBox.Action.YES,
                            onClose: function (oAction) {
                                if (oAction === "YES") {
                                    var deletePromises = [];
                                    selectedItems.forEach(function (item) {
                                        var path = item.getBindingContextPath();
                                        var itemId = table
                                            .getModel("EmployeeDetail")
                                            .getProperty(path).id;
                                        deletePromises.push(
                                            new Promise(function (resolve, reject) {
                                                $.ajax({
                                                    url: "deswork/api/p-balance-leaves/" + itemId,
                                                    type: "DELETE",
                                                    success: function (res) {
                                                        resolve(res);
                                                    },
                                                    error: function (err) {
                                                        reject(err.responseText);
                                                    },
                                                });
                                            })
                                        );
                                    });
        
                                    Promise.all(deletePromises)
                                        .then(function () {
                                            // Handle success
                                            that.getView().getModel("EmployeeDetail").updateBindings(true);
                                            that.onInit();
                                            MessageToast.show("Tasks Deleted Successfully!");
                                           
                                        })
                                        // .catch(function (error) {
                                        //     // Handle error
                                        //     MessageBox.error(error);
                                        // });
                                 }
                            },
                        }
                    );
                } else {
                    sap.m.MessageToast.show("Please select at least one item.");
                }
            },
                 
        });

    });    