
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as consts from "../common/constants.js";
import { pushMsg } from "../common/msgBox.js";
import { menuLoad } from "../common/commonMenu.js";

// 사급요청 조회
const consignedMaterialsReq = function(){
    
    let grid  = new GridFactory('#grid');
    /**
     * 그리드 초기화
     */
    const gridInit = () => {
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
			{binding:'mf15No'		,header:'사급요청서번호'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf15Dat'		,header:'요청일자'			,width:110	,dataType:'Date'	,align:'center'	,isReadOnly: true},
			{binding:'mf15Time'		,header:'요청시간'			,width:70	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf15Cus'		,header:'제조사'			,width:70	,dataType:'String'	,align:'center'	,isReadOnly: true,visible:false},
			{binding:'mf15CusName'	,header:'제조사'			,width:70	,dataType:'String'	,align:'center'	,isReadOnly: true},
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(500);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
    }
	grid._flexGrid.addEventListener(grid._flexGrid.hostElement,consts.JQUERYEVENT.CLICK,(e)=>{
	    let ht = grid._flexGrid.hitTest(e);     //더블클릭한 셀의 정보
	    if(ht.panel==grid._flexGrid.cells){    //그리드 셀에 더블클릭했을때
	        if(grid._flexGrid.getColumn(ht.col).binding=='mf15No'){  // aaaa 컬럼 더블클릭했을경우
				let form = $('<form></form>');
				form.attr("method","get");
				form.attr("action","view");
				form.attr("target","_self");

				form.append($('<input/>', {type: 'hidden', name: 'view', value:'stock/consignedMaterialsReg' }));
				form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'stock/consignedMaterialsReg' }));
				form.append($('<input/>', {type: 'hidden', name: 'title', value:'사급 요청 등록' }));
				form.append($('<input/>', {type: 'hidden', name: 'mf15No', value:grid._flexGrid.getCellData(ht._row,ht.col) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf15Dat', value:grid._flexGrid.getCellData(ht._row, 1) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf15Time', value:grid._flexGrid.getCellData(ht._row, 2) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf15Cus', value:grid._flexGrid.getCellData(ht._row, 3) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf15CusName', value:grid._flexGrid.getCellData(ht._row, 4) }));
				form.appendTo('body');
				form.submit();
	        }
	    }
	});
	
	/**
     * 조회 함수
     */
    const search = async ()=>{
        
        grid.disableAutoRows();
        
        let params = {
            uri: `consignedMaterialsReq/consignedMaterialsReq`
        }

        //params = {...params};

        await ajax.getAjax(params,true).then(data=>{
            grid._flexCv.sourceCollection =  data['consignedMaterialsReqList'].map(item=>({
                ...item,
                select:false
            }));
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);
        }).catch((e)=>{});
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
		
		$('#btnBack').on('click', goBack);
    }


    return{
        init:()=>{
			menuLoad();
            handleEvent();
			search();
        }
    }
}();


$(() => {
    consignedMaterialsReq.init();
});
