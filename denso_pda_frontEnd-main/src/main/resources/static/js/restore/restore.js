
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const restore = function(){
    
    let grid  = new GridFactory('#grid');
	//let qtyInput = input.number('#qtyInput',1,0,999999,'G10');
    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
            /*{binding:'select'	,header:' '		,width:30	,dataType:'Boolean'	,isRequired:false},*/
			/*{binding:'delete'	,header: ' '	,width:60	
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					text: '삭제',
					click: (e, ctx) => {
						
						grid._flexCv.remove(ctx.item);
						//console.log(ctx);
						alert('Clicked Button Delete** ' + ctx.item.st02No + ' **');
					}
				})
			},*/
            {binding:'cm08Name'		,header:'품목명'	,width:150	,dataType:'String'	,align:'center', isReadOnly:true},
            {binding:'st11Qrcode'	,header:'QR 코드'	,width:150	,dataType:'String'	,align:'center'},
			{binding:'st11Qty'		,header:'수량'	,width:100	,dataType:'Number'	,align:'center'	,editor:numberInput	,visible:false},
			
			{binding:'st02Qty'		,header:'수량'	,width:100	,dataType:'Number'	,align:'center'	,editor:numberInput	,isRequired:true},
			
            {binding:'st11Stok'		,header:'창고'	,width:150	,dataType:'String'	,align:'center'	},
			{binding:'st11Dist'		,header:'구역'	,width:150	,dataType:'String'	,align:'center'	},
			
			{binding:'st11Lot'		,header:'lot'	,width:150	,dataType:'String'	,align:'center',visible:false	},
			{binding:'st11No'		,header:'반납요청서상세번호', width:150,align:'center', dataType:'String', maxLength:18, visible:false},
            {binding:'st11LotSeq'	,header:'LOT시퀀스', width:150,align:'center', dataType:'String', maxLength:12, visible:false},
            {binding:'st02Dat'		,header:'입고일자', width:100, align:'center', dataType:'String', visible:false},
            {binding:'st02Seq'		,header:'입고순번', width:100, align:'center', dataType:'String', visible:false},
            {binding:'st11Seq'		,header:'상세순번', width:100, align:'center', dataType:'Number', visible:false},
            {binding:'st11Indte'	,header:'등록일자', width:100, align:'center', dataType:'String', visible:false},
            {binding:'st11Empno'	,header:'등록자사번', width:100, align:'center', dataType:'Number', visible:false},
            {binding:'st11Hno'		,header:'반납요청서번호', width:100, align:'center', dataType:'String', visible:false},
            {binding:'st11Company'	,header:'회사', width:100, align:'center', dataType:'String', visible:false},
            {binding:'st11Factory'	,header:'공장', width:100, align:'center', dataType:'String', visible:false}
			// button with regular bound text
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(500);
        //체크박스 컬럼 생성
        //grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
        //셀고정
        //grid.enableFrozenCol('select');
        //키가되는 컬럼으로 변경이 되면 안되는 컬럼
        //grid.disableReadOnlyForAutoRows(['itemNm','qrCode','relQty','storage','area']);
        //대문자로 변경하고싶은 컬럼
        //grid.toUpperCase(['itemNm','qrCode','relQty','storage','area']);

        //데이터를 DB에서 받아와서 처리해야할경우 데이터를 받아와서 dataMap을 만들고 넣고자 하는 컬럼의 dataMap에 넣는다.
		/*
		let st02Status =  getCommonCodeList('W005');
		grid._flexGrid.getColumn('st02Status').dataMap = new wijmo.grid.DataMap(st02Status, 'cm05Value', 'cm05Name');
		*/
        let st11Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st11Stok').dataMap = new wijmo.grid.DataMap(st11Stok, 'cm15Code', 'cm15Name');
		let st11Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st11Dist').dataMap = new wijmo.grid.DataMap(st11Dist, 'cm16Code', 'cm16Name');
		
		//그리드 오류체크
        grid._flexCv.getError = (item,prop) => {
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
			
			let dit_pattern = RegExp(/^[0-9|\*]/); // 숫자
                
            switch (prop) {
                case 'st02Qty':
                    if(wijmo.isNullOrWhiteSpace(item.st02Qty)) return '[수량]은 필수 입력 항목입니다.';
					if(item.st02Qty <= 0) return '[수량]은 0보다 작을 수 없습니다.';
					if(!dit_pattern.test(item.st02Qty)) return "[수량]은 숫자 만 입력이 가능합니다.";
                    break;
                case 'st11Stok':
                    if(wijmo.isNullOrWhiteSpace(item.st11Stok)) return '[창고]는 필수 입력 항목입니다.';
                    break;
                case 'st11Dist':
                    if(wijmo.isNullOrWhiteSpace(item.st11Dist)) return '[구역]은 필수 입력 항목입니다.';
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
	
	/**
     * 조회 함수
     */
    const search = async() => {
		
        grid.disableAutoRows();
		
        let params = {
            uri: `restore/restore`,
			st10No : $('#data-params').data('params').st10No
        }
        params = {...params,...ajax.getParams('searchForm')}
        
        try {
            let {restoreList} = await ajax.getAjax(params,true);  
            //grid._flexCv.sourceCollection = warehousingList.map(item => ({...item, select:false}));
			
			if(restoreList.length > 0 ) {
				
				grid._flexCv.sourceCollection = restoreList.map(item => ({...item, select:false}));
				
				$("#st10No").val($('#data-params').data('params').st10No);
				$("#st10Dat").val(restoreList[0].st02Dat);
	            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);
			} else {
				$("#st10No").val($('#data-params').data('params').st10No);
				$("#st10Dat").val(dateUtils.today('YYYY-MM-DD'));
				pushMsg(`반납 내역이 존재하지\n않습니다.`);	
			}

        } catch(error) {
            //alertError('오류', error);
            return;
        }

    }
	
	const saveResotre = () => {
		
		grid.disableAutoRows();
		
		if(!grid.gridValidation()){
            alertWarning('저장불가', '그리드 오류내역을 확인하세요.');
            return;
        }
		
		let updateList = grid.gridItemListToArray(grid._flexCv.itemsEdited);
		if(updateList.length < 1) {
			alertWarning('저장불가','저장할 내역이 없습니다.');
            return;
        }

		confirm("반납을 등록하시겠습니까?", "반납이 등록됩니다.", consts.MSGBOX.QUESTION, () => {
			
			let params = {
                uri: `restore/restore`,
                updateList: updateList
            };
			
			params = {...params,...ajax.getParams('#submitForm')};
			
        	ajax.postAjax(params, true).then(async (data)=>{
	            $(".text-bg-danger").text("완료");
				$("#btnSave").hide();
	            pushMsg('반납처리 되었습니다.');
            }).catch((e)=>{
                console.debug(e);
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

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{
		
        gridInit();
		search();
		
		$('#btnBack').on('click', goBack);
		$('#btnSave').on('click', saveResotre);
    }
	
	// 스캐너 값 얻기
	$(document).scannerDetection({
		/*timeBeforeScanTest: 40, // wait for the next character for upto 200ms
		startChar: [16, 45, 189], // Prefix character for the cabled scanner (OPL6845R)
		changeChar: [189], // Prefix character for the cabled scanner (OPL6845R)*/
		timeBeforeScanTest: 200, // 다음스캔까지 딜레이
		onComplete: function(barcode, qty){

			let matchBar = false;
			//barcode = barcode.toUpperCase();
			// 길이는 추후 변경될 수도 있음
			if(barcode.length == 17) {

				grid._flexGrid.rows.some((row, index, array)=>{
					if (!wijmo.isUndefined(row.dataItem) && !wijmo.isNullOrWhiteSpace(row.dataItem)) {

						// 납품확인서의 LOT번호와 다른 LOT번호를 찍은 경우에 경고메시지 및 입력이 안되도록 막아줘야함
						if(row.dataItem.st02Lot == barcode.substring(0, 13)){
							if(wijmo.isNullOrWhiteSpace(row.dataItem.st02Qrcode) || wijmo.isUndefined(row.dataItem.st02Qrcode)){
								// 리딩 시 여기 if문 안들어오면 일치하는 품번이 존재하지 않음.
								// match가 되었을 경우 true
								matchBar = true;
								// 바코드 값들어가는 경우 select값 true로 변경
								//grid._flexGrid.setCellData(index,'select',true);
								
								// 중복체크가 되어야한다.
								for(var i=0; i < grid._flexGrid.rows.length; i++){
									if(!wijmo.isUndefined(grid._flexGrid.getCellData(i,'st02Qrcode'))){
										if(barcode == grid._flexGrid.getCellData(i,'st02Qrcode')){
											grid._flexGrid.setCellData(index, 'st02Qrcode', '');
											alertWarning('작업 불가','QR코드는 중복될 수 없습니다.');
											return ;
										}
									}
								}

								// 값 넣어주기
								grid._flexGrid.setCellData(index, 'st02Qrcode', barcode);
								return true;
							}
						}

					} else {
						alertWarning("작업불가", "납품확인서를 선택해주세요");
						return ;
					}
				});

				// 바코드의 lot와 row의 lot가 매치가 되지 않았을 경우
				if(matchBar == false){
					alertWarning("작업불가", "리딩한 바코드와 일치하는 LOT번호가 존재하지 않습니다.")
					return ;
				}

			} else {
				alertWarning('작업 불가', 'QR코드의 길이가 맞지않습니다.', 'warning');
				return;
			}

			
		}
	});


    return{
        init:()=>{
            handleEvent();
        }
    }
}();


$(()=>{
    restore.init();
});