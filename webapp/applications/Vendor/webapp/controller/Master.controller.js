sap.ui.define([

	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	"sap/m/MessageToast"
	
], function (Controller, Filter, FilterOperator, Sorter, MessageToast) {
	"use strict";

	return Controller.extend("vaspp.Vendor.controller.Master", {
		onInit: function () {
			var that = this;
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("master").attachPatternMatched(function (oEvent) {
				this.getView().byId("productsTable").removeSelections(true);

			}, this);
			this._bDescendingSort = false;

			$.get("/deswork/api/p-vendors?populate=*", function (response) {
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mvendor");
			})

			// $.get("/deswork/api/p-vendors?populate[0]=p_projects", function (response) {
			// 	response = JSON.parse(response);
			// 	var oModel = new sap.ui.model.json.JSONModel(response.data);
			// 	that.getView().setModel(oModel, "mVendorProjects");
			// })
			//that.vendorProjects;
		},
		vendorProjects: function () {
			var that = this;
			$.get("/deswork/api/p-vendors?populate[0]=m_projects", function (response) {
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mVendorProjects");
			})
		},
		onListItemPress: function (oEvent) {
			

			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				vendorID = oEvent.getSource().getSelectedItem().getBindingContext("mvendor").getObject().id;
			this.oRouter.navTo("detail", { layout: oNextUIState.layout, product: vendorID });
			this.getView().getModel("mvendor").updateBindings(true);


		},
		//SEARCH THE VENDOR DETAILS USING ID
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("attributes/name", FilterOperator.Contains, sQuery)];
			}

			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},
		//TO ADD NEW VENDOR
		onAddNewVendor: function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");

			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if (sNextLayout == null)
				sNextLayout = "OneColumn"
			//NAVIGATE TO THE AddNewVendor 
			this.getOwnerComponent().getRouter().navTo("AddNewVendor", { "AddCust": "Add", "layout": sNextLayout, "listindex": "add" });
		},
		//SORT THE VENDOR DETAILS USING NAME
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("id", this._bDescendingSort);

			oBinding.sort(oSorter);
		}
	});
});