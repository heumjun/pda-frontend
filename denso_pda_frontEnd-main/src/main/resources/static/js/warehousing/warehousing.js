
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
            {binding:'cm08Name'		,header:'품목명'	,width:150	,dataType:'String'	,align:'center'	,maxLength:50},
            {binding:'st02Qrcode'	,header:'QR 코드'	,width:150	,dataType:'String'	,align:'center'	,maxLength:6,},
			{binding:'st02Ipqty'	,header:'수량'	,width:100	,dataType:'Number'	,align:'center'	,editor:numberInput	,isRequired:true},
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

        //데이터를 DB에서 받아와서 처리해야할경우 데이터를 받아와서 dataMap을 만들고 넣고자 하는 컬럼의 dataMap에 넣는다.
		let st02Status =  getCommonCodeList('W005');
		grid._flexGrid.getColumn('st02Status').dataMap = new wijmo.grid.DataMap(st02Status, 'cm05Value', 'cm05Name');
        let st02Stok = getWarehouseCodeList();
        grid._flexGrid.getColumn('st02Stok').dataMap = new wijmo.grid.DataMap(st02Stok, 'cm15Code', 'cm15Name');
		let st02Dist = getDistrictCodeList();
		grid._flexGrid.getColumn('st02Dist').dataMap = new wijmo.grid.DataMap(st02Dist, 'cm16Code', 'cm16Name');
		
		//그리드 오류체크
        grid._flexCv.getError = (item,prop)=>{
            //셀수정모드 일경우 오류검증 안함 (포커스 이동이 안됨으로)
            if(grid._flexCv.isEditingItem) return null;
                
            switch (prop) {
                /*case 'st02No':
                    if(wijmo.isNullOrWhiteSpace(item.st02No)) return '[입고번호]는 필수 입력 항목입니다.';
                    break;*/
                case 'cm08Code':
                    if(wijmo.isNullOrWhiteSpace(item.cm08Code)) return '[품목코드]는 필수 입력 항목입니다.';
                    break;
                case 'st02Qrcode':
                    if(wijmo.isNullOrWhiteSpace(item.st02Qrcode)) return '[QR코드]는 필수 입력 항목입니다.';
                    break;
                case 'st02Ipqty':
                    if(item.st02Ipqty <= 0) return '[박스수량]은 0보다 커야합니다.';
                    break;
                case 'st02Status':
                    if(wijmo.isNullOrWhiteSpace(item.st02Status)) return '[상태]는 필수 입력 항목입니다.';
                    break;
                case 'st02Stok':
                    if(wijmo.isNullOrWhiteSpace(item.st02Stok)) return '[창고]는 필수 입력 항목입니다.';
                    break;
                case 'st02Dist':
                    if(wijmo.isNullOrWhiteSpace(item.st02Dist)) return '[구역]은 필수 입력 항목입니다.';
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
    const searchOfwarehousing = async() => {
		
        grid.disableAutoRows();
		
        let params = {
            uri: `warehousing/warehousing`,
			pu01No : $('#data-params').data('params').pu01No
        }
        params = {...params,...ajax.getParams('searchForm')}
        
        try {
            let {warehousingList} = await ajax.getAjax(params,true);  
            //grid._flexCv.sourceCollection = warehousingList.map(item => ({...item, select:false}));
			
			grid._flexCv.sourceCollection = [];
			warehousingList.forEach( (item, index) => {
				
	            var newRowLength = item.rowCnt;

				for( var i = 0; i < newRowLength; i++ ) {
					 let addRow = grid._flexCv.addNew();
					 addRow.st02Pno = $('#data-params').data('params').pu01No;
					 addRow.cm08Code = item.cm08Code;
					 addRow.cm08Name = item.cm08Name;
					 addRow.st02Cus = item.pu01Cus;
					 addRow.cm08Gbn = item.cm08Gbn;
					 addRow.cm08Dgbn = item.cm08Dgbn;
					 addRow.st02Dat = item.pu01Dat;
					 addRow.st02Ipqty = 1;
					 addRow.st02Ipunt = '1';
					 addRow.st02Stok = '01';
					 addRow.st02Dist = '001';
					 addRow.st02Status = item.st02Status;
					 addRow.qa05Available = item.qa05Available;

					grid._flexCv.commitNew();
				}

	        });
			
			$("#st02Pno").val($('#data-params').data('params').pu01No);
			$("#st02Dat").val(dateUtils.today('YYYY-MM-DD'));
			
			/*if ( grid.getRowCnt() > 0 ) {	// 입고완료
				 $(".text-bg-danger").text("입고완료");
				 $("#btnStatus").text("입고삭제");
			} else {	// 입고 미처리
				$(".text-bg-danger").text("입고 미처리");
				$("#btnStatus").text("입고등록");
			}*/
			
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);

        } catch(error) {
            console.debug(error);
            alertError('오류', error);
            return;
        }

    }
	
	const saveWareHousing = () => {
		
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

		confirm('입고이력을 등록하시겠습니까?', '입고이력이 등록됩니다.', consts.MSGBOX.QUESTION, () => {
			
			let params = {
                uri: `warehousing/warehousing`,
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
		searchOfwarehousing();
		
		$('#btnBack').on('click', goBack);
		$('#btnSave').on('click', saveWareHousing);
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