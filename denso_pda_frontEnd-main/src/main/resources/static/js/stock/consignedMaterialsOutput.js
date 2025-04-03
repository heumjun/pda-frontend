
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as consts from "../common/constants.js";
import { pushMsg, alertWarning, confirm } from "../common/msgBox.js";
import { menuLoad } from "../common/commonMenu.js";

const consignedMaterialsOutput = function() {
	
	/**
	 * 제조사 조회
	 */
	const getComboCusCodeList = () => {
	    let params = {
	        uri : "consignedMaterialsOutput/consignedMaterialsOutput/getComboCusList",
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["cmbCusList"];
	}
	
	let grid  = new GridFactory('#grid');
	let cmbCus = input.comboBox('#cm01Cus', getComboCusCodeList(), 'cm01Code','cm01Name');

	/**
     * 그리드 초기화
     */
    const gridInit = () => {

        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');
        let columnsDefinition = [
			{binding:'delete'	,header: '삭제'	,width: 60
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					text: '<b style="color:red;">삭제</b>'
					,click: (e, ctx) => {
						let view = grid._flexCv;
						let rowIndex = ctx.row.index; // rowIndex 가져오기
					    if (rowIndex >= 0 && rowIndex < view.items.length) {
					      	  view.removeAt(rowIndex);
					    }
					}
				})
			},
            {binding:'st02Code'		,header:'품목코드'		,width:150	,dataType:'String'	,align:'left'	,visible:false},
            {binding:'st02Name'		,header:'품목명'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true},
            {binding:'st02Cus'		,header:'제조사'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true 	,visible:false},
            {binding:'st02CusName'	,header:'제조사'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true},
            {binding:'st02Qrcode'	,header:'QR코드'		,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true 	,visible:false},
			{binding:'st02Qty'		,header:'박스수량'		,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true	,isReadOnly: true},
			{binding:'st02Moq'		,header:'MOQ'		,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true	,isReadOnly: true},
			{binding:'st02Stok'		,header:'창고'		,width:150	,dataType:'String'	,align:'center'		,isReadOnly: true	,visible:false	},
			{binding:'st02Dist'		,header:'구역'		,width:150	,dataType:'String'	,align:'center'		,isReadOnly: true	,visible:false	},
			{binding:'st02Lot'		,header:'LOT번호'		,width:180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02LotSeq'	,header:'LOT SEQ'	,width:90	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Dat'		,header:'날짜'		,width:90	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Gbn'		,header:'구분'		,width:90	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Dgbn'		,header:'품목구분'		,width:90	,align:'center'		,dataType:'String'	,visible:false}
        ];
		
        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(350);
        //체크박스 컬럼 생성
        //grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');

		let st02Gbn = getCommonCodeList('E001');
		grid._flexGrid.getColumn('st02Gbn').dataMap = new wijmo.grid.DataMap(st02Gbn, 'cm05Value', 'cm05Name');
		let st02Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st02Stok').dataMap = new wijmo.grid.DataMap(st02Stok, 'cm15Code', 'cm15Name');
		let st02Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st02Dist').dataMap = new wijmo.grid.DataMap(st02Dist, 'cm16Code', 'cm16Name');

		//그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;

			let sameCode = grid._flexCv.sourceCollection.filter((c) =>
							( c.st02Company == item.st02Company && c.st02Factory == item.st02Factory && c.st02Qrcode == item.st02Qrcode));

            switch (prop) {
                case 'st02Qrcode':
                    if(wijmo.isNullOrWhiteSpace(item.st02Qrcode)) return '[QR코드]는 필수 입력 항목입니다.';
					if(sameCode.length > 1) return '[QR코드]는 중복될 수 없습니다.';
                    break;
                case 'st02Ipqty':
                    if(item.st02Qty <= 0) return '[박스수량]은 0보다 커야합니다.';
                    break;
                default:
                    return null;
            }
        }
    }
	
	/**
	 * 공통코드
	 */
	const getCommonCodeList = (commonCode) => {
	    let params = {
	        uri :"criteria/commonCode/"+commonCode+"/detail"
	    };
	   
	   let list = ajax.getAjaxSync(params);
	   
	   return list["commonCodeDetailList"];
	}
	/**
	 * 창고조회
	 */
	const getWarehouseCodeList = (code) => {
	    let params = {
	        uri : "criteria/warehouse",
	        cm15Code : code,
	        cm15Lock : 'N'
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["warehouseList"];
	}
	
	/**
	 * 구역
	 */
	const getDistrictCodeList = (code) => {
	    let params = {
	        uri : "criteria/district",
	        cm16Code : code,
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["districtList"];
	}
	
	// 바코드 스캔시 품목 검사
	const barcodeSearch = async(barcode) => {
		
		//barcode = "EK25032600091-005";
		//barcode = "3N110305-01530 2000 000000000279 G1000120250316";

        grid.disableAutoRows();
		
		let duplication = grid._flexCv.sourceCollection.filter((c) => ( c.st02Qrcode === barcode ));
		if(duplication.length != 0) {
			alertWarning('중복 항목', `중복된 항목입니다.`);
			return;
		}
		
		var st02LotSeq = "";
		var qrCode = "";
		
		if(barcode.substring(0,3) == '3N1') {
			qrCode = "";
			st02LotSeq = barcode.split(" ")[2];
		} else {
			qrCode = barcode;
			st02LotSeq = "";
		}
		
        let params = {
            uri: `consignedMaterialsOutput/consignedMaterialsOutput/getConsignedMaterialsOutput`,
			st02Qrcode : qrCode,
			st02LotSeq : st02LotSeq
        }
		
        params = {...params,...ajax.getParams('searchForm')}

		
		ajax.postAjax(params, true).then(async (data) => {
								
			if ( data != null ) {
							 
				let addRow = grid._flexCv.addNew();
				
				addRow.st02Code = data.st02Code;
				addRow.st02Name = data.st02Name;
				addRow.st02Cus = data.st02Cus;
				addRow.st02CusName = data.st02CusName;
				addRow.st02Stok = data.st02CurStok;
				addRow.st02Dist = data.st02CurDist;
				addRow.st02LotSeq = data.st02LotSeq;
				addRow.st02Lot = data.st02Lot;
				addRow.st02Qty = data.st02Qty;
				addRow.st02Ipqty = data.st02Ipqty;
				addRow.st02Qrcode = data.st02Qrcode;
				addRow.st02Moq = data.st02Moq;
				addRow.st02DefLot = data.st02DefLot;
				addRow.st02Dgbn = data.st02Dgbn;
				
				grid._flexCv.commitNew();
			} else {
				alertWarning('등록불가','품목이 없습니다.');	
			}
			
        }).catch((e)=>{
			console.debug(error);
			return;
		});

    }
	
	const save = () => {

		grid.disableAutoRows();

		/*if(!grid.gridValidation()){
            alertWarning('저장불가', '그리드 오류내역을 확인하세요.');
            return;
        }*/

		let insertList = grid.gridItemListToArray(grid._flexCv.itemsAdded);
		if(insertList.length < 1) {
			alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

		confirm("사급등록을 하시겠습니까?", "사급등록 이력이 등록됩니다.", consts.MSGBOX.QUESTION, () => {

			let params = {
                uri: `consignedMaterialsOutput/consignedMaterialsOutput`,
				cusCode : cmbCus.selectedValue,
                insertList: insertList
            };

			params = {...params,...ajax.getParams('#submitForm')};

        	ajax.postAjax(params, true).then(async (data)=>{
				$("#btnSave").hide();
	            pushMsg('사급등록 등록되었습니다.');
            }).catch((e) => {
                //console.debug(e);
            });
		});
	}
	
	const goBack = () => {
		let form = $('<form></form>');
		form.attr("method","get");
		form.attr("action","view");
		form.attr("target","_self");
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'index' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'index' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'작업 - QR 스캔' }));
		form.appendTo('body');
		form.submit();
	}
	
	const handleEvent = () => {

        gridInit();
		//barcodeSearch();

		$('#btnSave').on('click', save);
		$('#btnBack').on('click', goBack);
    }
	
	// 스캐너 값 얻기
	$(document).scannerDetection({
		onComplete: function(barcode, qty) {
			
			let matchBar = true;
			barcode = barcode.toUpperCase();
			
			// 중복체크 기능 필요
			grid._flexGrid.rows.some((row, index, array) => {
				if (!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)) {
					if(row.dataItem.st08Qrcode == barcode) {
						alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
						matchBar = false;
					}
				}
			});
			
			if ( matchBar ) {
				barcodeSearch(barcode);	
			}
			
		}
	});
	
	return {
		
       init:()=>{
			menuLoad();
			handleEvent();
       }
	   
   }
	
}();

$(() => {
    consignedMaterialsOutput.init();
});