sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "../utils/formatter",
  "sap/ui/core/date/UI5Date"
],

  /**
       * @param {typeof sap.ui.core.mvc.Controller} Controller
       */

  function (Controller, JSONModel, MessageBox, formatter, UI5Date) {
    "use strict";
    return Controller.extend("vaspp.timetracking.controller.timetracking", {

      formatter: formatter,

      onInit: function () {
        var that = this;
        that.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(this.onObjectMatched, this);
        this.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        that.getUserDetails();
        that.getAppointmentDetails();
        // that.getUserProject();

        that.getUserTask();
      },
      getUserDetails: function () {
        var that = this;
        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
        $.ajax({
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          success: function (response) {
            var arr = [];
            response = JSON.parse(response);
            var oModel = new sap.ui.model.json.JSONModel();
            for (var j = 0; j < response.p_appointments.length; j++) {
              response.p_appointments[j].startDate = UI5Date.getInstance(response.p_appointments[j].startDate);
              response.p_appointments[j].endDate = UI5Date.getInstance(response.p_appointments[j].endDate);
            }
            arr.push(response);
            oModel.setData(arr);
            that.getView().setModel(oModel);
          }
        });
      },

      //for select Task
      getUserTask: function () {
        var that = this;
        var url = "deswork/api/p-tasks?populate=*&filters[users_permissions_user][id][$eq]=" + this.loginId;
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mUserTasks");

          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wroung");
          }

        });
      },
      onSelectTask: function (oEvent) {
        var that = this;
        this.taskid = oEvent.getParameter("selectedItem").mProperties.key;
        that.taskID = JSON.parse(this.taskid);
        var url = "deswork/api/p-sub-tasks?populate=*&filters[p_task][id][$eq]=" + that.taskID;
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mUserSubTask");

          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wroung");
          }

        });

      },
      //
      getAppointmentDetails: function () {
        var that = this;
        var url = "deswork/api/p-appointments?populate=*&filters[users_permissions_users][id]=" + this.loginId;
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mAppointDetails");
          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wroung");
          }

        });
      },
      //for Edit Name Select
      getAppointmentDetailsEdit: function () {
        var that = this;
        var url = "deswork/api/p-appointments/" + this.taskId + "?populate=*";
        $.ajax({
          url: url,
          method: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mAppointDetailsE");
          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wroung");
          }

        });
      },
      //
      onObjectMatched: function (oEvent) {
        var that = this;
        that.getView().setModel(new JSONModel({}));
      },
      handleAppointmentCreate: function (oEvent) {
        var that = this;

        if (!this._AddAppointment) {
          this._AddAppointment = sap.ui.xmlfragment("calid", "vaspp.timetracking.fragment.CreateAppointment", this);
          this.getView().addDependent(this._AddAppointment);
        }

        // var mModel = new sap.ui.model.json.JSONModel(this.getView().getModel().getData());
        // this._AddAppointment.setModel(mModel);
        // var timecal =  ;
        // if (timecal === "8hours") {
        //   console.log("Time Extended")
        // }
        //  else {
        this._AddAppointment.open();
        //  }

      },
      handleAppointmentEdit: function (oEvent) {
        if (!this._EditAppointment) {
          this._EditAppointment = sap.ui.xmlfragment("caleditid", "vaspp.timetracking.fragment.EditAppointment", this);
          this.getView().addDependent(this._EditAppointment);
        }

        var mModel = new sap.ui.model.json.JSONModel(this.getView().getModel().getData());
        this._EditAppointment.setModel(mModel);
        this.getAppointmentDetailsEdit();
        var ch = this.getView().getModel("mAppointDetailsE").getData();
        this._EditAppointment.getContent()[0].getContent()[1].setValue(ch.attributes.name);
        this._EditAppointment.getContent()[0].getContent()[3].setValue(ch.attributes.description);
       // this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(ch.attributes.p_tasks.data[0].id) ? this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(ch.attributes.p_tasks.data[0].id) :"";
       // this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey(ch.attributes.p_sub_tasks.data[0].id) ? this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(ch.attributes.p_sub_tasks.data[0].id): null;
        if (ch.attributes.p_tasks.data.length > 0) {
          this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey(ch.attributes.p_tasks.data[0].id);
        } else {
          this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey(null);
        }
        if (ch.attributes.p_sub_tasks.data.length > 0) {
          this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey(ch.attributes.p_sub_tasks.data[0].id);
        } else {
          this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey(null);
        }

        this._EditAppointment.getContent()[0].getContent()[9].setValue(ch.attributes.startDate);
        this._EditAppointment.getContent()[0].getContent()[11].setValue(ch.attributes.endDate);
        this._EditAppointment.getContent()[0].getContent()[13].setValue(ch.attributes.noOfHours);
        this._EditAppointment.open();

      },
      handleAppointmentEditA: function () {
        var that = this;
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[3].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[9].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[12].setVisible(true);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[15].setVisible(true);


        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[5].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[11].setVisible(false);
        this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[14].setVisible(false);
      },
      handleAppointmentCancel: function () {
        var that = this;
        that.AppointmentInfo.close();
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].setEditable(false);
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[4].setEditable(false);
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].setEditable(false);
        that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].setEditable(false);
      },
      onSelectedEdit: function (oEvent) {

      },
      onSelectName: function (oEvent) {
        var that = this;
        that.cseltext = oEvent.getParameter("selectedItem").getProperty("key");
        // that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
        $.ajax({
          url: "deswork/api/p-appointments/" + that.cseltext + "?populate=*",
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);

            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");

            var check = that.getView().getModel("mCsfDetails").getData().attributes;
            that._EditAppointment.getContent()[0].getContent()[3].setValue(check.description);
            that._EditAppointment.getContent()[0].getContent()[5].setValue(check.startDate);
            that._EditAppointment.getContent()[0].getContent()[7].setValue(check.endDate);


          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wrong");
          }
        });
      },
      handleDialogEditSaveButton: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-appointments/" + this.taskId + "?populate=*",
          type: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            "data": {
              // "users_permissions_users": this.loginId,
              // "startDate": this._EditAppointment.getContent()[0].getContent()[5].getDateValue(),
              // "endDate": this._EditAppointment.getContent()[0].getContent()[7].getDateValue(),
              // "description": this._EditAppointment.getContent()[0].getContent()[3].getValue()
              "users_permissions_users": this.loginId,
              "name": this._EditAppointment.getContent()[0].getContent()[1].getValue(),
              "description": this._EditAppointment.getContent()[0].getContent()[3].getValue(),
              "p_tasks": this._EditAppointment.getContent()[0].getContent()[5].getSelectedKey() ? this._EditAppointment.getContent()[0].getContent()[5].getSelectedKey() : null,
              "p_sub_tasks": this._EditAppointment.getContent()[0].getContent()[7].getSelectedKey() ? this._EditAppointment.getContent()[0].getContent()[5].getSelectedKey() : null,
              "startDate": this._EditAppointment.getContent()[0].getContent()[9].getDateValue(),
              "endDate": this._EditAppointment.getContent()[0].getContent()[11].getDateValue(),
              "noOfHours": this._EditAppointment.getContent()[0].getContent()[13].getValue()
            }
          }),
          success: function (response) {
            var resValue = JSON.parse(response);
            console.log(resValue.error);
            if (resValue.error) {
              MessageBox.error(resValue.error.message);
            } else {
              that._EditAppointment.close();
              that.getAppointmentDetails();
              MessageBox.success("Updated Successfully");
              that.getUserDetails();
              that.onInit();
              that.clearSaveEdit();
            }
          }
        });
      },
      clearSaveEdit: function () {
        var that = this;
        this._EditAppointment.getContent()[0].getContent()[1].setValue(),
          this._EditAppointment.getContent()[0].getContent()[3].setValue(),
          this._EditAppointment.getContent()[0].getContent()[5].setSelectedKey(),
          this._EditAppointment.getContent()[0].getContent()[7].setSelectedKey() ,
          this._EditAppointment.getContent()[0].getContent()[9].setDateValue(),
          this._EditAppointment.getContent()[0].getContent()[11].setDateValue(),
          this._EditAppointment.getContent()[0].getContent()[13].setValue()
      },
      handleDialogEditSaveButtonA: function () {
        var that = this;
        $.ajax({
          url: "/deswork/api/p-appointments/" + that.DeleteAId + "?populate=*",
          type: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          data: JSON.stringify({
            "data": {
              "users_permissions_users": this.loginId,
              "name": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].getValue(),
              "description": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[4].getValue(),
              "startDate": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].getDateValue(),
              "endDate": this.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].getDateValue(),
            }
          }),
          success: function (response) {
            var resValue = JSON.parse(response);
            console.log(resValue.error);
            if (resValue.error) {
              MessageBox.error(resValue.error.message);
            } else {
              that.AppointmentInfo.close();
              that.getAppointmentDetails();
              MessageBox.success("Updated Successfully");
              that.getUserDetails();
              that.onInit();
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[2].setEditable(false);
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[4].setEditable(false);
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[6].setEditable(false);
              that.AppointmentInfo.getContent()[0].getItems()[0].getContent()[8].setEditable(false);
            }
          }
        });
      },
      handleDialogEditCancelButton: function () {
        var that = this;
        that._EditAppointment.close();
      },
      handleCreateChange: function (oEvent) {
        var that = this;
        var startDate = this._AddAppointment.getContent()[0].getContent()[9].getDateValue();
        var inputDate = new Date(startDate);
        var formattedDate = inputDate.toISOString().split('T')[0];

        var url = "deswork/api/users/" + this.loginId + "?populate[0]=p_appointments";
        $.ajax({
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          },
          success: function (response) {
            var arr = [];
            response = JSON.parse(response);
            var oModel = new sap.ui.model.json.JSONModel();

            var totalHoursWorked = 0; // Variable to store total hours worked

            for (var j = 0; j < response.p_appointments.length; j++) {
              response.p_appointments[j].startDate = UI5Date.getInstance(response.p_appointments[j].startDate);
              response.p_appointments[j].endDate = UI5Date.getInstance(response.p_appointments[j].endDate);

              // Check if the startDate matches the formattedDate
              if (formattedDate === response.p_appointments[j].startDate.toISOString().split('T')[0]) {
                var startTime = response.p_appointments[j].startDate.getTime();
                var endTime = response.p_appointments[j].endDate.getTime();
                var duration = (endTime - startTime) / (1000 * 60 * 60);
                // Calculate duration in hours

                totalHoursWorked += duration; // Accumulate the duration

                console.log("Appointment duration: " + duration + " hours");
              }
            }
            this.totalHoursWorked = totalHoursWorked;
            if (totalHoursWorked >= 8) {
              MessageBox.error("8 hours exceeded");
              that._AddAppointment.close();
            }
            // console.log("Total hours worked on " + formattedDate + ": " + totalHoursWorked + " hours");

            arr.push(response);
            oModel.setData(arr);
            that.getView().setModel(oModel);
          }
        });
      },


      handleCreateChange1: function (oEvent) {
        var startDate = this._AddAppointment.getContent()[0].getContent()[9].getDateValue();
        var endDate = this._AddAppointment.getContent()[0].getContent()[11].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          // console.log("Hours taken: " + hours + " hours " + minutes + " minutes");
        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._AddAppointment.close();
        }
        else {
          this._AddAppointment.getContent()[0].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
        }
      },
      handleCreateChangeEdit: function (oEvent) {
        var startDate = this._EditAppointment.getContent()[0].getContent()[9].getDateValue();
        var endDate = this._EditAppointment.getContent()[0].getContent()[11].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          // console.log("Hours taken: " + hours + " hours " + minutes + " minutes");
        }
        if (hours >= 8) {
          MessageBox.error("8 hours exceeded");
          this._EditAppointment.close();
        }
        this._EditAppointment.getContent()[0].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
      },
      // handleCreateChange1: function (oEvent) {
      //   var startDate = this._AddAppointment.getContent()[0].getContent()[9].getDateValue();
      //   var endDate = this._AddAppointment.getContent()[0].getContent()[11].getDateValue();

      //   if (startDate && endDate) {
      //     // Calculate the difference in milliseconds
      //     var timeDiff = endDate.getTime() - startDate.getTime();

      //     // Convert milliseconds to hours
      //     var hours = Math.floor(timeDiff / (1000 * 60 * 60));

      //     // Calculate the remaining minutes
      //     var remainingMinutes = Math.floor((timeDiff / (1000 * 60)) % 60);

      //     // Calculate the number of days
      //     var days = Math.floor(hours / 24);

      //     // Calculate the hours remaining after accounting for full days
      //     hours = hours % 24;

      //     console.log("Hours taken: " + days + " days, " + hours + " hours, " + remainingMinutes + " minutes");

      //     this._AddAppointment.getContent()[0].getContent()[13].setValue(days + " days, " + hours + " hours, " + remainingMinutes + " minutes");
      //   }
      // },

      handleDialogSaveButton: function () {
        var that = this;
        var Err = this.ValidateCreateCust();
        if (Err == 0) {
          $.ajax({
            url: "/deswork/api/p-appointments?populate=*",
            type: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            data: JSON.stringify({
              "data": {
                "users_permissions_users": this.loginId,
                "name": this._AddAppointment.getContent()[0].getContent()[1].getValue(),
                "description": this._AddAppointment.getContent()[0].getContent()[3].getValue(),
                "p_tasks": this._AddAppointment.getContent()[0].getContent()[5].getSelectedKey() ? this._AddAppointment.getContent()[0].getContent()[5].getSelectedKey() : null,
                "p_sub_tasks": this._AddAppointment.getContent()[0].getContent()[7].getSelectedKey() ? this._AddAppointment.getContent()[0].getContent()[5].getSelectedKey() : null,
                "startDate": this._AddAppointment.getContent()[0].getContent()[9].getDateValue(),
                "endDate": this._AddAppointment.getContent()[0].getContent()[11].getDateValue(),
                "noOfHours": this._AddAppointment.getContent()[0].getContent()[13].getValue()
              }
            }),
            success: function (response) {
              var resValue = JSON.parse(response);
              console.log(resValue.error);
              if (resValue.error) {
                MessageBox.error(resValue.error.message);
              } else {
                that._AddAppointment.close();
                that.getAppointmentDetails();
                MessageBox.success("Added Successfully");
                that.getUserDetails();
                that.onInit();
                that.clearSave();
              }
            }
          });
        }
        else {
          this.getView().setBusy(false);
          var text = "Mandatory Fields are Required";
          MessageBox.error(text);
        }
      },
      clearSave: function () {
        var that = this;
        this._AddAppointment.getContent()[0].getContent()[1].setValue(),
          this._AddAppointment.getContent()[0].getContent()[3].setValue(),
          this._AddAppointment.getContent()[0].getContent()[5].setSelectedKey(),
          this._AddAppointment.getContent()[0].getContent()[7].setSelectedKey() ,
          this._AddAppointment.getContent()[0].getContent()[9].setDateValue(),
          this._AddAppointment.getContent()[0].getContent()[11].setDateValue(),
          this._AddAppointment.getContent()[0].getContent()[13].setValue()
      },
      handleDialogCancelButton: function () {
        var that = this;
        that.clearSave();
        that._AddAppointment.close();
        
      },
      handleAppointmentSelect: function (oEvent) {
        var that = this;

        if (!this.AppointmentInfo) {
          this.AppointmentInfo = sap.ui.xmlfragment("idaPPo", "vaspp.timetracking.fragment.AppointmentInfo", this);
          this.getView().addDependent(this.AppointmentInfo);
        }

        var bindingContext = oEvent.getParameter("appointment").getBindingContext();
        var taskData = bindingContext.getObject();
        var userInfo = bindingContext.getModel().oData[0].p_appointments;

        for (var i = 0; i < userInfo.length; i++) {
          if (taskData.id === userInfo[i].id) {
            var url = "deswork/api/p-appointments/" + userInfo[i].id + "?populate=*";
            $.ajax({
              url: url,
              method: "GET",
              success: function (res) {
                var response = JSON.parse(res);
                var cModel = new sap.ui.model.json.JSONModel(response.data);
                that.getView().setModel(cModel, "mAppointDetails");
                var mAppointDetails = that.getView().getModel("mAppointDetails");
                var p_tasks = null;
                var p_sub_tasks = null;

                if (mAppointDetails && mAppointDetails.getData() && mAppointDetails.getData().attributes && mAppointDetails.getData().attributes.p_tasks && mAppointDetails.getData().attributes.p_tasks.data && mAppointDetails.getData().attributes.p_tasks.data.length > 0 && mAppointDetails.getData().attributes.p_tasks.data[0].attributes.name) {
                  p_tasks = mAppointDetails.getData().attributes.p_tasks.data[0].attributes.name;
                }

                if (mAppointDetails && mAppointDetails.getData() && mAppointDetails.getData().attributes && mAppointDetails.getData().attributes.p_sub_tasks && mAppointDetails.getData().attributes.p_sub_tasks.data && mAppointDetails.getData().attributes.p_sub_tasks.data.length > 0 && mAppointDetails.getData().attributes.p_sub_tasks.data[0].attributes.name) {
                  p_sub_tasks = mAppointDetails.getData().attributes.p_sub_tasks.data[0].attributes.name;
                }

                that.taskId = taskData.id;
                var taskName = taskData.name;
                var taskDescription = taskData.description;
                var startDate = taskData.startDate;
                var endDate = taskData.endDate;
                var noOfHours = taskData.noOfHours;

                var taskModel = new sap.ui.model.json.JSONModel();
                taskModel.setData({
                  id: that.taskId,
                  name: taskName,
                  description: taskDescription,
                  startDate: startDate,
                  endDate: endDate,
                  noOfHours: noOfHours,
                  p_tasks: p_tasks,
                  p_sub_tasks: p_sub_tasks
                });

                that.getView().setModel(taskModel, "taskModel");
                // load this selected appointment before opening
                that.getAppointmentDetailsEdit();
                // Open the fragment using the byId function
                that.AppointmentInfo.open();
              },
              error: function (res) {
                console.log(res);
                // MessageBox.error(res + "Something went wrong");
              }
            });
          }
        }
      },

      //TO CHECK DATA VALIDATION
      ValidateCreateCust: function () {
        var Err = 0;
        if (this._AddAppointment.getContent()[0].getContent()[1].getValue() === "" || this._AddAppointment.getContent()[0].getContent()[1].getValue() == null) {
          Err++;
        }
        else {
          this._AddAppointment.getContent()[0].getContent()[1].setValueState("None");
        }
        if (this._AddAppointment.getContent()[0].getContent()[3].getValue() === "") {
          this._AddAppointment.getContent()[0].getContent()[3].setValueState("None");
          Err++;
        }
        if (this._AddAppointment.getContent()[0].getContent()[9].getValue() === "") {
          this._AddAppointment.getContent()[0].getContent()[9].setValueState("None");
          Err++;
        }
        if (this._AddAppointment.getContent()[0].getContent()[11].getValue() === "") {
          this._AddAppointment.getContent()[0].getContent()[11].setValueState("None");
          Err++;
        }
        return Err;
      },


      handleAppointmentDelete: function () {
        var that = this;

        this.taskId;
        $.ajax({
          url: "/deswork/api/p-appointments/" + this.taskId + "?populate=*",
          type: "DELETE",
          success: function (response) {
            var resValue = JSON.parse(response);
            console.log(resValue.error);
            if (resValue.error) {
              MessageBox.error(resValue.error.message);
            } else {
              that.AppointmentInfo.close();
              that.getAppointmentDetails();
              MessageBox.success("Deleted Successfully");
              that.getUserDetails();
              that.onInit();
            }
          }
        });
      },
      timecalculation: function (oEvent) {
        var startDate = this._AddAppointment.getContent()[0].getContent()[9].getDateValue();
        var endDate = this._AddAppointment.getContent()[0].getContent()[11].getDateValue();
        if (startDate && endDate) {
          // Calculate the difference in milliseconds
          var timeDiff = endDate.getTime() - startDate.getTime();

          // Convert milliseconds to hours
          var hours = Math.floor(timeDiff / (1000 * 60 * 60));
          var minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
          console.log("Hours taken: " + hours + " hours " + minutes + " minutes");
        }
        this._AddAppointment.getContent()[0].getContent()[13].setValue(hours + " hours " + minutes + " minutes");
      }
      // handleSelectionFinish: function (oEvent) {
      //   var aSelectedKeys = oEvent.getSource().getSelectedKeys();
      //   this.byId("PC1").setBuiltInViews(aSelectedKeys);
      // }

    });
  });    