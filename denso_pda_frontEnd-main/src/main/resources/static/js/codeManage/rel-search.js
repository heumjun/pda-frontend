
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
    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
			{binding:'mf13No'		,header:'출고요청번호'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf13Dat'		,header:'요청일자'			,width:110	,dataType:'Date'	,align:'center'	,isReadOnly: true},
			{binding:'mf13Indte'	,header:'요청시간'			,width:110	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf13Cus'		,header:'제조사'			,width:110	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'cm01Name'		,header:'제조사명'			,width:110	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf13LineCode'	,header:'라인코드'			,width:70	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'st03No'		,header:'재고단위'			,visible: false},
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(600);
        //체크박스 컬럼 생성
        grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
        //셀고정
        grid.enableFrozenCol('select');
        //키가되는 컬럼으로 변경이 되면 안되는 컬럼
        /*grid.disableReadOnlyForAutoRows(['itemNm','qrCode','relQty','storage','area']);*/
        //대문자로 변경하고싶은 컬럼
        grid.toUpperCase(['mf13No','mf13Dat','mf13Indte','mf13LineCode']);
    }
	grid._flexGrid.addEventListener(grid._flexGrid.hostElement,consts.JQUERYEVENT.DBLCLICK,(e)=>{
	    let ht = grid._flexGrid.hitTest(e);     //더블클릭한 셀의 정보
	    if(ht.panel==grid._flexGrid.cells){    //그리드 셀에 더블클릭했을때
	        if(grid._flexGrid.getColumn(ht.col).binding=='mf13No'){  // aaaa 컬럼 더블클릭했을경우
	            console.log(ht);
				let form = $('<form></form>');
				form.attr("method","get");
				form.attr("action","view");
				form.attr("target","_self");

				form.append($('<input/>', {type: 'hidden', name: 'view', value:'system/rel-materials' }));
				form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'system/rel-materials' }));
				form.append($('<input/>', {type: 'hidden', name: 'title', value:'출고처리' }));
				form.append($('<input/>', {type: 'hidden', name: 'mf13No', value:grid._flexGrid.getCellData(ht._row,ht.col) }));
				form.append($('<input/>', {type: 'hidden', name: 'st03No', value:grid._flexGrid.getCellData(ht._row,6) }));
				form.appendTo('body');
				form.submit();
	        }
	    }
	});
	
	const qrReadView = function() {
		console.log("qr read view move");
	}
	
	/**
     * 조회 함수
     */
    const search = async ()=>{
        
        grid.disableAutoRows();
        
        let params = {
            uri: `pda/rel-search`
        }

        params = {...params};

        await ajax.getAjax(params,true).then(data=>{
            grid._flexCv.sourceCollection =  data['list'].map(item=>({
                ...item,
                select:false
            }));
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);
        }).catch((e)=>{});
    }

    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{

        gridInit();
		
		$('#btn-back').on('click',qrReadView);
    }


    return{
        init:()=>{
            handleEvent();
			search();
        }
    }
}();


$(()=>{
    returnReg.init();
    
});
