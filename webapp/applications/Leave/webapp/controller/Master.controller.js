sap.ui.define([
	
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	'sap/ui/model/Sorter',
	'../utils/formatter',
	"sap/m/MessageBox",
], function( Controller, Filter, FilterOperator, Sorter, formatter, MessageBox) {
"use strict";

	return Controller.extend("vaspp.Leave.controller.Master", {
		formatter : formatter,
		onInit: function () {
			var that = this;
			that.oRouter = that.getOwnerComponent().getRouter();			
			that.oRouter.getRoute("master").attachPatternMatched(function (oEvent) {
                that.getView().byId("productsTable").removeSelections(true);  
				that.getLeaveRequests();             
             }, that);
			 that._bDescendingSort = false;
		},
		
		onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
			var leaveID = oEvent.getSource().getSelectedItem().getBindingContext("mleave").getObject().id;
			var userId = oEvent.getSource().getSelectedItem().getBindingContext("mleave").getObject().attributes.requestedById;
			this.oRouter.navTo("detail", { 
				layout: oNextUIState.layout, 
				userId: userId,
				product: leaveID, 
			});				
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
		onSort: function (oEvent) {
			this._bDescendingSort = !this._bDescendingSort;
			var oView = this.getView(),
				oTable = oView.byId("productsTable"),
				oBinding = oTable.getBinding("items"),
				oSorter = new Sorter("attributes/users_permissions_user/data/id", this._bDescendingSort);
			oBinding.sort(oSorter);
		},
		getLeaveRequests: function() {
			var that = this;
            var url = '/deswork/api/p-leaves?populate=*&filters[status][$eq]=Requested';
            $.ajax({
                url: url,
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                },
                success: function (response) {
                    response = JSON.parse(response);
					var oModel = new sap.ui.model.json.JSONModel(response.data);
					that.getView().setModel(oModel, "mleave");
                },
                error: function (error) {
                    MessageBox.success("Error while loading Leave Requests");
                }
            });
		}
	});
});