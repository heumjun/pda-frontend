
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const partsInput = function(){
	const getCompMfList = () => {
		let params = {
	        uri : "mfr/partsInput/getCompMfList",
	        cm08Smd : 'Y',
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["compMfList"];
	};

    let grid  = new GridFactory('#grid');
	let compMf = input.comboBox('#compMf', getCompMfList(), 'cm08Code','mfDisp');
	let compMfQty = input.number('#compMfQty',1,0,999999,'G10');

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
            {binding:'st01Qrcode'	,header:'QR코드'		,width:150	,dataType:'String'	,align:'center' 	,isReadOnly: true},
			{binding:'st01Qty'		,header:'투입수량'		,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true ,isReadOnly: true},
            {binding:'st01Stok'		,header:'창고'		,width:130	,dataType:'String'	,align:'left'		,isReadOnly: true},
			{binding:'st01Distric'	,header:'구역'		,width:130	,dataType:'String'	,align:'left'		,isReadOnly: true},

			{binding:'st01Lot'		,header: 'LOT번호'	,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st01LotSeq'	,header: 'LOT SEQ'	,width: 90	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st01Code'		,header: '품목코드'	,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st01Unt'		,header: 'UNT'		,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'cm08Cus'		,header: 'CUS'		,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'cm08Moq'		,header: 'MOQ'		,width: 180	,align:'center'		,dataType:'String'	,visible:false},
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(450);
        //체크박스 컬럼 생성
        //grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');

		let st01Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st01Stok').dataMap = new wijmo.grid.DataMap(st01Stok, 'cm15Code', 'cm15Name');
		let st01Distric = getDistrictCodeList();
		grid._flexGrid.getColumn('st01Distric').dataMap = new wijmo.grid.DataMap(st01Distric, 'cm16Code', 'cm16Name');

		//그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;

			let sameCode = grid._flexCv.sourceCollection.filter((c) =>
							( c.st01Company == item.st01Company && c.st01Factory == item.st01Factory && c.st01Code == item.st01Code && c.st01Lot == item.st01Lot && c.st01Qrcode == item.st01Qrcode));

            switch (prop) {
                case 'st01Qrcode':
                    if(wijmo.isNullOrWhiteSpace(item.st01Qrcode)) return '[QR코드]는 필수 입력 항목입니다.';
					if(sameCode.length > 1) return '[QR코드]는 중복될 수 없습니다.';
                    break;
                case 'st01Qty':
                    if(item.st01Qty <= 0) return '[박스수량]은 0보다 커야합니다.';
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
	const bacodeSearch = async(barcode) => {

        grid.disableAutoRows();

		var beforeBar = barcode;
        // 트레스 라벨 앞부분 짜르기
        barcode = barcode.replaceAll("3N1", "");
        // 트레스 라벨을 공백으로 자름
        barcode = barcode.split(" ");
        // 품번 가져오기
        var code = barcode[0];
		var lot = barcode[3];
		var lotSeq = barcode[2];

        let params = {
            uri: `mfr/partsInput/getPartsInputRequestInfo`,
			st01Code : code,
			st01Lot : lot,
			st01LotSeq : lotSeq,
			st01Qrcode : beforeBar
        }
        params = {...params,...ajax.getParams('searchForm')}

        try {
            let {partsInputRequestInfo} = await ajax.getAjax(params, true);

			let temp = grid._flexCv.sourceCollection.filter((c) => ( c.st01Qrcode === partsInputRequestInfo.st01Qrcode ));
			if(temp.length != 0){
				alertWarning('중복 항목',`중복된 항목입니다.`);
				return;
			}

			let addRow = grid._flexCv.addNew();
			addRow.cm08Name = partsInputRequestInfo.cm08Name;
			addRow.st01Qrcode = partsInputRequestInfo.st01Qrcode;
			addRow.st01Qty = partsInputRequestInfo.st01Qty;
			addRow.st01Stok = partsInputRequestInfo.st01Stok;
			addRow.st01Distric = partsInputRequestInfo.st01Distric;
			addRow.st01Lot = partsInputRequestInfo.st01Lot;
			addRow.st01LotSeq = partsInputRequestInfo.st01LotSeq;
			addRow.st01Code = partsInputRequestInfo.st01Code;
			addRow.st01Unt = partsInputRequestInfo.st01Unt;
			addRow.cm08Cus = partsInputRequestInfo.cm08Cus;
			addRow.cm08Moq = partsInputRequestInfo.cm08Moq;

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
                uri: `mfr/partsInput`,
				compMfCode: compMf.selectedValue,
				compMfQty: compMfQty.value,
                insertList: insertList
            };

			params = {...params,...ajax.getParams('#submitForm')};

        	ajax.postAjax(params, true).then(async (data)=>{
	            $(".text-bg-danger").text("출고완료");
				$("#btnSave").hide();
	            pushMsg('출고이력이 등록되었습니다.');
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

		$('#btnSave').on('click', saveOutput);
		$('#btnBack').on('click', goBack);

		//bacodeSearch("3N1A00102 17 000000000054 G1000120250227");
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
            handleEvent();
        }
    }
}();


$(()=>{
    partsInput.init();

});
