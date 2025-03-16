
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const partsInput = function(){

    let grid  = new GridFactory('#grid');
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
            {binding:'cm08Name'		,header:'품목명'		,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true},
            {binding:'st02Qrcode'	,header:'QR코드'		,width:150	,dataType:'String'	,align:'center'},
			{binding:'st02Ipqty'	,header:'투입수량'		,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true},
			{binding:'st02Status'	,header:'상태'		,width:130	,dataType:'Number'	,align:'center', isReadOnly:true},
            {binding:'st02Stok'		,header:'창고'		,width:130	,dataType:'String'	,align:'left'},
			{binding:'st02Dist'		,header:'구역'		,width:130	,dataType:'String'	,align:'left'},

			{binding:'st02Lot'		,header: 'LOT번호'	,width: 180	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02LotSeq'	,header: 'LOT SEQ'	,width: 90	,align:'center'		,dataType:'String'	,visible:false},
			{binding:'st02Code'		,header: '품목코드'	,width: 180	,align:'center'		,dataType:'String'	,visible:false},
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(550);
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
                case 'st03Qr':
                    if(wijmo.isNullOrWhiteSpace(item.st03Qr)) return '[QR코드]는 필수 입력 항목입니다.';
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
            uri: `partsInput/partsInput/getPartsInputRequestInfo`,
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
                uri: `partsInput/partsInput`,
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

        gridInit();

		$('#btnSave').on('click', saveOutput);
		$('#btnBack').on('click', goBack);

		$("#btnTest1").on('click',function(){
			bacodeSearch("CO25031400001-001")
		});
		$("#btnTest2").on('click',function(){
			bacodeSearch("CO25031400001-005")
		});
		$("#btnTest3").on('click',function(){
			bacodeSearch("QQ25031000001-004")
		});
    }

	// 스캐너 값 얻기
	$(document).scannerDetection({
		/*timeBeforeScanTest: 50, // wait for the next character for upto 200ms
		startChar: [16, 45, 189], // Prefix character for the cabled scanner (OPL6845R)
		changeChar: [189], // Prefix character for the cabled scanner (OPL6845R)*/
		onComplete: function(barcode, qty) {
			let matchBar = false;
			//barcode = barcode.toUpperCase();
			// 길이에 따라 QR코드가 구분이 되어야한다. 현재는 트레스라벨만 찍음 -> 추후 QR, 트레스 두 개 찍음
			// barcode값으로 가져올 수 있는 값 - 품번, 품목구분 가져올 수 있다.




			/*if(barcode.substring(0, 3) == "3N1"){

				var beforeBar = barcode;
	            // 트레스 라벨 앞부분 짜르기
	            barcode = barcode.replaceAll("3N1", "");
	            // 트레스 라벨을 공백으로 자름
	            barcode = barcode.split(" ");
	            // 품번 가져오기
	            var code = barcode[0];

				grid._flexGrid.rows.some((row,index,array) => {
					if (!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)) {
						// 로우에 있는 품목코드와 바코드의 품목코드, 로우에 있는 품목구분과 바코드의 품목구분 비교
						// QR코드가 비어있느 항목에 값이 들어가도록 설정
						if(row.dataItem.cm08Code == code) {
							if(wijmo.isNullOrWhiteSpace(row.dataItem.st03Qr) || wijmo.isUndefined(row.dataItem.st03Qr)){
								matchBar = true;
								//grid._flexGrid.setCellData(row.index, 'select', true);

								// 중복체크 기능 필요
								for(var i=0; i < grid._flexGrid.rows.length; i++){
									if(!wijmo.isUndefined(grid._flexGrid.getCellData(i, 'st03Qr'))){
										if(beforeBar == grid._flexGrid.getCellData(i, 'st03Qr')){
											grid._flexGrid.setCellData(index, 'st03Qr', "");
											alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
											return ;
										}
									}
								}

								var lot = barcode[3];
								var lotSeq = barcode[2];

								grid._flexGrid.setCellData(index, 'st03Lot', lot);
								grid._flexGrid.setCellData(index, 'st03LotSeq', lotSeq);
								grid._flexGrid.setCellData(index, 'st03Qr', beforeBar);
								// 창고, 구역 가져와서 넣어주고 return true 해야한다.
								getStokDistInfo(index, code, lot, lotSeq);
								return true;
							}
						}
					}
				});

				// 바코드의 lot와 row의 lot가 매치가 되지 않았을 경우
				if(matchBar == false) {
					alertWarning("작업불가", "리딩한 바코드와 일치하는 LOT번호가 존재하지 않습니다.")
					return ;
				}
			// SCM 라벨을 조회 시 17자리
			} else {
				// SCM QR코드 값으로 입고테이블을 검색해서 입고 데이터를 가져와서 뿌려줘야함.
				let params ={
					uri :"warehousing/warehousing/stock/getInputInfo",
					barcode : barcode
				};

				ajax.getAjax(params, false).then(data => {

					let inputInfo = data["inputInfo"];

					if(inputInfo != null) {
						grid._flexGrid.rows.some((row,index,array)=>{
							if(!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)){
								if(row.dataItem.cm08Code == inputInfo.st02Code && barcode == inputInfo.st02Qrcode){
									if(wijmo.isNullOrWhiteSpace(row.dataItem.st03Qr) || wijmo.isUndefined(row.dataItem.st03Qr)){
										matchBar = true;
										for(var i=0; i<grid._flexGrid.rows.length; i++){
											if(!wijmo.isUndefined(grid._flexGrid.getCellData(i,'st03Qr'))){
												if(barcode == grid._flexGrid.getCellData(i,'st03Qr')){
													grid._flexGrid.setCellData(index, 'st03Qr', '');
													alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
													return;
												}
											}
										}

										grid._flexGrid.setCellData(index, 'st03Lot', inputInfo.st02Lot);
										grid._flexGrid.setCellData(index, 'st03LotSeq', inputInfo.st02LotSeq);
										grid._flexGrid.setCellData(index, 'st03Qr', inputInfo.st02Qrcode);
										grid._flexGrid.setCellData(index, 'st03Stok', inputInfo.st02Stok);
										grid._flexGrid.setCellData(index, 'st03Dist', inputInfo.st02Dist);

										return true;
									}
								}
							}
						})

						// 바코드의 lot와 row의 lot가 매치가 되지 않았을 경우
					  	if(matchBar == false){
							 alertWarning("작업불가", "리딩한 바코드와 일치하는 LOT번호가 존재하지 않습니다.");
						 	return ;
					  	}

					// 품번과 일치하지 않는 경우
					} else {
						alertWarning('작업 불가', '리딩한 QR코드의 LOT가 존재하지않거나\n 재고가 존재하지 않습니다.');
						return ;
					}


				});
			}*/
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
