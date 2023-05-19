sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel"
], function (Controller, MessageBox, MessageToast, JSONModel) {
  "use strict";
  return Controller.extend("vaspp.Vendor.controller.AddNewVendor", {
    onInit: function () {
      var that = this;
      this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      this.getOwnerComponent().getRouter().getRoute("AddNewVendor").attachPatternMatched(this.onObjectMatched, this);

      // $.get('/deswork/api/p-vendors/', function (response) {
      //   console.log(response);
      //   response = JSON.parse(response);
      //   var oModel = new sap.ui.model.json.JSONModel(response.data);
      //   that.getView().setModel(oModel, "mvendor");

      // })
    },
    onObjectMatched: function (oEvent) {
      var that = this;
      var task = oEvent.getParameter("arguments").AddCust;
      that.isAdd = task;
      if (task !== "Edit") {
        that.getView().setModel(new JSONModel({}));
      } else {

        // var EditModel=that.getView().getModel("mvendorupdated").getData();
        var usersModel = this.getOwnerComponent().getModel("mvendorupdated").getData();
        var usersMod = {
          "id": usersModel.id,
          "name": usersModel.attributes.name,
          "description": usersModel.attributes.description,
          "businessType": usersModel.attributes.businessType,
          "email": usersModel.attributes.email,
          "phone": usersModel.attributes.phone,
          "country": usersModel.attributes.country,
          "region": usersModel.attributes.region,
          "address": usersModel.attributes.address,
          "zipCode": usersModel.attributes.zipcode,
          "cpFirstName": usersModel.attributes.cpFirstName,
          "cpMiddleName": usersModel.attributes.cpMiddleName,
          "cpLastName": usersModel.attributes.cpLastName,
          "cpDesignation": usersModel.attributes.cpDesignation,
          "cpPhone": usersModel.attributes.cpPhone,
          "cpEmail": usersModel.attributes.cpEmail

        };
        this.getView().setModel(new JSONModel(usersMod));
      }
    },
    //ADDING AND UPDATING VENDOR DETAILS
    handleAddUserOkPress: function (oEvent) {
      var that = this;
      var Err = this.ValidateCreateCust();
      if (Err == 0) {
        if (that.isAdd == "Edit") {
          var updateModelData = that.getView().getModel().getData();

          $.ajax({
            type: "PUT",
            url: "/deswork/api/p-vendors/" + updateModelData.id,
            data: {
              "data": updateModelData
            },
            success: function (res) {
              var resValue = JSON.parse(res);
              console.log(resValue.error);
              if (resValue.error) {
                MessageBox.error(resValue.error.message);
              } else {
                //  MessageToast.show("Vendor Details Updated successfully");
                that.getView().getModel("appView").setProperty("/actionButtonsInfo/midColumn/fullScreen", false);
                that.getOwnerComponent().getRouter().navTo("master", {
                  AddCust: "Edit"
                });
                MessageToast.show("Vendor details updated successfully", {
                  closeOnBrowserNavigation: false
                });

                //  that.clearform();
              }
            }
          });

        } else {
          var settings = {
            "url": "/deswork/api/p-vendors",
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
                "zipcode": that.getView().byId("idProjectId9").getValue(),
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
              // MessageBox.error(response.error.message);
              MessageBox.error("Vendor with this " + response.error.details.errors[0].path[0] + " already exist");
            } else {
              var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
              oRouter.navTo("master", { "AddCust": "Add" });
              //  MessageToast.show("Vendor Added Successfully")
              MessageToast.show("Vendor Added successfully", {
                closeOnBrowserNavigation: false
              });
              that.getOwnerComponent().getModel("mvendor").updateBindings(true);
            }

          });

        }

      }
      else {
        this.getView().setBusy(false);
        var text = "Mandatory Fields are Required";
        MessageBox.error(text);
      }
    },
    //TO CHECK DATA VALIDATION
    ValidateCreateCust: function () {
      var Err = 0;
      var thisView = this.getView();
      if (thisView.byId("idProjectId1").getValue() === "" || this.getView().byId("idProjectId1").getValue() == null) {
       // thisView.byId("idProjectId1").setValueState("None");
        Err++;
      }
      else{
        thisView.byId("idProjectId1").setValueState("None");
      }
      if (thisView.byId("idProjectId4").getValue() === "") {
        thisView.byId("idProjectId4").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId5").getValue() === "") {
        thisView.byId("idProjectId5").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId6").getValue() === "") {
        thisView.byId("idProjectId6").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId8").getValue() === "") {
        thisView.byId("idProjectId8").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId9").getValue() === "") {
        thisView.byId("idProjectId9").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId10").getValue() === "") {
        thisView.byId("idProjectId10").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId12").getValue() === "") {
        thisView.byId("idProjectId12").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId14").getValue() === "") {
        thisView.byId("idProjectId14").setValueState("None");
        Err++;
      }
      if (thisView.byId("idProjectId15").getValue() === "") {
        thisView.byId("idProjectId15").setValueState("None");
        Err++;
      }
      // 1,4,5,6 ,8,9, 10,12 ,14,15   
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
