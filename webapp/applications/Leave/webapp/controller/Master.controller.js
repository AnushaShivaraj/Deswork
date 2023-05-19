sap.ui.define([
	
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter'
], function( Controller, Filter, FilterOperator, Sorter) {
"use strict";

	return Controller.extend("vaspp.Leave.controller.Master", {
		onInit: function () {
			var that = this;
			// TO REMOVE THE AUTO SELECTION FROM THE LIST
			this.oRouter = this.getOwnerComponent().getRouter();
			
			this.oRouter.getRoute("master").attachPatternMatched(function (oEvent) {
                this.getView().byId("productsTable").removeSelections(true);
                
             }, this);
			this._bDescendingSort = false;

			$.get("/deswork/api/p-leaves?populate=*",function(response){
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mleave");
			}) 
		},
		
		onListItemPress: function (oEvent) {
			// var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
			// 	productPath = oEvent.getSource().getSelectedItem().getBindingContext("mleave").getPath(),
			// 	product = productPath.split("/").slice(-1).pop();
				

			// this.oRouter.navTo("detail", {layout: oNextUIState.layout, product: product});
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				leaveID = oEvent.getSource().getSelectedItem().getBindingContext("mleave").getObject().id;
			this.oRouter.navTo("detail", { layout: oNextUIState.layout, product: leaveID });
			this.getView().getModel("mleave").updateBindings(true);
			
		},
		//SEARCH
		onSearch: function (oEvent) {
			var oTableSearchState = [],
				sQuery = oEvent.getParameter("query");

			if (sQuery && sQuery.length > 0) {
				oTableSearchState = [new Filter("attributes/users_permissions_user/data/0/attributes/firstName", FilterOperator.Contains, sQuery)];
			}

			this.getView().byId("productsTable").getBinding("items").filter(oTableSearchState, "Application");
		},

		//SORT
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("attributes/users_permissions_user/data/id", this._bDescendingSort);

			oBinding.sort(oSorter);
		}
	});
});