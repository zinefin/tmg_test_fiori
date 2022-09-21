/*
----------------------------------------------------------------------------------*
*  App Name     : ZMMXE00002													  *
*  File Name    : SearchHelp.js													  *
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

jQuery.sap.declare("ZMMXE00002.util.SearchHelp");
var _aFilter = [];
var _oControl = null;
var _sControlType = "";
var _oModelValueHelp = new sap.ui.model.json.JSONModel();
var _oColModel = new sap.ui.model.json.JSONModel();

var _fnCallBackOK = "";
var _fnCallBackCancel = "";
var _iCountBasic = 0;
var _self = null;
var _oDialogValueHelp = null;
var _aData = [];
var _bIsDescription = false;
var _bIsPhone = false;
var _aColumnName = [];
ZMMXE00002.util.SearchHelp = {

	fnOnInitDialog: function(sTitle, oControl, sControlType, bMultiSelect, aData, aColumnName, isDescription, bIsPhone, that, fnCallBackOK,
		fnCallBackCancel) {

		_self = that;
		_aData = aData;
		_oDialogValueHelp = null;
		_oControl = oControl;
		_sControlType = sControlType;
		_bIsPhone = bIsPhone;
		_aColumnName = JSON.parse(JSON.stringify(aColumnName));
		_aColumnName.map(function(oItem) {
			// Delete all key not search
			delete oItem.Width;
		});
		_aFilter = this.fnOnSetModelColumnAndFilter(aColumnName);
		_oModelValueHelp.setData(aData);
		_oModelValueHelp.refresh();
		_fnCallBackOK = fnCallBackOK;
		_fnCallBackCancel = fnCallBackCancel;
		sTitle = sTitle + " ( " + aData.length + " )";
		var sValue = "";
		if (_sControlType === "Button") {
			sValue = "";
		} else {
			sValue = _oControl.getValue();
		}
		_oDialogValueHelp = this.fnOnCreateDialogSearchHelp(sTitle, sValue, _aFilter, bMultiSelect);
		_bIsDescription = isDescription;
		return _oDialogValueHelp;
	},

	fnOnSetModelColumnAndFilter: function(aText) {
		var aColumn = [];
		var aFilter = [];
		aText.map(function(oItem) {
			aColumn.push({
				label: oItem.Text,
				template: oItem.Key,
				width: oItem.Width
			});
			aFilter.push(
				new sap.ui.comp.filterbar.FilterGroupItem({
					groupTitle: "foo",
					groupName: "gn1",
					name: oItem.Text,
					label: oItem.Text,
					control: new sap.m.Input()
				})
			);
		});
		_oColModel.setData({
			cols: aColumn
		});
		_oColModel.refresh();

		return aFilter;
	},

	fnOnCreateDialogSearchHelp: function(sTitle, sValueLocal, aFilter, bMultiSelect) {
		var oDialogValueHelp = sap.ui.xmlfragment("ZMMXE00002.popup.ValueHelpDialog", this);
		var that = this;
		_self.getView().addDependent(oDialogValueHelp);
		oDialogValueHelp.getTable().setModel(_oColModel, "columns");
		oDialogValueHelp.getTable().setModel(_oModelValueHelp);
		if (oDialogValueHelp.getTable().bindRows) {
			oDialogValueHelp.getTable().bindRows("/");
		}
		if (oDialogValueHelp.getTable().bindItems) {
			var oTable = oDialogValueHelp.getTable();
			// oTable.setRememberSelections(true);
			oTable.bindAggregation("items", "/", function(sId, oContext) {
				var aCols = oTable.getModel("columns").getData().cols;
				return new sap.m.ColumnListItem({
					cells: aCols.map(function(column) {
						var colname = column.template;
						return new sap.m.Label({
							text: "{" + colname + "}"
						});
					})
				});
			});
		}
		oDialogValueHelp.setBasicSearchText(sValueLocal);
		oDialogValueHelp.setTitle(sTitle);
		oDialogValueHelp.setSupportMultiselect(bMultiSelect);
		oDialogValueHelp.attachUpdateSelection(function(oEvent) {
			console.log(oEvent);
		});

		if (_sControlType === "Button") {
			// Code Here
		} else {

			var aTokensNew = [];
			if (bMultiSelect) {
				var aTokensOld = _oControl.getTokens();
				for (var i = 0; i < aTokensOld.length; i++) {
					aTokensNew.push(new sap.m.Token({
						text: aTokensOld[i].getKey(),
						key: aTokensOld[i].getKey()
					}));
				}
			} else {
				aTokensNew.push(new sap.m.Token({
					text: sValueLocal,
					key: sValueLocal
				}));
				if (!_bIsPhone) {
					oDialogValueHelp.getTable().setSelectionBehavior("RowOnly");
				}

			}
			// oDialogValueHelp.setTokens(_oControl.getTokens());
		}

		var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
			advancedMode: true,
			filterBarExpanded: false,
			showGoOnFB: !sap.ui.Device.system.phone,
			filterMode: false,
			filterGroupItems: aFilter,
			search: function(oEvent) {
				if (!_bIsPhone) {
					//because cloud version(SCP), phone call this function and basic search function both

					var aValueKey = [];
					var aColumnKey = [];
					_aColumnName.map(function(oItem, sIndex) {
						var sValue = "";
						if (oEvent.getParameter("selectionSet")[sIndex].getValue()) {
							sValue = oEvent.getParameter("selectionSet")[sIndex].getValue().toLowerCase().trim();
							aValueKey.push(sValue);
							aColumnKey.push(oItem);
						}
					});

					var aItems = [];
					aItems = JSON.parse(JSON.stringify(_aData));

					var aItemsSearch = [];
					aItemsSearch = that.fnOnSearchByGoBTN(aItems, aColumnKey, aValueKey);

					_oModelValueHelp.setData(aItemsSearch);
					_oModelValueHelp.refresh();
					oDialogValueHelp.update();
				} else if (_iCountBasic === 0) {

					var aValueKey = [];
					var aColumnKey = [];

					_aColumnName.map(function(oItem, sIndex) {
						var sValue = "";
						if (oEvent.getParameter("selectionSet")[sIndex].getValue()) {
							sValue = oEvent.getParameter("selectionSet")[sIndex].getValue().toLowerCase().trim();
							aValueKey.push(sValue);
							aColumnKey.push(oItem);
						}
					});

					var sValue = oEvent.getSource()._oBasicSearchField.getValue();
					if (sValue) {
						sValue = sValue.toLowerCase().trim();
						aValueKey.push(sValue);
						aColumnKey = JSON.parse(JSON.stringify(_aColumnName));
					}

					var aItems = [];
					aItems = JSON.parse(JSON.stringify(_aData));
					var aItemsSearch = [];
					aItemsSearch = that.fnOnSearchByGoBTN(aItems, aColumnKey, aValueKey);
					_oModelValueHelp.setData(aItemsSearch);
					_oModelValueHelp.refresh();
					oDialogValueHelp.update();
				} else {
					_iCountBasic = 0;
				}
			}
		});

		if (oFilterBar.setBasicSearch) {
			oFilterBar.setBasicSearch(new sap.m.SearchField({
				showSearchButton: sap.ui.Device.system.phone,
				placeholder: "Search",
				search: function(oEvent) {
					_iCountBasic += 1;
					var aItems = [];
					var aItemsSearch = [];
					var sValue = oEvent.getParameter("query").toLowerCase();
					if (sValue) {
						sValue = sValue.trim();
					}
					aItems = JSON.parse(JSON.stringify(_aData));
					aItemsSearch = that.fnOnSearchByBasicSearch(aItems, _aColumnName, sValue);
					_oModelValueHelp.setData(aItemsSearch);
					_oModelValueHelp.refresh();
					oDialogValueHelp.update();
					if (_bIsPhone) {
						// oDialogValueHelp.getTable().removeSelections();
						// updateSelection
						// oDialogValueHelp.updateSelection();
					}
				}
			}));
		}
		oDialogValueHelp.setFilterBar(oFilterBar);
		jQuery.sap.syncStyleClass("sapUiSizeCompact", _self.getView(), oDialogValueHelp);
		oDialogValueHelp.update();
		return oDialogValueHelp;
	},

	fnOnSelectionUpdate: function(oEvent) {
		console.log(oEvent);
	},

	fnOnOKDialogSearchHelp: function(oControlEvent) {
		if (_sControlType === "Button") {
			if (_fnCallBackOK) {
				var aSelectedData = [],
					aToken = [];

				aToken = oControlEvent.getParameter("tokens");
				if (aToken.length > 0) {
					aToken.map(function(oToken) {
						var aNewItem = _aData.filter(function(oItem) {
							return oItem.Key === oToken.getKey();
						});

						aSelectedData = aSelectedData.concat(aNewItem);
					});
				}

				_fnCallBackOK(aSelectedData);
				_oDialogValueHelp.close();
			}
		} else {
			_oControl.setValue("");
			_oControl.setTooltip("");
			//_oControl.setTokens([]);
			if (_oDialogValueHelp.getSupportMultiselect()) {
				var aToken = [];
				aToken = oControlEvent.getParameter("tokens");
				var aTokensNew = [];
				var aTokensOther = [];
				var i = 0;
				var oToken = {};
				if (_bIsDescription) {
					for (i = 0; i < aToken.length; i++) {
						if (_bIsPhone) {
							oToken = new sap.m.Token({
								text: aToken[i].getKey(),
								key: aToken[i].getKey()
							});
							aTokensNew.push(oToken);
						} else {
							if (_oDialogValueHelp.getTable().getModel().oData[_oDialogValueHelp.getTable().getSelectedIndices()[i]]) {
								oToken = new sap.m.Token({
									text: _oDialogValueHelp.getTable().getModel().oData[_oDialogValueHelp.getTable().getSelectedIndices()[i]].Text,
									key: _oDialogValueHelp.getTable().getModel().oData[_oDialogValueHelp.getTable().getSelectedIndices()[i]].Text
								});
								oToken.setTooltip(aToken[i].getKey());
								aTokensNew.push(oToken);
							}
						}
					}
				} else {
					for (i = 0; i < aToken.length; i++) {
						oToken = new sap.m.Token({
							text: aToken[i].getKey(),
							key: aToken[i].getKey()
						});
						var aResult = [];
						aResult = _aData.filter(function(oItem) {
							return oItem.Key === aToken[i].getKey();
						});
						if (aResult.length > 0) {
							oToken.setTooltip(aResult[0].Text);
						}
						aTokensNew.push(oToken);
					}
				}
				_oControl.setTokens(aTokensNew);
			} else if (_bIsDescription) {
				_oControl.setTooltip(oControlEvent.getParameter("tokens")[0].getKey());
				_oControl.setValue(_oDialogValueHelp.getTable().getModel().oData[_oDialogValueHelp.getTable().getSelectedIndex()].Text);
			} else {

				//_oControl.setValue(oControlEvent.getParameter("tokens")[0].getKey());

			}
			if (_fnCallBackOK) {
				if (oControlEvent.getParameter("tokens").length > 0) {
					//_fnCallBackOK(oControlEvent.getParameter("tokens")[0].getKey());
					if (_bIsPhone) {
						//only single select
						_fnCallBackOK(_oDialogValueHelp.getTable().getModel().oData[_oDialogValueHelp.getTable().getSelectedContextPaths()[0].substr(1)]);

					} else {
						_fnCallBackOK(_oDialogValueHelp.getTable().getModel().oData[_oDialogValueHelp.getTable().getSelectedIndex()]);
					}

				}
				_oDialogValueHelp.close();
			}
		}
	},

	fnOnCloseDialogSearchHelp: function() {
		if (_fnCallBackCancel) {
			_fnCallBackCancel();
		}
		_oDialogValueHelp.close();
	},

	fnOnAfterCloseDialogSearchHelp: function() {
		_oDialogValueHelp.destroy();
	},

	fnOnSearchByGoBTN: function(aItemsLocal, aColumnName, aValueKey) {
		var aItemsSearchLocal = [];
		var bFlagFalse = false;
		var bFlag = false;
		var aFlag = [];
		for (var i = 0; i < aItemsLocal.length; i++) {
			var bFlagFalse = false;
			var bFlag = false;
			var aFlag = [];
			aValueKey.map(function(sText) {
				if (sText) {
					bFlag = aColumnName.filter(function(oColumn) {
						// return aItemsLocal[i][oColumn.Key].toLowerCase() === sText;
						return aItemsLocal[i][oColumn.Key].toLowerCase().indexOf(sText.toLowerCase()) !== -1;
					}).length > 0;
				} else {
					bFlag = true;
				}
				aFlag.push(bFlag);
			});
			bFlagFalse = aFlag.filter(function(oItem) {
				return oItem === false;
			}).length > 0;
			if (!bFlagFalse) {
				aItemsSearchLocal.push(aItemsLocal[i]);
			}
		}
		return aItemsSearchLocal;
	},

	fnOnSearchByBasicSearch: function(aItemsLocal, aColumnName, sValue) {
		// for (var i = aItemsLocal.length - 1; i >= 0; i--) {
		// var bFlag = aItemsLocal[i].Key.toLowerCase().indexOf(sValue) !== -1;
		// var bFlagDes = aItemsLocal[i].Text.toLowerCase().indexOf(sValue) !== -1;
		// if (!bFlag && !bFlagDes) {
		// 	aItemsLocal.splice(i, 1);
		// }
		// }
		if (sValue) {
			var aItemsSearchLocal = [];
			var bFlagFalse = false;
			var bFlag = false;
			var aFlag = [];
			for (var i = 0; i < aItemsLocal.length; i++) {
				var bFlagFalse = false;
				var bFlag = false;
				var aFlag = [];
				bFlag = aColumnName.filter(function(oColumn) {
					// return aItemsLocal[i][oColumn.Key].toLowerCase() === sValue;
					return aItemsLocal[i][oColumn.Key].toLowerCase().indexOf(sValue.toLowerCase()) !== -1;
				}).length > 0;
				aFlag.push(bFlag);
				bFlagFalse = aFlag.filter(function(oItem) {
					return oItem === false;
				}).length > 0;
				if (!bFlagFalse) {
					aItemsSearchLocal.push(aItemsLocal[i]);
				}
			}
			return aItemsSearchLocal;
		} else {
			return aItemsLocal;
		}
	}

};