/*
----------------------------------------------------------------------------------*
*  App Name     : ZMMXE00002													  *
*  File Name    : Formatther.js													  *
*  Create Date  : 08-Nov-2021													  *
*  Create By    : Jitrada Thasripoo (Jitrada@zygencenter.com)					  *
*  Company      : ZyGen															  *
*  Description  : Fiori: Cycle Count Application								  *
*---------------------------------------------------------------------------------*
*  Change Key   : 																  *
*  TR No.       : 																  *
*  Change Date  : 																  *
*  Change By    : 																  *
*  Request By   : 																  *
*  Change Desc  : 																  *
*---------------------------------------------------------------------------------*
*/

jQuery.sap.declare("ZMMXE00002.util.Formatter");
jQuery.sap.require("sap.ca.ui.model.format.DateFormat");
jQuery.sap.require("sap.ca.ui.model.format.NumberFormat");

ZMMXE00002.util.Formatter = {

	fnConvertNumberFormat: function(sNumber, sDecimal) {
		var fValue = sNumber ? parseFloat(sNumber) : 0.0;
		var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
			decimals: sDecimal,
			maxFractionDigits: sDecimal,
			groupingEnabled: true,
			groupingSeparator: ",",
			decimalSeparator: "."
		});
		return oNumberFormat.format(fValue);
	},

	fnConvertStringToDate: function(sDate) {
		return new Date(sDate.substr(0, 4), parseInt(sDate.substr(4, 2)) - 1, sDate.substr(6, 2));
	},

	fnDateFormatFromString: function(sDate) {
		var sFormatDate = "";
		var oSelf = ZMMXE00002.util.Formatter;
		if (sDate) {
			sDate = oSelf.fnConvertStringToDate(sDate);
			var oFormatter = sap.ca.ui.model.format.DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy"
			});
			sFormatDate = oFormatter.format(sDate, false);
		}
		return sFormatDate;
	},

	fnSetIcon: function(sMessageType) {
		var sIcon = "sap-icon://message-information";

		if (sMessageType) {
			switch (sMessageType.toLowerCase()) {
				case "e":
					sIcon = "sap-icon://message-error";
					break;
				case "i":
					sIcon = "sap-icon://message-information";
					break;
				case "s":
					sIcon = "sap-icon://message-success";
					break;
				case "w":
					sIcon = "sap-icon://message-warning";
					break;
				default:
					sIcon = "sap-icon://message-information";
					break;
			}
		}

		return sIcon;
	},

	fnSetIconText: function(sMessageType) {
		var sStateText = "Information";
		if (sMessageType) {
			switch (sMessageType.toLowerCase()) {
				case "e":
					sStateText = "Error";
					break;
				case "i":
					sStateText = "Information";
					break;
				case "s":
					sStateText = "Success";
					break;
				case "w":
					sStateText = "Warning";
					break;
				default:
					sStateText = "Information";
					break;
			}
		}

		return sStateText;
	},

	fnSetIconState: function(sMessageType) {
		var sState = "None";

		if (sMessageType) {
			switch (sMessageType.toLowerCase()) {
				case "e":
					sState = "Error";
					break;
				case "i":
					sState = "None";
					break;
				case "s":
					sState = "Success";
					break;
				case "w":
					sState = "Warning";
					break;
				default:
					sState = "None";
					break;
			}
		}

		return sState;
	},

	fnCheckStatusText: function(fDiffQty) {
		var sText = this.getView().getModel("i18n").getProperty("labelBalance");
		parseFloat(fDiffQty);
		if (fDiffQty > 0) {
			sText = this.getView().getModel("i18n").getProperty("labelExceedValue");
		} else if (fDiffQty < 0) {
			sText = this.getView().getModel("i18n").getProperty("labelLackValue");
		} else {
			sText = this.getView().getModel("i18n").getProperty("labelBalance");
		}
		return sText;
	},

	fnCheckStatus: function(sText) {
		var sState = "None";
		if (sText === this.getView().getModel("i18n").getProperty("labelExceedValue")) {
			sState = "Warning";
		} else if (sText === this.getView().getModel("i18n").getProperty("labelLackValue")) {
			sState = "Error";
		} else {
			sState = "None";
		}
		return sState;
	},
	fnAddcomma: function(sValue) {
		if (sValue !== "" && sValue !== null) {
			var sDecimal = "3";
			var sNewValue = sValue.replace(/,/g, "");
			var oNumberFormat = sap.ui.core.format.NumberFormat.getFloatInstance({
				decimals: sDecimal,
				maxFractionDigits: sDecimal,
				groupingEnabled: true,
				groupingSeparator: ",",
				decimalSeparator: "."
			});
			return oNumberFormat.format(sNewValue);
		} else {
			return sValue;
		}
	}
};