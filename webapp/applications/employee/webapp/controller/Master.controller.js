sap.ui.define([
	
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter'
], function (Controller, Filter, FilterOperator, Sorter) {
	"use strict";
	return Controller.extend("VASPP.employee.controller.Master", {
		onInit: function () {
            var that= this;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("master").attachPatternMatched(function (oEvent) {
				this.getView().byId("productsTable").removeSelections(true);

			}, this);
			this._bDescendingSort = false;

			$.get("/deswork/api/users?populate=*",function(response){
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response);
				that.getView().setModel(oModel, "memployee");
			}) 
		},
		onListItemPress: function (oEvent) {
			// var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
			// 	productPath = oEvent.getSource().getSelectedItem().getBindingContext("memployee").getPath(),
			// 	product = productPath.split("/").slice(-1).pop();

			// this.oRouter.navTo("detail", { layout: oNextUIState.layout, product: product });
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
			employeeID = oEvent.getSource().getSelectedItem().getBindingContext("memployee").getObject().id;
		this.oRouter.navTo("detail", { layout: oNextUIState.layout, product: employeeID });
		this.getView().getModel("memployee").updateBindings(true);
		},
		//SEARCH THE EMPLOYEE DETAILS USING NAME
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("firstName", FilterOperator.Contains, sQuery)];
			}

			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
		//TO SORT THE EMPLOYEE DETAILS USING ID
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("id", this._bDescendingSort);

			oBinding.sort(oSorter);
		},
		//TO ADD NEW EMPLOYEE 
		onAddNewEmployee: function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");

			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if(sNextLayout == null)
			sNextLayout = "OneColumn"
			//NAVIGATE TO THE ADD NEW EMPLOYEE
		//	this.getOwnerComponent().getRouter().navTo("AddNewEmployee", { "AddCust": "Add", "layout": sNextLayout});
			this.getOwnerComponent().getRouter().navTo("AddNewEmployee", { "AddCust": "Add", "layout": sNextLayout, "listindex": "a"});
		},
	});
});
