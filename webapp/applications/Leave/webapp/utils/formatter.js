sap.ui.define([], function () {
	"use strict";

	return {
		createdAt: function(date) {
			if(date) {
				var temp = date.substr(0,10);
				temp = temp.split("-");
				var result = temp[2] + "-" + temp[1] + "-" + temp[0];
				return result;
			} else {
				return date;
			}
		}
	};
});