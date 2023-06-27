sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("vaspp.mypublicholidays.controller.View1", {
            onInit: function () {
                var that =this;
                // var url = '/deswork/api/p-holidays';
                // $.ajax({
                //     url: url,
                //     method: "GET",
                //     success: function (response) {
                //         response = JSON.parse(response);
                //         var oModel2 = new sap.ui.model.json.JSONModel(response.data);
                //         that.getView().setModel(oModel2, "publicholiday");
                //     }
                // });
                var date= new Date();
                var year= date.getFullYear();
                $.get("/deswork/api/p-holidays?filters[year][$eq]="+ year,function(response){
                    response = JSON.parse(response);
                    var oModel = new sap.ui.model.json.JSONModel(response.data);
                    that.getView().setModel(oModel, "publicholiday");
                }) 
            }
        });
    });
