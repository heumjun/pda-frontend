
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";
import { menuLoad } from "../common/commonMenu.js";

const partsInput = function(){
	const getCompMfList = () => {
		let params = {
	        uri : "smd/partsInput/getCompMfList",
	        cm08Smd : 'Y',
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["compMfList"];
	};
	
	const getCompLineList = () => {
		let params = {
	        uri : "lotFault/lotFault/getComboLineList"
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["comboLineList"];
	};

    let grid  = new GridFactory('#grid');
	let compMf = input.comboBox('#compMf', getCompMfList(), 'cm08Code','mfDisp');
	let compMfQty = input.number('#compMfQty',1,0,999999,'G10');
	let compMfLine = input.comboBox('#compMfLine', getCompLineList(), 'lineCode','lineNm');
	

    /**
     * 그리드 초기화
     */
    const gridInit = () => {

        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');
        let columnsDefinition = [
			{binding:'delete'	,header: '삭제'	,width: 80
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					text: '<b>삭제</b>'
					,click: (e, ctx) => {
						let view = grid._flexCv;
						let rowIndex = ctx.row.index; // rowIndex 가져오기
					    if (rowIndex >= 0 && rowIndex < view.items.length) {
					      	  view.removeAt(rowIndex);
					    }
					}
				})
			},
            {binding:'cm08Name'		,header:'품목명'		,width:150	,dataType:'String'	,align:'left'		,isReadOnly: true},
            {binding:'st02Qrcode'	,header:'QR코드'		,width:150	,dataType:'String'	,align:'center' 	,isReadOnly: true},
			{binding:'st02Ipqty'	,header:'투입수량'		,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true},
			{binding:'st02Status'	,header:'상태'		,width:130	,dataType:'Number'	,align:'center'		,isReadOnly:true},
            {binding:'st02Stok'		,header:'창고'		,width:130	,dataType:'String'	,align:'left'		,isReadOnly: true},
			{binding:'st02Dist'		,header:'구역'		,width:130	,dataType:'String'	,align:'left'		,isReadOnly: true},

			{binding:'st02Lot'		,header: 'LOT번호'	,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02LotSeq'	,header: 'LOT SEQ'	,width: 90	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Code'		,header: '품목코드'	,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Gbn'		,header: 'GBN'		,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Ipunt'	,header: 'IPUNT'	,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Line'		,header: 'Line'		,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Moq'		,header: 'Moq'		,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Cus'		,header: 'Cus'		,width: 180	,align:'center'		,dataType:'String'	,visible:false},
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(450);
        //체크박스 컬럼 생성
        //grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');

		let st02Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st02Stok').dataMap = new wijmo.grid.DataMap(st02Stok, 'cm15Code', 'cm15Name');
		let st02Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st02Dist').dataMap = new wijmo.grid.DataMap(st02Dist, 'cm16Code', 'cm16Name');

		//그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;

			let sameCode = grid._flexCv.sourceCollection.filter((c) =>
							( c.st02Company == item.st02Company && c.st02Factory == item.st02Factory && c.st02Code == item.st02Code && c.st02Lot == item.st02Lot && c.st02Qrcode == item.st03Qrcode));

            switch (prop) {
                case 'st02Qrcode':
                    if(wijmo.isNullOrWhiteSpace(item.st02Qrcode)) return '[QR코드]는 필수 입력 항목입니다.';
					if(sameCode.length > 1) return '[QR코드]는 중복될 수 없습니다.';
                    break;
                case 'st02Ipqty':
                    if(item.st02Ipqty <= 0) return '[박스수량]은 0보다 커야합니다.';
                    break;
                default:
                    return null;
            }
        }

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
	const bacodeSearch = async(bacode) => {

        grid.disableAutoRows();
		
		/*let addRow = grid._flexCv.addNew();
		addRow.cm08Name = "fdsfa";
		addRow.st02Qr = "QQ25031000001-001";
		addRow.st02Qty = 3;
		addRow.st02Status = item.mf14Code;
		addRow.st02Stok = item.cm08Name;
		addRow.st02Dist = item.cm08Gbn;

		addRow.st03Stok = "01";
		addRow.st03Dist = "001";

		grid._flexCv.commitNew();*/

        let params = {
            uri: `smd/partsInput/getPartsInputRequestInfo`,
			st02Qrcode : bacode
        }
        params = {...params,...ajax.getParams('searchForm')}

        try {
            let {partsInputRequestInfo} = await ajax.getAjax(params, true);

			let temp = grid._flexCv.sourceCollection.filter((c) => ( c.st02Qrcode === partsInputRequestInfo.st02Qrcode ));
			if(temp.length != 0){
				alertWarning('중복 항목',`중복된 항목입니다.`);
				return;
			}

			let addRow = grid._flexCv.addNew();
			addRow.cm08Name = partsInputRequestInfo.cm08Name;
			addRow.st02Qrcode = partsInputRequestInfo.st02Qrcode;
			addRow.st02Ipqty = partsInputRequestInfo.st02Ipqty;
			addRow.st02Status = partsInputRequestInfo.st02Status;
			addRow.st02Stok = partsInputRequestInfo.st02Stok;
			addRow.st02Dist = partsInputRequestInfo.st02Dist;

			addRow.st02Lot = partsInputRequestInfo.st02Lot;
			addRow.st02LotSeq = partsInputRequestInfo.st02LotSeq;
			addRow.st02Code = partsInputRequestInfo.st02Code;

			addRow.st02Gbn = partsInputRequestInfo.st02Gbn;
			addRow.st02Ipunt = partsInputRequestInfo.st02Ipunt;
			addRow.st02Line = partsInputRequestInfo.st02Line;
			addRow.st02Moq = partsInputRequestInfo.st02Moq;
			addRow.st02Cus = partsInputRequestInfo.st02Cus;

			grid._flexCv.commitNew();

        } catch(error) {
            console.debug(error);
            return;
        }

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

	const saveOutput = () => {

		grid.disableAutoRows();
		
		alert(compMfLine.value);

		if(!grid.gridValidation()){
            alertWarning('저장불가', '그리드 오류내역을 확인하세요.');
            return;
        }

		let insertList = grid.gridItemListToArray(grid._flexCv.itemsAdded);
		let updateList = grid.gridItemListToArray(grid._flexCv.itemsEdited);
		if(insertList.length < 1 && updateList.length < 1) {
			alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

		confirm("부품투입을 등록하시겠습니까?", "부품투입 이력이 등록됩니다.", consts.MSGBOX.QUESTION, () => {

			let params = {
                uri: `smd/partsInput`,
				compMfCode: compMf.selectedValue,
				compMfQty: compMfQty.value,
				compMfLine: compMfLine.selectedValue,
                insertList: insertList
            };

			params = {...params,...ajax.getParams('#submitForm')};

        	ajax.postAjax(params, true).then(async (data)=>{
	            $(".text-bg-danger").text("부품투입 완료");
				$("#btnSave").hide();
	            pushMsg('부품투입이 완료되었습니다.');
            }).catch((e)=>{
                console.debug(e);
            });
		});
	}

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = () => {
		compMfQty.value = 24;
        gridInit();
		
		//bacodeSearch("3N110301-00180 1000 000000000278 G1000120250316");

		$('#btnSave').on('click', saveOutput);
		$('#btnBack').on('click', goBack);
    }

	// 스캐너 값 얻기
	$(document).scannerDetection({
		/*timeBeforeScanTest: 50, // wait for the next character for upto 200ms
		startChar: [16, 45, 189], // Prefix character for the cabled scanner (OPL6845R)
		changeChar: [189], // Prefix character for the cabled scanner (OPL6845R)*/
		onComplete: function(barcode, qty) {
			let matchBar = false;
			barcode = barcode.toUpperCase();
			// 길이에 따라 QR코드가 구분이 되어야한다. 현재는 트레스라벨만 찍음 -> 추후 QR, 트레스 두 개 찍음
			// barcode값으로 가져올 수 있는 값 - 품번, 품목구분 가져올 수 있다.
			bacodeSearch(barcode);
		}
	});

	const getStokDistInfo = async (index, code, lot, lotSeq)=>{
		let params = {
			uri : 'output/getStokDist',
			st03Code : code,
			st03Lot : lot,
			st03LotSeq : lotSeq
		};



		await ajax.getAjax(params, true).then(async (data) => {
			let stokDistInfo = data["stokDistInfo"];

			if(stokDistInfo != null) {
				grid._flexGrid.setCellData(index, 'st03Stok', stokDistInfo.st01Stok);
				grid._flexGrid.setCellData(index, 'st03Dist', stokDistInfo.st01District);
			}
		});
	}

    return{
        init:()=>{
			menuLoad();
            handleEvent();
        }
    }
}();


$(()=>{
    partsInput.init();

});
