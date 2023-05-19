sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, JSONModel) {
	"use strict";
	return Controller.extend("VASPP.employee.controller.AddNewEmployee", {
		onInit: function () {
			this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.getOwnerComponent().getRouter().getRoute("AddNewEmployee").attachPatternMatched(this.onObjectMatched, this);
		},
		onObjectMatched: function (oEvent) {
			var that = this;
			var task = oEvent.getParameter("arguments").AddCust;
			that.isAdd = task;
			if (task !== "Edit") {
				that.getView().setModel(new JSONModel({}));
				//this.getView().setModel(new JSONModel({}));
			} else {

				

				var prodd = oEvent.getParameter("arguments").listindex;
				var MyModel = that.getView().getModel("memployee").getData().EmployeeCollection[prodd]

				var data = {
					"Name": MyModel.Name,
					"id": MyModel.id,
					"gender": MyModel.gender,
					"dob": MyModel.dob,
					"department": MyModel.department,
					"designation": MyModel.designation,
					"doj": MyModel.doj,
					"contact": MyModel.contact,
					"email": MyModel.email,
					"teamlead": MyModel.teamlead,
					"probationperiod": MyModel.probationperiod,
					"emcontactname": MyModel.emcontactname,
					"emcontactno": MyModel.emcontactno,
					"bank": MyModel.bank,
					"ifsc": MyModel.ifsc,
					"bankno": MyModel.bankno,
					"uan": MyModel.uan,
					"pfnominee": MyModel.pfnominee,
					"nomineeaddress": MyModel.nomineeaddress,
					"nomineerelationship": MyModel.nomineerelationship,
					"nomineedob": MyModel.nomineedob,
					"nomineeshare": MyModel.nomineeshare,
					"country": MyModel.country,
					"city": MyModel.city,
					"region1": MyModel.region1,
					"zipCode": MyModel.zipCode,
				};
				this.getView().setModel(new JSONModel(data));
				this.getView().getModel("memployee").getData().EmployeeCollection.splice(prodd, 1, data);

				this.getView().getModel("memployee").updateBindings(true)

			}
		},
		//ADDING AND UPDATING EMPLOYEE DETAILS
		handleAddUserOkPress: function (oEvent) {
			var that = this;
			var Err = this.ValidateCreateCust();
			if (Err == 0) {
				if (that.isAdd == "Edit") {

					this.getOwnerComponent().getModel("memployee").updateBindings(true);
					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					oRouter.navTo("master", { "AddCust": "Edit" });

				} else 
				//{
					// that.getView().getModel("memployee").getData().EmployeeCollection.push(this.getView().getModel().getData());

					// var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
					// oRouter.navTo("master", { "AddCust": "Add" });
				//}
				{
					var settings = {
					  "url": "/deswork/api/users",
					  "method": "POST",
					  "timeout": 0,
					  "headers": {
						"Content-Type": "application/json"
					  },
					  "data": JSON.stringify({
						"data": {
						  "name": that.getView().byId("idProjectId1").getValue(),
						  "description": that.getView().byId("idProjectId2").getValue(),
						  "businessType": that.getView().byId("idProjectId3").getValue(),
						  "email": that.getView().byId("idProjectId4").getValue(),
						  "phone": that.getView().byId("idProjectId5").getValue(),
						  "country": that.getView().byId("idProjectId6").getValue(),
						  "region": that.getView().byId("idProjectId7").getValue(),
						  "address": that.getView().byId("idProjectId8").getValue(),
						  "zipCode": that.getView().byId("idProjectId9").getValue(),
						  "cpFirstName": that.getView().byId("idProjectId10").getValue(),
						  "cpMiddleName": that.getView().byId("idProjectId11").getValue(),
						  "cpLastName": that.getView().byId("idProjectId12").getValue(),
						  "cpDesignation": that.getView().byId("idProjectId13").getValue(),
						  "cpPhone": that.getView().byId("idProjectId14").getValue(),
						  "cpEmail": that.getView().byId("idProjectId15").getValue(),
						  
		  
						}
					  }),
					};
		  
					$.ajax(settings).done(function (response) {
					  response = JSON.parse(response);
					  if (response.error) {
						MessageBox.error(response.error.message);
					  } else {
						var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
						oRouter.navTo("master", { "AddCust": "Add" });
					  }
		  
					});
				  }

				that.getView().getModel("memployee").updateBindings(true);
			}
			else {
				this.getView().setBusy(false);
				var text = "Mandatory Fields are Required";
				MessageBox.error(text);
			}
		},
		//CHECK DATA VALIDATION
		ValidateCreateCust: function () {
			var Err = 0;
			var thisView = this.getView();
			if (thisView.byId("idProjectId1").getValue() === "") {
				thisView.byId("idProjectId1").setValueState("None");
				Err++;
			}
			if (thisView.byId("idProjectId7").getValue() === "") {

				thisView.byId("idProjectId7").setValueState("None");
				Err++;

			}
			if (thisView.byId("idProjectId8").getValue() === "") {
				thisView.byId("idProjectId8").setValueState("None");
				Err++;
			}
			if (thisView.byId("idProjectId13").getValue() === "") {
				thisView.byId("idProjectId13").setValueState("None");
				Err++;
			}
			if (thisView.byId("idProjectId15").getValue() === "") {
				thisView.byId("idProjectId15").setValueState("None");
				Err++;
			}
			if (thisView.byId("idProjectId22").getValue() === "") {
				thisView.byId("idProjectId22").setValueState("None");
				Err++;
			}

			return Err;
		},

		//CANCELING THE DATA GETTING ADDED OR UPDATED 
		handleWizardCancel: function () {
			var that = this;

			MessageBox.confirm("Do you want to Cancel",
				{
					actions: ["Yes", "No"],
					emphasizedAction: "Yes",
					onClose: function (oEvent) {
						if (oEvent == "Yes") {
							var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
							oRouter.navTo("master");
						}
					}
				});

		},

	});

});
