/*
----------------------------------------------------------------------------------*
*  App Name     : ZMMXE00002													  *
*  File Name    : MainPage.controller.js										  *
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
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/format/NumberFormat",
	"ZMMXE00002/util/Formatter",
	"sap/ndc/BarcodeScanner",
	"ZMMXE00002/util/Service",
	"ZMMXE00002/util/SearchHelp"
], function(Controller, JSONModel, MessageBox, NumberFormat, Formatter, BarcodeScanner, Service, SearchHelp) {
	"use strict";
	/*
	 *&--------------------------------------------------------------------------*
	 *&                         GLOBAL VARIABLE SECTION
	 *&--------------------------------------------------------------------------*
	 */
	var _oBusyDialog = new sap.m.BusyDialog();
	_oBusyDialog.setText("Loading, Please Wait...");

	return Controller.extend("ZMMXE00002.controller.MainPage", {
		formatter: Formatter,
		/*
		 *&---------------------------------------------------------------------*
		 *&                       LIFE CYCLE VIEW SECTION
		 *&---------------------------------------------------------------------*
		 */

		onInit: function() {

			var sMainServiceUrl = this.getOwnerComponent().getMetadata().getManifestEntry("sap.app").dataSources.ZMMXE00002_SRV.uri;
			var oModelMain = new sap.ui.model.odata.ODataModel(sMainServiceUrl, true);
			this.getView().setModel(oModelMain, "MainModel");

			var sSearchHelpServiceUrl = this.getOwnerComponent().getMetadata().getManifestEntry("sap.app").dataSources.ZMMXE00000_SRV.uri;
			var oModel = new sap.ui.model.odata.ODataModel(sSearchHelpServiceUrl, true);
			this.getView().setModel(oModel, "SearchHelpModel");

			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.fnHandelRouteMatched, this);

			var oRootPath = jQuery.sap.getModulePath("ZMMXE00002");
			this.oMsg = new sap.ui.model.resource.ResourceModel({
				bundleUrl: [oRootPath, "i18n/i18n.properties"].join("/")
			});
		},

		fnHandelRouteMatched: function(oEvent) {
			var oModel = new JSONModel();
			oModel.setData({
				SearchHelp: {
					PIDocItems: [],
					SlocItems: []
				}
			});
			oModel.refresh();
			this.getView().setModel(oModel, "SearchHelpItems");

			var oModelTable = new JSONModel();
			oModelTable.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oModelTable.setData({
				PIItems: []
			});
			oModelTable.refresh();
			this.getView().setModel(oModelTable, "TableItems");
		},

		/*
		 *&---------------------------------------------------------------------*
		 *&                  PREPARE DATA & BINDING DATA SECTION
		 *&---------------------------------------------------------------------*
		 */
		fnPrepareModel: function(aData) {
			var oTableModel = this.getView().getModel("TableItems");
			var aPIItems = $.extend([], oTableModel.getProperty("/PIItems"));
			aPIItems.unshift(aData[0]);
			oTableModel.setProperty("/PIItems", aPIItems);
		},

		/*
		 *&---------------------------------------------------------------------*
		 *&                         HTTP REQUEST SECTION
		 *&---------------------------------------------------------------------*
		 */

		fnGetPIDocAndOpenValueHelpDialog: function(oConfig) {
			var oSearchHelpModel = this.getView().getModel("SearchHelpItems");
			var oSearchHelp = SearchHelp;
			var aPIDocItems = [];
			if (!oSearchHelpModel.getProperty("/SearchHelp/PIDocItems") || oSearchHelpModel.getProperty("/SearchHelp/PIDocItems").length <= 0) {
				var sPath = "/HelpSet";
				var oModel = this.getView().getModel("SearchHelpModel");
				var oDataForPost = {};
				oDataForPost.ActionParameter = "SPI";
				oDataForPost.HelpPIDoc = [];

				this.fnShowBusyDialog();
				Service.fnPostData(oModel, oDataForPost, sPath, function(oDataResponse) {
					this.fnHideBusyDialog();
					if (oDataResponse && oDataResponse.HelpPIDoc && oDataResponse.HelpPIDoc.results) {
						aPIDocItems = oDataResponse.HelpPIDoc.results;
						aPIDocItems.map(function(oItem) {
							oItem.Key = oItem.Key01;
							oItem.Text = oItem.Text01;
						});
					}
					oSearchHelpModel.setProperty("/SearchHelp/PIDocItems", aPIDocItems);
					oSearchHelpModel.refresh();
					this.oDialogSearchHelp = oSearchHelp.fnOnInitDialog(oConfig.Title, oConfig.Control, oConfig.ControlType, oConfig.IsMultiSelect,
						aPIDocItems, oConfig.ColumnNames, oConfig.IsDescription, oConfig.IsPhone, this,
						function(oResponse) {
							this.getView().byId("vIdMultiInputPIDoc").setValue(oResponse.Key);
							this.getView().byId("vIdMultiInputPIDoc").setTooltip(oResponse.Text);

						}.bind(this),
						function() {
							// Cancel
						}.bind(this));
					this.oDialogSearchHelp.open();
				}.bind(this), function(oError) {
					this.fnHideBusyDialog();
					this.fnCreateErrorMessageBox(oError.message);
				}.bind(this));
			} else {
				aPIDocItems = JSON.parse(JSON.stringify(oSearchHelpModel.getProperty("/SearchHelp/PIDocItems")));
				this.oDialogSearchHelp = oSearchHelp.fnOnInitDialog(oConfig.Title, oConfig.Control, oConfig.ControlType,
					oConfig.IsMultiSelect, aPIDocItems, oConfig.ColumnNames, oConfig.IsDescription, oConfig
					.IsPhone, this,
					function(oResponse) {
						this.getView().byId("vIdMultiInputPIDoc").setValue(oResponse.Key);
						this.getView().byId("vIdMultiInputPIDoc").setTooltip(oResponse.Text);
					}.bind(this),
					function() {});
				this.oDialogSearchHelp.open();
			}
		},

		fnGetSLOCAndOpenValueHelpDialog: function(oConfig) {
			var oSearchHelpModel = this.getView().getModel("SearchHelpItems");
			var oSearchHelp = SearchHelp;
			var aSlocItems = [];
			var sPath = "/HelpSet";
			var oModel = this.getView().getModel("SearchHelpModel");
			var oDataForPost = {};
			oDataForPost.ActionParameter = "SSP";
			oDataForPost.PIDoc = this.getView().byId("vIdMultiInputPIDoc").getValue();
			oDataForPost.HelpSLOC = [];
			this.fnShowBusyDialog();
			Service.fnPostData(oModel, oDataForPost, sPath, function(oDataResponse) {
				this.fnHideBusyDialog();
				if (oDataResponse && oDataResponse.HelpSLOC && oDataResponse.HelpSLOC.results) {
					aSlocItems = oDataResponse.HelpSLOC.results;
					aSlocItems.map(function(oItem) {
						oItem.Key = oItem.Key01;
						oItem.Text = oItem.Text01;
					});
				}
				oSearchHelpModel.setProperty("/SearchHelp/SlocItems", aSlocItems);
				oSearchHelpModel.refresh();
				this.oDialogSearchHelp = oSearchHelp.fnOnInitDialog(oConfig.Title, oConfig.Control, oConfig.ControlType, oConfig.IsMultiSelect,
					aSlocItems, oConfig.ColumnNames, oConfig.IsDescription, oConfig.IsPhone, this,
					function(oResponse) {
						this.getView().byId("vIddMultiInputSLOC").setValue(oResponse.Key);
						this.getView().byId("vIddMultiInputSLOC").setTooltip(oResponse.Text);
					}.bind(this),
					function() {
						// Cancel
					}.bind(this));
				this.oDialogSearchHelp.open();
			}.bind(this), function(oError) {
				this.fnHideBusyDialog();
				this.fnCreateErrorMessageBox(oError.message);
			}.bind(this));
		},

		fnShowBusyDialog: function() {
			jQuery.sap.delayedCall(200, this, function() {
				_oBusyDialog.open();
			});
		},

		fnHideBusyDialog: function() {
			jQuery.sap.delayedCall(100, this, function() {
				_oBusyDialog.close();
			});
		},
		/*
		 *&---------------------------------------------------------------------*
		 *&                           ON EVENT SECTION
		 *&---------------------------------------------------------------------*
		 */
		fnOnPressDeleteBtn: function(oEvent) {
			var sMessage = this.getView().getModel("i18n").getProperty("msgDeleteItem");
			var sPath = oEvent.getParameter("listItem").getBindingContextPath();
			var sIndex = sPath.split("/")[sPath.split("/").length - 1];
			var oTableModel = this.getView().getModel("TableItems");
			this.fnOnConfirmMessageBoxAndCallback(sMessage, function(sAction) {
				if (sAction && sAction.toUpperCase() === "YES") {
					var aPIItems = $.extend([], oTableModel.getProperty("/PIItems"));
					aPIItems.splice(sIndex, 1);
					oTableModel.setProperty("/PIItems", aPIItems);
					oTableModel.refresh();
				}
			});
		},

		fnOnPressPostBtn: function(oEvent) {
			var sMessage = this.getView().getModel("i18n").getProperty("msgPostPI");
			var oModelMain = this.getView().getModel("MainModel");
			var oModelTable = this.getView().getModel("TableItems");

			if (oModelTable.getProperty("/PIItems").length > 0) {
				var sPath = "MainSet";
				var oDataForPost = {};
				oDataForPost.ActionParameter = "POS";
				oDataForPost.PIDoc = this.getView().byId("vIdMultiInputPIDoc").getValue();
				oDataForPost.SLOC = this.getView().byId("vIddMultiInputSLOC").getValue();
				oDataForPost.EAN = this.getView().getModel("HeaderModel").getData().EAN;
				oDataForPost.MainToMatDetail = oModelTable.getProperty("/PIItems");
				oDataForPost.MainToMessage = [];
				this.fnOnConfirmMessageBoxAndCallback(sMessage, function(sAction) {
					if (sAction && sAction.toUpperCase() === "YES") {
						this.fnShowBusyDialog();
						Service.fnPostData(oModelMain, oDataForPost, sPath, function(oDataResponse) {
							this.fnHideBusyDialog();
							if (oDataResponse.MainToMessage && oDataResponse.MainToMessage.results) {
								var aMessage = [];
								aMessage = JSON.parse(JSON.stringify(oDataResponse.MainToMessage.results));
								aMessage = aMessage.filter(function(oMsg) {
									return oMsg.Type.toUpperCase() === "E";
								});
								if (aMessage.length === 0) {
									this.getView().byId("vIdMultiInputPIDoc").setValue("");
									this.getView().byId("vIddMultiInputSLOC").setValue("");
									this.fnCreateTableMessageDialog("Message", oDataResponse.MainToMessage.results, "None");
									oModelTable.setProperty("/PIItems", []);
								}

							}
						}.bind(this), function(oError) {
							this.fnHideBusyDialog();
							this.fnCreateErrorMessageBox(oError.message);
						}.bind(this));
					}
				}.bind(this));
			} else {
				this.fnCreateErrorMessageBox(this.getView().getModel("i18n").getProperty("msgErrorPost"));
			}

		},

		fnOnPressScanChange: function(oEvent) {
			var bFilagRequire = this.fnCheckRequirefield();
			if (!bFilagRequire) {
				var bErrorPI = this.fnCheckPostPIDOC();
				if (bErrorPI) {
					this.fnCreateErrorMessageBox(this.getView().getModel("i18n").getProperty("msgErrorPIDoc"));
					oEvent.getSource().setValue("");
					return;
				}
				var oModelMain = this.getView().getModel("MainModel");
				var oRadioQty = this.getView().byId("vIdRadioButtonScanInputQty");
				var sPath = "MainSet";
				var oDataForPost = {};
				oDataForPost.ActionParameter = "ECO";
				oDataForPost.PIDoc = this.getView().byId("vIdMultiInputPIDoc").getValue();
				oDataForPost.SLOC = this.getView().byId("vIddMultiInputSLOC").getValue();
				oDataForPost.EAN = oEvent.getSource().getValue();
				oDataForPost.MainToScanUnit = [];
				oDataForPost.MainToMessage = [];

				if (oRadioQty.getSelected()) {
					oDataForPost.ActionParameter = "EIN";
				}
				if (oDataForPost.EAN) {
					// Call oData to get material no.
					this.fnShowBusyDialog();
					Service.fnPostData(oModelMain, oDataForPost, sPath, function(oDataResponse) {
						this.fnHideBusyDialog();
						if (oDataResponse.MainToMessage && oDataResponse.MainToMessage.results && oDataResponse.MainToMessage.results[0].Type !== "S") {
							this.fnCreateTableMessageDialog("Message", oDataResponse.MainToMessage.results, "None");
						} else {
							if (oDataResponse && oDataResponse !== null) {
								oDataResponse.ScanInputUnit = oDataResponse.ScanBookUnit;
								var sMessage = this.getView().getModel("i18n").getProperty("titlePIDocument");
								this.getView().byId("vIdPanelPIDocument").setHeaderText(sMessage + oDataResponse.PIDoc);
								if (oRadioQty.getSelected()) {
									this.fnOpenInputQtyDialog(oDataResponse);
								} else {
									this.fnOpenCountQtyDialog(oDataResponse);
								}
							}
						}
					}.bind(this), function(oError) {
						this.fnHideBusyDialog();
						this.fnCreateErrorMessageBox(oError.message);
					}.bind(this));
				}
			} else {
				this.fnHideBusyDialog();
				this.fnCreateErrorMessageBox(this.getView().getModel("i18n").getProperty("msgErrorRequire"));
			}
			oEvent.getSource().setValue("");
		},

		fnOnPressScanButton: function(oEvent) {
			var bFilagRequire = this.fnCheckRequirefield();
			if (!bFilagRequire) {
				var bErrorPI = this.fnCheckPostPIDOC();
				if (bErrorPI) {
					this.fnCreateErrorMessageBox(this.getView().getModel("i18n").getProperty("msgErrorPIDoc"));
					this.getView().byId("vIdMaterial").setValue("");
					return;
				}
				var oModelMain = this.getView().getModel("MainModel");
				var oRadioQty = this.getView().byId("vIdRadioButtonScanInputQty");
				var sPath = "MainSet";
				var oDataForPost = {};
				oDataForPost.ActionParameter = "ECO";
				oDataForPost.PIDoc = this.getView().byId("vIdMultiInputPIDoc").getValue();
				oDataForPost.SLOC = this.getView().byId("vIddMultiInputSLOC").getValue();
				oDataForPost.MainToScanUnit = [];
				oDataForPost.MainToMessage = [];

				if (oRadioQty.getSelected()) {
					oDataForPost.ActionParameter = "EIN";
				}
				this.fnOpenScanBarcode(function(sEANValue) {
					if (sEANValue) {
						// Call oData to get material no.
						oDataForPost.EAN = sEANValue;
						this.fnShowBusyDialog();
						Service.fnPostData(oModelMain, oDataForPost, sPath, function(oDataResponse) {
							this.fnHideBusyDialog();
							if (oDataResponse.MainToMessage && oDataResponse.MainToMessage.results && oDataResponse.MainToMessage.results[0].Type !==
								"S") {
								this.fnCreateTableMessageDialog("Message", oDataResponse.MainToMessage.results, "None");
							} else {
								if (oDataResponse && oDataResponse !== null) {
									oDataResponse.ScanInputUnit = oDataResponse.ScanBookUnit;
									var sMessage = this.getView().getModel("i18n").getProperty("titlePIDocument");
									this.getView().byId("vIdPanelPIDocument").setHeaderText(sMessage + oDataResponse.PIDoc);
									if (oRadioQty.getSelected()) {
										this.fnOpenInputQtyDialog(oDataResponse);
									} else {
										this.fnOpenCountQtyDialog(oDataResponse);
									}
								}
							}
						}.bind(this), function(oError) {
							this.fnHideBusyDialog();
							this.fnCreateErrorMessageBox(oError.message);
						}.bind(this));
					}
				}.bind(this));
			} else {
				this.fnCreateErrorMessageBox(this.getView().getModel("i18n").getProperty("msgErrorRequire"));
			}
			this.getView().byId("vIdMaterial").setValue("");
		},

		fnOnPressOKInputQtyBtn: function(oEvent) {
			var oModelMain = this.getView().getModel("MainModel");
			var sPath = "MainSet";
			var oDataForPost = this.oInputQtyDialog.getModel("InputQtyModel").getData()[0];

			oDataForPost.ActionParameter = "ADD";
			oDataForPost.ScanInputQty = oDataForPost.ScanInputQty.replace(/,/g, "");
			oDataForPost.MainToMatDetail = [];
			oDataForPost.MainToMessage = [];
			oDataForPost.MainToScanUnit = [];
			this.fnShowBusyDialog();
			Service.fnPostData(oModelMain, oDataForPost, sPath, function(oDataResponse) {
				this.fnHideBusyDialog();
				if (oDataResponse.MainToMessage && oDataResponse.MainToMessage.results && oDataResponse.MainToMessage.results[0].Type !== "S") {
					this.fnCreateTableMessageDialog("Message", oDataResponse.MainToMessage.results, "None");
				} else {
					if (oDataResponse && oDataResponse.MainToMatDetail !== null) {
						var oModelHeader = new JSONModel();
						oModelHeader.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
						oModelHeader.setData(oDataResponse);
						oModelHeader.refresh();
						this.getView().setModel(oModelHeader, "HeaderModel");
						this.fnPrepareModel(oDataResponse.MainToMatDetail.results);
					}
				}
			}.bind(this), function(oError) {
				this.fnHideBusyDialog();
				this.fnCreateErrorMessageBox(oError.message);
			}.bind(this));

			this.fnOnPressCancelInputQtyBtn();
		},

		fnOnPressCancelInputQtyBtn: function() {
			if (this.oInputQtyDialog) {
				this.oInputQtyDialog.close();
			}
		},

		fnOnPressOKCountQtyBtn: function() {
			var oModelMain = this.getView().getModel("MainModel");
			var sPath = "MainSet";
			var oDataForPost = this.oCountQtyDialog.getModel("CountQtyModel").getData()[0];
			delete oDataForPost.MainToMatDetail;
			delete oDataForPost.MainToScanUnit;

			oDataForPost.ActionParameter = "ADD";
			oDataForPost.MainToMatDetail = [];
			oDataForPost.MainToMessage = [];
			this.fnShowBusyDialog();
			Service.fnPostData(oModelMain, oDataForPost, sPath, function(oDataResponse) {
				this.fnHideBusyDialog();
				if (oDataResponse.MainToMessage && oDataResponse.MainToMessage.results && oDataResponse.MainToMessage.results[0].Type !== "S") {
					this.fnCreateTableMessageDialog("Message", oDataResponse.MainToMessage.results, "None");
				} else {
					if (oDataResponse && oDataResponse.MainToMatDetail !== null) {
						var oModelHeader = new JSONModel();
						oModelHeader.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
						oModelHeader.setData(oDataResponse);
						oModelHeader.refresh();
						this.getView().setModel(oModelHeader, "HeaderModel");

						this.fnPrepareModel(oDataResponse.MainToMatDetail.results);
					}
				}
			}.bind(this), function(oError) {
				this.fnHideBusyDialog();
				this.fnCreateErrorMessageBox(oError.message);
			}.bind(this));
			this.fnOnPressCancelCountQtyBtn();
		},

		fnOnPressCancelCountQtyBtn: function() {
			if (this.oCountQtyDialog) {
				this.oCountQtyDialog.close();
			}
		},

		fnOnValueHelpDialogPress: function(oEvent) {
			var sId = oEvent.getParameter("id");
			this.fnCreateValueHelpDialog(sId, oEvent.getSource(), "");
		},
		fnOnChangeQty: function(oEvent) {
			var sScanEan = oEvent.getSource().getValue();
			var aData = this.oCountQtyDialog.getModel("CountQtyModel").getData()[0];
			if (aData.EAN === sScanEan) {
				if (aData.ScanInputQty === "") {
					aData.ScanInputQty = "0";
				}

				aData.ScanInputQty = parseFloat(aData.ScanInputQty) + parseFloat(aData.ScanCounter);
				aData.ScanInputQty = aData.ScanInputQty.toString();
				this.oCountQtyDialog.getModel("CountQtyModel").refresh();
			} else {
				this.fnCreateErrorMessageBox(this.getView().getModel("i18n").getProperty("msgErrorEAN"));
			}
			oEvent.getSource().setValue("");
		},
		fnOnChangeInputQTY: function(oEvent) {
			var sValue = oEvent.getSource().getValue();
			sValue = sValue.replace(/,/g, "");
			var fValue = parseFloat(sValue);
			var sNewValue = "0.000";
			var sPath = oEvent.getSource().getBindingContext("InputQtyModel").sPath;
			var oSelectedPIDoc = oEvent.getSource().getBindingContext("InputQtyModel").getProperty(sPath);
			if (!(isNaN(fValue))) {
				sNewValue = Formatter.fnAddcomma(sValue);
			} else {
				MessageBox.error(this.getView().getModel("i18n").getProperty("MsgErrorNumberFormat"));
				sNewValue = "0.000";
			}
			oSelectedPIDoc.ScanInputQty = sNewValue;
			oEvent.getSource().getModel("InputQtyModel").setProperty(sPath, oSelectedPIDoc);
			oEvent.getSource().getModel("InputQtyModel").refresh();
			oEvent.getSource().setValue(sNewValue);

		},
		/*
		 *&---------------------------------------------------------------------*
		 *&                         VALIDATE SECTION
		 *&---------------------------------------------------------------------*
		 */

		fnCheckRequirefield: function() {
			var bIsFlag = false;
			var oPIDocument = this.getView().byId("vIdMultiInputPIDoc");
			var oSloc = this.getView().byId("vIddMultiInputSLOC");

			if (oPIDocument.getValue() === "") {
				bIsFlag = true;
			}
			if (oSloc.getValue() === "") {
				bIsFlag = true;
			}
			return bIsFlag;
		},
		fnCheckPostPIDOC: function() {
			var aPIData = this.getView().getModel("TableItems").getProperty("/PIItems");
			var sPiDoc = this.getView().byId("vIdMultiInputPIDoc").getValue();
			var bIsFlag = false;
			if (aPIData.length > 0) {
				aPIData.map(function(oPIData) {
					if (oPIData.PIDoc !== sPiDoc) {
						bIsFlag = true;
						return;

					}
				});
				return bIsFlag;
			}
		},

		/*
		 *&---------------------------------------------------------------------*
		 *&                       MESSAGE & DIALOG SECTION
		 *&---------------------------------------------------------------------*
		 */

		fnCreateValueHelpDialog: function(sId, oControl, sControlType) {
			var aColumnName = [];
			var oSearchHelpModel = {
				Title: "",
				Control: {},
				ControlType: "",
				IsMultiSelect: true,
				ColumnNames: [],
				IsDescription: true,
				IsPhone: this.getView().getModel("device").getData().system.phone
			};
			if (sId.search("vIdMultiInputPIDoc") >= 0) {
				aColumnName.push({
					Key: "Key",
					Text: this.getView().getModel("i18n").getProperty("labelPIDocument"),
					Width: "30%"
				});
				aColumnName.push({
					Key: "Key02",
					Text: this.getView().getModel("i18n").getProperty("labelPlant"),
					Width: "35%"
				});
				aColumnName.push({
					Key: "Key03",
					Text: this.getView().getModel("i18n").getProperty("labelSLOC"),
					Width: "35%"
				});
				oSearchHelpModel.Title = this.getView().getModel("i18n").getProperty("labelPIDocument");
				oSearchHelpModel.Control = oControl;
				oSearchHelpModel.ControlType = sControlType;
				oSearchHelpModel.IsMultiSelect = false;
				oSearchHelpModel.ColumnNames = aColumnName;
				oSearchHelpModel.IsDescription = false;
				this.fnGetPIDocAndOpenValueHelpDialog(oSearchHelpModel);
			} else if (sId.search("vIddMultiInputSLOC") >= 0) {
				aColumnName.push({
					Key: "Key",
					Text: this.getView().getModel("i18n").getProperty("labelSLOC"),
					Width: "30%"
				});
				aColumnName.push({
					Key: "Text",
					Text: this.getView().getModel("i18n").getProperty("labelSLOCName"),
					Width: "70%"
				});
				oSearchHelpModel.Title = this.getView().getModel("i18n").getProperty("labelSLOC");
				oSearchHelpModel.Control = oControl;
				oSearchHelpModel.ControlType = sControlType;
				oSearchHelpModel.IsMultiSelect = false;
				oSearchHelpModel.ColumnNames = aColumnName;
				oSearchHelpModel.IsDescription = false;
				this.fnGetSLOCAndOpenValueHelpDialog(oSearchHelpModel);
			}
		},

		fnOpenInputQtyDialog: function(oData) {
			if (!this.oInputQtyDialog) {
				this.oInputQtyDialog = sap.ui.xmlfragment("ZMMXE00002.popup.InputQtyDialog", this);
			}

			var oModelDialog = new JSONModel();
			oModelDialog.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);

			oModelDialog.setData([oData]);
			oModelDialog.refresh();

			this.oInputQtyDialog.setModel(this.oMsg, "i18n");
			this.oInputQtyDialog.setModel(oModelDialog, "InputQtyModel");

			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oInputQtyDialog);
			this.oInputQtyDialog.open();
		},

		fnOpenCountQtyDialog: function(oData) {
			if (!this.oCountQtyDialog) {
				this.oCountQtyDialog = sap.ui.xmlfragment("ZMMXE00002.popup.CountQtyDialog", this);
			}
			var oModelDialog = new JSONModel();
			oModelDialog.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
			oData.ScanInputQty = oData.ScanCounter;
			oModelDialog.setData([oData]);
			oModelDialog.refresh();

			this.oCountQtyDialog.setModel(this.oMsg, "i18n");
			this.oCountQtyDialog.setModel(oModelDialog, "CountQtyModel");
			this.getView().addDependent(this.oCountQtyDialog);
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.oCountQtyDialog);
			this.oCountQtyDialog.open();
		},

		fnOnConfirmMessageBoxAndCallback: function(sMessageText, fnCallback) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			MessageBox.confirm(sMessageText, {
				title: "Confirm",
				onClose: fnCallback, // return action text
				styleClass: bCompact ? "sapUiSizeCompact" : "",
				actions: [
					MessageBox.Action.YES,
					MessageBox.Action.NO
				],
				initialFocus: MessageBox.Action.OK,
				textDirection: sap.ui.core.TextDirection.Inherit // default
			});
		},

		fnCreateErrorMessageBox: function(sMessage) {
			var bCompact = !!this.getView().$().closest(".sapUiSizeCompact").length;
			sap.m.MessageBox.error(sMessage, {
				styleClass: bCompact ? "sapUiSizeCompact" : ""
			});
		},
		fnCreateTableMessageDialog: function(sTitle, aMessage, sState) {
			var oMsgModel = new JSONModel();
			oMsgModel.setData({
				ColumnType: this.getView().getModel("i18n").getProperty("labelMessageType"),
				ColumnText: this.getView().getModel("i18n").getProperty("labelMessageText"),
				MessageDetail: aMessage
			});
			oMsgModel.refresh();
			if (!this.oTableMessageDialog) {
				this.oTableMessageDialog = sap.ui.xmlfragment("ZMMXE00002" + ".popup.TableMessageDialog", this);
			}
			this.oTableMessageDialog.setTitle(sTitle);
			this.oTableMessageDialog.setState(sState);
			this.oTableMessageDialog.setModel(oMsgModel, "Message");
			this.oTableMessageDialog.open();
		},
		fnOnTableMessageDialogClose: function() {
			if (this.oTableMessageDialog.isOpen()) {
				this.oTableMessageDialog.close();
			}
		},

		/*
		 *&---------------------------------------------------------------------*
		 *&                          UTILITIES SECTION
		 *&---------------------------------------------------------------------*
		 */

		fnAfterCloseDialog: function() {
			if (this.oInputQtyDialog) {
				this.oInputQtyDialog.destroy();
				this.oInputQtyDialog = null;
			}

			if (this.oCountQtyDialog) {
				this.oCountQtyDialog.destroy();
				this.oCountQtyDialog = null;
			}
		},
		fnOpenScanBarcode: function(fnCallback) {
			BarcodeScanner.scan(
				function(oResult) {
					if (!oResult.cancelled) {
						var sBarCode = oResult.text;
						fnCallback(sBarCode);
					}
				},
				function(oError) {
					// / * handle scan error * /
				}
			);
		}

	});
});