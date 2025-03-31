
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
            {binding:'mf16No'			,header:'사급상세번호'	,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true	,visible:false},
            {binding:'mf16Code'			,header:'품목명'		,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true	,visible:false},
            {binding:'cm08Name'			,header:'품목명'		,width:150	,dataType:'String'	,align:'left'	,isReadOnly: true},
            {binding:'st03Qr'			,header:'QR코드'		,width:150	,dataType:'String'	,align:'center'},
			{binding:'mf16Qty'			,header:'출고수량'		,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true},
			{binding:'mf16Gbn'			,header:'구분'		,width:100	,dataType:'Number'	,isRequired:true},
            {binding:'cm08Opunt'		,header:'출고단위'		,width:130	,dataType:'String'	,align:'left'	,visible:false},
			{binding:'cm08OpuntName'	,header:'출고단위명'	,width:130	,dataType:'String'	,align:'left'	,visible:false}
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(460);
        //체크박스 컬럼 생성
        //grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
		
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
            uri: `consignedMaterialsReg/consignedMaterialsReg`,
			mf15No : $('#data-params').data('params').mf15No
        }
        params = {...params,...ajax.getParams('searchForm')}
        
        try {
            let {consignedMaterialsRegDetailList} = await ajax.getAjax(params, true);  
            grid._flexCv.sourceCollection = consignedMaterialsRegDetailList.map(item => ({...item, select:false}));
			
			$("#mf15No").val($('#data-params').data('params').mf15No);
			$("#mf15Dat").val($('#data-params').data('params').mf15Dat);
			$("#mf15Cus").val($('#data-params').data('params').mf15Cus);
			$("#mf15CusName").val($('#data-params').data('params').mf15CusName);
			
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
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'output/outputReqSel' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'output/outputReqSel' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'출고 조회' }));
		form.appendTo('body');
		form.submit();
	}
	
	const save = () => {

        let st06Docno = $('#st06Docno').val(); // 전표번호
        let st06Dat = datFr.value; // 입고일자
        let st06Cus = $('#st06Cus').val(); // 제조사코드

        if (wijmo.isNullOrWhiteSpace(st06Docno)) {
            swal('등록 불가','전표번호가 입력되지 않아 저장할 수 없습니다.','warning');
            return;
        }

        if (wijmo.isNullOrWhiteSpace(st06Dat)) {
            swal('등록 불가','입고일자가 입력되지 않아 저장할 수 없습니다.','warning');
            return;
        }

        // 그리드 - [반품일자] 형식 문제
        if (!commonValidation.validationCheck("date", wijmo.Globalize.format(st06Dat, 'yyyy-MM-dd'))) {
            swal('등록 불가','입고일자의 날짜형식을 확인해주세요.','warning');
            return;
        }

        if (wijmo.isNullOrWhiteSpace(st06Cus)) {
            swal('등록 불가','제조사코드가 입력되지 않아 저장할 수 없습니다.','warning');
            return;
        }

        if(consignedMaterialsReqSaveCv.itemsAdded.length == 0 ){
            swal('작업 불가', '등록할 내용이 없습니다.', 'warning');
            return;
        }

        if (consignedMaterialsReqSaveCv.isEditingItem) {
            swal('등록 불가','입력 값을 확인해주세요.','warning');
            return;
        }

        if (!gridValidation(consignedMaterialsReqSaveGrid,consignedMaterialsReqSaveCv)) {
            swal('등록 불가','필수 값이 입력되지 않아 저장할 수 없습니다.','warning');
            return;
        }

        common.confirm("사급 정보를 등록하시겠습니까?", "사급 정보가 등록됩니다.", commonConst.INSERT, function () {

            let consignedMaterialsReqSaveCvHead = $("form[name=consignedMaterialsReqSave-form]").serializeObject();

            // 신규/수정 정보 파라메터 등록
            let params ={
                consignedMaterialsReqSaveAddedInfo: commonGrid.convertJsonOfGrid(consignedMaterialsReqSaveCv.itemsAdded),
                consignedMaterialsReqSaveHead: [consignedMaterialsReqSaveCvHead],
                uri :"purchase/order/consignedMaterial"
            }

            // 저장 수행
            console.log(params);

            commonAjax.getAjax("POST",params, function () {
                location.reload();
            });

        });

        console.log("=========== save-end ===========");
    }
	
	const saveOutput = () => {
			
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

		confirm("사급요청을 등록하시겠습니까?", "사급요청이 등록됩니다.", consts.MSGBOX.QUESTION, () => {
			
			let params = {
                uri: `output`,
                insertList: insertList
            };
			
			params = {...params,...ajax.getParams('#submitForm')};
			
        	ajax.postAjax(params, true).then(async (data)=>{
	            $(".text-bg-danger").text("출고완료");
				$("#btnSave").hide();
	            pushMsg('사급요청이 등록되었습니다.');
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
        init:() => {
			menuLoad();
            handleEvent();
        }
    }
}();


$(()=>{
    consignedMaterialsReg.init();
    
});
