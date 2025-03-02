
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const returnReg = function(){
    
    let grid  = new GridFactory('#grid');
	let qtyInput = input.number('#qtyInput',1,0,999999,'G10');
    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
            {binding:'select'	,header:' '		,width:30	,dataType:'Boolean'	,isRequired:false},
			{binding:'delete'	,header: ' '	,width:60	
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					text: '삭제',
					click: (e, ctx) => {
						//console.log(ctx);
						alert('Clicked Button Delete** ' + ctx.item.st02No + ' **');
					}
				})
			},
            {binding:'cm08Name'		,header:'품목명'	,width:150	,dataType:'String'	,align:'center'	,maxLength:50},
            {binding:'st02Qrcode'	,header:'QR 코드'	,width:70	,dataType:'String'	,align:'center'	,maxLength:6,},
			{binding:'st02Ipqty'	,header:'입고수량'	,width:130	,dataType:'Number'	,align:'center'	,editor:numberInput	,isRequired:true},
            {binding:'st02Status'	,header:'상태'	,width:130	,dataType:'Number'	,align:'center', isReadOnly:true},
            {binding:'st02Stok'		,header:'창고'	,width:150	,dataType:'String'	,align:'center'	,maxLength:50},
			{binding:'st02Dist'		,header:'구역'	,width:150	,dataType:'String'	,align:'center'	,maxLength:50},
			// button with regular bound text
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(350);
        //체크박스 컬럼 생성
        grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
        //셀고정
        grid.enableFrozenCol('select');
        //키가되는 컬럼으로 변경이 되면 안되는 컬럼
        //grid.disableReadOnlyForAutoRows(['itemNm','qrCode','relQty','storage','area']);
        //대문자로 변경하고싶은 컬럼
        //grid.toUpperCase(['itemNm','qrCode','relQty','storage','area']);

        //unit데이터를 DB에서 받아와서 처리해야할경우 데이터를 받아와서 dataMap을 만들고 넣고자 하는 컬럼의 dataMap에 넣는다.
        //let storage = [{key:'storage1',name:'창고1'},{key:'storage2',name:'창고2'},{key:'storage3',name:'창고3'}];
		
		let st02Status =  getCommonCodeList('W005');
		grid._flexGrid.getColumn('st02Status').dataMap = new wijmo.grid.DataMap(st02Status, 'cm05Value', 'cm05Name');
        let st02Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st02Stok').dataMap = new wijmo.grid.DataMap(st02Stok, 'cm15Code', 'cm15Name');
		//let area = [{key:'area1',name:'아산'},{key:'area2',name:'창원'},{key:'area3',name:'마산'}];
		let st02Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st02Dist').dataMap = new wijmo.grid.DataMap(st02Dist, 'cm16Code', 'cm16Name');

        //그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
                
            switch (prop) {
                case 'relQty':
                    if(wijmo.isNullOrWhiteSpace(item.relQty)) return '[출고수량]를 입력하세요.';
                    break;
                case 'qrCode':
                    if(grid.isSameColumnValue(item,['qrCode'])) return 'QR코드가 중복되는 내역이 존재합니다.';
                    break;
                default:
                    return null;
            }
        }
        
    }
	
	/**
	 * 공통코드
	 */
	const getCommonCodeList = (commonCode)=>{
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
    const searchOfwarehousing = async () => {
		
        grid.disableAutoRows();
        
        let params = {
            uri: `warehousing/warehousing`,
        }
        params = {...params,...ajax.getParams('searchForm')}
        
        try {
            let {warehousingList} = await ajax.getAjax(params,true);  
            
            grid._flexCv.sourceCollection = warehousingList.map(item => ({...item, select:false}));
			
			if ( grid.getRowCnt() > 0 ) {	// 입고완료
				 $(".text-bg-danger").text("입고완료");
				 $("#btnStatus").text("입고삭제");
			} else {	// 입고 미처리
				$(".text-bg-danger").text("입고 미처리");
				$("#btnStatus").text("입고등록");
			}
			
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);

        } catch (error) {
            console.debug(error);
            alertError('오류',error);
            return;
        }

    }

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{

        gridInit();
		searchOfwarehousing();
		
		$('#btn-search').on('click', searchOfwarehousing);
    }


    return{
        init:()=>{
            handleEvent();
        }
    }
}();


$(()=>{
    returnReg.init();
    
});

// 스캐너 값 얻기
/*$(document).scannerDetection({
    //$('#returnForRegGrid').scannerDetection({
    //ignoreIfFocusOn: 'input[type="text"]',
    //timeBeforeScanTest: 100, // wait for the next character for upto 200ms
    timeBeforeScanTest: 50, // wait for the next character for upto 200ms
    startChar: [16], // Prefix character for the cabled scanner (OPL6845R)
    endChar: [9, 13], // be sure the scan is complete if key 13 (enter) is detected
    avgTimeByChar: 40, // it's not a barcode if a character takes longer than 40ms
    onComplete: function(barcode, qty){
		alert(2);
		$("#st02Cus").val(barcode);
        console.log(">>["+barcode+"]("+barcode.length+")");
        //getBarcodeInfo(barcode);
    },
	onerror : function (barcode, qty) {
		alert(1); 
		alert(barcode);
	}
});*/

