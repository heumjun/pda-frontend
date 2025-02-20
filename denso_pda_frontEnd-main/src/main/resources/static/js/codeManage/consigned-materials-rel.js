
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
			// button with regular bound text
			{binding:'delete'	,header: '삭제'	,width: 150	
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					click: (e, ctx) => {
						console.log(ctx);
						alert('Clicked Button Delete** ' + ctx.item.qrCode + ' **');
					}
				})
			},
            {binding:'cm08Name'	,header:'부품명'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50 	,isReadOnly: true},
            {binding:'qrCode'	,header:'QR코드'	,width:70	,dataType:'String'	,align:'center'	,maxLength:6 	,isReadOnly: true},
			{binding:'relQty'	,header:'출고수량'	,width:130	,dataType:'Number'	,editor:numberInput	,isRequired:true},
            {binding:'st01Qty'	,header:'현재고량'	,width:130	,dataType:'Number' 	,isReadOnly: true},
            {binding:'cm15Name'	,header:'창고'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50 	,isReadOnly: true},
			{binding:'cm16Name'	,header:'구역'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50 	,isReadOnly: true},
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
        /*grid.disableReadOnlyForAutoRows(['itemNm','qrCode','relQty','storage','area']);*/
        //대문자로 변경하고싶은 컬럼
        /*grid.toUpperCase(['itemNm','qrCode','relQty','storage','area']);*/

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
	
	const qrReadView = function() {
		console.log("qr read view move");
	}
	
	const qrTestFnc = async ()=> {
		let params = {
            uri: `pda/consigned-materials-rel/qrcode`
			,mf15No : $('#data-params').data('params').mf15No
			,mf13No : $('#data-params').data('params').mf13No
			,mf16No : "2025021800006"
        };
		
		params = {...params};

        await ajax.postAjax(params,true).then(data=>{
			let result = data['result'];
			console.log(result);
			if(result.result_status == "S") {
				let resultData = result.result_data;
				
			} else {
				pushMsg(`해당 항목은 없습니다.`);
			}
            /*pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);*/
        }).catch((e)=>{});
	}
	
	const calcBtns = function(event) {
		let targetObj = $(event.target);
		if(event.target.tagName.toUpperCase() == "SPAN" || event.target.tagName.toUpperCase() == "PATH") {
			targetObj = $(event.target).closest("button");
		}
		let type = targetObj.data('value').substr(0,1);
		let calcVal = targetObj.data('value').substr(1,targetObj.data('value').length-1);
		let resultVal = 0;
		if(type == "p") {
			console.log('더한거~~');
		} else {
			console.log('뺀거~~');
		}
	}
	
	/**
     * 조회 함수
     */
    const findCmrInfo = async ()=>{
        
        grid.disableAutoRows();
        
        let params = {
            uri: `pda/consigned-materials-rel`
			,mf15No : $('#data-params').data('params').mf15No
			,mf13No : $('#data-params').data('params').mf13No
        }

        params = {...params};

        await ajax.postAjax(params,true).then(data=>{
			let masterInfo = data['info'];
			
			$("#cmrReqNo").val(masterInfo.mf15No);
			$("#cmrReqDt").val(masterInfo.mf13Dat);
			$("#cmrReqClient").val(masterInfo.cm01Name); //이게 제조사를 말하는지 아니면 거래처를 말하는지는 모름...
			
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
		$(".btn-calc").on('click',calcBtns);
		$("#btn-test").on('click',qrTestFnc);
    }


    return{
        init:()=>{
			if(!commonFunc.isEmpty($('#data-params').data('params').mf13No))$("#btn-save:last-child").text("출고삭제");
			else $("#btn-save:last-child").text("출고등록");
            handleEvent();
			findCmrInfo();
        }
    }
}();


$(()=>{
    returnReg.init();
});
