sap.ui.define([

	"sap/ui/core/mvc/Controller",
	'sap/ui/model/json/JSONModel',
	'sap/ui/export/library',
	'sap/ui/export/Spreadsheet',
	'sap/m/MessageToast'

], function (Controller, JSONModel, exportLibrary, Spreadsheet, MessageToast) {

	"use strict";
	var EdmType = exportLibrary.EdmType;

	return Controller.extend("vaspp.ProjectStatisticalReport.controller.drilldown", {

		onInit: function () {

			var that = this;
			var sampleDatajson = new sap.ui.model.json.JSONModel("model/report.json");
				this.getView().setModel(sampleDatajson);
				sap.ui.core.UIComponent.getRouterFor(this).getRoute("drilldown").attachPatternMatched(this._objMatched, this);
        },

onBackButtonPress: function () {
			
			// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			// oRouter.navTo("View1");
			this.getOwnerComponent().getRouter().navTo("View1");
		},

		onExportproject: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigProject();
			aProducts = this.getView().getModel("mreport").getProperty('/Projects');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
       
		createColumnConfigProject: function() {
			return [
				{
					label: 'ProjectName',
					property: 'ProjectName'	
				},{
					label: 'Description',
					property: 'Description',	
				},{
					label: 'Startdate',
					property: 'Startdate',	
				},{
					label: 'Enddate',
					property: 'Enddate',	
				},
				{
					label: 'Status',
					property: 'Status',	
				}
                  ];
		},
		onExportprojecttask: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigProjectTask();
			aProducts = this.getView().getModel("mreport").getProperty('/Projects');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
       
		createColumnConfigProjectTask: function() {
			return [
				{
					label: 'ProjectName',
					property: 'ProjectName'	
				},{
					label: 'Description',
					property: 'Description',	
				},{
					label: 'Startdate',
					property: 'Startdate',	
				},{
					label: 'Enddate',
					property: 'Enddate',	
				},{
					label: 'milestone',
					property: 'milestone',	
				},{
					label: 'task',
					property: 'task',
				},{
					label: 'Status',
					property: 'Status',	
				}
                  ];
		},
		
		onExportnewprojects: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigSubmitted();
			aProducts = this.getView().getModel("mreport").getProperty('/New_Projects');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		onExportProjectsubmitted: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigSubmitted();
			aProducts = this.getView().getModel("mreport").getProperty('/Projectsubmitted');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		onExportProjectdelayed: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigSubmitted();
			aProducts = this.getView().getModel("mreport").getProperty('/Projectdelayed');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		onExportProjectInProgress: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigSubmitted();
			aProducts = this.getView().getModel("mreport").getProperty('/ProjectInProgress');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		
		
		createColumnConfigSubmitted: function() {
			return [
				{
					label: 'ProjectName',
					property: 'ProjectName'	
				},
				{
					label: 'Description',
					property: 'Description',	
				},{
					label: 'Startdate',
					property: 'Startdate',	
				},
				{
					label: 'Enddate',
					property: 'Enddate',	
				},
				{
					label: 'customername',
					property: 'customername',	
				},
				{
					label: 'Status',
					property: 'Status',	
				}
				
                  ];
		},
		onExportBudget: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigBudget();
			aProducts = this.getView().getModel("mreport").getProperty('/Projects');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigBudget: function() {
			return [
				{
					label: 'ProjectName',
					property: 'ProjectName'	
				},{
					label: 'actualbudget',
					property: 'actualbudget',	
				},{
					label: 'targetbudget',
					property: 'targetbudget',	
				}
                  ];
		},
		onExportProjectProgress: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigProjectProgress();
			aProducts = this.getView().getModel("mreport").getProperty('/Projects');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigMonth: function() {
			return [
				{
					label: 'month',
					property: 'month'	
				},{
					label: 'noOfProjects',
					property: 'noOfProjects',	
				},{
					label: 'ProjectName1',
					property: 'ProjectName1',	
				},{
					label: 'ProjectName2',
					property: 'ProjectName2'	
				} ];
		},
		createColumnConfigProjectProgress: function() {
			return [
				{
					label: 'ProjectName',
					property: 'ProjectName'	
				},{
					label: 'Description',
					property: 'Description',	
				},{
					label: 'Startdate',
					property: 'Startdate',	
				},{
					label: 'Enddate',
					property: 'Enddate'	
				},{
					label: 'Status',
					property: 'Status',	
				},{
					label: 'projectprogress',
					property: 'projectprogress',	
				}
                  ];
		},
		onExportProjectMonth: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigMonth();
			aProducts = this.getView().getModel("mreport").getProperty('/Months');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigMonth: function() {
			return [
				{
					label: 'month',
					property: 'month'	
				},{
					label: 'noOfProjects',
					property: 'noOfProjects',	
				},{
					label: 'ProjectName1',
					property: 'ProjectName1',	
				},{
					label: 'ProjectName2',
					property: 'ProjectName2'	
				} ];
		},
		onExportProjectMilestone: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigProjectMilestone();
			aProducts = this.getView().getModel("mreport").getProperty('/Projects');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigProjectMilestone: function() {
			return [
				{
					label: 'ProjectName',
					property: 'ProjectName'	
				},{
					label: 'Startdate',
					property: 'Startdate',	
				},{
					label: 'Enddate',
					property: 'Enddate',	
				},{
					label: 'milestone',
					property: 'milestone'	
				},{
					label: 'totalmilestonecompleted',
					property: 'totalmilestonecompleted',	
				},{
					label: 'delayedmilestone',
					property: 'delayedmilestone',	
				},{
					label: 'inprogressmilestone',
					property: 'inprogressmilestone'	
				}  ];
		},
		onExportEmployeeleave: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigLeave();
			aProducts = this.getView().getModel("mreport").getProperty('/Employeedetails');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigLeave: function() {
			return [
				{
					label: 'name',
					property: 'name'	
				},
				{
					label: 'noofleavetaken',
					property: 'noofleavetaken',	
				},{
					label: 'balanceleave',
					property: 'balanceleave',	
				},
				{
					label: 'leavelastapplied',
					property: 'leavelastapplied',	
				},
				{
					label: 'sickleave',
					property: 'sickleave',	
				},
				{
					label: 'ForwardLeaves',
					property: 'ForwardLeaves',	
				}
				
                  ];
		},
		onExportHours: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigHours();
			aProducts = this.getView().getModel("mreport").getProperty('/Hours');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigHours: function() {
			return [
				{
					label: 'name',
					property: 'name'	
				},
				{
					label: 'nhour',
					property: 'nhour',	
				},{
					label: 'day1',
					property: 'day1',	
				},
				{
					label: 'day2',
					property: 'day2',	
				},
				{
					label: 'day3',
					property: 'day3',	
				},
				{
					label: 'day4',
					property: 'day4',	
				},
				{
					label: 'day5',
					property: 'day5',	
				}
				
                  ];
		},
		onExportEmployeeTask: function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigEmployeeTask();
			aProducts = this.getView().getModel("mreport").getProperty('/Employeedetails');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigEmployeeTask: function() {
			return [
				{
					label: 'name',
					property: 'name'	
				},
				{
					label: 'role',
					property: 'role',	
				},{
					label: 'nprojects',
					property: 'nprojects',	
				},
				{
					label: 'ntask',
					property: 'ntask',	
				},
				{
					label: 'ntaskcompleted',
					property: 'ntaskcompleted',	
				},
				{
					label: 'ntaskinprogress',
					property: 'ntaskinprogress',	
				}
				
                  ];
		},
		onExportresourceUtilization:function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigResourceUtilization();
			aProducts = this.getView().getModel("mreport").getProperty('/Employeedetails');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		
        createColumnConfigResourceUtilization: function() {
			return [
				{
					label: 'name',
					property: 'name'	
				},
				{
					label: 'role',
					property: 'role',	
				},{
					label: 'nprojects',
					property: 'nprojects',	
				},
				{
					label: 'ProjectName0',
					property: 'ProjectName0',	
				},
				{
					label: 'hoursspent0',
					property: 'hoursspent0',	
				},
				{
					label: 'ProjectName1',
					property: 'ProjectName1',	
				},
				{
					label: 'hoursspent1',
					property: 'hoursspent1',	
				}
				
                  ];
		},
		onExportProjectChartStatus:function() {
			var aCols, aProducts, oSettings, oSheet;

			aCols = this.createColumnConfigProjectChartStatus();
			aProducts = this.getView().getModel("mreport").getProperty('/Projects');

			oSettings = {
				workbook: { columns: aCols },
				dataSource: aProducts
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build()
				.then( function() {
					MessageToast.show('Spreadsheet export has finished');
				})
				.finally(oSheet.destroy);
		},
		createColumnConfigProjectChartStatus: function() {
			return [
				{
					label: 'ProjectName',
					property: 'ProjectName'	
				},
				,{
					label: 'Description',
					property: 'Description',	
				},{
					label: 'Startdate',
					property: 'Startdate',	
				},{
					label: 'Enddate',
					property: 'Enddate'	
				},
				{
					label: 'milestone',
					property: 'milestone',	
				},{
					label: 'Status',
					property: 'Status',	
				},{
					label: 'projectprogress',
					property: 'projectprogress',	
				}
				
                  ];
		},
		
		_objMatched: function (oEvent) {
			
			$.get("/deswork/api/p-projects?populate=*",function(response){
				response = JSON.parse(response);
			//	debugger
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mreport");
			}) 
			
			var that = this;
				this.oBundle = this.getOwnerComponent().getModel("mreport");
				this.Title = oEvent.getParameter("arguments").selectedKPI;
				if(this.Title == "Total Projects"){
				this.getView().byId("drillDownTableIdproject").setVisible(true);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		
	}
	if(this.Title == "Total Task"){
		this.getView().byId("drillDownTableIdproject").setVisible(false);
		this.getView().byId("drillDownTableIdtask").setVisible(true);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
	}
	if(this.Title == "New Projects"){
		this.getView().byId("drillDownTableIdproject").setVisible(false);
		this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(true);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
	}
	
	if(this.Title == "Projects Submitted"){
		this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(true);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
	}
	if(this.Title == "Projects Delayed"){
		this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(true);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
	}
	if(this.Title == "Projects InProgress"){
		this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(true);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
	}
	 if(this.Title == "Hours worked in a week"){
        this.getView().byId("drillDownTableIdcharthours").setVisible(true);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Projects Budget"){
		this.getView().byId("drillDownTableIdchartbudget").setVisible(true);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
				this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Project Progress"){
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(true);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
				this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Projects Received"){
		this.getView().byId("drillDownTableIdchartmonth").setVisible(true);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
		this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Projects By Milestone"){
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(true);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Employee Leave Used"){
		this.getView().byId("drillDownTableIdchartleave").setVisible(true);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Employee Performance"){
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(true);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Resources Utilization"){
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(true);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	if(this.Title == "Projects By Status in Pie chart"){
		this.getView().byId("drillDownTableIdchartprojectstatus").setVisible(true);
		this.getView().byId("drillDownTableIdchartprojectprogress").setVisible(false);
		this.getView().byId("drillDownTableIdcharthours").setVisible(false);
		this.getView().byId("drillDownTableIdchartresourceutilization").setVisible(false);
		this.getView().byId("drillDownTableIdchartemployeetask").setVisible(false);
		this.getView().byId("drillDownTableIdchartleave").setVisible(false);
		this.getView().byId("drillDownTableIdchartmilestone").setVisible(false);
		this.getView().byId("drillDownTableIdchartmonth").setVisible(false);
		this.getView().byId("drillDownTableIdchartbudget").setVisible(false);
		this.getView().byId("drillDownTableIdproject").setVisible(false);
				this.getView().byId("drillDownTableIdtask").setVisible(false);
				this.getView().byId("drillDownTableIdnewproject").setVisible(false);
		this.getView().byId("drillDownTableIdprojectsubmitted").setVisible(false);
		this.getView().byId("drillDownTableIdprojectdelayed").setVisible(false);
		this.getView().byId("drillDownTableIdprojectinprogress").setVisible(false);
	}
	}
	
	
		
    });
});