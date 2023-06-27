sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/UploadCollectionParameter"
   // "VASPP/manageleaves/util/utils"
    ],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel, MessageToast, MessageBox, UploadCollectionParameter) {
        "use strict";
        return Controller.extend("VASPP.manageleaves.controller.ApplyLeaves", {

            onInit: function () {
                var that = this;
                that.getUserDetails();
                that.callBalanceLeave();
                that.appliedDates = [];
			    that.holidayDates = [];
			    that.lastSelectedRangeDates = [];
			    that.lastSelecetedDatesCount = 0; // Contains the count of successfully selected valid dates only
			    that.calendar = that.getView().byId("calSelectLeaveDates");
                that.getOwnerComponent().getRouter().getRoute("RouteApplyLeaves").attachPatternMatched(that.onObjectMatched, that);
            },

            onChange: function (oEvent) {
                var that=this;
                var oUploadCollection = oEvent.getSource();
                var file = oEvent.getParameter("item").getFileObject();
                that.fileName = oEvent.getParameter("item").getFileName();
                var reader = new FileReader();
                reader.onload = function (e) {
                    that.getView().mElementBindingContexts.Leaves.getObject().documents.push({
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

            handleDateSelection: function (evt) {
                var applyLeaveThis=this;
                var oCalendar = evt.getSource();
                var aSelectedDates = oCalendar.getSelectedDates();
                applyLeaveThis.calendar = oCalendar;
    
                // If a new date is selected
                if (aSelectedDates.length > applyLeaveThis.lastSelecetedDatesCount) {
                    var lastSelectedDate = aSelectedDates[aSelectedDates.length - 1].getStartDate(),
                        selectedLeaveType = applyLeaveThis.getView().byId("leaveTypeSelectId").getSelectedKey();
    
                    if (selectedLeaveType !== "Select") {
                        // Don't proceed if a past date has been selected for vacation leave
                        if (lastSelectedDate < new Date() && lastSelectedDate.toDateString() !== new Date().toDateString() && selectedLeaveType ===
                            "Vacation Leave" ) {
                            oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                        	MessageBox.error("Vacation leaves cant be applied for past dates", {
                            	actions: MessageBox.Action.OK
                            });
                            return;
                        }
                    } else {
                        oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                        MessageToast.show("Please select leave type");
                        return;
                    }
    
                    //... Monitoring each date selection and guiding the user ...///
    
                    var isHalfDayLeave = applyLeaveThis.getView().byId("halfDayCheckBoxId").getSelected();
                    var appliedDates = [];
                    if (isHalfDayLeave && aSelectedDates.length > 1) {
                        // Half day leave cannot be applied for multiple days
                    //	MessageToast.show(applyLeaveThis.getView().getModel("i18nModel").getResourceBundle().getText("LE_HALF_DAY"));
                        oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                        return;
                    } else {
                        var leavesAppliedModel =this.getView().getModel("Leaves").getData();
                        for (var i = 0; i < leavesAppliedModel.length; i++) {
                            //Status meaning: 1="Approved", 2="Rejected", 3="Cancelled", 4="Applied"
                            if (leavesAppliedModel[i].Status == "Approved" || leavesAppliedModel[i].Status == "Applied") {
                                var firstDate = new Date(leavesAppliedModel[i].startDate);
                                var endDate = new Date(leavesAppliedModel[i].endDate);
                                var days = applyLeaveThis.getDays(firstDate, endDate);
                                if (firstDate.getDate() < endDate.getDate()) {
                                    var fdate = (firstDate.getDate() + '-' + (firstDate.getMonth() + 1) + '-' + firstDate.getFullYear());
                                    appliedDates.push(fdate);
                                    for (var j = 1; j < days; j++) {
                                        var next = (firstDate.getFullYear() + '-0' + (firstDate.getMonth() + 1)) + '-' + (firstDate.getDate() + j);
                                        var n = new Date(next);
                                        if (n.getDay() == 0 || n.getDay() == 6) {
                                            days++;
                                        } else {
                                            var nextDate = ((firstDate.getDate() + j) + '-' + (firstDate.getMonth() + 1) + '-' + firstDate.getFullYear());
                                            appliedDates.push(nextDate);
                                        }
                                    }
                                } else if (endDate.getDate() < firstDate.getDate()) {
                                    var fdate = (firstDate.getDate() + '-' + (firstDate.getMonth() + 1) + '-' + firstDate.getFullYear());
                                    appliedDates.push(fdate);
                                    for (var j = 1; j < days; j++) {
                                        var next = (firstDate.getFullYear() + '-0' + (firstDate.getMonth() + 1)) + '-' + (firstDate.getDate() + j);
                                        var n = new Date(next);
                                        if (n == "Invalid Date") {
                                            for (var q = 0; q < (days - j); q++) {
                                                var next = (firstDate.getFullYear() + '-' + (firstDate.getMonth() + 2) + '-' + (q + 1));
                                                var n = new Date(next);
                                                if (n.getDay() == 0 || n.getDay() == 6) {
                                                    days++;
                                                } else {
                                                    var nextDate = (n.getDate() + "-" + (n.getMonth() + 1) + '-' + n.getFullYear());
                                                    appliedDates.push(nextDate);
                                                }
                                            }
                                            break;
                                        } else {
                                            if (n.getDay() == 0 || n.getDay() == 6) {
                                                days++;
                                            } else {
                                                var nextDate = (n.getDate() + "-" + (n.getMonth() + 1) + '-' + n.getFullYear());
                                                appliedDates.push(nextDate);
                                            }
                                        }
                                    }
                                }
                                var fDate = (firstDate.getDate() + '-' + (firstDate.getMonth() + 1) + '-' + firstDate.getFullYear());
                                appliedDates.push(fDate);
                            }
                        }
    
                        // var holidayInfo = sap.ui.getCore().getModel("holidaysInfoModel").getData();
                        // var holidayDates = [];
                        // for (var i = 0; i < holidayInfo.length; i++) {
                        //     holidayDates.push(new Date(holidayInfo[i].date).toDateString());
                        // }
    
                        var getDayDate = (lastSelectedDate.getDate()) + '-' + (lastSelectedDate.getMonth() + 1) + '-' + (lastSelectedDate.getFullYear());
                        var month = (lastSelectedDate.getMonth() + 1);
                        if (month.toString().length == 1) {
                            month = "0" + month;
                        }
    
                        var date = lastSelectedDate.getDate();
                        if (date.toString().length == 1) {
                            date = "0" + date;
                        }
    
                        // var getHolidayDate = (lastSelectedDate.getFullYear()) + '-' + month + '-' + date;
                        var getHolidayDate = lastSelectedDate.toDateString();
                        var today = new Date();
                        var dd = today.getDate();
                        if (dd.toString().length == 1) {
                            dd = "0" + date;
                        }
                        var mm = today.getMonth() + 1;
                        if (mm.toString().length == 1) {
                            mm = "0" + mm;
                        }
                        var yyyy = today.getFullYear();
                        today = yyyy + '-' + mm + '-' + dd;
                        if (appliedDates.indexOf(getDayDate) > -1) {
                             MessageToast.show("It is already applied");
                           // MessageToast.show(applyLeaveThis.getView().getModel("i18nModel").getResourceBundle().getText("LE_APPLY_ALREADY"));
                            oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                            return;
                        }
                        //  else if (holidayDates.indexOf(getHolidayDate) > -1) {
                        //     // MessageToast.show("It is Holiday");
                        //     MessageToast.show(applyLeaveThis.getView().getModel("i18nModel").getResourceBundle().getText("LE_HOLIDAY", [holidayInfo[
                        //         holidayDates.indexOf(getHolidayDate)].reason]));
                        //     oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                        //     return;
                        // }
                         else if (lastSelectedDate.getDay() == 0 || lastSelectedDate.getDay() == 6) {
                         
                            MessageToast.show("It is not working Day..");
                            oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                            return;
                        }
                    }
                }
                //... Calling the function which handles range selection operations ...//
                applyLeaveThis.handleDateRangeSelection(); // This function must be called for both selection and deselection of each date
            },

            handleDateRangeSelection: function () {
                var applyLeaveThis = this;
                var oCalendar = applyLeaveThis.calendar,
                    aSelectedDates = oCalendar.getSelectedDates(),
                    lastSelectedDateRanngeObj = aSelectedDates[aSelectedDates.length - 1];
    
                // Sorting the selected DateRange objects
                applyLeaveThis.sortDateRangeObjects(aSelectedDates);
    
                // A new date is selected
                if (aSelectedDates.length > applyLeaveThis.lastSelecetedDatesCount) {
                    applyLeaveThis.lastSelecetedDatesCount++;
    
                    if (aSelectedDates.length === 2) { // If a range was intended to select
                        var firstDate = aSelectedDates[0].getStartDate(),
                            lastDate = aSelectedDates[1].getStartDate();
    
                        // If the start and the end dates are adjacent to each other
                        if (firstDate.toDateString() === new Date(new Date(lastDate.toDateString()).setDate(lastDate.getDate() - 1)).toDateString()) {
                            applyLeaveThis.lastSelectedRangeDates = [];
                            applyLeaveThis.lastSelectedRangeDates.push(firstDate.toDateString());
                            applyLeaveThis.lastSelectedRangeDates.push(lastDate.toDateString());
                            applyLeaveThis.lastSelecetedDatesCount = 2;
                        }
    
                        // If there is a gap of at least one day between the selection
                        else {
                            var rangeDates = [],
                                date = new Date(firstDate.toISOString()); // Creating new date object from ISO string so that the reference will not update the value of firstDate automatically
                            // Creating the array of JavaScript Date objects
                            do {
                                rangeDates.push(new Date(date.toISOString())); // Creating new date object from ISO string so that the stored dates in the array will not automatically update on increments
                                date.setDate(date.getDate() + 1); // Incrementing the date value by one day
                            } while (date <= lastDate);
    
                            oCalendar.removeAllSelectedDates(); // Removing the two selected dates
                            applyLeaveThis.lastSelecetedDatesCount = 0;
                            applyLeaveThis.lastSelectedRangeDates = [];
    
                            var dateIndex,
                                appliedSpecificDates = [];
                            for (dateIndex = 0; dateIndex < rangeDates.length; dateIndex++) {
                                // If a user selects a date range containing any already applied date for leave which must not be allowed to apply again
                                if (applyLeaveThis.appliedDates.includes(rangeDates[dateIndex].toDateString())) {
                                    appliedSpecificDates.push(rangeDates[dateIndex].toDateString().slice(4, 15));
                                }
                            }
    
                            // If no applied dates were selected withing the range
                            if (appliedSpecificDates.length === 0) {
                                // Selecting all the dates included in the intended selection range
                                for (dateIndex = 0; dateIndex < rangeDates.length; dateIndex++) {
                                    oCalendar.addSelectedDate(new sap.ui.unified.DateRange({
                                        startDate: rangeDates[dateIndex]
                                    }));
                                    // Storing all the dates into the lastSelectedRangeDates array included in the intended selection range.
                                    // This array is used while handling the deselection of a date.
                                    applyLeaveThis.lastSelectedRangeDates.push(rangeDates[dateIndex].toDateString());
                                    applyLeaveThis.lastSelecetedDatesCount++; // Updating the lastSelecetedDatesCount variable
                                }
                            }
                            // Show error message:
                            // You cannot select this range.
                            // You have already applied for the dates date1, date2,..., and daten. Please select another set of dates.
                            // Or, you may cancel the leave(s) applied for these dates and try again.
                            else if (appliedSpecificDates.length === 1) {
                                MessageBox.error(applyLeaveThis.oBundle.getText("datesRangeWithAnAppliedDateNotAllowed", [appliedSpecificDates[0]]), {
                                    actions: MessageBox.Action.OK
                                });
                            } else { // If there are multiple applied date within the range
                                var datesList = appliedSpecificDates[0], // Adding the date of index 0 here so in the following loop will start from index 1
                                    and = applyLeaveThis.oBundle.getText("and");
                                // Creating the string having list of the applied dates
                                for (dateIndex = 1; dateIndex < appliedSpecificDates.length; dateIndex++) {
                                    if (dateIndex < (appliedSpecificDates.length - 1)) {
                                        datesList += ", " + appliedSpecificDates[dateIndex];
                                    } else {
                                        datesList += " " + and + " " + appliedSpecificDates[dateIndex];
                                    }
                                }
    
                                MessageBox.error(applyLeaveThis.oBundle.getText("datesRangeWithAppliedDatesNotAllowed", [datesList]), {
                                    actions: MessageBox.Action.OK
                                });
                            }
                        }
    
                        // If the user tried to select a date outside the current selection range
                    } else if (aSelectedDates.length > 2) {
                        //Don't use the aSelectedDates array here because it's sorted, there is no guarantee that its last index will have the last selected date
                        var lastSelectedDate = oCalendar.getSelectedDates()[oCalendar.getSelectedDates().length - 1].getStartDate();
                        oCalendar.removeAllSelectedDates();
                        oCalendar.addSelectedDate(new sap.ui.unified.DateRange({
                            startDate: lastSelectedDate
                        }));
                        applyLeaveThis.lastSelecetedDatesCount = 1;
                        applyLeaveThis.lastSelectedRangeDates = []; // Empty means no range of selected dates exists
                    }
                } else { // If a date is deselected
                    if (applyLeaveThis.lastSelecetedDatesCount > 2) { // Before deselecting, if a range was selected having more than two dates
                        var selectedDates = [],
                            dateIndex;
                        // Converting the DateRange objects to date strings and storing them in the selectedDates array.
                        // Note that the aSelectedDates array contains DateRange objects which can be used for deselecting a date.
                        for (dateIndex = 0; dateIndex < aSelectedDates.length; dateIndex++) {
                            selectedDates.push(aSelectedDates[dateIndex].getStartDate().toDateString());
                        }
                        // Searching the deselected date
                        var deselectedDate;
                        for (dateIndex = 0; dateIndex < applyLeaveThis.lastSelectedRangeDates.length; dateIndex++) {
                            if (selectedDates.includes(applyLeaveThis.lastSelectedRangeDates[dateIndex]) === false) {
                                deselectedDate = applyLeaveThis.lastSelectedRangeDates[dateIndex];
                                break;
                            }
                        }
    
                        var hodidayFound = false,
                            weekendDayFound = false,
                            textHoliday = applyLeaveThis.oBundle.getText("holiday"),
                            textWeekend = applyLeaveThis.oBundle.getText("weekendDay"),
                            textHolidayOrWeekendDay = applyLeaveThis.oBundle.getText("holidayOrWeekendDay");
                        // If the first date of the range was deselected
                        if (deselectedDate === applyLeaveThis.lastSelectedRangeDates[0]) {
                            applyLeaveThis.lastSelecetedDatesCount--;
                            // Updating the lastSelectedRangeDates array
                            applyLeaveThis.lastSelectedRangeDates.splice(0, 1);
    
                            // Removing the inapplicable start date (if any)
                            // After removing a selection it is possible that the new start date can be an invalid/inapplicable start date.
                            // So, we are checking it after removing a start date each time
                            do {
                                // After deselection if the new first date of the selection is a weekend day (Saturday or Sunday)
                                if (new Date(applyLeaveThis.lastSelectedRangeDates[0]).getDay() === 0 || new Date(applyLeaveThis.lastSelectedRangeDates[0]).getDay() ===
                                    6) {
                                    weekendDayFound = true;
                                    // Removing the selection of the inapplicable first date
                                    oCalendar.removeSelectedDate(aSelectedDates[0]);
                                    aSelectedDates.splice(0, 1);
                                    applyLeaveThis.lastSelecetedDatesCount--;
                                    applyLeaveThis.lastSelectedRangeDates.splice(0, 1);
                                }
                                // After deselection if the new first date of the selection is a holiday
                                else if (applyLeaveThis.holidayDates.includes(applyLeaveThis.lastSelectedRangeDates[0])) {
                                    hodidayFound = true;
                                    // Removing the selection of the inapplicable first date
                                    oCalendar.removeSelectedDate(aSelectedDates[0]);
                                    aSelectedDates.splice(0, 1);
                                    applyLeaveThis.lastSelecetedDatesCount--;
                                    applyLeaveThis.lastSelectedRangeDates.splice(0, 1);
                                }
                            } while (new Date(applyLeaveThis.lastSelectedRangeDates[0]).getDay() === 0 || new Date(applyLeaveThis.lastSelectedRangeDates[0])
                                .getDay() === 6 || applyLeaveThis.holidayDates.includes(applyLeaveThis.lastSelectedRangeDates[0]));
    
                            var textStartDate = applyLeaveThis.oBundle.getText("startDate");
                            // Showing appropriate message to the user
                            if (weekendDayFound === true && hodidayFound === false) {
                                // Show message toast: A weekend day can't be a start date
                                MessageToast.show(applyLeaveThis.oBundle.getText("selectionInapplicableErrorMsg", [textWeekend, textStartDate]));
                            } else if (hodidayFound === true && weekendDayFound === false) {
                                // Show message toast: A holiday can't be a start date
                                MessageToast.show(applyLeaveThis.oBundle.getText("selectionInapplicableErrorMsg", [textHoliday, textStartDate]));
                            } else if (weekendDayFound === true && hodidayFound === true) {
                                // Show message toast: A holiday or a weekend day can't be a start date
                                MessageToast.show(applyLeaveThis.oBundle.getText("selectionInapplicableErrorMsg", [textHolidayOrWeekendDay, textStartDate]));
                            }
    
                            // If the last date of the range was deselected
                        } else if (deselectedDate === applyLeaveThis.lastSelectedRangeDates[applyLeaveThis.lastSelectedRangeDates.length - 1]) {
                            applyLeaveThis.lastSelecetedDatesCount--;
                            // Updating the lastSelectedRangeDates array
                            applyLeaveThis.lastSelectedRangeDates.splice(applyLeaveThis.lastSelectedRangeDates.length - 1, 1);
                            // Removing the inapplicable end date (if any)
                            // After removing a selection it is possible that the new end date can be an invalid/inapplicable end date.
                            // So, we are checking it after removing an end date each time
                            do {
                                // After deselection if the new end date of the selection is a weekend day (Saturday or Sunday)
                                if (new Date(applyLeaveThis.lastSelectedRangeDates[applyLeaveThis.lastSelectedRangeDates.length - 1]).getDay() === 0 || new Date(
                                        applyLeaveThis.lastSelectedRangeDates[applyLeaveThis.lastSelectedRangeDates.length - 1]).getDay() === 6) {
                                    weekendDayFound = true;
                                    // Removing the selection of the inapplicable end date
                                    oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                                    aSelectedDates.splice(aSelectedDates.length - 1, 1);
                                    applyLeaveThis.lastSelecetedDatesCount--;
                                    applyLeaveThis.lastSelectedRangeDates.splice(applyLeaveThis.lastSelectedRangeDates.length - 1, 1);
                                }
                                // After deselection if the new end date of the selection is a holiday
                                else if (applyLeaveThis.holidayDates.includes(applyLeaveThis.lastSelectedRangeDates[applyLeaveThis.lastSelectedRangeDates.length -
                                        1])) {
                                    hodidayFound = true;
                                    // Removing the selection of the inapplicable end date
                                    oCalendar.removeSelectedDate(aSelectedDates[aSelectedDates.length - 1]);
                                    aSelectedDates.splice(aSelectedDates.length - 1, 1);
                                    applyLeaveThis.lastSelecetedDatesCount--;
                                    applyLeaveThis.lastSelectedRangeDates.splice(applyLeaveThis.lastSelectedRangeDates.length - 1, 1);
                                }
                            } while (new Date(applyLeaveThis.lastSelectedRangeDates[applyLeaveThis.lastSelectedRangeDates.length - 1]).getDay() === 0 || new Date(
                                    applyLeaveThis.lastSelectedRangeDates[applyLeaveThis.lastSelectedRangeDates.length - 1]).getDay() === 6 || applyLeaveThis.holidayDates
                                .includes(applyLeaveThis.lastSelectedRangeDates[applyLeaveThis.lastSelectedRangeDates.length - 1]));
    
                            var textEndDate = applyLeaveThis.oBundle.getText("endDate");
                            // Showing appropriate message to the user
                            if (weekendDayFound === true && hodidayFound === false) {
                                // Show message toast: A weekend day can't be an end date
                                MessageToast.show(applyLeaveThis.oBundle.getText("selectionInapplicableErrorMsg", [textWeekend, textEndDate]));
                            } else if (hodidayFound === true && weekendDayFound === false) {
                                // Show message toast: A holiday can't be an end date
                                MessageToast.show(applyLeaveThis.oBundle.getText("selectionInapplicableErrorMsg", [textHoliday, textEndDate]));
                            } else if (weekendDayFound === true && hodidayFound === true) {
                                // Show message toast: A holiday or a weekend day can't be an end date
                                MessageToast.show(applyLeaveThis.oBundle.getText("selectionInapplicableErrorMsg", [textHolidayOrWeekendDay, textEndDate]));
                            }
                        } else { // If a date between the first and last dates of the date range was deselected (In this case, select only the deselected date and deselect all the other dates)
                            oCalendar.removeAllSelectedDates();
                            oCalendar.addSelectedDate(new sap.ui.unified.DateRange({
                                startDate: new Date(deselectedDate)
                            }));
                            applyLeaveThis.lastSelecetedDatesCount = 1;
                            // Updating the lastSelectedRangeDates array
                            applyLeaveThis.lastSelectedRangeDates = []; // Empty means no rang selection exists
                            // Show message toast: The selection must be continuous
                            MessageToast.show(applyLeaveThis.oBundle.getText("selectionMustBeCountinuous"));
                        }
                    } else { // Before deselecting, if only 1 or 2 dates were selected
                        applyLeaveThis.lastSelecetedDatesCount--;
                        applyLeaveThis.lastSelectedRangeDates = [];
                    }
                }
            },
            sortDateRangeObjects: function (dateRangeObjects) {
                dateRangeObjects.sort(function (obj1, obj2) { // Defining the compare function
                    if (obj1.getStartDate() > obj2.getStartDate()) {
                        return 1; //Returning a positive value to indicate to the sort function that the first object (obj1) is greater than the second object (obj2).
                    } else if (obj1.getStartDate() < obj2.getStartDate()) {
                        return -1; //Returning a negative value to indicate to the sort function that the first object (obj1) is less than the second object (obj2).
                    } else {
                        return 0; //Returning 0 (a neutral value) to indicate to the sort function that both the first and the second objects are equal.
                    }
                });
            },
            onObjectMatched: function (oEvent) {
                var that = this;
                that.getView().setModel(new JSONModel({}));
                
            },
            collectAttachment: function (Event) {
                this.leaveRequestObject.attachments.push(Event.getParameter("files")[0]);
            },

            handleHistoryPress: function () {
                 sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteAppliedLeaves");
            },

            handlebalancePress : function () {
                 sap.ui.core.UIComponent.getRouterFor(this).navTo("RouteBalanceLeaves");
            },

            applyLeave: function (oEvent) {
                var applyLeaveThis=this;
                var that=this;
                var appliedOn, startDate, endDate;
                var data=this.getView().getModel().getData();
                var type = applyLeaveThis.getView().byId("leaveTypeSelectId").getSelectedKey();
                var halfDay = applyLeaveThis.getView().byId("halfDayCheckBoxId").getProperty("selected");
                var appliedOnObject = new Date();
                var appliedOnYear = appliedOnObject.getFullYear();
                var requestedBy = that.getView().getModel("userModel").getData().username;
                var requestedById = that.getView().getModel("userModel").getData().id;
                //JSON.parse
                var datesSelected = applyLeaveThis.calendar.getSelectedDates();
                var datesArr = that.getRandomDates(datesSelected);
                var start_dateObject = applyLeaveThis.calendar.getSelectedDates()[0].mProperties.startDate;
                var start_month = start_dateObject.getMonth() + 1;
                if(start_month < 10) {
                    start_month = "0" + start_month;
                }
                var start_date = start_dateObject.getDate();
                if(start_date < 10) {
                    start_date = "0" + start_date;
                }
                var start_year = start_dateObject.getFullYear();
                startDate = start_date + "-" + start_month + "-" + start_year;
                var end_dateObject = applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates()[applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates().length - 1].getStartDate();
                var end_month = end_dateObject.getMonth() + 1;
                if(end_month < 10) {
                    end_month = "0" + end_month;
                }
                var end_date = end_dateObject.getDate();
                if(end_date < 10) {
                    end_date = "0" + end_date;
                }
                var end_year = end_dateObject.getFullYear();
                endDate = end_date + "-" + end_month + "-" + end_year;
                var sd = applyLeaveThis.calendar.getSelectedDates()[0].getStartDate().getDate() ;
                var ed = applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates()[applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates().length - 1].getStartDate().getDate();
                var days = applyLeaveThis.calendar.getSelectedDates().length
                data.days = days;
                that.getView().getModel("Leaves").getData().applied_leaves.push(data);
                this.getView().getModel("Leaves").updateBindings(true);
                if (applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates().length === 0) {
                    MessageToast.show("Please Select Date to Apply for leave");
                    return;
                } else {
                    var leaveBalanceLeft = that.getLeaveBalanceLeft(that.getView().getModel("userModel").getData().p_balance_leaves, appliedOnYear);
                    //if (applyLeaveThis.verifyBalanceLeaves() === "error") {
                        if (parseInt(leaveBalanceLeft) < parseInt(days)) {
                            MessageToast.show("Insufficient Leave Balance(You have " + leaveBalanceLeft + " leave balance)");
                            return; // Don't proceed if there are no enough balance leaves available
                    } else {
                        if(datesArr.length > 1) {
                            var oPromises = [];
                            for(var i = 0; i < datesArr.length; i++) {
                                var result = {
                                    "startDate": datesArr[i],
                                    "endDate": datesArr[i],
                                    "NoOfDays": applyLeaveThis.calendar.getSelectedDates().length,
                                    "type": applyLeaveThis.getView().byId("leaveTypeSelectId").getSelectedKey(),
                                    "status": "Requested",
                                    "reason": applyLeaveThis.getView().byId("reasonId").getValue(),
                                    "halfDay": halfDay,
                                    "leave_balance": that.getLeaveBalanceLeft(),
                                    "approvedBy": null,
                                    "requestedBy": requestedBy,
                                    "requestedById": requestedById
                                };  
                                oPromises.push(that.applyLeaveNow(result, "noreset"));
                            }
                            Promise.all(oPromises).then(function() {
                                that.clearLeaveRequestControl();
                            });
                        } else {
                            var result = {
                                "startDate": startDate,
                                "endDate": endDate,
                                "NoOfDays": applyLeaveThis.calendar.getSelectedDates().length,
                                "type": applyLeaveThis.getView().byId("leaveTypeSelectId").getSelectedKey(),
                                "status": "Requested",
                                "reason": applyLeaveThis.getView().byId("reasonId").getValue(),
                                "halfDay": halfDay,
                                "leave_balance": that.getLeaveBalanceLeft(),
                                "approvedBy": null,
                                "requestedBy": requestedBy,
                                "requestedById": requestedById
                            };
                            that.applyLeaveNow(result, "reset");
                        }    
                    }  
                }             
            },

            getRandomDates: function(data) {
                var arr = [], startDate;
                for(var i = 0; i < data.length; i++) {
                    var date = data[i].getProperty("startDate").getDate();
                    if(date < 10) {
                        date = "0" + date;
                    }
                    var month = data[i].getProperty("startDate").getMonth();
                    month = month + 1;
                    if(month < 10) {
                        month = "0" + month;
                    }
                    month = month.toString();
                    var year = data[i].getProperty("startDate").getFullYear();
                    startDate = date + "-" + month + "-" + year;
                    arr.push(startDate);
                }
                return arr;
            },
            
            getLeaveBalanceLeft: function(data, year) {
                var data = this.getView().getModel("balanceleave").getData();
                data = data[0].attributes.balanceLeaves;
                return data;
            },

            applyLeaveNow: function(result, reset) {
                var that = this;
                var updateUrl = '/deswork/api/p-leaves/';
                $.ajax({
                    url: updateUrl,
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }, data: JSON.stringify({
                        "data": result
                    }),
                    success: function (response) {
                        if(reset === "reset") {
                            that.clearLeaveRequestControl();
                        }
                    },
                    error: function (error) {
                        MessageBox.success(error);
                    }
                });
            },

            clearLeaveRequestControl: function() {
                var that =this;
                MessageBox.success("Leave Applied");
                that.getView().byId("leaveTypeSelectId").setSelectedKey("Select");
                that.getView().byId("reasonId").setValue(""),
                that.getView().byId("calSelectLeaveDates").removeAllSelectedDates();
                that.getView().byId("halfDayCheckBoxId").setSelected(false);
                //that.getView().byId("UploadCollection").removeAllItems();
            },

            verifyBalanceLeaves: function () {
                    var applyLeaveThis=this;
                    if (applyLeaveThis.getView().byId("leaveTypeSelectId").getSelectedKey() !== "Unpaid Leave") {
                        var startDate = applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates()[0].getStartDate();
                        var endDate = applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates()[applyLeaveThis.byId("calSelectLeaveDates").getSelectedDates().length - 1].getStartDate();
                
                    
                        // var applicableDatesCount = applyLeaveThis.getApplicableDates(startDate, endDate).length,
                        //     balanceLeavesData = sap.ui.getCore().getModel("balanceLeavesModel").getData().length > 0 ? sap.ui.getCore().getModel("balanceLeavesModel").getData().length - 1 : 0,
                        //     balanceLeavesCount = parseFloat(sap.ui.getCore().getModel("balanceLeavesModel").getData()[balanceLeavesData].balanceLeaves);
                    // if (applicableDatesCount <= balanceLeavesCount) {
                            return "ok";
                    //  } else {
                    //     MessageBox.error(applyLeaveThis.oBundle.getText("noEnoughBalanceLeavesErrorMsg", [balanceLeavesCount, applicableDatesCount]), {
                    //         actions: MessageBox.Action.OK
                    //      });
                    //      return "error";
                    //   }
                //  } else {
                //      return "ok";
                    }
            },

            getApplicableDates: function (argStartDate, argEndDate) {
                var applyLeaveThis=this;
                var includes=[];

                if (argStartDate && argEndDate) { // Process only if both the dates are passed to this functions
                    // Both the start and the end date may be same as well
                    var startDate = new Date(argStartDate),
                        endDate = new Date(argEndDate),
                        tempDate,
                        rangeDates = []; // This array will contain all the dates included within the passed start and end dates
                    // Swap the dates if the arguments order if wrong
                    if (startDate > endDate) {
                        tempDate = startDate;
                        startDate = endDate;
                        endDate = tempDate;
                    }
                    // Creating and storing all the dates included within the date range
                    tempDate = new Date(startDate.toDateString());
                    do {
                        rangeDates.push(startDate.toDateString());
                        startDate.setDate(startDate.getDate() + 1);
                    } while (startDate <= endDate);
    
                    //...Evaluating applicable dates which are applicable for leaves...//
                    var dateIndex;
                    var applicableDates = rangeDates; // Taking the copy of all range dates initially
                    // Removing weekend dates (It's possible that a date range has some weekend dates within it).
                    for (dateIndex = 0; dateIndex < applicableDates.length; dateIndex++) {
                        if (new Date(applicableDates[dateIndex]).getDay() === 0 || new Date(applicableDates[dateIndex]).getDay() === 6) {
                            applicableDates.splice(dateIndex, 1);
                            dateIndex--; //Repositioning the iterator's cursor one step back because the currently pointed element has been deleted
                        }
                    }
                    // Removing holiday dates (It's possible that a date range has some holiday dates within it).
                    for (dateIndex = 0; dateIndex < applicableDates.length; dateIndex++) {
                        if (applyLeaveThis.holidayDates.includes(applicableDates[dateIndex])) {
                            applicableDates.splice(dateIndex, 1);
                            dateIndex--;
                        }
                    }
                    // Removing allready applied and approved dates (rarely it's possible that a date range has some already applied/approved leave dates within it)
                    for (dateIndex = 0; dateIndex < applicableDates.length; dateIndex++) {
                        if (applyLeaveThis.appliedDates.includes(applicableDates[dateIndex])) {
                            applicableDates.splice(dateIndex, 1);
                            dateIndex--;
                        }
                    }
                    // Now the applicableDates array has only the applicable dates where each date is valid for applying a leave
                    return applicableDates;
                } else {
                    console.log("Please pass both the start date and end date arguments to the getApplicableDates function.")
                    return undefined;
                }
            },
            
            getUserDetails: function() {
                var that = this;
                var url = 'deswork/api/users/me?populate=*';
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel = new sap.ui.model.json.JSONModel(response);
				        that.getView().setModel(oModel, "userModel");
                        that.callBalanceLeave(response.id);
                    }
                });
            },
            callBalanceLeave: function (id) {
                var that = this;
                var date = new Date();
                var currentYear = date.getFullYear();
                var url = 'deswork/api/p-balance-leaves?populate=*&filters[year]][$eq]=';
                url = url + currentYear + '&filters[userId][$eq]=' + id;
                $.ajax({
                    url: url,
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    success: function (response) {
                        response = JSON.parse(response);
                        var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                        that.getView().setModel(oModel2, "balanceleave");
                    }
                });             
            }
            });
    });