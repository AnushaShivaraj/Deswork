sap.ui.define(
    [
      "sap/ui/model/json/JSONModel",
      "sap/ui/core/mvc/Controller",
      "VASPP/Projects/utils/formatter",
      "sap/m/MessageBox",
      "sap/ui/model/FilterOperator",
      "sap/ui/model/Filter",
      "sap/ui/export/library",
      "sap/ui/export/Spreadsheet",
      "sap/m/MessageToast",
      "sap/m/UploadCollectionParameter"
    ],
    function (
      JSONModel,
      Controller,
      formatter,
      MessageBox,
      FilterOperator,
      Filter,
      exportLibrary,
      Spreadsheet,
      MessageToast
    ) {
      "use strict";
  
      return Controller.extend("VASPP.Projects.controller.Detail", {
        formatter: formatter,
        onInit: function () {
          if (!this.oAddSubTaskInfo) {
            this.oAddSubTaskInfo = sap.ui.xmlfragment(
  
              "VASPP.Projects.fragment.RegisteraddSubTask",
              this
            );
            this.getView().addDependent(this.oAddSubTaskInfo);
          }
          if (!this.oEditSubTaskInfo) {
            this.oEditSubTaskInfo = sap.ui.xmlfragment(
  
              "VASPP.Projects.fragment.EditSubTask",
              this
            );
            this.getView().addDependent(this.oEditSubTaskInfo);
          }
  
  
          //Other
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
          if (!this.oAddTeamMember) {
            this.oAddTeamMember = sap.ui.xmlfragment(
              "idFragmentTM",
              "VASPP.Projects.fragment.RegisterTeamMember",
              this
            );
            this.getView().addDependent(this.oAddTeamMember);
          }
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
          var that = this;
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/closeColumn"
          );
          this.oRouter.navTo("master", { layout: sNextLayout });
        },
  
        //OBJECT MATCHED
  
        _onObjectMatched: function (oEvent) {
          //  debugger;
          var that = this;
          if (typeof oEvent == "number") {
            this.id = oEvent;
          } else {
            this.id = oEvent.getParameter("arguments").product;
          }
          that.getEffort();
          var options = {};
          $.get(
            "/deswork/api/p-projects/" +
            this.id +
            "?populate[0]=p_customer&populate[1]=p_vendors&populate[2]=p_tasks.users_permissions_user&populate[3]=p_project_teams.users_permissions_user&populate[4]=p_milestones&populate[5]=Users&populate[6]=m_time_entries&populate[7]=p_time_estimations&populate[8]=users_permissions_users&populate[9]=p_documents",
            options,
            function (response) {
  
              console.log(response);
              response = JSON.parse(response);
              var oModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(oModel, "mprojects");
              that.getView().getModel("mprojects").updateBindings("true");
  
              that.projectsDetails();
              // that.getEffort();
              //   that.getVendorDetails();
              //tree Table
              that.mCsfData();
              that.Subcsf();
              //
              that.getNameforTeam();
              that.getNameforTask();
              that.csf();
  
              that.getCustomerDetails();
  
              that.getTeamMemberdetails();
              //table
              that.mcsfsDetails();
              // //tree Table
              // that.mCsfData();
              // that.Subcsf();
  
            }
          );
        },
  
  
        mCsfData: function () {
          var that = this;
  
          $.ajax({
            url: "/deswork/api/p-tasks?populate[0]=p_sub_tasks&populate[1]=users_permissions_user&filters[p_project][id]=" + that.id,
            type: "GET",
            success: function (res) {
              var response = JSON.parse(res);
              that.mcsrfLength = response.data.length;
              var cModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(cModel, "mCsfDetails");
              var taskLength = that.getView().getModel("mCsfDetails").getData();
              var finalCsfSet = [];
  
              for (var i = 0; i < taskLength.length; i++) {
                var task = taskLength[i].attributes;
                task.id = taskLength[i].id;
                var subTasks = task.p_sub_tasks.data;
  
                if (subTasks) {
                  task.p_sub_tasks = [];
                  for (var j = 0; j < subTasks.length; j++) {
                    var subTask = subTasks[j].attributes;
                    subTask.id = subTasks[j].id;
                    task.p_sub_tasks.push(subTask);
                  }
                }
  
                // Convert users_permissions_user array to an object
                var usersPermissionsUser = task.users_permissions_user.data;
                if (usersPermissionsUser) {
                  task.users_permissions_user = usersPermissionsUser.attributes;
                  task.users_permissions_user.id = usersPermissionsUser.id;
                  task.users_permissions_user.appPermission = permission;
                
                }
                // Convert users_permissions_user array to an object
                var usersPermissionsUser = task.users_permissions_user.data;
                if (usersPermissionsUser) {
                  task.users_permissions_user = {};
                  for (var k = 0; k < usersPermissionsUser.length; k++) {
                    var permission = usersPermissionsUser[k].attributes;
                    permission.id = usersPermissionsUser[k].id;
                    task.users_permissions_user[permission.appPermission] = permission;
                
                  }
                }
  
                finalCsfSet.push(task);
              }
  
              var csfData = new sap.ui.model.json.JSONModel(finalCsfSet);
              that.getView().setModel(csfData, "csfData");
              debugger;
              that.getView().getModel("mCsfDetails").updateBindings(true);
              // that.tableExpand();
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wrong");
            }
          });
        },
  
        tableExpand: function (oEvent) {
          // var oTreeTable = this.byId("TreeTableBasic");
          //  oTreeTable.expand(0);
          // var oRowContext = oEvent.getParameter("rowContext");
          // var iLevel = oRowContext.getProperty("level");
  
          // if (iLevel === 2) {
          //    oEvent.preventDefault(); // Prevent expansion of second level
          // }
          var oTreeTable = this.byId("TreeTableBasic");
          var aExtensions = oTreeTable._aExtensions;
  
          // Extensions to remove
          var extensionsToRemove = [3, 4, 5, 6];
  
          extensionsToRemove.forEach(function (extensionIndex) {
            var extension = aExtensions[extensionIndex];
            if (extension) {
              oTreeTable.removeExtension(extension);
            }
          });
  
  
  
        },
        // Event handler for file deletion
        onFileDeleted: function (event) {
          var that = this;
          var file = event.getParameter("item");
          var documentId = event.getParameter("item").getBindingContext("mprojects").getObject().id;
          file.data("documentId", documentId);
          var projectId = event.getParameter("item").getBindingContext("mprojects").oModel.oData.id
          var documentId = file.data("documentId");
  
          if (documentId) {
  
            $.ajax({
              url: "/deswork/api/p-projects/" + projectId,
              type: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              success: function (res) {
                var getValues = JSON.parse(res);
                console.log(getValues.error);
                if (getValues.error) {
                  MessageBox.error(getValues.error.message);
                } else {
                  $.ajax({
                    url: "/deswork/api/p-projects/" + projectId,
                    type: "PUT",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    success: function (res) {
                      var getValues = JSON.parse(res);
                      console.log(getValues.error);
                      if (getValues.error) {
                        MessageBox.error(getValues.error.message);
                      } else {
                        MessageToast.show("Attachments Deleted Successfully!");
                        that.getView().getModel("mprojects").updateBindings(true);
                        that.getView().getModel("mprojects").refresh();
  
                      }
                    },
                  });
                  MessageToast.show("Attachments Deleted Successfully!");
                  that.getView().getModel("mprojects").updateBindings(true);
                  that.getView().getModel("mprojects").refresh();
  
                }
              },
            });
  
          }
        },
  
        //projectsDetails -milestone
        mcsfsDetails: function () {
          var that = this;
          $.ajax({
            // not working check later
            url: "/deswork/api/p-tasks?populate=*&filters[p_project][id]=" + that.id,
            // url: "/deswork/api/p-tasks?populate=*" ,
            type: "GET",
  
            success: function (res) {
              var response = JSON.parse(res);
              // console.log(response);
              // var taskData = [];
              //   that.mcsrfLength = response.data.length;
              var cModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(cModel, "mCsfDetails");
              //that.mDclDetails();
              //	that.getView().setBusy(false);
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wroung");
            }
          });
        },
  
        projectsDetails: function () {
          var that = this;
          that.id = JSON.parse(that.id);
          //that.getView().setBusy(true);
          $.ajax({
            url: "/deswork/api/p-projects?populate=*&filters[id][$eq]=" + that.id,
            type: "GET",
  
            success: function (res) {
              var response = JSON.parse(res);
              // debugger;
              that
                .getView()
                .setModel(new sap.ui.model.json.JSONModel(response.data[0]));
              var milestoneData = that.getView().getModel().getData().attributes
                .p_milestones.data;
              var milestoneDataModel = new JSONModel(milestoneData);
              that.getView().setModel(milestoneDataModel, "mMileStoneModel");
              that.dataId = response.data[0].id;
              //that.getMilestoneDetails();
            },
            error: function (res) {
              console.log(res);
            },
          });
        },
  
  
        //EDIT PROJECTS
  
        onEditProjects: function (oEvent) {
          var that = this;
  
          var EditModel = that
            .getView()
            .getModel("mprojects")
            .getData().attributes;
          if (EditModel.status === "Completed") {
            MessageToast.show("Completed Projects can't be Edited")
          }
          else {
            var customerEdit = that.getView().getModel("mprojects").getData()
              .attributes.p_customer.data;
            if (!this.oAddProjectDialog1) {
              this.oAddProjectDialog1 = sap.ui.xmlfragment(
                "idfragm",
                "VASPP.Projects.view.Register",
                this
              );
              this.getView().addDependent(this.oAddProjectDialog1);
            }
            if(EditModel.p_customer.data === null){
              this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[18]
                .setSelectedKey("");
            }
            var data = {
              name: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[2]
                .setValue(EditModel.name),
              description: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[4]
                .setValue(EditModel.description),
                type: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[6]
                .setSelectedKey(EditModel.type),
                startDate: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[8]
                .setValue(EditModel.startDate),
              estimatedEndDate: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[10]
                .setValue(EditModel.estimatedEndDate),
              actualEndDate: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[12]
                .setEditable(true),
              actualEndDate: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[12]
                .setValue(EditModel.actualEndDate),
              priority: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[14]
                .setSelectedKey(EditModel.priority),
              // effort: this.oAddProjectDialog1
              //   .getContent()[0]
              //   .getItems()[0]
              //   .getContent()[14]
              //   .setEditable(true),
              // effort: this.oAddProjectDialog1
              //   .getContent()[0]
              //   .getItems()[0]
              //   .getContent()[14]
              //   .setSelectedKey(EditModel.effort),
              status: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[16]
                .setSelectedKey(EditModel.status),
              p_customer: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[18]
                .setSelectedKey(EditModel.p_customer.data.id) ,
                // ? this.oAddProjectDialog1
                // .getContent()[0]
                // .getItems()[0]
                // .getContent()[18]
                // .setSelectedKey() : "",
              estimated_budget: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[20]
                .setEditable(true),
              estimated_budget: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[20]
                .setValue(EditModel.estimated_budget),
              actual_budget: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[22]
                .setEditable(true),
              // if()
              actual_budget: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[22]
                .setValue(EditModel.actual_budget) ? this.oAddProjectDialog1
                  .getContent()[0]
                  .getItems()[0]
                  .getContent()[22]
                  .setValue(EditModel.actual_budget) : null,
  
            };
            this.oAddProjectDialog1.setModel(new sap.ui.model.json.JSONModel(data));
  
            this.getView().getModel("mprojects").updateBindings(true);
            this.oAddProjectDialog1.open();
          }
        },
  
        //ON SAVE EDITED PROJECT
  
        onSaveProject: function (oEv) {
          var that = this;
          that.updatedProject = {
            name: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[2]
              .getValue(),
            description: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[4]
              .getValue(),
              type: this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[6]
                .getSelectedKey(),
            startDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[8]
              .getValue(),
            estimatedEndDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[10]
              .getValue(),
            actualEndDate: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[12]
              .getValue() ? this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[12]
                .getValue() : null,
            priority: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[14]
              .getSelectedKey(),
            // effort: this.oAddProjectDialog1
            //   .getContent()[0]
            //   .getItems()[0]
            //   .getContent()[14]
            //   .getValue(),
            status: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[16]
              .getSelectedKey(),
            p_customer: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[18]
              .getSelectedKey(),
            estimated_budget: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[20]
              .getValue(),
  
            actual_budget: this.oAddProjectDialog1
              .getContent()[0]
              .getItems()[0]
              .getContent()[22]
              .getValue() ? this.oAddProjectDialog1
                .getContent()[0]
                .getItems()[0]
                .getContent()[22]
                .getValue() : null,
          }
          $.ajax({
            url: "/deswork/api/p-projects/" + that.id +"?populate=*",
            type: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            data: JSON.stringify({
              data: that.updatedProject,
            }),
            success: function (res) {
              var getValues = JSON.parse(res);
              console.log(getValues.error);
              if (getValues.error) {
                MessageBox.error(getValues.error.message);
              } else {
                that.handleClose();
                that.oAddProjectDialog1.close();
                // that.getOwnerComponent().getRouter().navTo();
                MessageBox.success("Project Updated Successfully");
                that._onObjectMatched(that.id);
  
                that.onInit();
                that.getView().getModel("mprojects").updateBindings(true);
                
               
                that.getView().getModel("mprojects").updateBindings(true);
                that.getView().getModel().updateBindings(true);
  
              }
            },
          });
  
        },
  
        closeProjectDialog: function () {
          this.oAddProjectDialog1.close();
        },
  
        //DELETE PROJECT DETAILS
        OnDeleteProjects: function (evt) {
          var that = this;
          MessageBox.confirm("Are you sure you want to Delete  ?", {
            actions: ["Yes", "No"],
            emphasizedAction: "Yes",
            onClose: function (evt) {
              if (evt == "Yes") {
                $.ajax({
                  type: "DELETE",
                  url: "/deswork/api/p-projects/" + that.id,
                  success: function (response) {
                    var resv = JSON.parse(response);
                    console.log(resv);
                    if (resv.error) {
                      MessageBox.error(resv.error.message);
                    } else {
                      MessageBox.success("Project has been deleted");
                      // that._onObjectMatched();
                      // var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
                      // this.oRouter.navTo("master", { layout: sNextLayout });
                      that.handleClose();
                      that._onObjectMatched(that.id);
  
                      that.getView().getModel().updateBindings(true);
                      //  that.getOwnerComponent().getRouter().navTo();
  
                      that.onInit();
                      // that.getOwnerComponent().getModel("mprojects").getData();
                      // that.getOwnerComponent().getModel("mprojects").updateBindings(true);
                      // that.getOwnerComponent().getModel("mprojects").refresh();
                      //  that.getView().getModel("mprojects").updateBindings(true);
                      //  that.getView().getModel("mprojects").refresh();
                      // that._onObjectMatched(that.id);
                    }
                  },
                });
              }
            },
          });
        },
        //CUSTOMER DETAILS
        getCustomerDetails: function () {
          var that = this;
          $.ajax({
            url: "/deswork/api/p-customers",
            type: "GET",
            success: function (res) {
              var response = JSON.parse(res);
              console.log(response);
              var theModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(theModel, "customerInfo");
              //that.getTeamMemberdetails();
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wrong");
            },
          });
        },
  
  
  
        //TEAM MEMBER DETAILS Updated : Anusha
  
        getTeamMemberdetails: function () {
  
          var that = this;
          $.ajax({
            url: "/deswork/api/p-project-teams?populate=*&filters[p_project][id]=" + that.id,
            type: "GET",
            success: function (res) {
              var response = JSON.parse(res);
              that.mcsrfLength = response.data.length;
              var cModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(cModel, "mTeamMember");
            },
            error: function (res) {
              console.log(res);
            }
          });
        },
        //user for team member and task
        getNameforTeam: function () {
          var that = this;
          $.ajax({
            url: "/deswork/api/users?populate=*",
            type: "GET",
            success: function (res) {
              var response = JSON.parse(res);
              console.log(response);
              var theModel = new sap.ui.model.json.JSONModel(response);
              that.getView().setModel(theModel, "pUsers");
              //that.getTeamMemberdetails();
            },
            error: function (res) {
              console.log(res);
            },
          });
        },
        addTeamMember: function () {
          // if (!this.oAddTeamMember) {
          //   this.oAddTeamMember = sap.ui.xmlfragment(
          //     "idFragmentTM",
          //     "VASPP.Projects.fragment.RegisterTeamMember",
          //     this
          //   );
          //   this.getView().addDependent(this.oAddTeamMember);
          // }
          var TeamMemberModel = new JSONModel(
            this.getView().getModel("pUsers").getData()
          );
  
          this.oAddTeamMember.setModel(TeamMemberModel);
          this.oAddTeamMember.open();
        },
  
        onSelectedTeam: function (oEvent) {
          //from here
          var that = this;
          that.p_role_team = oEvent.getParameters().selectedItem.mProperties.text;
          //till here
          if (!this.selectUser) {
            this.selectUser = sap.ui.xmlfragment(this.getView().getId(), "VASPP.Projects.fragment.selectUser", this);
            //  this.selectUser.setModel(this.getOwnerComponent().getModel("i18nModel"), "i18n");
            this.getView().addDependent(this.selectUser);
          }
  
          let userModel = this.getView().getModel("pUsers").getData();
          var filteredUsers = [];
          if (that.p_role_team === "Associate Developer") {
  
            // for (var i = 0; i < userModel.length; i++) {
            //   var user = userModel[i];
            //   if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
            //     filteredUsers.push(user);
            //   }
            // }
            for (var i = 0; i < userModel.length; i++) {
              var user = userModel[i];
              for (var j = 0; j < user.p_team_role_users.length; j++) {
                if (user.p_team_role_users[j].roleName === that.p_role_team) {
                  filteredUsers.push(user);
                  break; // Break out of the inner loop if the "Tester" role is found
                }
              }
            }
          }
          else if (that.p_role_team === "Senior Developer") {
            // for (var i = 0; i < userModel.length; i++) {
            //   var user = userModel[i];
            //   if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
            //     filteredUsers.push(user);
            //   }
            // }
            for (var i = 0; i < userModel.length; i++) {
              var user = userModel[i];
              for (var j = 0; j < user.p_team_role_users.length; j++) {
                if (user.p_team_role_users[j].roleName === that.p_role_team) {
                  filteredUsers.push(user);
                  break; // Break out of the inner loop if the "Tester" role is found
                }
              }
            }
          }
          // else if (that.p_role_team === "Tester") {
          //   for (var i = 0; i < userModel.length; i++) {
          //     var user = userModel[i];
          //     if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
          //       filteredUsers.push(user);
          //     }
          //   }
          // }
          else if (that.p_role_team === "Tester") {
            for (var i = 0; i < userModel.length; i++) {
              var user = userModel[i];
              for (var j = 0; j < user.p_team_role_users.length; j++) {
                if (user.p_team_role_users[j].roleName === that.p_role_team) {
                  filteredUsers.push(user);
                  break; // Break out of the inner loop if the "Tester" role is found
                }
              }
            }
          }
  
          else if (that.p_role_team === "Project Manager") {
            // for (var i = 0; i < userModel.length; i++) {
            //   var user = userModel[i];
            //   if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
            //     filteredUsers.push(user);
            //   }
            // }
            for (var i = 0; i < userModel.length; i++) {
              var user = userModel[i];
              for (var j = 0; j < user.p_team_role_users.length; j++) {
                if (user.p_team_role_users[j].roleName === that.p_role_team) {
                  filteredUsers.push(user);
                  break; // Break out of the inner loop if the "Tester" role is found
                }
              }
            }
          }
          else if (that.p_role_team === "Architect") {
            // for (var i = 0; i < userModel.length; i++) {
            //   var user = userModel[i];
            //   if (user.p_team_role_users.length > 0 && user.p_team_role_users[0].roleName === that.p_role_team) {
            //     filteredUsers.push(user);
            //   }
            // }
            for (var i = 0; i < userModel.length; i++) {
              var user = userModel[i];
              for (var j = 0; j < user.p_team_role_users.length; j++) {
                if (user.p_team_role_users[j].roleName === that.p_role_team) {
                  filteredUsers.push(user);
                  break; // Break out of the inner loop if the "Tester" role is found
                }
              }
            }
          }
          this.selectUser.setModel(new sap.ui.model.json.JSONModel(filteredUsers));
  
          this.selectUser.open();
        },
  
        onSelectUser: function (evt) {
          var that = this;
          // var that = this;
          that.ProjectId = this.getView().getModel("mprojects").getData();
          var Project = this.getView().getModel("mprojects").getData().id;
          that.participants = [];
          that.userManagment = [];
          var aSelectedItems = evt.getParameter("selectedItems");
          aSelectedItems.forEach(function (item) {
            var bindingContext = item.getBindingContext();
            var userObject = bindingContext.getObject();
            that.participants.push(userObject);
            that.userManagment.push(userObject.id);
          });
          that.oAddTeamMember.getContent()[0].getItems()[0].getContent()[3].setValue(that.participants[0].firstName);
          that.oAddTeamMember.getContent()[0].getItems()[0].getContent()[5].setValue(that.participants[0].rate_card);
        },
        onSaveTeamMemberDialogs: function (oEvent) {
          var that = this;
          that.oNewAppointment = {
            users_permissions_user: that.userManagment,
            p_project: [that.ProjectId.id],
            p_team_role: that.oAddTeamMember.getContent()[0].getItems()[0].getContent()[1].getSelectedKey(),
          };
          $.ajax({
            url: "/deswork/api/p-project-teams?populate=*",
            type: "POST",
            headers: {
              "Content-Type": 'application/json'
            },
            data: JSON.stringify({
              "data": that.oNewAppointment
            }),
            success: function (res) {
              var getValues = JSON.parse(res);
              if (getValues.error) {
                MessageBox.error(getValues.error.message + "data is not created Something went wrong!");
              } else {
  
                MessageToast.show("Team Member Added successfully!");
  
                that._onObjectMatched(that.id);
                that.getView().getModel().updateBindings(true);
                that.oAddTeamMember.close();
  
                $.ajax({
                  url: "/deswork/api/p-project-teams?populate[0]=p_project&filters[p_project][id][$eq]=" + that.ProjectId.id + "&populate[1]=users_permissions_user",
                  type: "GET",
                  success: function (res) {
                    var response = JSON.parse(res);
                    console.log(response);
                    var theModel = new sap.ui.model.json.JSONModel(response.data);
                    that.getView().setModel(theModel, "mTeamMembers");
                    var teamusers = that.getView().getModel("mTeamMembers").getData();
                    var newUsers = [];
                    for (var i = 0; i < teamusers.length; i++) {
                      newUsers.push(teamusers[i].attributes.users_permissions_user.data.id);
                    }
                    $.ajax({
                      url: "/deswork/api/p-projects/" + that.ProjectId.id + "?populate=*",
                      type: "PUT",
                      headers: {
                        "Content-Type": "application/json"
                      },
                      data: JSON.stringify({
                        "data": {
                          "users_permissions_users": newUsers
                        }
                      }),
                      success: function (response) {
                        var resValue = JSON.parse(response);
                        console.log(resValue.error);
                        if (resValue.error) {
                          MessageBox.error(resValue.error.message);
                        } else {
                          that._onObjectMatched(that.id);
                        }
                      }
                    });
                  },
                  error: function (res) {
                    console.log(res);
                    MessageBox.error(res + "Something went wrong");
                  },
                });
  
  
  
              }
            }
          });
  
        },
  
        TeamMemberCancelPress: function () {
          this.oAddTeamMember.close();
        },
  
        deleteTeamMemberDailog: function (evt) {
  
          var that = this;
          var table = this.getView().byId("suppliersTable3b");
          var selectedItems = table.getSelectedItems();
  
          if (selectedItems.length > 0) {
            MessageBox.confirm(
              "Are you sure you want to remove the selected TeamMember?",
              {
                title: "Confirm Deletion",
                icon: MessageBox.Icon.WARNING,
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === "YES") {
                    var deletePromises = [];
  
                    selectedItems.forEach(function (item) {
                      var path = item.getBindingContextPath();
                      var itemId = table
                        .getModel("mTeamMember")
                        .getProperty(path).id;
  
                      deletePromises.push(
                        new Promise(function (resolve, reject) {
                          $.ajax({
                            url: "/deswork/api/p-project-teams/" + itemId,
                            type: "DELETE",
                            success: function (res) {
                              resolve(res);
                            },
                            error: function (err) {
                              reject(err.responseText);
                            },
                          });
                        })
                      );
                    });
  
                    Promise.all(deletePromises)
                      .then(function () {
                        // Handle success
                        MessageToast.show("Team Member Deleted Successfully!");
  
                        // that.selectedObjectRaci(that.sObjectId);
                        that._onObjectMatched(that.id);
                        that.getView().getModel().updateBindings(true);
                        that.getView().getModel("mTeamMember").updateBindings(true);
                        that.getView().getModel("mTeamMember").refresh();
                        that.getView().getModel("mprojects").refresh();
  
                        that
                          .getView()
                          .getModel("mprojects")
                          .updateBindings(true);
                        $.ajax({
                          url: "/deswork/api/p-project-teams?populate[0]=p_project&filters[p_project][id][$eq]=" + that.ProjectId.id + "&populate[1]=users_permissions_user",
                          type: "GET",
                          success: function (res) {
                            var response = JSON.parse(res);
                            console.log(response);
                            var theModel = new sap.ui.model.json.JSONModel(response.data);
                            that.getView().setModel(theModel, "mTeamMembers");
                            var teamusers = that.getView().getModel("mTeamMembers").getData();
                            var newUsers = [];
                            for (var i = 0; i < teamusers.length; i++) {
                              newUsers.push(teamusers[i].attributes.users_permissions_user.data.id);
                            }
                            $.ajax({
                              url: "/deswork/api/p-projects/" + that.ProjectId.id + "?populate=*",
                              type: "PUT",
                              headers: {
                                "Content-Type": "application/json"
                              },
                              data: JSON.stringify({
                                "data": {
                                  "users_permissions_users": newUsers
                                }
                              }),
                              success: function (response) {
                                var resValue = JSON.parse(response);
                                console.log(resValue.error);
                                if (resValue.error) {
                                  MessageBox.error(resValue.error.message);
                                } else {
                                  that._onObjectMatched(that.id);
                                }
                              }
                            });
                          },
                          error: function (res) {
                            console.log(res);
                            MessageBox.error(res + "Something went wrong");
                          },
                        });
                      })
                      .catch(function (error) {
                        // Handle error
                        MessageBox.error(error);
                      });
                  }
                },
              }
            );
          } else {
            sap.m.MessageToast.show("Please select at least one item.");
          }
        },
        onCloseTeamDialog: function () {
          this.oAddTeamMember.close();
        },
  
  
  
        //TASK DETAILS UPDATED : ANU
  
        //TASK DELETE ADD
        getTaskDetails: function () {
          var that = this;
          $.ajax({
            url: "/deswork/api/p-tasks?populate=*",
            type: "GET",
            success: function (res) {
              var response = JSON.parse(res);
              console.log(response);
  
              var taskData = [];
              that.mcsrfLength = response.data.length;
              response.data.forEach(function (teamDetails) {
                if (teamDetails.attributes.p_project.data === null) {
                } else {
                  if (teamDetails.attributes.p_project.data.id == that.id) {
                    taskData.push(teamDetails);
                  }
                }
              });
              var theModel = new sap.ui.model.json.JSONModel(taskData);
              that.getView().setModel(theModel, "mTasks");
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wrong");
            },
          });
        },
  
        getNameforTask: function () {
          var that = this;
          $.ajax({
            url: "/deswork/api/p-projects/" + that.id + "?populate[0]=users_permissions_users",
            type: "GET",
            success: function (res) {
              var response = JSON.parse(res);
              console.log(response);
  
              var teamMembers = response.data.attributes.users_permissions_users.data;
              var userDetails = [];
  
              // Iterate over teamMembers and retrieve user details
              for (var i = 0; i < teamMembers.length; i++) {
                var id = teamMembers[i].id;
                var firstName = teamMembers[i].attributes.firstName;
                var lastName = teamMembers[i].attributes.lastName;
                //  var email = teamMembers[i].attributes.email;
  
                // Create an object with user details
                var user = {
                  id: id,
                  firstName: firstName,
                  lastName: lastName,
                  //  email: email
                };
  
                // Push user details to the userDetails array
                userDetails.push(user);
              }
  
              var theModel = new sap.ui.model.json.JSONModel(userDetails);
              that.getView().setModel(theModel, "pTeams");
  
              // Access the model data
              var modelData = that.getView().getModel("pTeams").getData();
              console.log(modelData);
  
              // Call the getTeamMemberdetails function
              //that.getTeamMemberdetails();
            },
            error: function (res) {
              console.log(res);
            },
          });
        },
  
        onCloseSubTaskDialog: function () {
          this.oAddSubTaskInfo.close();
        },
        addTaskDailog: function () {
          this.editTask = false;
          this.oAddTaskInfo.setModel(
            new sap.ui.model.json.JSONModel({}),
            "mTasks"
          );
          this.oAddTaskInfo.open();
        },
  
        addSubTaskDailog: function () {
          // this.editTask = false;
          this.oAddSubTaskInfo.setModel(
            new sap.ui.model.json.JSONModel({}),
            "mSubTasks"
          );
          this.oAddSubTaskInfo.open();
        },
        onSaveSubTaskDialog: function (oEv) {
          var that = this;
          // var taskStatus;
          // var projectData = this.getView().getModel("mprojects").getData();
          // that.frg = this.getView().getModel("mCsfDetails").getData()[this.taskPath]
          that.addCSFPayload = {
            "name": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[1]
              .getValue(),
  
            "startDate": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[3]
              .getValue(),
            "endDate": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[5]
              .getValue(),
            "status": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[7]
              .getSelectedKey(),
            "p_task": this.oAddSubTaskInfo
              .getContent()[0]
              .getItems()[0]
              .getContent()[9]
              .getSelectedKey(),
  
  
            //   "p_project": [projectData.id],
          };
  
  
          $.post(
            //  "/deswork/api/p-tasks?populate=*",
            "/deswork/api/p-sub-tasks?populate=*",
            {
              data: that.addCSFPayload
            },
            function (response) {
              var resValue = JSON.parse(response);
              console.log(resValue.error);
              //debugger
              if (resValue.error) {
                MessageBox.error(resValue.error.message);
              } else {
                MessageToast.show("Task Added successfully!");
                // that.projectsDetails();
                that._onObjectMatched(that.id);
                that.getView().getModel().updateBindings(true);
  
                that.oAddSubTaskInfo.close();
              }
            })
  
  
        },
  
        deleteTaskDailog: function (evt) {
          var that = this;
          this.table = this.getView().byId("TreeTableBasic");
          var selectedItems = this.table.getSelectedIndices();
          var oModel = this.table.getBinding().getModel();
  
          if (selectedItems.length > 0) {
            MessageBox.confirm(
              "Are you sure you want to delete the selected Task?",
              {
                title: "Confirm Deletion",
                icon: MessageBox.Icon.WARNING,
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === "YES") {
                    var deletePromises = [];
  
                    selectedItems.forEach(function (itemIndex) {
                      var oContext = that.table.getContextByIndex(itemIndex);
                      var oData = oContext.getProperty();
                      var sPath = oContext.getPath()
                      var itemId = oData.id;
  
                      if (sPath.includes("p_sub_tasks")) {
                        // Delete subtask
                        deletePromises.push(
                          new Promise(function (resolve, reject) {
                            $.ajax({
                              url: "/deswork/api/p-sub-tasks/" + itemId,
                              type: "DELETE",
                              success: function (res) {
                                resolve(res);
                                MessageToast.show("Sub-Tasks Deleted Successfully!");
                                that._onObjectMatched(that.id);
                                that.getView().getModel().updateBindings(true);
                              },
                              error: function (err) {
                                reject(err.responseText);
                              },
                            });
                          })
                        );
                      } else {
                        // Delete task
                        deletePromises.push(
                          new Promise(function (resolve, reject) {
                            $.ajax({
                              url: "/deswork/api/p-tasks/" + itemId + "?populate=*",
                              type: "DELETE",
                              success: function (res) {
                                resolve(res);
                                MessageToast.show("Tasks Deleted Successfully!");
                                that._onObjectMatched(that.id);
                                that.getView().getModel().updateBindings(true);
                              },
                              error: function (err) {
                                reject(err.responseText);
                              },
                            });
                          })
                        );
                      }
                    });
  
                    Promise.all(deletePromises)
                      .then(function () {
                        // MessageToast.show("Tasks Deleted Successfully!");
                        that._onObjectMatched(that.id);
                        that.getView().getModel().updateBindings(true);
                        that.getView().getModel("mCsfDetails").updateBindings(true);
                        that.getView().getModel("mCsfDetails").refresh();
                        that.getView().getModel("mprojects").refresh();
                        that.getView().getModel("mprojects").updateBindings(true);
                      })
                      .catch(function (error) {
                        MessageBox.error(error);
                      });
                  }
                },
              }
            );
          } else {
            sap.m.MessageToast.show("Please select at least one item.");
          }
        },
  
  
  
  
        onSearch: function () {
          var aTableFilters = this.oFilterBar
            .getFilterGroupItems()
            .reduce(function (aResult, oFilterGroupItem) {
              var oControl = oFilterGroupItem.getControl(),
                aSelectedKeys = oControl.getSelectedKeys(),
                aFilters = aSelectedKeys.map(function (sSelectedKey) {
                  return new Filter({
                    path: oFilterGroupItem.getName(),
                    operator: FilterOperator.Contains,
                    value1: sSelectedKey,
                  });
                });
  
              if (aSelectedKeys.length > 0) {
                aResult.push(
                  new Filter({
                    filters: aFilters,
                    and: false,
                  })
                );
              }
  
              return aResult;
            }, []);
  
          this.oTable.getBinding("items").filter(aTableFilters);
          this.oTable.setShowOverlay(false);
        },
  
        onFilterChange: function () {
          this._updateLabelsAndTable();
        },
  
        onAfterVariantLoad: function () {
          this._updateLabelsAndTable();
        },
  
        getFormattedSummaryText: function () {
          var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();
  
          if (aFiltersWithValues.length === 0) {
            return "No filters active";
          }
  
          if (aFiltersWithValues.length === 1) {
            return (
              aFiltersWithValues.length +
              " filter active: " +
              aFiltersWithValues.join(", ")
            );
          }
  
          return (
            aFiltersWithValues.length +
            " filters active: " +
            aFiltersWithValues.join(", ")
          );
        },
  
        getFormattedSummaryTextExpanded: function () {
          var aFiltersWithValues = this.oFilterBar.retrieveFiltersWithValues();
  
          if (aFiltersWithValues.length === 0) {
            return "No filters active";
          }
  
          var sText = aFiltersWithValues.length + " filters active",
            aNonVisibleFiltersWithValues =
              this.oFilterBar.retrieveNonVisibleFiltersWithValues();
  
          if (aFiltersWithValues.length === 1) {
            sText = aFiltersWithValues.length + " filter active";
          }
  
          if (
            aNonVisibleFiltersWithValues &&
            aNonVisibleFiltersWithValues.length > 0
          ) {
            sText += " (" + aNonVisibleFiltersWithValues.length + " hidden)";
          }
  
          return sText;
        },
  
        _updateLabelsAndTable: function () {
          this.oTable.setShowOverlay(true);
        },
  
        onApproveProjects: function () {
          var that = this;
          that.programApproved("Approved");
        },
        programApproved: function (result) {
          var that = this;
          this.table = this.getView().byId("TreeTableBasic");
          var selectedItems = this.table.getSelectedIndices();
          var oModel = this.table.getBinding().getModel();
  
          if (selectedItems.length > 0) {
            MessageBox.confirm(
              "Are you sure you want to Approve the Time Extension for selected Task?",
              {
                title: "Confirm Deletion",
                icon: MessageBox.Icon.WARNING,
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === "YES") {
                    //  var deletePromises = [];
  
                    selectedItems.forEach(function (itemIndex) {
                      var oContext = that.table.getContextByIndex(itemIndex);
                      var oData = oContext.getProperty();
                      var sPath = oContext.getPath()
                      var itemId = oData.id;
                      var itemStatus = oData.p_approver_status;
                      //   if(itemStatus == "Requested"){
                      var updateData = {
                        p_approver_status: "Approved" // Update the status to "approved"
                      };
                      $.ajax({
                        url: "/deswork/api/p-sub-tasks/" + itemId,
                        type: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        data: JSON.stringify({
                          data: updateData,
                        }),
  
                        success: function (res) {
                          //  resolve(res);
                          MessageToast.show("Sub-Tasks Approved Successfully!");
                          that._onObjectMatched(that.id);
                          that.getView().getModel().updateBindings(true);
                        },
                        error: function (err) {
  
                        },
                      });
                      // }
                      // else{
                      //   sap.m.MessageToast.show("Please select the Time Extension Requested item only.");
                      // }
  
  
                    });
  
  
                  }
                },
              }
            );
          } else {
            sap.m.MessageToast.show("Please select at least one item.");
          }
        },
        OnRejectProjects: function () {
          var that = this;
          that.programRejected("Rejected");
        },
        programRejected: function (result) {
          var that = this;
          this.table = this.getView().byId("TreeTableBasic");
          var selectedItems = this.table.getSelectedIndices();
          var oModel = this.table.getBinding().getModel();
  
          if (selectedItems.length > 0) {
            MessageBox.confirm(
              "Are you sure you want to Reject the selected Time Extension for  Task?",
              {
                title: "Confirm Deletion",
                icon: MessageBox.Icon.WARNING,
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                emphasizedAction: MessageBox.Action.YES,
                onClose: function (oAction) {
                  if (oAction === "YES") {
                    //  var deletePromises = [];
  
                    selectedItems.forEach(function (itemIndex) {
                      var oContext = that.table.getContextByIndex(itemIndex);
                      var oData = oContext.getProperty();
                      var sPath = oContext.getPath()
                      var itemId = oData.id;
                      var itemStatus = oData.p_approver_status;
                      //   if(itemStatus == "Requested"){
                      var updateData = {
                        p_approver_status: "Rejected" // Update the status to "approved"
                      };
                      $.ajax({
                        url: "/deswork/api/p-sub-tasks/" + itemId,
                        type: "PUT",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        data: JSON.stringify({
                          data: updateData,
                        }),
  
                        success: function (res) {
                          //  resolve(res);
                          MessageToast.show("Sub-Tasks Approved Successfully!");
                          that._onObjectMatched(that.id);
                          that.getView().getModel().updateBindings(true);
                        },
                        error: function (err) {
  
                        },
                      });
                      // }
                      // else{
                      //   sap.m.MessageToast.show("Please select the Time Extension Requested item only.");
                      // }
  
  
                    });
  
  
                  }
                },
              }
            );
          } else {
            sap.m.MessageToast.show("Please select at least one item.");
          }
        },
        //from here
        handleSelectionChange: function (oEvent) {
          var that = this;
          var gettingText = oEvent.getParameter("item").getProperty("text");
  
          if (gettingText === 'CREATE TASK') {
            this.oAddSubTaskInfo.getContent()[1].setVisible(true);
            this.oAddSubTaskInfo.getContent()[2].setVisible(false);
            // that.getView().byId('AddTasks').setVisible(true);
            // that.getView().byId('AddSubTasks').setVisible(false);
  
          } else {
            this.oAddSubTaskInfo.getContent()[1].setVisible(false);
            this.oAddSubTaskInfo.getContent()[2].setVisible(true);
            // that.getView().byId('AddTasks').setVisible(false);
            // that.getView().byId('AddSubTasks').setVisible(true);
          }
        },
        handleAddTaskCancelS: function () {
          var that = this;
          that.oAddSubTaskInfo.close();
          if (this.oAddSubTaskInfo.getContent()[1].getVisible() == true) {
            // that.CLearSubInfoAdd()
            that.CLearSubInfo();
          } else {
            that.CLearSubInfosub();
          }
        },
        handleAddTaskS: function () {
          var that = this;
          var taskStatus;
          var projectData = this.getView().getModel("mprojects").getData();
          that.frg = this.getView().getModel("mCsfDetails").getData()[this.taskPath]
  
          that.addCSFPayload = {
            "name": this.oAddSubTaskInfo.getContent()[1].getContent()[1].getValue(),
            "description": this.oAddSubTaskInfo.getContent()[1].getContent()[3].getValue(),
            "startDate": this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue(),
            "endDate": this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue(),
            "noOfDays": this.oAddSubTaskInfo.getContent()[1].getContent()[9].getValue(),
            "status": this.oAddSubTaskInfo.getContent()[1].getContent()[11].getSelectedKey(),
            "priority": this.oAddSubTaskInfo.getContent()[1].getContent()[13].getSelectedKey(),
            "users_permissions_user": this.oAddSubTaskInfo.getContent()[1].getContent()[15].getSelectedKey(),
            "p_project": [projectData.id],
          };
  
  
  
          if (new Date(projectData.attributes.startDate) > new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue())) {
            sap.m.MessageBox.error("Start date is less than Project start date");
          }
          //  else if (new Date(projectData.attributes.startDate) < new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue())) {
          //     sap.m.MessageBox.error("Start date is greater than Project start date");
          //   }
          else if (new Date(projectData.attributes.estimatedEndDate) < new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue())) {
            sap.m.MessageBox.error("End date is greater than Project end date");
          }
          else if (new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue()) > new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue())) {
            sap.m.MessageBox.error("Start date is greater than end date");
          }
          else if (this.oAddSubTaskInfo.getContent()[1].getVisible() == true) {
            $.post(
              "/deswork/api/p-tasks?populate=*",
              {
                data: that.addCSFPayload
              },
              function (response) {
                var resValue = JSON.parse(response);
                console.log(resValue.error);
                //debugger
                if (resValue.error) {
                  MessageBox.error(resValue.error.message);
                } else {
                  MessageToast.show("Task Added successfully!");
                  // that.projectsDetails();
                  that._onObjectMatched(that.id);
                  that.getView().getModel().updateBindings(true);
  
                  that.oAddSubTaskInfo.close();
                  that.CLearSubInfo();
                }
              }
            )
          }
  
          else {
  
            var that = this;
            var taskdetails = this.oAddSubTaskInfo.getContent()[2].getContent()[1].getSelectedKey();
            $.ajax({
              url: "deswork/api/p-tasks/" + taskdetails + "?populate=*",
              type: "GET",
  
              success: function (res) {
                var response = JSON.parse(res);
  
                that.mcsrfLength = response.data.length;
                var cModel = new sap.ui.model.json.JSONModel(response.data);
                that.getView().setModel(cModel, "mCsfDetails");
                that.taskDetails = that.getView().getModel("mCsfDetails").getData();
              },
              error: function (res) {
                console.log(res);
                MessageBox.error(res + "Something went wrong");
              }
            });
            that.addSubCSFPayload = {
              "p_task": this.oAddSubTaskInfo.getContent()[2].getContent()[1].getSelectedKey(),
  
              "name": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[3]
                .getValue(),
              "description": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[5]
                .getValue(),
              "startDate": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[7]
                .getValue(),
              "endDate": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[9]
                .getValue(),
              "noOfDays": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[11]
                .getValue(),
              "status": this.oAddSubTaskInfo
                .getContent()[2]
                .getContent()[13]
                .getSelectedKey(),
            };
  
            if (new Date(projectData.attributes.startDate) > new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue())) {
              sap.m.MessageBox.error("Start date is less than Project start date");
            }
            else if (new Date(that.taskDetails.attributes.startDate) > new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue())) {
              sap.m.MessageBox.error("Start date is less than Task start date");
            }
            else if (new Date(projectData.attributes.estimatedEndDate) < new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue())) {
              sap.m.MessageBox.error("End date is greater than Project end date");
            }
            else if (new Date(that.taskDetails.attributes.endDate) < new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue())) {
              sap.m.MessageBox.error("End date is less than Task End date");
            }
            else if (new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue()) > new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue())) {
              sap.m.MessageBox.error("Start date is greater than end date");
            }
            else {
              $.post(
                "/deswork/api/p-sub-tasks?populate=*",
                {
                  data: that.addSubCSFPayload
                },
                function (response) {
                  var resValue = JSON.parse(response);
                  console.log(resValue.error);
                  //debugger
                  if (resValue.error) {
                    MessageBox.error(resValue.error.message);
                  } else {
                    MessageToast.show("Sub-Task Added successfully!");
                    // that.projectsDetails();
                    that._onObjectMatched(that.id);
                    that.getView().getModel().updateBindings(true);
  
                    that.oAddSubTaskInfo.close();
                    that.CLearSubInfosub();
  
  
                  }
                })
            }
          }
        },
        CLearSubInfosub: function () {
          var that = this;
          this.oAddSubTaskInfo.getContent()[2].getContent()[1].setSelectedKey("");
          this.oAddSubTaskInfo.getContent()[2].getContent()[3].setValue("");
          this.oAddSubTaskInfo.getContent()[2].getContent()[5].setValue("");
          this.oAddSubTaskInfo.getContent()[2].getContent()[7].setValue("");
          this.oAddSubTaskInfo.getContent()[2].getContent()[9].setValue("");
          this.oAddSubTaskInfo.getContent()[2].getContent()[11].setValue("");
          this.oAddSubTaskInfo.getContent()[2].getContent()[13].setSelectedKey("");
  
          // this.oAddSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
          // var that = this;
          // this.oAddSubTaskInfo.getContent()[2].getContent()[1].setSelectedKey("");
          // this.oAddSubTaskInfo.getContent()[2].getContent()[3].setValue("");
          // this.oAddSubTaskInfo.getContent()[2].getContent()[5].setValue("");
          // this.oAddSubTaskInfo.getContent()[2].getContent()[7].setValue("");
          // this.oAddSubTaskInfo.getContent()[2].getContent()[9].setSelectedKey("");
        },
        CLearSubInfo: function () {
          var that = this;
          this.oAddSubTaskInfo.getContent()[1].getContent()[1].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[3].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[5].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[7].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[9].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
        },
        CLearSubInfoAdd: function () {
          var that = this;
          this.oAddSubTaskInfo.getContent()[1].getContent()[1].setSelectedKey("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[3].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[5].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[7].setValue("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[9].setSelectedKey("");
          this.oAddSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("");
  
          this.oAddSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
        },
  
        handleSubSelectionChange: function (oEvent) {
          var that = this;
          var gettingText = oEvent.getParameter("item").getProperty("text");
  
          if (gettingText === 'EDIT TASK') {
            this.oEditSubTaskInfo.getContent()[1].setVisible(true);
            this.oEditSubTaskInfo.getContent()[2].setVisible(false);
            // that.getView().byId('AddTasks').setVisible(true);
            // that.getView().byId('AddSubTasks').setVisible(false);
  
          } else {
            this.oEditSubTaskInfo.getContent()[1].setVisible(false);
            this.oEditSubTaskInfo.getContent()[2].setVisible(true);
            // that.getView().byId('AddTasks').setVisible(false);
            // that.getView().byId('AddSubTasks').setVisible(true);
          }
        },
        handleEditAddTaskCancelS: function () {
          var that = this;
          this.oEditSubTaskInfo.close();
          if (this.oEditSubTaskInfo.getContent()[1].getVisible() == true) {
            // that.CLearSubInfoAdd()
            that.CLearSubInfoAddEdit();
          } else {
            that.CLearSubInfosubEdit();
          }
          //  this.CLearSubInfosub();
        },
        editSubTaskDailog: function () {
          var that = this;
          this.oEditSubTaskInfo.open();
          //  this.oAddSubTaskInfo.open();
        },
        Subcsf: function () {
          var that = this;
          $.ajax({
            url: "/deswork/api/p-sub-tasks?populate[0]=p_task.p_project&filters[p_task][p_project][id][$eq]= " + that.id,
            type: "GET",
  
            success: function (res) {
              var response = JSON.parse(res);
              // console.log(response);
              // var taskData = [];
              //  that.mcsrfLength = response.data.length;
              var cModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(cModel, "mSubcsf");
              //that.mDclDetails();
              //	that.getView().setBusy(false);
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wroung");
            }
          });
        },
        csf: function () {
          var that = this;
          $.ajax({
            url: "/deswork/api/p-tasks?populate=*&filters[p_project][id][$eq]=" + that.id,
            type: "GET",
  
            success: function (res) {
              var response = JSON.parse(res);
              // console.log(response);
              // var taskData = [];
              //  that.mcsrfLength = response.data.length;
              var cModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(cModel, "mcsf");
              //that.mDclDetails();
              //	that.getView().setBusy(false);
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wroung");
            }
          });
        },
  
        onPress: function (oEvent) {
          var that = this;
          that.selectedId = oEvent.getParameters().selectedItem.mProperties.key;
          $.ajax({
            url: "deswork/api/p-sub-tasks/" + that.selectedId + "?populate=*",
            type: "GET",
  
            success: function (res) {
              var response = JSON.parse(res);
  
              that.mcsrfLength = response.data.length;
              var cModel = new sap.ui.model.json.JSONModel(response.data);
              that.getView().setModel(cModel, "mCsfDetails");
  
              var taskData = that.getView().getModel("mCsfDetails").getData();
              var selected_id = that.getView().getModel("mCsfDetails").getData().id;
  
              var check = that.getView().getModel("mCsfDetails").getData().attributes;
              that.oEditSubTaskInfo.getContent()[2].getContent()[3].setValue(check.description);
              that.oEditSubTaskInfo.getContent()[2].getContent()[5].setValue(check.startDate);
  
              that.oEditSubTaskInfo.getContent()[2].getContent()[7].setValue(check.endDate);
              that.oEditSubTaskInfo.getContent()[2].getContent()[9].setValue(check.extended_end_date);
              that.oEditSubTaskInfo.getContent()[2].getContent()[11].setValue(check.noOfDays);
              that.oEditSubTaskInfo.getContent()[2].getContent()[13].setSelectedKey(check.status);
  
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wrong");
            }
          });
        },
        onPressTask: function (oEvent) {
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
              var selected_id = that.getView().getModel("mCsfDetails").getData().id;
  
              var check = that.getView().getModel("mCsfDetails").getData().attributes;
              that.oEditSubTaskInfo.getContent()[1].getContent()[3].setValue(check.description);
              that.oEditSubTaskInfo.getContent()[1].getContent()[5].setValue(check.startDate);
              that.oEditSubTaskInfo.getContent()[1].getContent()[7].setValue(check.endDate);
              that.oEditSubTaskInfo.getContent()[1].getContent()[9].setValue(check.extended_end_date);
              that.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue(check.noOfDays);
              that.oEditSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey(check.status);
              that.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey(check.priority);
              that.oEditSubTaskInfo.getContent()[1].getContent()[17].setSelectedKey(check.users_permissions_user.data.id);
  
            },
            error: function (res) {
              console.log(res);
              MessageBox.error(res + "Something went wrong");
            }
          });
        },
        handleEditAddTaskS: function () {
          var that = this;
          that.selectedId;
          that.Subid = JSON.parse(that.selectedId);
          that.upEditSubTaskInfo = {
            description: that.oEditSubTaskInfo.getContent()[2].getContent()[3].getValue(),
            startDate: that.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue(),
            endDate: that.oEditSubTaskInfo.getContent()[2].getContent()[7].getValue(),
            extended_end_date: that.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue() ? that.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue() : null,
            noOfDays: that.oEditSubTaskInfo.getContent()[2].getContent()[11].getValue(),
            status: that.oEditSubTaskInfo.getContent()[2].getContent()[13].getSelectedKey(),
          }
          if (this.oEditSubTaskInfo.getContent()[2].getVisible() == true) {
            $.ajax({
              url: "deswork/api/p-sub-tasks/" + that.Subid + "?populate=*",
              type: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              data: JSON.stringify({
                data: that.upEditSubTaskInfo,
              }),
              success: function (res) {
                var getValues = JSON.parse(res);
                console.log(getValues.error);
                if (getValues.error) {
                  MessageBox.error(getValues.error.message);
                } else {
                  that.oEditSubTaskInfo.close();
                  MessageToast.show("Sub-Tasks Updated Successfully!");
                  that._onObjectMatched(that.id);
                  that.getView().getModel().updateBindings(true);
                  that.CLearSubInfosubEdit();
                }
              },
            })
          }
          else {
            that.upEditTaskInfo = {
              description: that.oEditSubTaskInfo.getContent()[1].getContent()[3].getValue(),
              startDate: that.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue(),
              endDate: that.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue(),
              extended_end_date: that.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue() ? that.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue() : null,
              noOfDays: that.oEditSubTaskInfo.getContent()[1].getContent()[11].getValue(),
              status: that.oEditSubTaskInfo.getContent()[1].getContent()[13].getSelectedKey(),
              priority: that.oEditSubTaskInfo.getContent()[1].getContent()[15].getSelectedKey(),
              users_permissions_user: that.oEditSubTaskInfo.getContent()[1].getContent()[17].getSelectedKey(),
            }
            $.ajax({
              url: "deswork/api/p-tasks/" + that.Subid + "?populate=*",
              type: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              data: JSON.stringify({
                data: that.upEditTaskInfo,
              }),
              success: function (res) {
                var getValues = JSON.parse(res);
                console.log(getValues.error);
                if (getValues.error) {
                  MessageBox.error(getValues.error.message);
                } else {
                  that.oEditSubTaskInfo.close();
                  MessageToast.show("Tasks Updated Successfully!");
                  that.id;
                  that.parId = that.id;
                  that.parIds = JSON.parse(that.parId);
                  that._onObjectMatched(that.parIds);
                  that.getView().getModel().updateBindings(true);
                  that.CLearSubInfoAddEdit();
                }
              },
            })
          }
        },
        CLearSubInfosubEdit: function () {
          this.oEditSubTaskInfo.getContent()[2].getContent()[1].setSelectedKey("");
          this.oEditSubTaskInfo.getContent()[2].getContent()[3].setValue("");
          this.oEditSubTaskInfo.getContent()[2].getContent()[5].setValue("");
          this.oEditSubTaskInfo.getContent()[2].getContent()[7].setValue("");
          this.oEditSubTaskInfo.getContent()[2].getContent()[9].setValue("");
          this.oEditSubTaskInfo.getContent()[2].getContent()[11].setSelectedKey("");
  
          this.oEditSubTaskInfo.getContent()[2].getContent()[13].setSelectedKey("");
          // this.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
        },
        CLearSubInfoAddEdit: function () {
          this.oEditSubTaskInfo.getContent()[1].getContent()[1].setSelectedKey("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[3].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[5].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[7].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[9].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[17].setSelectedKey("");
  
          this.oEditSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
        },
        CLearSubInfosubTask: function () {
          var that = this;
          this.oEditSubTaskInfo.getContent()[1].getContent()[1].setSelectedKey("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[3].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[5].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[7].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[9].setValue("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[11].setSelectedKey("");
  
          this.oEditSubTaskInfo.getContent()[1].getContent()[13].setSelectedKey("");
          this.oEditSubTaskInfo.getContent()[1].getContent()[15].setSelectedKey("");
          // description: that.oEditSubTaskInfo.getContent()[1].getContent()[3].getValue(),
          //   startDate: that.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue(),
          //   endDate: that.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue(),
          //   extended_end_date: that.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue(),
          //   status: that.oEditSubTaskInfo.getContent()[1].getContent()[11].getSelectedKey(),
          //   priority: that.oEditSubTaskInfo.getContent()[1].getContent()[13].getSelectedKey(),
          //   users_permissions_user: that.oEditSubTaskInfo.getContent()[1].getContent()[15].getSelectedKey(),
        },
  
        ///calculate Effort for Projects
  
        getEffort: function () {
          var that = this;
          $.ajax({
            type: "GET",
            url: '/deswork/api/p-projects?populate=*&filters[id][$eq]=' + that.id,
            success: function (response) {
              var res = JSON.parse(response);
  
              var projects = res.data;
              var kpiInfo = [];
  
              projects.forEach(function (project) {
                var completedTasksCount = 0;
                var totalDays = 0;
                project.attributes.p_tasks.data.forEach(function (task) {
                  if (task.attributes.status === "Completed") {
                    completedTasksCount++;
                    var startDate = new Date(task.attributes.startDate);
                    var endDate = new Date(task.attributes.endDate);
                    var businessDays = that.calculateBusinessDays(startDate, endDate);
                    totalDays += businessDays;
                  }
                });
  
                // Add the project details along with completed tasks count and total days to kpiInfo
                kpiInfo.push({
                  // project: project,
                  //completedTasksCount: completedTasksCount,
                  totalDays: totalDays
                });
              });
  
              var oModel3 = new sap.ui.model.json.JSONModel(kpiInfo);
              that.getView().setModel(oModel3, "kpiInfo");
            }
          });
        },
  
        calculateBusinessDays: function (startDate, endDate) {
          var days = Math.ceil((endDate - startDate) / (1000 * 3600 * 24)); // Total days between startDate and endDate
          var businessDays = 0;
  
          for (var i = 0; i <= days; i++) {
            var currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
  
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
              businessDays++; // Increment businessDays if the currentDate is not Saturday or Sunday
            }
          }
  
          return businessDays;
        },
  
        //FOR NO OF TASK CAL
        handleChange: function (oEvent) {
          var that = this;
          var startDate = new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[5].getValue());
          var endDate = new Date(this.oAddSubTaskInfo.getContent()[1].getContent()[7].getValue());
          var businessDays = that.calculateBusinessDays(startDate, endDate);
          var totalDays = businessDays;
          this.oAddSubTaskInfo.getContent()[1].getContent()[9].setValue(totalDays);
        },
        //FOR NO OF DAYS SUB-TASK CAL
        handleChangeSub: function (oEvent) {
          var that = this;
          var startDate = new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[7].getValue());
          var endDate = new Date(this.oAddSubTaskInfo.getContent()[2].getContent()[9].getValue());
          var businessDays = that.calculateBusinessDays(startDate, endDate);
          var totalDays = businessDays;
          this.oAddSubTaskInfo.getContent()[2].getContent()[11].setValue(totalDays);
        },
        onChangeSubTaskEdit: function (oEvent) {
          var that = this;
          var startDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue());
          var endDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[7].getValue());
          var businessDays = that.calculateBusinessDays(startDate, endDate);
          var totalDays = businessDays;
          this.oEditSubTaskInfo.getContent()[2].getContent()[11].setValue(totalDays);
        },
        onChangeTaskEdit: function (oEvent) {
          var that = this;
          var startDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue());
          var endDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[7].getValue());
          var businessDays = that.calculateBusinessDays(startDate, endDate);
          var totalDays = businessDays;
          this.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue(totalDays);
        },
        onChangeTaskEditIfExtended: function (oEvent) {
          var that = this;
          var startDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[5].getValue());
          var endDate = new Date(this.oEditSubTaskInfo.getContent()[1].getContent()[9].getValue());
          var businessDays = that.calculateBusinessDays(startDate, endDate);
          var totalDays = businessDays;
          this.oEditSubTaskInfo.getContent()[1].getContent()[11].setValue(totalDays);
        },
        onChangeSubTaskEditIfExtended: function (oEvent) {
          var that = this;
          var startDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[5].getValue());
          var endDate = new Date(this.oEditSubTaskInfo.getContent()[2].getContent()[9].getValue());
          var businessDays = that.calculateBusinessDays(startDate, endDate);
          var totalDays = businessDays;
          this.oEditSubTaskInfo.getContent()[2].getContent()[11].setValue(totalDays);
        },
      });
    }
  );
  
  
  