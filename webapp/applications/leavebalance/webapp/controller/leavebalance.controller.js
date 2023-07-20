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
        return Controller.extend("vaspp.leavebalance.controller.leaveBalance", {
            onInit: function () {
                var that = this;
                that.getOwnerComponent().getRouter().getRoute("leavebalance").attachPatternMatched(that.onObjectMatched, that);
                that.callBalanceLeave();
                that.getUserDetails();
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
            
            onObjectMatched: function (oEvent) {
                var that = this;
                that.getView().setModel(new JSONModel({}));  
                var object = {
                    "editable": false,
                    "editButton": true
                };  
                var oModel = new sap.ui.model.json.JSONModel(object);
                that.getView().setModel(oModel, "editableModel");          
            },
            onPressLeaveBalance: function() {
                var date = new Date();
                var currentYear = date.getFullYear();
                var currentMonth = date.getMonth();
                currentMonth = currentMonth + 1;
                if(currentMonth === 3) {
                    var data = that.getView().getModel("userModel").getData();
                    that.compareAndPostLeaveBalance(data, currentYear);
                } else {
                    MessageBox.error("You can't revise current financial year holidays");
                }
            },
            getUserDetails: function() {
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
                    }
                });
            },
            compareAndPostLeaveBalance: function(userData, currYear) {
                var that = this;
                var previousYearData = that.getView().getModel("balanceleave").getData();
                var i = 0;
                for(i = 0; i < userData.length; i++) {
                    for(var j = 0; j < previousYearData.length;j++) {
                        if(userData[i].id === previousYearData[j].attributes.userId) {
                            var carryForwardLeaves = previousYearData[j].attributes.balanceLeaves > 10 ? 10 : previousYearData[j].attributes.balanceLeaves;
                            var balanceLeaves = 20 + carryForwardLeaves;
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
            onEditleaves: function () {
                var that = this;
                that.editableMode(true, false);      
            },
            onDeleteleaves: function (evt) {
                var that = this;
                that.editableMode(true, false);   
                var data = that.getIndexData(evt);
                that.deleteEntry(data.id, evt);    
            },
            onCancelleaves: function () {
                var that = this;
                that.editableMode(false, true);  
                that.removeDuplicates();       
            },
            onSaveleaves: function (evt) {
                var that = this;
                that.editableMode(false, true); 
                that.removeDuplicates(); 
                var data = this.getIndexData(evt);
                that.dataUpdated(data.attributes, data.id);  
            },
            editableMode: function(val1, val2) {
                var that = this;
                var data = that.getView().getModel("editableModel").getData();
                data.editable = val1;  
                data.editButton = val2;
                that.getView().getModel("editableModel").setData(data);  
            },
            dataUpdated: function(data, id) {
                var that = this;
                if(id === 0) {
                    var type = "POST";
                    var url = "/deswork/api/p-balance-leaves";
                    var mode = "created";
                } else {
                    type = "PUT";
                    url = "/deswork/api/p-balance-leaves/" + id;
                    mode = "updated"
                }
                var settings = {
                    "url": url,
                    "method": type,
                    "timeout": 0,
                    "headers": {
                      "Content-Type": "application/json"
                    },
                    data: JSON.stringify({
                        "data": {
                          "year": parseInt(data.year),
                          "defaultLeaves": parseFloat(data.defaultLeaves),
                          "carryForwardLeaves": parseFloat(data.carryForwardLeaves),
                          "balanceLeaves": data.defaultLeaves + data.carryForwardLeaves - data.sickLeaves - data.paidLeaves,
                          "sickLeaves": parseFloat(data.sickLeaves),
                          "paidLeaves": parseFloat(data.paidLeaves),               
                          "unPaidLeaves": parseFloat(data.unPaidLeaves),
                          "userId": data.userId,
                          "userName": data.userName
                        }
                      }),
                  };
        
                  $.ajax(settings).done(function (response) {
                    response = JSON.parse(response);
                    if (response.error) {
                      MessageBox.error(response.error.message); 
                    } else {
                        MessageBox.success("Leave balance " + mode + " successfully");
                    }                   
                  });
            },
            onAddleaves: function() {
                var that = this;
                that.data = "";
                that.removeDuplicates();
                var currYear = new Date();
                currYear = currYear.getFullYear();
                var data = that.getView().getModel("balanceleave").getData();
                var obj = 
                    {
                        "id": 0,
                        "attributes": {
                            "year": currYear,
                            "defaultLeaves": 20,
                            "carryForwardLeaves": 0,
                            "balanceLeaves": 20,
                            "sickLeaves": 0,
                            "paidLeaves": 0,               
                            "unPaidLeaves": 0,
                            "userId": 0,
                            "userName": ""
                        },
                        
                    };
                data.push(obj);
                that.getView().getModel("balanceleave").setData(data);
                that.data = that.getView().getModel("balanceleave").getData();
                that.onEditleaves(true, false); 
            },
            removeDuplicates: function() {
                var that = this;
                var data = that.getView().getModel("balanceleave").getData();
                for(var i = 0; i <data.length; i++) {
                    if(data[i].attributes.userName === "") {
                        data.splice(i, 1);
                    }
                }
                that.getView().getModel("balanceleave").setData(data);
            },
            onSelectUserId: function(evt) {
                var selectedItem = evt.getParameters().selectedItem.getProperty("text");
                var data = this.getIndexData(evt);
                data.attributes.userName = selectedItem;
            },
            getIndexData: function(evt) {
                var that = this;
                var path = evt.getSource().getBindingContext("balanceleave").getPath();
                path = path.replace("/", "");
                var data;
                path = parseInt(path);
                if(that.data) {
                    data = that.data;
                } else {
                    data = that.getView().getModel("balanceleave").getData();   
                }
                data = data[path];
                return data;
            },
            deleteEntry: function(id, evt) {
                var that = this;
                if(id === 0) {
                    that.deleteFromModel(evt);
                } else {
                    var checkAndDelete = that.CheckData(id);
                    if(checkAndDelete) {
                        $.ajax({
                            url: "deswork/api/p-balance-leaves/" + id,
                            type: "DELETE",
                            success: function (res) {
                                MessageBox.error("Deleted!");
                            },
                            error: function (err) {
                                reject(err.responseText);
                            },
                        });
                    } else {
                        that.deleteFromModel(evt);
                    }
                }
            },
            deleteFromModel: function(evt) {
                var that = this;
                var path = evt.getSource().getBindingContext("balanceleave").getPath();
                path = path.replace("/", "");
                var data;
                path = parseInt(path);
                if(that.data) {
                    data = that.data;
                } else {
                    data = that.getView().getModel("balanceleave").getData();   
                }
                data.splice(path, 1);
                that.getView().getModel("balanceleave").setData(data);
            },
            CheckData: function(id) {
                var url = 'deswork/api/p-balance-leaves/' + id;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        if (response.data.length === 0) {
                            return false;
                        } else {
                            return true;
                        }
                    }
                }); 
            }   
        });
    });    