
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const outputRegister = function(){
    
    let grid  = new GridFactory('#grid');
    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
            /*{binding:'select'	,header:' '		,width:30	,dataType:'Boolean'	,isRequired:false},*/
            {binding:'cm08Name'	,header:'품목명'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50	,isReadOnly: true},
            {binding:'st03Qr'	,header:'QR코드'	,width:150	,dataType:'String'	,align:'center'	,maxLength:6,},
			{binding:'st03Qty'	,header:'출고수량'	,width:100	,dataType:'Number'	,editor:numberInput	,isRequired:true},
            {binding:'st03Stok'	,header:'창고'	,width:130	,dataType:'String'	,align:'left'	,maxLength:50},
			{binding:'st03Dist'	,header:'구역'	,width:130	,dataType:'String'	,align:'left'	,maxLength:50},
        ];

        //그리드 컬럼셋팅
        grid.setColumnsDefinition(columnsDefinition);
        //그리드 높이 자동조절
        grid.setDynamicHeight(350);
        //체크박스 컬럼 생성
        grid.checkBoxColumns(["select"]);
        //옵션판넬 생성(모바일상태에서는 없어지고 데스크톱모드에서 보여짐)
        grid.optionPanel('#grid-option');
		
		let st03Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st03Stok').dataMap = new wijmo.grid.DataMap(st03Stok, 'cm15Code', 'cm15Name');
		let st03Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st03Dist').dataMap = new wijmo.grid.DataMap(st03Dist, 'cm16Code', 'cm16Name');
		
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
				let addRow = grid._flexCv.addNew();
				addRow.st03OutputNo = item.mf13No;
				addRow.st03OutputDtlNo = item.mf14No;
				addRow.st03Qty = item.mf14Qty;
				addRow.cm08Code = item.mf14Code;
				addRow.cm08Name = item.cm08Name;
				addRow.cm08Gbn = item.cm08Gbn;
				addRow.cm08Dgbn = item.cm08Dgbn;
				addRow.st03Unt = item.mf14Unt;
				
				addRow.st03Stok = "01";
				addRow.st03Dist = "001";

				grid._flexCv.commitNew();

	        });
			
			$("#st03OutputNo").val($('#data-params').data('params').mf13No);
			$("#st03Dat").val($('#data-params').data('params').mf13Dat);
			$("#st03DatTime").val($('#data-params').data('params').mf13DatTime);
			$("#st03Line").val($('#data-params').data('params').mf13LineCode);
			$("#st03Linena").val($('#data-params').data('params').mf13LineNm);
			
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);

        } catch(error) {
            console.debug(error);
            alertError('오류', error);
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
		if(!grid.gridValidation()){
            alertWarning('저장불가', '그리드 오류내역을 확인하세요.');
            return;
        }
		
		let insertList = grid.gridItemListToArray(grid._flexCv.itemsAdded);
		let updateList = grid.gridItemListToArray(grid._flexCv.itemsEdited);
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
	            $(".text-bg-danger").text("입고완료");
				$("#btnSave").hide();
	            pushMsg('입고 등록 되었습니다.');
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


    return{
        init:()=>{
            handleEvent();
        }
    }
}();


$(()=>{
    outputRegister.init();
    
});
