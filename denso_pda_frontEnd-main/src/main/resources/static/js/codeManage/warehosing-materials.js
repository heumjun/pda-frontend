
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
            {binding:'itemNm'	,header:'부품명'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50},
            {binding:'qrCode'	,header:'QR코드'	,width:70	,dataType:'String'	,align:'center'	,maxLength:6,},
			{binding:'relQty'	,header:'출고수량'	,width:130	,dataType:'Number'	,editor:numberInput	,isRequired:true},
            {binding:'sotreQty'	,header:'재고수량'	,width:130	,dataType:'Number'},
            {binding:'storage'	,header:'창고'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50},
			{binding:'area'		,header:'구역'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50},
			// button with regular bound text
			{binding:'delete'	,header: '삭제'	,width: 150	
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					click: (e, ctx) => {
						console.log(ctx);
						alert('Clicked Button Delete** ' + ctx.item.qrCode + ' **');
					}
				})
			},
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
        grid.disableReadOnlyForAutoRows(['itemNm','qrCode','relQty','storage','area']);
        //대문자로 변경하고싶은 컬럼
        grid.toUpperCase(['itemNm','qrCode','relQty','storage','area']);

        //unit데이터를 DB에서 받아와서 처리해야할경우 데이터를 받아와서 dataMap을 만들고 넣고자 하는 컬럼의 dataMap에 넣는다.
        let storage = [{key:'storage1',name:'창고1'},{key:'storage2',name:'창고2'},{key:'storage3',name:'창고3'}];
        grid._flexGrid.getColumn('storage').dataMap = new wijmo.grid.DataMap(storage,'key','name');
		let area = [{key:'area1',name:'아산'},{key:'area2',name:'창원'},{key:'area3',name:'마산'}];
		grid._flexGrid.getColumn('area').dataMap = new wijmo.grid.DataMap(area,'key','name');


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
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{

        gridInit();
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
