
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";
import { menuLoad } from "../common/commonMenu.js";

const outputRegister = function(){
    
    let grid  = new GridFactory('#grid');
    /**
     * 그리드 초기화
     */
    const gridInit = ()=> {
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
            /*{binding:'select'	,header:' '		,width:30	,dataType:'Boolean'	,isRequired:false},*/
            {binding:'cm08Code'	,header:'품번'	,width:120	,dataType:'String'	,align:'center'	,isReadOnly: true},
            {binding:'cm08Name'	,header:'품목명'	,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true	,visible:false},
            {binding:'st03Qr'	,header:'QR코드'	,width:150	,dataType:'String'	,align:'center' ,isReadOnly: true},
			{binding:'st03Qty'	,header:'박스수량'	,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true ,isReadOnly: true},
			{binding:'st03Moq'	,header:'MOQ'	,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true ,isReadOnly: true},
            {binding:'st03Stok'	,header:'창고'	,width:130	,dataType:'String'	,align:'left' ,isReadOnly: true},
			{binding:'st03Dist'	,header:'구역'	,width:130	,dataType:'String'	,align:'left' ,isReadOnly: true},
			{binding:'st03Lot', header: 'LOT번호', width: 180, align:'center', dataType:'String'	,visible:false},
			{binding:'st03LotSeq', header: 'LOT SEQ', width: 90, align:'center', dataType:'String'	,visible:false},
			
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(350);
        //체크박스 컬럼 생성
        //grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
		
		let st03Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st03Stok').dataMap = new wijmo.grid.DataMap(st03Stok, 'cm15Code', 'cm15Name');
		let st03Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st03Dist').dataMap = new wijmo.grid.DataMap(st03Dist, 'cm16Code', 'cm16Name');
		
		//그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
            
			let sameCode = grid._flexCv.sourceCollection.filter((c) =>
							( c.st03Company == item.st03Company && c.st03Factory == item.st03Factory && c.cm08Code == item.cm08Code && c.st03Lot == item.st03Lot && c.st03Qr == item.st03Qr));  
			  
            switch (prop) {
                /*case 'st02No':
                    if(wijmo.isNullOrWhiteSpace(item.st02No)) return '[입고번호]는 필수 입력 항목입니다.';
                    break;*/
                case 'cm08Code':
                    if(wijmo.isNullOrWhiteSpace(item.cm08Code)) return '[품목코드]는 필수 입력 항목입니다.';
                    break;
                case 'st03Lot':
                    if(wijmo.isNullOrWhiteSpace(item.st03Lot)) return '[LOT번호]는 필수 입력 항목입니다.';
                    break;
                case 'st03LotSeq':
                    if(wijmo.isNullOrWhiteSpace(item.st03LotSeq)) return '[LOT SEQ]는 필수 입력 항목입니다.';
                    break;
                case 'st03Qr':
                    if(wijmo.isNullOrWhiteSpace(item.st03Qr)) return '[QR코드]는 필수 입력 항목입니다.';
                    break;
                case 'st03Qr':
                    if(sameCode.length > 1) return '[QR코드]는 중복될 수 없습니다.';
                    break;
                case 'st03Qty':
                    if(item.st03Qty <= 0) return '[박스수량]은 0보다 커야합니다.';
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
	
	const detailSearch = async() => {
			
        grid.disableAutoRows();
		
        let params = {
            uri: `output/getOutputRegisterList`,
			mf13No : $('#data-params').data('params').mf13No
        }
        params = {...params,...ajax.getParams('searchForm')}
        
        try {
            let {outputRegisterList} = await ajax.getAjax(params, true);  
            //grid._flexCv.sourceCollection = warehousingList.map(item => ({...item, select:false}));
			
			grid._flexCv.sourceCollection = [];
			
			outputRegisterList.forEach( (item, index) => {
				
				for(var i=0; i < item.mf14Qty; i++) {
					let addRow = grid._flexCv.addNew();
					addRow.st03OutputNo = item.mf13No;
					addRow.st03OutputDtlNo = item.mf14No;
					addRow.st03Qty = 1;
					addRow.cm08Code = item.mf14Code;
					addRow.cm08Name = item.cm08Name;
					addRow.cm08Gbn = item.cm08Gbn;
					addRow.cm08Dgbn = item.cm08Dgbn;
					addRow.st03Unt = item.mf14Unt;
					
					grid._flexCv.commitNew();
				}

	        });
			
			$("#st03OutputNo").val($('#data-params').data('params').mf13No);
			$("#st03Dat").val($('#data-params').data('params').mf13Dat);
			$("#st03DatTime").val($('#data-params').data('params').mf13DatTime);
			$("#st03Line").val($('#data-params').data('params').mf13LineCode);
			$("#st03Linena").val($('#data-params').data('params').mf13LineNm);
			
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);

        } catch(error) {
            //console.debug(error);
           //	 alertError('오류', error);
            return;
        }

    }
	
	const goBack = () => {
		let form = $('<form></form>');
		form.attr("method","get");
		form.attr("action","view");
		form.attr("target","_self");
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'output/outputReqSel' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'output/outputReqSel' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'출고 조회' }));
		form.appendTo('body');
		form.submit();
	}
	
	const saveOutput = () => {
			
		grid.disableAutoRows();
		
		/*if(!grid.gridValidation()){
            alertWarning('저장불가', '그리드 오류내역을 확인하세요.');
            return;
        }*/
		
		let insertListTemp = grid.gridItemListToArray(grid._flexCv.itemsAdded);
		let insertList = [];
		let updateList = grid.gridItemListToArray(grid._flexCv.itemsEdited);

		insertListTemp.forEach((item) => {
			console.debug(item.st03Qr);
			console.debug(!wijmo.isNullOrWhiteSpace(item.st03Qr));
			if(!wijmo.isNullOrWhiteSpace(item.st03Qr)) {
				item.st03Cus = $("#st03Cus").val();
				item.st03Dat = $("#st03Dat").val();
				item.st03DatTime = $("#st03DatTime").val();
				item.st03Line = $("#st03Line").val();
				item.st03Gbn = 'PR';
				insertList.push(item);
			}
		});

		if(insertList.length < 1 && updateList.length < 1) {
			alertWarning('저장불가','저장할 내역이 없습니다.');
			return;
		}

		confirm("출고이력을 등록하시겠습니까?", "출고이력이 등록됩니다.", consts.MSGBOX.QUESTION, () => {
			
			let params = {
                uri: `output`,
                insertList: insertList,
                updateList: updateList,
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
    const handleEvent = ()=>{

        gridInit();
		detailSearch();
		
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

								// 값 넣어주기
								//var lot = barcode.substring(35,82).trim();
								//var lotSeq = barcode.substring(23,35).trim();
								
								var lot = barcode[3];
								var lotSeq = barcode[2];
								
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
										grid._flexGrid.setCellData(index, 'st03Moq', inputInfo.st02Moq);
										
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
	
	const getLotInfo = (index, code, lot, lotSeq, barcode) => {
			
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
				grid._flexGrid.setCellData(index, 'st03Stok', lotInfo.st01Stok);
				grid._flexGrid.setCellData(index, 'st03Dist', lotInfo.st01District);
				grid._flexGrid.setCellData(index, 'st03Lot', lotInfo.st01Lot);
				grid._flexGrid.setCellData(index, 'st03LotSeq', lotInfo.st01LotSeq);
				grid._flexGrid.setCellData(index, 'st03Qr', barcode);
				grid._flexGrid.setCellData(index, 'st03Moq', lotInfo.st02Moq);
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
    outputRegister.init();
    
});
