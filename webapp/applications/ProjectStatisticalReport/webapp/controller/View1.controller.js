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
				var that = this;
				var design = this.getOwnerComponent().getModel("loggedOnUserModel").getData().designation;
				if (design === "IT") {
					this.getView().byId("_IDGenTitle1").setVisible(false);
					this.getView().byId("totalCalls").setVisible(false);
					this.getView().byId("totaltask").setVisible(false);
					this.getView().byId("newprojects").setVisible(false);
					this.getView().byId("totalCount").setVisible(false);
					this.getView().byId("InProgress").setVisible(false);

					this.getView().byId("_IDGenBlockLayoutCell2").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell5").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell3").setVisible(false);
					this.getView().byId("_IDGenBlockLayutCell2").setVisible(false);
					this.getView().byId("_IDGenObjectIdentifier1").setVisible(false);
					// this.getView().byId("_IDGenChartContainerContent4").setVisible(false);
					// this.getView().byId("chartContainer3").setVisible(false);

					// this.getView().byId("_IDGenBlockLayoutRow3").setVisible(false);

					// this.getView().byId("_IDGenBlockLayoutRow2").setVisible(false);
					// this.getView().byId("idVizFrame4").setVisible(false);
				}
				else if (design === "HR") {
					this.getView().byId("_IDGenTitle1").setVisible(false);
					this.getView().byId("totalCalls").setVisible(false);
					this.getView().byId("totaltask").setVisible(false);
					this.getView().byId("newprojects").setVisible(false);
					this.getView().byId("totalCount").setVisible(false);
					this.getView().byId("InProgress").setVisible(false);

					this.getView().byId("_IDGenBlockLayoutCell2").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell5").setVisible(false);
					this.getView().byId("_IDGenBlockLayoutCell3").setVisible(false);
					this.getView().byId("_IDGenBlockLayutCell2").setVisible(false);
					this.getView().byId("_IDGenObjectIdentifier1").setVisible(false);

				}
				else {


				}
				//	var chartIds = ["chartContainer0", "chartContainer1", "chartContainer2", "chartContainer3", "chartContainer4"];
				//	for (var i = 0; i < chartIds.length; i++) {
				// this.getView().byId(chartIds[i])._oChartTitle.attachBrowserEvent("click", function (evt) {
				// 	that.getView().setBusy(true);
				// 	var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				// 	oRouter.navTo("drilldown", {
				// 		selectedKPI: evt.target.textContent
				// 	});
				// 	that.getView().setBusy(false);
				// });
				//}
				$.get('deswork/api/p-projects?populate=*', function (response) {
					console.log(response);
					response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mprojects");
					//  that.programLength();
					that.projectLength();
					that.statusPiePrograms();
					that.taskLength();
					//that.projectData();
					that.projectNewLength();
					that.ProjectsSubmitted();
					that.ProjectsInProgress();
					that.ProjectMilestones();
					that.progressChart();
					that.projectReceivedAll();
					that.ProjectBudget();
				});
				var oModel = new sap.ui.model.json.JSONModel({
					"programLength": 0,
					"projectLength": 0,
					"taskLength": 0,
					"projectNewLength": 0,
					"ProjectsSubmitted": 0,
					"ProjectsInProgress": 0
				});
				this.getView().setModel(oModel, "modelLength");

				var oModelStatus = new sap.ui.model.json.JSONModel({
					"New": 0,
					"In-progress": 0,
					"Completed": 0,

				});
				this.getView().setModel(oModelStatus, "modelProjectStatus");

			},
			statusPiePrograms: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects",
					type: "GET",
					success: function (res) {
						console.log(response);
						var status_counts = that.getView().getModel("modelProjectStatus").getData();
						var response = JSON.parse(res);
						console.log(response);
						var reslen = that.getView().getModel("mprojects").getData();
						
						for (var i = 0; i < reslen.length; i++) {
							var status = reslen[i].attributes.status;
							if (!status_counts[status]) {
								status_counts[status] = 1;
							} else {
								status_counts[status]++;
							}
						}

						var chartData = [];
						for (var status in status_counts) {
							chartData.push({
								status: status,
								count: status_counts[status]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartstatuspie");
						that.getView().getModel("mreportchartstatuspie").updateBindings(true);

					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			progressChart: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects",
					type: "GET",
					success: function (res) {
						var statusCounts = that.getView().getModel("mprojects").getData();

						var chartData = [];
						statusCounts.forEach(function (project) {
							var chartEntry = {
								"progress": project.attributes.progress,
								"name": project.attributes.name
							};
							chartData.push(chartEntry);
						});

						var oChartModel = new sap.ui.model.json.JSONModel();
						oChartModel.setData({
							"chartData": chartData
						});
						that.getView().setModel(oChartModel, "mreportchartprogress");
						that.getView().getModel("mreportchartprogress").updateBindings(true);

					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			ProjectBudget: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects",
					type: "GET",
					success: function (res) {
						var statusCounts = that.getView().getModel("mprojects").getData();

						var chartData = [];
						statusCounts.forEach(function (project) {
							var chartEntry = {
								"actual_budget": project.attributes.actual_budget,
								"estimated_budget": project.attributes.estimated_budget,
								"name": project.attributes.name
							};
							chartData.push(chartEntry);
						});

						var oChartModel = new sap.ui.model.json.JSONModel();
						oChartModel.setData({
							"chartData": chartData
						});
						that.getView().setModel(oChartModel, "mreportchartBudget");
						that.getView().getModel("mreportchartBudget").updateBindings(true);
						//that.ResourcesUtilize();
					},
					error: function (err) {
						console.error(err);
					}
				});
			},
			ResourcesUtilize: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?populate=*",
					type: "GET",
					success: function (res) {
						var projects = that.getView().getModel("mprojects").getData();

						var chartData = [];

						projects.forEach(function (project) {
							var milestonesInProgress = 0;
							var milestonesCompleted = 0;
							var milestonesNew = 0;

							project.attributes.p_milestones.data.forEach(function (milestone) {

								if (milestone.attributes.status === "In-Progress") {
									milestonesInProgress++;
								} else if (milestone.attributes.status === "Completed") {
									milestonesCompleted++;
								} else if (milestone.attributes.status === "New") {
									milestonesNew++;
								}

							});

							var projectEntry = {
								"name": project.attributes.name,
								"In-Progress": milestonesInProgress,
								"Completed": milestonesCompleted,
								"New": milestonesNew
							};

							chartData.push(projectEntry);
						});


						var oChartModel = new sap.ui.model.json.JSONModel();
						oChartModel.setData({
							"chartData": chartData
						});
						that.getView().setModel(oChartModel, "modelProjectMilestones");
						that.getView().getModel("modelProjectMilestones").updateBindings(true);
					}
				});
			},
			ProjectMilestones: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?populate=*",
					type: "GET",
					success: function (res) {
						var projects = that.getView().getModel("mprojects").getData();

						var chartData = [];

						projects.forEach(function (project) {
							var milestonesInProgress = 0;
							var milestonesCompleted = 0;
							var milestonesNew = 0;

							project.attributes.p_milestones.data.forEach(function (milestone) {

								if (milestone.attributes.status === "In-Progress") {
									milestonesInProgress++;
								} else if (milestone.attributes.status === "Completed") {
									milestonesCompleted++;
								} else if (milestone.attributes.status === "New") {
									milestonesNew++;
								}

							});

							var projectEntry = {
								"name": project.attributes.name,
								"In-Progress": milestonesInProgress,
								"Completed": milestonesCompleted,
								"New": milestonesNew
							};

							chartData.push(projectEntry);
						});


						var oChartModel = new sap.ui.model.json.JSONModel();
						oChartModel.setData({
							"chartData": chartData
						});
						that.getView().setModel(oChartModel, "modelProjectMilestones");
						that.getView().getModel("modelProjectMilestones").updateBindings(true);
					}
				});
			},
			projectReceivedAll: function () {
				var that = this;

				$.ajax({
					url: "/deswork/api/p-projects?populate=*",

					type: "GET",
					success: function (res) {
						console.log(response);


						var month_counts = {
							Jan: 0,
							Feb: 0,
							Mar: 0,
							Apr: 0,
							May: 0,
							Jun: 0,
							Jul: 0,
							Aug: 0,
							Sep: 0,
							Oct: 0,
							Nov: 0,
							Dec: 0

						};
						var response = JSON.parse(res);
						console.log(response);

						var reslen = that.getView().getModel("mprojects").getData();


						var projectData = [];
						for (var i = 0; i < reslen.length; i++) {
							projectData.push(reslen[i].attributes.startDate);
						}

						for (var i = 0; i < reslen.length; i++) {
							var startDate = reslen[i].attributes.startDate;
							var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
								pattern: "MMM"
							});
							var oDate = new Date(startDate);
							var sMonthName = oDateFormat.format(oDate);
							if (!month_counts[sMonthName]) {
								month_counts[sMonthName] = 1;
							} else {
								month_counts[sMonthName]++;
							}
						}

						var chartData = [];
						for (var sMonthName in month_counts) {
							chartData.push({
								sMonthName: sMonthName,
								count: month_counts[sMonthName]
							});
						}
						var oModel = new sap.ui.model.json.JSONModel({
							chartData: chartData
						});
						that.getView().setModel(oModel, "mreportchartmonth");
						that.getView().getModel("mreportchartmonth").updateBindings(true);

					},
					error: function (err) {
						console.error(err);
					}
				});
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

					},
					error: function (res) {
						console.log(res);
					}
				});
			},
			projectNewLength: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?filters[status]=New",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						console.log(response);
						that.mNew = response.data.length;
						that.getView().getModel("modelLength").getData().projectNewLength = that.mNew;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));

					},
					error: function (res) {
						console.log(res);
					}
				});
			},
			ProjectsSubmitted: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?filters[status]=Completed",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						console.log(response);
						that.mCompleted = response.data.length;
						that.getView().getModel("modelLength").getData().ProjectsSubmitted = that.mCompleted;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));

					},
					error: function (res) {
						console.log(res);
					}
				});
			},
			ProjectsInProgress: function () {
				var that = this;
				$.ajax({
					url: "/deswork/api/p-projects?filters[status]=In-progress",
					type: "GET",
					success: function (res) {
						var response = JSON.parse(res);
						console.log(response);
						that.mProjectsInProgress = response.data.length;
						that.getView().getModel("modelLength").getData().ProjectsInProgress = that.mProjectsInProgress;
						that.getView().getModel("modelLength").updateBindings(true);
						that.getView().setModel(new sap.ui.model.json.JSONModel(response.data));

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
			onKpiLinkPressTasks: function (evt) {

				var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				var pressedLinkText = evt.getSource().getText();
				oRouter.navTo("drilldown", {
					selectedKPI: pressedLinkText
				}
				);
			},
			// projectData: function () {
			// 	var that = this;
			// 	$.get("/deswork/api/p-projects?populate=*", function (response) {
			// 		response = JSON.parse(response);

			// 		var oModel = new sap.ui.model.json.JSONModel(response.data);
			// 		that.getView().setModel(oModel, "mreport");
			// 	})


			// }


		});
	});


