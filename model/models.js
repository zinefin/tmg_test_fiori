/*
----------------------------------------------------------------------------------*
*  App Name     : ZMMXE00002													  *
*  File Name    : models.js														  *
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

sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		}

	};
});