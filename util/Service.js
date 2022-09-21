/*
----------------------------------------------------------------------------------*
*  App Name     : ZMMXE00002													  *
*  File Name    : Service.js													  *
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

jQuery.sap.declare("ZMMXE00002.util.Service");
jQuery.sap.require("sap.ui.model.json.JSONModel");

ZMMXE00002.util.Service = {
	/**
	 * Private method
	 * to generate local message object by result message list from service
	 */
	fnGenerateResultMessage: function(aMsg) {
		var bSuccess = false;
		var oError = aMsg.find(function(s) {
			return (s.SeverityLevel === "ERROR");
		});
		var oSuccess = aMsg.find(function(s) {
			return (s.SeverityLevel === "SUCCESS");
		});
		var oMsg = {
			DocumentRequestNo: null,
			SeverityLevel: null,
			Message: ""
		};

		if (oSuccess) {
			bSuccess = true;
		}
		if (bSuccess) {
			oMsg.DocumentRequestNo = oSuccess.DocumentRequestNo;
			oMsg.SeverityLevel = "SUCCESS";
			aMsg.forEach(function(oResultMsg, index) {
				if (oMsg.Message) {
					oMsg.Message += "\r\n" + oResultMsg.Message;
				} else {
					oMsg.Message += oResultMsg.Message;
				}
			});
		} else {
			oMsg.DocumentRequestNo = oError.DocumentRequestNo;
			oMsg.SeverityLevel = "ERROR";
			aMsg.forEach(function(oResultMsg, index) {
				if (oMsg.Message) {
					oMsg.Message += "\r\n" + oResultMsg.Message;
				} else {
					oMsg.Message += oResultMsg.Message;
				}
			});
		}

		return oMsg;
	},

	fnGetData: function(oModel, sPath, aFilters, fnCallBackSuccess, fnCallBackFail) {
		oModel.read(sPath, {
			filters: aFilters,
			success: function(oDataResponse) {
				fnCallBackSuccess(oDataResponse);
			}.bind(this),
			error: function(oError) {
				fnCallBackFail(oError);
			}.bind(this)
		});
	},

	fnPostData: function(oModel, oData, sPath, fnCallBackSuccess, fnCallBackFail) {
		oModel.create(sPath, oData, undefined, function(oDataResponse) {
			fnCallBackSuccess(oDataResponse);
		}.bind(this), function(oError) {
			fnCallBackFail(oError);
		}.bind(this));
	}
};