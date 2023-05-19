sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("vaspp.ProjectStatisticalReport.controller.View1", {
            onInit: function () {
                // var sampleDatajson = new sap.ui.model.json.JSONModel("model/report.json");
                // this.getView().setModel(sampleDatajson);

                // for charts
                //  sap.ui.core.UIComponent.getRouterFor(this).getRoute("drilldown").attachPatternMatched(this._objMatched, this);
                var that = this;
                // that.serviceCall();
                var chartIds = ["chartContainer0", "chartContainer1", "chartContainer2", "chartContainer3", "chartContainer4", "chartContainer5", "chartContainer6", "chartContainer7", "chartContainer8"];
                for (var i = 0; i < chartIds.length; i++) {
                    this.getView().byId(chartIds[i])._oChartTitle.attachBrowserEvent("click", function (evt) {
                        that.getView().setBusy(true);
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("drilldown", {
                            selectedKPI: evt.target.textContent
                        });
                        that.getView().setBusy(false);
                    });
                }
                $.get('deswork/api/p-projects?populate=*', function (response) {
                    console.log(response);
                    response = JSON.parse(response);
                    var oModel = new sap.ui.model.json.JSONModel(response.data);
                    that.getView().setModel(oModel, "mprojects");
                  //  that.programLength();
                    that.projectLength();
                    that.taskLength();
                    that.projectData();
                });
                var oModel = new sap.ui.model.json.JSONModel({
                    "programLength": 0,
                    "projectLength": 0,
                    "taskLength": 0,
                });
                this.getView().setModel(oModel, "modelLength");

                var oModelStatus = new sap.ui.model.json.JSONModel({
                    "New": 0,
                    "In-Progress": 0,
                    "Completed": 0,
                    "Cancelled": 0,
                    "Archived": 0
                });
                this.getView().setModel(oModelStatus, "modelProjectStatus");

                var oModelStatus = new sap.ui.model.json.JSONModel({
                    "Jan": 0,
                    "Feb": 0,
                    "Mar": 0,
                    "Apr": 0,
                    "May": 0,
                    "Jun": 0,
                    "Jul": 0,
                    "Aug": 0,
                    "Sep": 0,
                    "Oct": 0,
                    "Nov": 0,
                    "Dec": 0
                });
                this.getView().setModel(oModelStatus, "modelProjectReceived");




            },

            projectLength: function () {
                var that = this;
                $.ajax({
                    url: "/deswork/api/p-projects?populate=*",
                    type: "GET",
                    success: function (res) {
                        var response = JSON.parse(res);
                        console.log(response);
                        that.mPrograms = response.data.length;
                        that.getView().getModel("modelLength").getData().projectLength = that.mPrograms;
                        that.getView().getModel("modelLength").updateBindings(true);
                        that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));
                        //   that.projectLength();
                        //that.Statuspie();
                    },
                    error: function (res) {
                        console.log(res);
                    }
                });
            },
            taskLength: function () {
                var that = this;
                $.ajax({
                    url: "/deswork/api/p-tasks?populate=*",
                    type: "GET",
                    success: function (res) {
                        var response = JSON.parse(res);
                        console.log(response);
                        // that.mTasks = response.data.length;
                        // response.data[0].mTasks = that.mTasks
                        // that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));
                        that.mTasks = response.data.length;
                        that.getView().getModel("modelLength").getData().taskLength = that.mTasks;
                        that.getView().getModel("modelLength").updateBindings(true);
                        that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));
                        // that.statusPie();
                    },
                    error: function (res) {
                        console.log(res);
                    }
                });
            },


            onKpiLinkPress: function (evt) {

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var pressedLinkText = evt.getSource().getText();
                oRouter.navTo("drilldown", {
                    selectedKPI: pressedLinkText
                }
                );
            },
            projectData: function () {
                var that = this;
                $.get("/deswork/api/p-projects?populate=*", function (response) {
                    response = JSON.parse(response);

                    var oModel = new sap.ui.model.json.JSONModel(response.data);
                    that.getView().setModel(oModel, "mreport");
                })
               

            }


        });
    });


