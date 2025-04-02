
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as consts from "../common/constants.js";
import { pushMsg,alertWarning,confirm } from "../common/msgBox.js";
import { menuLoad } from "../common/commonMenu.js";

const consignedMaterialsReg = function(){
    
    let grid  = new GridFactory('#grid');
    /**
     * 그리드 초기화
     */
    const gridInit = ()=> {
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
            {binding:'cm08Gbn'		,header:'품목구분'		,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true	,visible:false},
            {binding:'cm08Dgbn'		,header:'라벨정보구분'	,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true	,visible:false},
            {binding:'mf16Code'		,header:'품목코드'		,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true	,visible:false},
            {binding:'cm08Name'		,header:'품명'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'st02Qrcode'	,header:'QR코드'		,width:130	,dataType:'String'	,align:'left'	,isReadOnly: true	,isRequired:true},
			{binding:'st03Lot'		,header:'LOT번호'		,width:100	,dataType:'String'	,isRequired:true	,visible:false},
			{binding:'st03LotSeq'	,header:'LOT SEQ'	,width:100	,dataType:'String'	,isRequired:true	,visible:false},
            {binding:'searchLotNo'	,header:' '			,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'st03Qty'		,header:'박스수량'		,width:130	,dataType:'Number'	,editor:numberInput		,isReadOnly: true	,visible:true},
			{binding:'cm08Moq'		,header:'MOQ'		,width:130	,dataType:'Number'	,editor:numberInput		,isReadOnly: true	,visible:true},
			{binding:'st01Qty'		,header:'재고량'		,width:130	,dataType:'Number'	,editor:numberInput		,isReadOnly: true	,visible:false},
			{binding:'mf16Gbn'		,header:'구분'		,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'st01Stok'		,header:'창고'		,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'st01District'	,header:'구역'		,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'st03No'		,header:'출고번호'		,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'mf16HNo'		,header:'사입번호'		,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'mf16Company'	,header:'회사'		,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'mf16Factory'	,header:'공장'		,width:130	,dataType:'String'	,align:'left'	,visible:false}
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(350);
        //체크박스 컬럼 생성
        //grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
		
		//그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
            
            switch (prop) {
                case 'mf16Code':
                    if(wijmo.isNullOrWhiteSpace(item.mf16Code)) return '[품목코드]는 필수 입력 항목입니다.';
                    break;
                case 'cm08Gbn':
                    if(wijmo.isNullOrWhiteSpace(item.cm08Gbn)) return '[품목구분]는 필수 입력 항목입니다.';
                    break;
                case 'st03Lot':
                    if(wijmo.isNullOrWhiteSpace(item.st03Lot)) return '[LOT번호]는 필수 입력 항목입니다.';
                    break;
                case 'st03LotSeq':
                    if(wijmo.isNullOrWhiteSpace(item.st03LotSeq)) return '[LOT SEQ]는 필수 입력 항목입니다.';
                    break;
                case 'st02Qrcode':
                    if(wijmo.isNullOrWhiteSpace(item.st02Qrcode)) return '[QR코드]는 필수 입력 항목입니다.';
                    break;
                case 'st02Qrcode':
                    if(sameCode.length > 1) return '[QR코드]는 중복될 수 없습니다.';
                    break;
                case 'cm08Moq':
					if(wijmo.isNullOrWhiteSpace(item.cm08Moq)) return '[MOQ]은 필수 입력 항목입니다.';
                    if(item.cm08Moq <= 0) return '[MOQ]은 0보다 작을 수 없습니다.';
                    break;
                default:
                    return null;
            }
        }
		
    }
	
	const search = async ()=>{
	        
        grid.disableAutoRows();
        
        let params = {
            uri: `consignedMaterialsReq/consignedMaterialsReq`,
			mf15No : $('#data-params').data('params').mf15No
        }
		
		params = {...params,...ajax.getParams('searchForm')}
		let {consignedMaterialsReqList} = await ajax.getAjax(params, true);  
		
		$("#mf15No").val($('#data-params').data('params').mf15No);
		$("#mf15Dat").val(consignedMaterialsReqList[0].mf15Dat + " " + consignedMaterialsReqList[0].mf15Time);
		$("#mf15Cus").val(consignedMaterialsReqList[0].mf15Cus);
		$("#mf15CusName").val(consignedMaterialsReqList[0].mf15CusName);
    }
	
	const detailSearch = async() => {
			
        grid.disableAutoRows();
		
        let params = {
            uri: `consignedMaterialsReg/consignedMaterialsReg`,
			mf15No : $('#data-params').data('params').mf15No
        }
        params = {...params,...ajax.getParams('searchForm')}
        
        try {
            let {consignedMaterialsHistDetailAllList} = await ajax.getAjax(params, true);  
            grid._flexCv.sourceCollection = consignedMaterialsHistDetailAllList.map(item => ({...item}));
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);

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
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'stock/consignedMaterialsReq' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'stock/consignedMaterialsReq' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'사급 출고 조회' }));
		form.appendTo('body');
		form.submit();
	}
	
	const saveOutput = () => {
			
		grid.disableAutoRows();
		
		if(!grid.gridValidation()){
            alertWarning('저장불가', '그리드 오류내역을 확인하세요.');
            return;
        }
		
		let insertList = grid.gridItemListToArray(grid._flexCv.itemsEdited);
		if(insertList.length < 1) {
			alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

		confirm("사급등록 하시겠습니까?", "사급등록 이력이 등록됩니다.", consts.MSGBOX.QUESTION, () => {
			
			let params = {
                uri: `consignedMaterialsReg/consignedMaterialsReg`,
				cm01Code : $("#mf15Cus").val(), // 제조사코드
				mf15No : $("#mf15No").val(), // 사급요청서번호
                insertList: insertList
            };
			
			params = {...params,...ajax.getParams('#submitForm')};
			
        	ajax.postAjax(params, true).then(async (data)=>{
	            $(".text-bg-danger").text("사급출고 완료");
				$("#btnSave").hide();
	            pushMsg('사급이 등록되었습니다.');
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
			if(barcode.substring(0, 3) == "3N1") {
				
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
						if(row.dataItem.mf16Code == code) {
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
			
			} else { // SCM 라벨을 조회 시 17자리
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
								if(row.dataItem.mf16Code == inputInfo.st02Code && barcode == inputInfo.st02Qrcode){
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
										
										grid._flexGrid.setCellData(index, 'st03Lot', inputInfo.st02Lot);
										grid._flexGrid.setCellData(index, 'st03LotSeq', inputInfo.st02LotSeq);
										grid._flexGrid.setCellData(index, 'st02Qrcode', inputInfo.st02Qrcode);
										grid._flexGrid.setCellData(index, 'st01Stok', inputInfo.st02Stok);
										grid._flexGrid.setCellData(index, 'st01District', inputInfo.st02Dist);
										grid._flexGrid.setCellData(index, 'st01Qty', inputInfo.st01Qty);
										
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
				grid._flexGrid.setCellData(index, 'st01Stok', lotInfo.st01Stok);
				grid._flexGrid.setCellData(index, 'st01District', lotInfo.st01District);
				grid._flexGrid.setCellData(index, 'st03Lot', lotInfo.st01Lot);
				grid._flexGrid.setCellData(index, 'st03LotSeq', lotInfo.st01LotSeq);
				grid._flexGrid.setCellData(index, 'st02Qrcode', barcode);
				grid._flexGrid.setCellData(index, 'st01Qty', lotInfo.st01Qty);
				// 값이 없는 경우 경고메시지
			} else {
				swal('작업 불가','리딩한 바코드와 일치하는 품목이 출고내역에 존재하지 않습니다','warning');
				return ;
			}
        }).catch((e)=>{
            console.debug(e);
        });
		
	}
	
    return{
        init:() => {
			menuLoad();
            handleEvent();
			search();
        }
    }
}();


$(()=>{
    consignedMaterialsReg.init();
    
});
