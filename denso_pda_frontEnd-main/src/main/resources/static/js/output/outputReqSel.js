
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as consts from "../common/constants.js";
import { pushMsg } from "../common/msgBox.js";

const outputReqSel = function(){
    
    let grid  = new GridFactory('#grid');
    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
			{binding:'mf13No'		,header:'출고요청번호'		,width:150	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf13LineCode'	,header:'라인코드'			,width:70	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf13LineNm'	,header:'라인명'			,width:110	,dataType:'String'	,align:'center'	,isReadOnly: true},
			{binding:'mf13Dat'		,header:'요청일자'			,width:110	,dataType:'Date'	,align:'center'	,isReadOnly: true},
			{binding:'mf13DatTime'	,header:'요청시간'			,width:70	,dataType:'String'	,align:'center'	,isReadOnly: true}
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
	grid._flexGrid.addEventListener(grid._flexGrid.hostElement,consts.JQUERYEVENT.CLICK,(e)=>{
	    let ht = grid._flexGrid.hitTest(e);     //더블클릭한 셀의 정보
	    if(ht.panel==grid._flexGrid.cells){    //그리드 셀에 더블클릭했을때
	        if(grid._flexGrid.getColumn(ht.col).binding=='mf13No'){  // aaaa 컬럼 더블클릭했을경우
				let form = $('<form></form>');
				form.attr("method","get");
				form.attr("action","view");
				form.attr("target","_self");

				form.append($('<input/>', {type: 'hidden', name: 'view', value:'output/outputRegister' }));
				form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'system/outputRegister' }));
				form.append($('<input/>', {type: 'hidden', name: 'title', value:'출고 처리' }));
				form.append($('<input/>', {type: 'hidden', name: 'mf13No', value:grid._flexGrid.getCellData(ht._row,ht.col) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf13Dat', value:grid._flexGrid.getCellData(ht._row, 3) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf13DatTime', value:grid._flexGrid.getCellData(ht._row, 4) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf13LineCode', value:grid._flexGrid.getCellData(ht._row, 1) }));
				form.append($('<input/>', {type: 'hidden', name: 'mf13LineNm', value:grid._flexGrid.getCellData(ht._row, 2) }));
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
            uri: `output/outputReqSel`
        }

        params = {...params};

        await ajax.getAjax(params,true).then(data=>{
            grid._flexCv.sourceCollection =  data['detailInfo'].map(item=>({
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
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'output/outputReqSel' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'output/outputReqSel' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'출고 조회' }));
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
            handleEvent();
			search();
        }
    }
}();


$(()=>{
    outputReqSel.init();
});
