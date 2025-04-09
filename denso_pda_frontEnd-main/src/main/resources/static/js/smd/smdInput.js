
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";
import { menuLoad } from "../common/commonMenu.js";

const smdInput = function(){
	
	const getComboLineList = () => {
		let params = {
	        uri : "lotFault/lotFault/getComboLineList"
	    };

	    let list = ajax.getAjaxSync(params);

	    if(list === undefined) return null;
	    return list["comboLineList"];
	};
	
    let grid  = new GridFactory('#grid');
	let mf13LineCode = input.comboBox('#mf13LineCode', getComboLineList(), 'lineCode','lineNm');
    /**
     * 그리드 초기화
     */
    const gridInit = () => {

        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');
        let columnsDefinition = [
			{binding: 'mf14Company'	,header:'회사'			,width:100		,align:'center'		,dataType:'String'		,visible:false},
			{binding: 'mf14Factory'	,header:'공장'			,width:100		,align:'center'		,dataType:'String'		,visible:false},
			{binding: 'mf14No'		,header:'출고완료번호'		,width:150		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'st02Code'	,header:'품번'			,width:120		,align:'center'		,dataType:'String'		,isReadOnly:true		},
			{binding: 'cm08Name'	,header:'품명'			,width:200		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'st02Qrcode'	,header:'QR코드'			,width:200		,align:'center'		,dataType:'String'},
			{binding: 'st02Ipqty'	,header:'박스수량'			,width:100		,align:'center'		,dataType:'Number'		,isReadOnly:true},
			{binding: 'cm08Dgbn'	,header:'라벨정보구분'		,width:100		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'cm08Gbn'		,header:'품목구분'			,width:100		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'st02Lot'		,header:'LOT번호'			,width:200		,align:'center'		,dataType:'String'		,isRequired:false	,isReadOnly:true		,visible:false},
			{binding: 'st02LotSeq'	,header:'LOT SEQ'		,width:200		,align:'center'		,dataType:'String'		,isRequired:false	,isReadOnly:true		,visible:false},
			{binding: 'st02Moq'		,header:'MOQ'			,width:200		,align: 'center'	,dataType:'Number'		,isRequired:false	,visible:false},
			{binding: 'st02Ipunt'	,header:'출고단위'			,width:100		,align:'center'		,dataType:'String'		,isRequired:false	,visible:false},
			{binding: 'st02Stok'	,header:'창고'			,width:100		,align:'center'		,dataType:'String'		,isRequired:false	,isReadOnly:true},
			{binding: 'st02Dist'	,header:'구역'			,width:100		,align:'center'		,dataType:'String'		,isRequired:false	,isReadOnly:true},
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(450);
        grid.optionPanel('#grid-option');

		let cm08Gbn = getCommonCodeList('G001');
		grid._flexGrid.getColumn('cm08Gbn').dataMap = new wijmo.grid.DataMap(cm08Gbn, 'cm05Value', 'cm05Name');
		let st02Ipunt = getCommonCodeList('LU01');
		grid._flexGrid.getColumn('st02Ipunt').dataMap = new wijmo.grid.DataMap(st02Ipunt, 'cm05Value', 'cm05Name');
		let st02Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st02Stok').dataMap = new wijmo.grid.DataMap(st02Stok, 'cm15Code', 'cm15Name');
		let st02Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st02Dist').dataMap = new wijmo.grid.DataMap(st02Dist, 'cm16Code', 'cm16Name');

		//그리드 오류체크
        grid._flexCv.getError = (item,prop) => {
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'st02Lot':
                    if(wijmo.isNullOrWhiteSpace(item.st02Lot)) return '[LOT번호]는 필수 입력 항목입니다.';
                    break;
				case 'st02Qrcode':
                    if(wijmo.isNullOrWhiteSpace(item.st02Qrcode)) return '[QR코드]는 필수 입력 항목입니다.';
                    break;	
				case 'st02Stok':
                    if(wijmo.isNullOrWhiteSpace(item.st02Stok)) return '[창고]는 필수 입력 항목입니다.';
                    break;	
				case 'st02Dist':
                    if(wijmo.isNullOrWhiteSpace(item.st02Dist)) return '[구역]는 필수 입력 항목입니다.';
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
	const searchSmdInput = async() => {

        grid.disableAutoRows();
		
		$("#mf13No").val($('#data-params').data('params').mf13No);

		// TODO 여기서 가져오는 쿼리 수정
		let params ={
			uri: `output/getOutputRegisterList`,
			mf13No : $('#data-params').data('params').mf13No
		};
        params = {...params,...ajax.getParams('searchForm')}

        try {
            let {outputRegisterList} = await ajax.getAjax(params, true);
			
			if( outputRegisterList.length > 0 ) {
				grid._flexCv.sourceCollection = [];

				//라인코드 받아와서 넣기. index.js 128행에서 미리 받아와서 데이터파람으로 넘기는것이 더 좋음.
				mf13LineCode.selectedValue = outputRegisterList[0].mf13LineCode;
				
				outputRegisterList.forEach( (item, index) => {
					
					for(var i=0; i<item.mf14Qty; i++){				
					
						let addRow = grid._flexCv.addNew();
						
						addRow.st02RequestNo = item.mf13No;
						addRow.st02Ipqty = 1;
						addRow.st02Code = item.mf14Code;
						addRow.cm08Name = item.cm08Name;
						addRow.cm08Gbn = item.cm08Gbn;
						addRow.cm08Dgbn = item.cm08Dgbn;
						addRow.st02Ipunt = item.mf14Unt;
						addRow.st02Stok = '03';
						addRow.st02Dist = '0301';
		
						grid._flexCv.commitNew();
					}

	        	});
			}
        } catch(error) {
            return;
        }
    }

	// 뒤로가기
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

	const saveSmdInput = () => {

		grid.disableAutoRows();
		/*
		if(!grid.gridValidation()){
            alertWarning('등록 불가', '필수 값이 입력되지 않아 저장할 수 없습니다.');
            return;
        }
		 */

		let insertListTemp = grid.gridItemListToArray(grid._flexCv.itemsAdded);
		let insertList = [];

		insertListTemp.forEach((item) => {
			if(!wijmo.isNullOrWhiteSpace(item.st02Qrcode)) {
				insertList.push(item);
			}
		});
		
		if(insertList.length < 1) {
			alertWarning('작업불가', '등록할 내용이 없습니다.');
            return;
        }

		confirm("출고완료요청을 등록하시겠습니까?", "출고완료요청이 등록됩니다.", consts.MSGBOX.QUESTION, () => {
			
			insertList.forEach((item) => {
				// 출고요청 완료 번호
				item.mf13No = $('#data-params').data('params').mf13No;
				// 헤더에 라인 추가
				item.mf13LineCode = mf13LineCode.selectedValue;
			})
			
			let params = {
                uri: `smdInput/smdInput`,
				mf13No : $('#data-params').data('params').mf13No,
				mf13LineCode : mf13LineCode.selectedValue,
                insertList: insertList
            };

			params = {...params,...ajax.getParams('#submitForm')};
			
        	ajax.postAjax(params, true).then(async (data)=>{
	            $(".text-bg-danger").text("출고완료요청 등록완료");
				$("#btnSave").hide();
	            pushMsg('출고완료요청이 등록되었습니다.');
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
		searchSmdInput();

		$('#btnSave').on('click', saveSmdInput);
		$('#btnBack').on('click', goBack);

		/*$("#btnTest1").on('click',function(){
			bacodeSearch("CO25031400001-001")
		});
		$("#btnTest2").on('click',function(){
			bacodeSearch("CO25031400001-005")
		});
		$("#btnTest3").on('click',function(){
			bacodeSearch("QQ25031000001-004")
		});*/
    }

	// 스캐너 값 얻기
	$(document).scannerDetection({
		timeBeforeScanTest: 200, // wait for the next character for upto 200ms
		avgTimeByChar: 40, // it's not a barcode if a character takes longer than 40ms
		onComplete: function(barcode, qty) {
			let matchBar = false;
			barcode = barcode.toUpperCase();
			// 길이에 따라 QR코드가 구분이 되어야한다. 현재는 트레스라벨만 찍음 -> 추후 QR, 트레스 두 개 찍음
			// barcode값으로 가져올 수 있는 값 - 품번, 품목구분 가져올 수 있다.
			console.debug(barcode);
			OT2025032400011

			if(barcode.substring(0,3) == '3N1') {
				
				// 기존 트레스 라벨 들고 있어야 중복 비교 및 데이터 저장 시 라벨 넣을 수 있음.
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
						if(row.dataItem.st02Code == code) {
							if(wijmo.isNullOrWhiteSpace(row.dataItem.st02Qrcode) || wijmo.isUndefined(row.dataItem.st02Qrcode)){
								matchBar = true;
								//grid._flexGrid.setCellData(row.index, 'select', true);

								// 중복체크 기능 필요
								for(var i=0; i < grid._flexGrid.rows.length; i++){
									if(!wijmo.isUndefined(grid._flexGrid.getCellData(i, 'st02Qrcode'))){
										if(beforeBar == grid._flexGrid.getCellData(i, 'st02Qrcode')){
											grid._flexGrid.setCellData(index, 'st02Qrcode', "");
											alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
											return ;
										}
									}
								}

								var lot = barcode[3];
								var lotSeq = barcode[2];

								// lot와 lotSeq로 재고테이블을 검색해서 해당 정보를 가져와야한다.
								getLotInfo(index, code, lot, lotSeq, beforeBar);
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

					// TODO
					let outputInfo = data["outputInfo"];

					if(inputInfo != null) {
						grid._flexGrid.rows.some((row,index,array)=>{
							if(!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)){
								if(row.dataItem.st02Code == outputInfo.st03Code && barcode == outputInfo.st03Qr){
									if(wijmo.isNullOrWhiteSpace(row.dataItem.st02Qrcode) || wijmo.isUndefined(row.dataItem.st02Qrcode)){
										matchBar = true;
										for(var i=0; i<grid._flexGrid.rows.length; i++){
											if(!wijmo.isUndefined(grid._flexGrid.getCellData(i,'st02Qrcode'))){
												if(barcode == grid._flexGrid.getCellData(i,'st02Qrcode')){
													grid._flexGrid.setCellData(index, 'st02Qrcode', '');
													alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
													return;
												}
											}
										}

										grid._flexGrid.setCellData(index, 'st02Lot', outputInfo.st03Lot);
										grid._flexGrid.setCellData(index, 'st02LotSeq', outputInfo.st03LotSeq);
										grid._flexGrid.setCellData(index, 'st02Qrcode', outputInfo.st03Qr);
										grid._flexGrid.setCellData(index, 'st02Moq', outputInfo.st03Moq);
										grid._flexGrid.setCellData(index, 'st02Stok', '03');
										grid._flexGrid.setCellData(index, 'st02Dist', '0301');

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
			}
		}
	});
	
	// TODO
	const getLotInfo = (index, code, lot, lotSeq, barcode)=>{
		let params = {
			uri : 'smdInput/smdInput/getLotInfo',
			st03Code : code,
			st03Lot : lot,
			st03LotSeq : lotSeq
		};
		
		ajax.getAjax(params, true).then(async (data)=>{
			
			let lotInfo = data["lotInfo"];
			
			if(lotInfo != null) {
				console.log(lotInfo);
				grid._flexGrid.setCellData(index, 'st02Stok', '03');
				grid._flexGrid.setCellData(index, 'st02Dist', '0301');
				grid._flexGrid.setCellData(index, 'st02Lot', lotInfo.st01Lot);
				grid._flexGrid.setCellData(index, 'st02LotSeq', lotInfo.st01LotSeq);
				grid._flexGrid.setCellData(index, 'st02Moq', lotInfo.st02Moq);
				grid._flexGrid.setCellData(index, 'st02Qrcode', barcode);
				// 값이 없는 경우 경고메시지
			} else {
				swal('작업 불가','리딩한 바코드와 일치하는 품목이 출고내역에 존재하지 않습니다','warning');
				return ;
			}
        }).catch((e)=>{
            console.debug(e);
        });
		
	}

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
    smdInput.init();

});
