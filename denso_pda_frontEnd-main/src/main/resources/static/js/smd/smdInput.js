
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const smdInput = function(){

    let grid  = new GridFactory('#grid');
    /**
     * 그리드 초기화
     */
    const gridInit = () => {

        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');
        let columnsDefinition = [
			{binding: 'mf14Company'	,header:'회사'			,width:100		,align:'center'		,dataType:'String'		,visible:false},
			{binding: 'mf14Factory'	,header:'공장'			,width:100		,align:'center'		,dataType:'String'		,visible:false},
			{binding: 'mf14No'		,header:'출고요청완료상세번호'	,width:150		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'mf14Code'	,header:'품번'			,width:120		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'cm08Dgbn'	,header:'라벨정보구분'		,width:100		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'cm08Name'	,header:'품명'			,width:200		,align:'center'		,dataType:'String'		,isReadOnly:true},
			{binding: 'cm08Gbn'		,header:'품목구분'			,width:100		,align:'center'		,dataType:'String'		,isReadOnly:true		,visible:false},
			{binding: 'mf14Lot'		,header:'LOT번호'			,width:200		,align:'center'		,dataType:'String'		,isRequired:false	,isReadOnly:true		,visible:false},
			{binding: 'mf14Qrcode'	,header:'QR코드'			,width:200		,align:'center'		,dataType:'String'		,isRequired:false},
			{binding: 'mf14Qty'		,header:'출고요청수량'		,width:100		,align:'center'		,dataType:'Number'		,isRequired:false},
			{binding: 'mf14Unt'		,header:'출고단위'			,width:100		,align:'center'		,dataType:'String'		,isRequired:false	,visible:false},
			{binding: 'mf14Stok'	,header:'창고'			,width:100		,align:'center'		,dataType:'String'		,isRequired:false},
			{binding: 'mf14Dist'	,header:'구역'			,width:100		,align:'center'		,dataType:'String'		,isRequired:false},
			{binding: 'mf14Indte'	,header:'등록일자'			,width:100		,align:'center'		,dataType:'String'		,visible:false},
			{binding: 'mf14Empno'	,header:'등록자'			,width:100		,align:'center'		,dataType:'String'		,visible:false}
			
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(550);
        grid.optionPanel('#grid-option');

		let cm08Gbn = getCommonCodeList('G001');
		grid._flexGrid.getColumn('cm08Gbn').dataMap = new wijmo.grid.DataMap(cm08Gbn, 'cm05Value', 'cm05Name');
		let mf14Unt = getCommonCodeList('LU01');
		grid._flexGrid.getColumn('mf14Unt').dataMap = new wijmo.grid.DataMap(mf14Unt, 'cm05Value', 'cm05Name');
		let mf14Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('mf14Stok').dataMap = new wijmo.grid.DataMap(mf14Stok, 'cm15Code', 'cm15Name');
		let mf14Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('mf14Dist').dataMap = new wijmo.grid.DataMap(mf14Dist, 'cm16Code', 'cm16Name');

		//그리드 오류체크
        grid._flexCv.getError = (item,prop) => {
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;

            switch (prop) {
                case 'mf14Lot':
                    if(wijmo.isNullOrWhiteSpace(item.mf14Lot)) return '[LOT번호]는 필수 입력 항목입니다.';
                    break;
				case 'mf14Qrcode':
                    if(wijmo.isNullOrWhiteSpace(item.mf14Qrcode)) return '[QR코드]는 필수 입력 항목입니다.';
                    break;	
				case 'mf14Stok':
                    if(wijmo.isNullOrWhiteSpace(item.mf14Stok)) return '[창고]는 필수 입력 항목입니다.';
                    break;	
				case 'mf14Dist':
                    if(wijmo.isNullOrWhiteSpace(item.mf14Dist)) return '[구역]는 필수 입력 항목입니다.';
                    break;	
				case 'mf14Code':
                    if(wijmo.isNullOrWhiteSpace(item.mf14Code)) return '[품번]는 필수 입력 항목입니다.';
                    break;	
                case 'mf14Qty':
                    if(item.mf14Qty <= 0) return '[출고요청수량]은 0보다 커야합니다.';
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

		let params ={
			uri: `output/getOutputRegisterList`,
			mf13No : "2025031400002" //$('#data-params').data('params').mf13No
		};
        params = {...params,...ajax.getParams('searchForm')}

        try {
            let {outputRegisterList} = await ajax.getAjax(params, true);

			if( outputRegisterList.length > 0 ) {
				grid._flexCv.sourceCollection = [];
				
				outputRegisterList.forEach( (item, index) => {
									
					let addRow = grid._flexCv.addNew();
					addRow.mf13No = item.mf13No;
					addRow.mf14No = item.mf14No;
					addRow.mf14Qty = item.mf14Qty;
					addRow.mf14Code = item.mf14Code;
					addRow.cm08Name = item.cm08Name;
					addRow.cm08Gbn = item.cm08Gbn;
					addRow.cm08Dgbn = item.cm08Dgbn;
					addRow.mf14Unt = item.mf14Unt;
	
					grid._flexCv.commitNew();

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

		if(!grid.gridValidation()){
            alertWarning('등록 불가', '필수 값이 입력되지 않아 저장할 수 없습니다.');
            return;
        }

		let insertList = grid.gridItemListToArray(grid._flexCv.itemsAdded);
		
		if(insertList.length < 1) {
			alertWarning('작업불가', '등록할 내용이 없습니다.');
            return;
        }

		confirm("출고완료요청을 등록하시겠습니까?", "출고완료요청이 등록됩니다.", consts.MSGBOX.QUESTION, () => {

			let params = {
                uri: `smdInput/smdInput`,
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
		
		
		
		/*let flag = $(this).attr("data-flag");

		if(flag == "insert") {
			
			//모달창 폼에 validation 체크
			if (!$('#upOutputRequestCompReg-form').valid()) {
				return false;
			}
			//그리드에 필수값이 모두 등록되어 있을 경우 -> cv.geterror를 만족해야함
			if (!gridValidation()) {
				alertWarning('등록 불가', '필수 값이 입력되지 않아 저장할 수 없습니다.', 'warning');
				return;
			}

			common.confirm("출고완료요청이 등록하시겠습니까?", "출고완료요청이 등록됩니다.", commonConst.INSERT, function () {
				let outputData = $("form[name=upOutputRequestCompReg-form]").serializeObject();
				let outputRequestCompInfo = commonGrid.convertJsonOfGrid(outputRequestCompRegCv.itemsAdded);

				outputRequestCompInfo.forEach((item) => {
					item.mf13No = outputData.pmf13No;
					item.mf13LineCode = outputData.pmf13Line;
					item.mf13Dat = outputData.pmf13Dat;
					item.mf13DatTime = outputData.pmf13DatTime;
				})

				let params = {
					uri: 'manufacture/outputRequestComp',
					outputHeadInfo: outputData,
					outputRequestCompInfo: commonGrid.convertJsonOfGrid(outputRequestCompRegCv.itemsAdded) -- insertList
				};
				save(params);
			});
		} else if(flag == "update"){
			common.confirm("출고완료요청이 수정하시겠습니까?","출고완료요청이 수정됩니다.",commonConst.UPDATE, modalUpdate);
		}*/
		
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
		/*timeBeforeScanTest: 50, // wait for the next character for upto 200ms
		startChar: [16, 45, 189], // Prefix character for the cabled scanner (OPL6845R)
		changeChar: [189], // Prefix character for the cabled scanner (OPL6845R)*/
		onComplete: function(barcode, qty) {
			let matchBar = false;
			//barcode = barcode.toUpperCase();
			// 길이에 따라 QR코드가 구분이 되어야한다. 현재는 트레스라벨만 찍음 -> 추후 QR, 트레스 두 개 찍음
			// barcode값으로 가져올 수 있는 값 - 품번, 품목구분 가져올 수 있다.

			if(barcode.substring(0, 3) == "3N1"){

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
							if(wijmo.isNullOrWhiteSpace(row.dataItem.mf14Qrcode) || wijmo.isUndefined(row.dataItem.mf14Qrcode)){
								matchBar = true;
								//grid._flexGrid.setCellData(row.index, 'select', true);

								// 중복체크 기능 필요
								for(var i=0; i < grid._flexGrid.rows.length; i++){
									if(!wijmo.isUndefined(grid._flexGrid.getCellData(i, 'mf14Qrcode'))){
										if(beforeBar == grid._flexGrid.getCellData(i, 'mf14Qrcode')){
											grid._flexGrid.setCellData(index, 'mf14Qrcode', "");
											alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
											return ;
										}
									}
								}

								var lot = barcode[3];
								var lotSeq = barcode[2];

								grid._flexGrid.setCellData(index, 'mf14Lot', lot);
								grid._flexGrid.setCellData(index, 'mf14LotSeq', lotSeq);
								grid._flexGrid.setCellData(index, 'mf14Qrcode', beforeBar);
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
									if(wijmo.isNullOrWhiteSpace(row.dataItem.mf14Qrcode) || wijmo.isUndefined(row.dataItem.mf14Qrcode)){
										matchBar = true;
										for(var i=0; i<grid._flexGrid.rows.length; i++){
											if(!wijmo.isUndefined(grid._flexGrid.getCellData(i,'mf14Qrcode'))){
												if(barcode == grid._flexGrid.getCellData(i,'mf14Qrcode')){
													grid._flexGrid.setCellData(index, 'mf14Qrcode', '');
													alertWarning('작업 불가', 'QR코드는 중복될 수 없습니다.');
													return;
												}
											}
										}

										grid._flexGrid.setCellData(index, 'mf14Lot', inputInfo.st02Lot);
										grid._flexGrid.setCellData(index, 'mf14LotSeq', inputInfo.st02LotSeq);
										grid._flexGrid.setCellData(index, 'mf14Qrcode', inputInfo.st02Qrcode);
										grid._flexGrid.setCellData(index, 'mf14Stok', inputInfo.st02Stok);
										grid._flexGrid.setCellData(index, 'mf14Dist', inputInfo.st02Dist);

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
    smdInput.init();

});
