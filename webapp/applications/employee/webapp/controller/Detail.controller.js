sap.ui.define([

	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter"
], function (Controller, MessageBox, MessageToast, UploadCollectionParameter) {
	"use strict";
	return Controller.extend("VASPP.employee.controller.Detail", {
		onInit: function () {
			
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
		
		handleFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", { layout: sNextLayout, product: this.id });
		},
		handleExitFullScreen: function () {
			this.bFocusFullScreenButton = true;
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", { layout: sNextLayout, product: this.id });
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", { layout: sNextLayout });
		},


		handleAddPagesAccess: function () {
			var that=this;
			if (!this.AddappFragment) {
				this.AddappFragment = sap.ui.xmlfragment("VASPP.employee.fragments.applicationList", this);
				this.getView().addDependent(this.AddappFragment);
			}
			this.AddappFragment.open();
			},

			handleConfirmAppList : function () {
				var that=this;

				var data={
					"appId": that.AddappFragment._aSelectedItems[0].mProperties.title,
					"appName": that.AddappFragment._aSelectedItems[0].mProperties.description,
					"create": false,
					"read": true,
					"update": false,
					"delete": false
				};
				var model = that.getView().getModel("memployee").getData().EmployeeCollection[that._product].assignedApps;
				model.push(data);
				that.getView().getModel("memployee").updateBindings(true);
				
				
				
			},


				
	
				

		handleDeletePageAccess: function () {
			var that = this;
			MessageBox.confirm("Are you sure you want to Delete  ?", {
				actions: ["Yes", "No"],
				emphasizedAction: "Yes",
				onClose: function (oEvent) {
					if (oEvent == "Yes") {
						var model = that.getView().getModel("memployee").getData().EmployeeCollection[that._product].assignedApps;
						var len=that.getView().byId("pagesAccessId").getSelectedContextPaths()[0].length-1;
						var fulllen=that.getView().byId("pagesAccessId").getSelectedContextPaths()[0].length;
						var pos=that.getView().byId("pagesAccessId").getSelectedContextPaths()[0].slice(len,fulllen);
						model.splice(pos,1);
						that.getView().getModel("memployee").updateBindings(true);
					}
					MessageBox.success("Deleted Successful");
				}
			});
		},


		_onObjectMatched: function (oEvent) {
			// this._product = oEvent.getParameter("arguments").product || this._product || "0";
			// this.getView().bindElement({
			// 	path: "/EmployeeCollection/" + this._product,
			// 	model: "memployee"
			// });
			// //attachment
			// var attachmentModel = new sap.ui.model.json.JSONModel(this.getView().mElementBindingContexts.memployee.getObject().documents);
			// this.getView().setModel(attachmentModel,"attachmentModel");
			// this.getView().getModel("attachmentModel").updateBindings(true);
			var that = this;
			this.id = oEvent.getParameter("arguments").product
			var options = {};
			$.get('/deswork/api/users/' + this.id + '?populate[0]=p_project_teams&populate[1]=p_bank_datum', options, function (response) {
				console.log(response);
				response = JSON.parse(response);
				var oModel = new sap.ui.model.json.JSONModel(response);
				that.getView().setModel(oModel, "memployee");
				
			});
		},
//TO DELETE THE EMPLOYEE DETAILS
		onDetailPageDelete: function (evt) {
			// var that = this;
			// var oItems = evt.getSource().getBindingContext("memployee").getObject().Name;
			// var oData = that.getView().getModel("memployee").getData().EmployeeCollection;
			// MessageBox.confirm("Are you sure you want to Delete  ?", {
			// 	actions: ["Yes", "No"],
			// 	emphasizedAction: "Yes",
			// 	onClose: function (oEvent) {
			// 		if (oEvent == "Yes") {
			// 			for (var i = 0; i < oData.length; i++) {
			// 				var products = oData[i];
											
			// 				if (products.Name === oItems) {
			// 					that.getView().getModel("memployee").getData().EmployeeCollection.splice(i, 1)
								
			// 				}
			// 			}
			// 			that.getView().getModel("memployee").updateBindings(true);
			// 			MessageBox.success("Employee details has been deleted");
			// 			//NAVIGATE TO MASTER			
			// 			var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			// 			oRouter.navTo("master");
			// 		}
			// 	}
			// }
			// );

			var that = this;
			MessageBox.confirm("Are you sure you want to Delete  ?", {
				actions: ["Yes", "No"],
				emphasizedAction: "Yes",
				onClose: function (evt) {
					if (evt == "Yes") {
						$.ajax({
							type: "DELETE",
							url: "/deswork/api/users/" + that.id,
							success: function (response) {
								var resv = JSON.parse(response);
								console.log(resv)
								if (resv.error) {
									MessageBox.error(resv.error.message)
								}
								else {
									MessageBox.success("Employee has been deleted");
									that.getView().getModel("memployee").updateBindings(true);
								}
							}

						})
					}
				}
			}
			);
		},
		//TO NAVIGATE TO ADDEMPLOYEE 
		onEdit: function () {
			var that = this;
			this.getView().getModel().setProperty("/layout", "OneColumn");

			var sNextLayout = this.getView().getModel().getProperty("/actionButtonsInfo/midColumn/closeColumn");
			if(sNextLayout == null)
			sNextLayout = "OneColumn"
		//	this.getOwnerComponent().getRouter().navTo("AddNewEmployee", { "AddCust": "Edit", "layout": sNextLayout});
		this.getOwnerComponent().getRouter().navTo("AddNewEmployee", { "AddCust": "Edit", "layout": sNextLayout, "listindex": this._product});
	},
		//TO ATTACH DOCUMENTS
		onChange: function (oEvent) {
			var that=this;
			var oUploadCollection = oEvent.getSource();
			var file = oEvent.getParameter("item").getFileObject();
			that.fileName = oEvent.getParameter("item").getFileName();
			var reader = new FileReader();
			reader.onload = function (e) {
				that.getView().mElementBindingContexts.memployee.getObject().documents.push({
					"FileName": that.fileName,
					"FileContent": e.currentTarget.result
				});

			};
			reader.readAsDataURL(file);
		},


		onStartUpload: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			var oTextArea = this.byId("TextArea");
			var cFiles = oUploadCollection.getItems().length;
			var uploadInfo = cFiles + " file(s)";

			if (cFiles > 0) {
				oUploadCollection.upload();

				if (oTextArea.getValue().length === 0) {
					uploadInfo = uploadInfo + " without notes";
				} else {
					uploadInfo = uploadInfo + " with notes";
				}

				MessageToast.show("Method Upload is called (" + uploadInfo + ")");
				MessageBox.information("Uploaded " + uploadInfo);
				oTextArea.setValue("");
			}
		},

		onBeforeUploadStarts: function (oEvent) {
			// Header Slug
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			setTimeout(function () {
				MessageToast.show("Event beforeUploadStarts triggered");
			}, 4000);
		},

		onUploadComplete: function (oEvent) {
			var sUploadedFileName = oEvent.getParameter("files")[0].fileName;
			setTimeout(function () {
				var oUploadCollection = this.byId("UploadCollection");

				for (var i = 0; i < oUploadCollection.getItems().length; i++) {
					if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
						oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
						break;
					}
				}

				// delay the success message in order to see other messages before
				MessageToast.show("Event uploadComplete triggered");
			}.bind(this), 8000);
		},

		onSelectChange: function (oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
		}



		// working
	});
});