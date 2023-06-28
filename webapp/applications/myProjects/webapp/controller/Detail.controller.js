sap.ui.define(
  [
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/Controller",
    "VASPP/myProjects/utils/formatter",
    "sap/m/MessageBox",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/m/UploadCollectionParameter"
  ],
  function (
    JSONModel, Controller,
    formatter,
    MessageBox,
    FilterOperator,
    Filter,
    exportLibrary,
    Spreadsheet,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("VASPP.myProjects.controller.Detail", {
      formatter: formatter,
      onInit: function () {

        // if (!this.oAddTaskInfo) {
        //   this.oAddTaskInfo = sap.ui.xmlfragment(
        //     "idFragmentT123",
        //     "VASPP.myProjects.view.RegisteraddTask",
        //     this
        //   );
        //   this.getView().addDependent(this.oAddTaskInfo);
        // }
        if (!this.oAddTaskInfo) {
          this.oAddTaskInfo = sap.ui.xmlfragment(
            "idFragmentT123",
            "VASPP.myProjects.fragment.RegisteraddTask",
            this
          );
          this.getView().addDependent(this.oAddTaskInfo);
        }

        var oExitButton = this.getView().byId("exitFullScreenBtn"),
          oEnterButton = this.getView().byId("enterFullScreenBtn");
        this.oRouter = this.getOwnerComponent().getRouter();
        this.oModel = this.getOwnerComponent().getModel();
        this.oRouter
          .getRoute("detail")
          .attachPatternMatched(this._onObjectMatched, this);
        [oExitButton, oEnterButton].forEach(function (oButton) {
          oButton.addEventDelegate({
            onAfterRendering: function () {
              if (this.bFocusFullScreenButton) {
                this.bFocusFullScreenButton = false;
                oButton.focus();
              }
            }.bind(this),
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
      //CLOSE
      handleClose: function () {
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/midColumn/closeColumn"
        );
        this.oRouter.navTo("master", { layout: sNextLayout });
      },

      //OBJECT MATCHED

      _onObjectMatched: function (oEvent) {

        var that = this;
        if (typeof oEvent == "number") {
          this.id = oEvent;
        } else {
          this.id = oEvent.getParameter("arguments").product;
        }

        var options = {};
        $.get(
          "/deswork/api/p-projects/" +
          this.id +
          "?populate[0]=p_customer&populate[1]=p_vendors&populate[2]=p_tasks.users_permissions_user&populate[3]=p_project_teams.users_permissions_users&populate[4]=p_milestones&populate[5]=Users&populate[6]=m_time_entries",
          options,
          function (response) {
            console.log(response);
            response = JSON.parse(response);
            var oModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(oModel, "myproject");
            that.csf();
            that.mcsfsDetails();
            that.subTasks();
          }
        );
      },
      subTasks: function () {
        var that = this;
        $.ajax({
           url: "/deswork/api/p-sub-tasks?populate=*",
          type: "GET",
          success: function (res) {
            var csrfDetails = JSON.parse(res);
            if (csrfDetails.error) {
              MessageBox.error(
                csrfDetails.error.message + "Something went wrong!"
              );
            } else {
              var mmModel = new sap.ui.model.json.JSONModel(csrfDetails.data);
              that.oAddTaskInfo.setModel(mmModel, "csfmodel");
              // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue(that.getView().getModel("csfmodel").getData().attributes.startDate);
              that.selectedSubtask = that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].getSelectedKey()
              // that.oAddTaskInfo.getModel("csfmodel").getData()[0].attributes.startDate
            }
          },
        });
      },
      csf: function () {
        var that = this;
        $.ajax({
          url: "deswork/api/p-tasks?populate=*",
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            that.mcsrfLength = response.data.length;
            //
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mcsf");
          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wrong");
          }
        });
      },
      mcsfsDetails: function () {
        var that = this;
        that.loginId = this.getOwnerComponent().getModel("loggedOnUserModel").getData().id;
        $.ajax({
          url: "deswork/api/p-tasks?populate[0]=p_sub_tasks&filters[users_permissions_user][id]=" + that.loginId + "&filters[p_project][id]=" + that.id,
          type: "GET",
          success: function (res) {
            var response = JSON.parse(res);
            that.mcsrfLength = response.data.length;
            //
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");
            var taskLength = that.getView().getModel("mCsfDetails").getData();
            var finalCsfSet = [];
            for (var i = 0; i < taskLength.length; i++) {
              var task = taskLength[i].attributes;
              var subTasks = task.p_sub_tasks.data;

              if (subTasks) {
                task.p_sub_tasks = [];
                for (var j = 0; j < subTasks.length; j++) {
                  var subTask = subTasks[j].attributes;
                  subTask.id = subTasks[j].id;
                  task.p_sub_tasks.push(subTask);
                }
              }

              finalCsfSet.push(task);
            }

            var appointmentsdata = new sap.ui.model.json.JSONModel(finalCsfSet);
            that.getView().setModel(appointmentsdata, "appointmentsdata");
            that.getView().getModel("mCsfDetails").updateBindings(true);
          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wrong");
          }
        });
      },

      addTaskDailog: function () {
        this.editTask = false;
        this.oAddTaskInfo.setModel(
          new sap.ui.model.json.JSONModel({}),
          "mTasks"
        );
        this.oAddTaskInfo.open();
      },
      onSaveTaskDialog: function (oEv) {
        var that = this;
        that.oAddTask = {
          extended_end_date: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].getValue(),
          status: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].getSelectedKey(),
          p_task_reason: this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].getValue(),
          p_approver_status: "Requested"
        }
        $.ajax({
          url: "deswork/api/p-sub-tasks/" + that.selectedSubtask + "?populate=*",
          type: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          data: JSON.stringify({
            data: that.oAddTask,
          }),
          success: function (res) {
            var getValues = JSON.parse(res);
            console.log(getValues.error);
            if (getValues.error) {
              MessageBox.error(getValues.error.message);
            } else {
              that.oAddTaskInfo.close();
              MessageToast.show("Time Extension Requested Successfully!");
              that.id;
              that.parId = that.id;
              that.parIds = JSON.parse(that.parId);
              that._onObjectMatched(that.parIds);
              that.getView().getModel().updateBindings(true);
              that.clearTask();
            }
          },
        })

      },
      clearTask: function () {
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].setSelectedKey();
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].setValue();
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValue();
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue();
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setSelectedKey();
        this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setValue();
        // this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setSelectedKey();
        // this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[15].setValue();
        // this.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[15].getValue();
      },
      onCloseTaskDialog: function () {
        var that = this;
        that.oAddTaskInfo.close();
        that.clearTask();
      },
      onPress: function (oEvent) {
        debugger;
        var that = this;
        that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
        $.ajax({
          url: "deswork/api/p-tasks/" + that.selectedId + "?populate=*",
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);

            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");

            var taskData = that.getView().getModel("mCsfDetails").getData();
            // for (var i = 0; taskData.length > length; i++) {
            var selected_id = that.getView().getModel("mCsfDetails").getData().id;


            //     that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].setSelectedKey(that.getView().getModel("mCsfDetails").getData().attributes.name);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].setValue(that.getView().getModel("mCsfDetails").getData().attributes.description);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValue(that.getView().getModel("mCsfDetails").getData().attributes.startDate);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue(that.getView().getModel("mCsfDetails").getData().attributes.endDate);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setValue(that.getView().getModel("mCsfDetails").getData().attributes.extended_end_date);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setSelectedKey(that.getView().getModel("mCsfDetails").getData().attributes.status);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setSelectedKey(that.getView().getModel("mCsfDetails").getData().attributes.priority);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[15].setValue(that.getView().getModel("mCsfDetails").getData().attributes.p_task_reason);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[17].setValue(that.getView().getModel("mCsfDetails").getData().attributes.users_permissions_user.data.attributes.firstName);

            //   var programKey =  that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].getSelectedItem().getKey();
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setEditable(true);

            $.ajax({
              url:
                "/deswork/api/p-sub-tasks?populate=*&filters[p_task][id][$eq]=" +
                selected_id,
              type: "GET",
              success: function (res) {
                var csrfDetails = JSON.parse(res);
                if (csrfDetails.error) {
                  MessageBox.error(
                    csrfDetails.error.message + "Something went wrong!"
                  );
                } else {
                  var mmModel = new sap.ui.model.json.JSONModel(csrfDetails.data);
                  that.oAddTaskInfo.setModel(mmModel, "csfmodel");
                  // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue(that.getView().getModel("csfmodel").getData().attributes.startDate);
                  that.selectedSubtask = that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].getSelectedKey()
                  // that.oAddTaskInfo.getModel("csfmodel").getData()[0].attributes.startDate
                }
              },
            });
          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wrong");
          }
        });

      },
      onSelectSubtask: function () {
        //   that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
        var that = this;
        that.selectedSubtask = that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].getSelectedKey();
        $.ajax({
          url: "deswork/api/p-sub-tasks/" + that.selectedSubtask + "?populate=*",
          type: "GET",

          success: function (res) {
            var response = JSON.parse(res);

            that.mcsrfLength = response.data.length;
            var cModel = new sap.ui.model.json.JSONModel(response.data);
            that.getView().setModel(cModel, "mCsfDetails");

            var taskData = that.getView().getModel("mCsfDetails").getData();
            // for (var i = 0; taskData.length > length; i++) {
            //  var selected_id = that.getView().getModel("mCsfDetails").getData().id;


            //   
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[3].setValue(taskData.attributes.startDate);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValue(taskData.attributes.endDate);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue(taskData.attributes.extended_end_date);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setSelectedKey(taskData.attributes.status);
            that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setValue(taskData.attributes.p_task_reason);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setValue(that.getView().getModel("mCsfDetails").getData().attributes.startDate);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue(that.getView().getModel("mCsfDetails").getData().attributes.endDate);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[9].setValue(that.getView().getModel("mCsfDetails").getData().attributes.extended_end_date);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[11].setSelectedKey(that.getView().getModel("mCsfDetails").getData().attributes.status);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[13].setSelectedKey(that.getView().getModel("mCsfDetails").getData().attributes.priority);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[15].setValue(that.getView().getModel("mCsfDetails").getData().attributes.p_task_reason);
            // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[17].setValue(that.getView().getModel("mCsfDetails").getData().attributes.users_permissions_user.data.attributes.firstName);

            //   var programKey =  that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[1].getSelectedItem().getKey();
            //   that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].setEditable(true);

            // $.ajax({
            //   url:
            //     "/deswork/api/p-sub-tasks?populate=*&filters[p_task][id][$eq]=" +
            //     selected_id,
            //   type: "GET",
            //   success: function (res) {
            //     var csrfDetails = JSON.parse(res);
            //     if (csrfDetails.error) {
            //       MessageBox.error(
            //         csrfDetails.error.message + "Something went wrong!"
            //       );
            //     } else {
            //       var mmModel = new sap.ui.model.json.JSONModel(csrfDetails.data);
            //       that.oAddTaskInfo.setModel(mmModel, "csfmodel");
            //      // that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[7].setValue(that.getView().getModel("csfmodel").getData().attributes.startDate);
            //     that.selectedSubtask = that.oAddTaskInfo.getContent()[0].getItems()[0].getContent()[5].getSelectedKey()
            //      // that.oAddTaskInfo.getModel("csfmodel").getData()[0].attributes.startDate
            //     }
            //   },
            // });
          },
          error: function (res) {
            console.log(res);
            MessageBox.error(res + "Something went wroung");
          }
        });
      }

    });
  }
);
