sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Label",
	"sap/m/library",
	"sap/m/MessageBox",
	"sap/m/TextArea"
], function (Controller,  Dialog, Button,Label, mobileLibrary,MessageBox,TextArea) {
	"use strict";
	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.DialogType
	var DialogType = mobileLibrary.DialogType;
	return Controller.extend("vaspp.Leave.controller.Detail", {

		onInit: function (evt) {
			
			var oExitButton = this.getView().byId("exitFullScreenBtn"),
				oEnterButton = this.getView().byId("enterFullScreenBtn");
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oModel = this.getOwnerComponent().getModel();
			this.oRouter.getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
			[oExitButton, oEnterButton].forEach(function (oButton) {
				oButton.addEventDelegate({
					onAfterRendering: function () {
						if (this.bFocusFullScreenButton) {
							this.bFocusFullScreenButton = false;
							oButton.focus();
						}
					}.bind(this)
				});
			}, this);	
		},
		
		//FULL SCREEN
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this.id});
		},
		//EXIT FULL SCREEN
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this.id});
		},
		//CLOSE THE DETAIL
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},

		_onObjectMatched: function (oEvent) {
			// this._product = oEvent.getParameter("arguments").product || this._product || "0";
			// this.getView().bindElement({
			// 	path: "/details/" + this._product,
			// 	model: "mleave"
			// });

			var that = this;
			this.id = oEvent.getParameter("arguments").product
			var options = {};
			$.get('/deswork/api/p-leaves/' + this.id + '?populate[0]=users_permissions_user', options, function (response) {
				console.log(response);
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response.data);
				that.getView().setModel(oModel, "mleave");
				
			});
			
		},
// APPROVE BUTTON
		onInitialFocusOnAccept: function (evt) {
			var that=this;
			var oItems = evt.getSource().getBindingContext("mleave").getObject()._id;
			var oData = that.getView().getModel("mleave").getData().details;
					MessageBox.confirm("Are you sure you want Approve  ?", {
						actions: ["Yes", "No"], 
						emphasizedAction: "Yes",
						onClose: function (oEvent) { 
							if (oEvent == "Yes")
							{for(var i = 0; i < oData.length; i++){				
									var products = oData[i];	
									if(products._id === oItems){
										that.getView().getModel("mleave").getData().details.splice(i,1)	
									}
								}	
								that.getView().getModel("mleave").updateBindings(true);
								MessageBox.success("Leave has been Approved");	
								var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			                    oRouter.navTo("master");
							}
							}
					  }	
		    	);
					},
			//	REJECT BUTTON		 
		
		onInitialFocusOnReject:function(){
			// var that=this;
				
		if (!this.oRejectDialog) {
			
			this.oRejectDialog = new Dialog({
				title: "Are you sure you want to reject?",
				type: DialogType.Message,
				content: [
					new Label({
						text: "Please Enter the Reason for Rejection",
						labelFor: "rejectionNote",
					}),
					new TextArea("rejectionNote", {
						width: "100%",
						placeholder: "Add Reason for Rejection (optional)"
					})
				],
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: "Reject",
					press: function () {
						var that=this;
						var oItems = that.getView().getBindingContext("mleave").getObject()._id;
						 var oData = that.getView().getModel("mleave").getData().details;	

			for(var i = 0; i < oData.length; i++){				
				var products = oData[i];	
							
				if(products._id === oItems){
					this.getView().getModel("mleave").getData().details.splice(i,1)
					
					
				}
			}	
			this.getView().getModel("mleave").updateBindings(true);
			MessageBox.success("Leave has been Rejected");	
			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
				oRouter.navTo("master");
				this.oRejectDialog.close();
					}.bind(this)	
				}
				),
				endButton: new Button({
					text: "Cancel",
					press: function () {
						
						this.oRejectDialog.close();
					}.bind(this)
				})
			});
		}
		//to clear the data present in comment box
		this.oRejectDialog.getContent()[1].setValue();
          this.oRejectDialog.open();
   },
	});
});

