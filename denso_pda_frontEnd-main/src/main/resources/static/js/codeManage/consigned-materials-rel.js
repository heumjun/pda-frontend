
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";
import * as signature from "../common/signature_pad.umd.min.js";

const returnReg = function(){
    
    let grid  = new GridFactory('#grid');
	let qtyInput = input.number('#qtyInput',1,0,999999,'G10');
	let cmrInfo = undefined;
	let signaturePad = new SignaturePad(document.getElementById('signature-pad'), {
	  backgroundColor: 'rgba(255, 255, 255, 0)',
	  penColor: 'rgb(0, 0, 0)'
	});
    /**
     * 그리드 초기화
     */
    const gridInit = ()=>{
		
        let numberInput = input.number(document.createElement('div'),1,0,999999,'G10');		
        let columnsDefinition = [
            {binding:'delete'	,header: '삭제'	,width: 80	
				,cellTemplate: wijmo.grid.cellmaker.CellMaker.makeButton({
					text: '<b>삭제</b>'
					,click: (e, ctx) => {
						alert('Clicked Button Delete** ' + ctx.item.qrCode + ' **');
						
						let view = grid._flexCv;
						let rowIndex = ctx.row.index; // rowIndex 가져오기
					    if (rowIndex >= 0 && rowIndex < view.items.length) {
					      	  view.removeAt(rowIndex);
					    }
					}
				})
			},
            {binding:'cm08Name'	,header:'부품명'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50 	,isReadOnly: true},
            {binding:'qrCode'	,header:'QR코드'	,width:70	,dataType:'String'	,align:'center'	,maxLength:6 	,isReadOnly: true},
			{binding:'outputQty',header:'출고수량'	,width:130	,dataType:'Number'	,editor:numberInput	,isRequired:true},
            {binding:'st01Qty'	,header:'현재고량'	,width:130	,dataType:'Number' 	,isReadOnly: true},
            {binding:'cm15Name'	,header:'창고'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50 	,isReadOnly: true},
			{binding:'cm16Name'	,header:'구역'	,width:150	,dataType:'String'	,align:'left'	,maxLength:50 	,isReadOnly: true},
			{binding:'st01Lot'	,header:'LOT번호'	,visible: false},
			{binding:'st01Unt'	,header:'재고단위'	,visible: false},
			{binding:'mf16Code'	,header:'품목코드'	,visible: false},
			{binding:'mf15No'	,header:'사급지시서번호',visible: false},
			{binding:'st01District'	,header:'구역',visible: false},
			{binding:'mf15Cus'	,header:'구역',visible: false},
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
                case 'outputQty':
                    if(wijmo.isNullOrWhiteSpace(item.outputQty)) return '[출고수량]를 입력하세요.';
                    break;
                default:
                    return null;
            }
        }
        
    }
	//추후 qr read view가 완성되었을 경우 연결처리
	const qrReadView = function() {
		console.log("qr read view move");
	}
	//qr code reader가 현재 완성되지 않았으므로 임의 생성
	const qrTestFnc = async ()=> {
		let params = {
            uri: `pda/consigned-materials-rel/qrcode`
			,mf15No : $('#data-params').data('params').mf15No
			,mf16No : "2025021800006"
        };
		
		params = {...params};
		//new row추가시
		/*let newRow = grid._flexCv.addNew({"cm15Name":"AAA"});*/
        await ajax.postAjax(params,true).then(data=>{
			let result = data['result'];
			if(result.result_status == "S") {
				let resultData = result.result_data;
				let temp = grid._flexCv.sourceCollection.filter((c) => ( c.cm08Name === resultData.cm08Name ));
				if(temp.length == 0) grid._flexCv.addNew(resultData);
				else alertWarning('중복 항목',`중복된 항목입니다.`);
			} else {
				pushMsg(`해당 항목은 없습니다.`);
			}
            /*pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);*/
        }).catch((e)=>{});
	}
	
	//사인 팝업 호출
	const signPopupShow = function() {
		//사인 팝업 호출 및 백그라운드 클릭시 팝업 닫힘 방지 처리
		$('#signPopup').modal({backdrop:'static', keyboard:false});
		$('#signPopup').modal('show');
	}
	//+1~+100까지 버튼 입력 액션 처리
	//max : 재고의 최대값 min : 재고의 최소값
	const calcBtns = function(event) {
		let targetObj = $(event.target);
		let type = targetObj.data('value').substr(0,1);
		let calcVal = targetObj.data('value').substr(1,targetObj.data('value').length-1);
		
		if(type == "p") {
			grid._flexGrid.rows.forEach((row,index,array)=>{
				let resultVal = 0;
				let targetData = commonFunc.isEmpty(row.dataItem['outputQty']) ? 0 : parseInt(row.dataItem['outputQty']);
				let limitData = commonFunc.isEmpty(row.dataItem['st01Qty']) ? 0 : parseInt(row.dataItem['st01Qty']);
				resultVal = targetData + parseInt(calcVal);
				
				if(resultVal > limitData) grid._flexGrid.setCellData(index,"outputQty",limitData);
				if(resultVal <= limitData) grid._flexGrid.setCellData(index,"outputQty",resultVal);
			});
		} else {
			grid._flexGrid.rows.forEach((row,index,array)=>{
				let resultVal = 0;
				let targetData = commonFunc.isEmpty(row.dataItem['outputQty']) ? 0 : parseInt(row.dataItem['outputQty']);
				let limitData = commonFunc.isEmpty(row.dataItem['st01Qty']) ? 0 : parseInt(row.dataItem['st01Qty']);
				resultVal = targetData - parseInt(calcVal);
				
				if(resultVal < 0) grid._flexGrid.setCellData(index,"outputQty", 0);
				if(resultVal >= 0) grid._flexGrid.setCellData(index,"outputQty",resultVal);
			});
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
        }

        params = {...params};

        await ajax.postAjax(params,true).then(data=>{
			cmrInfo = data['info'];
			
			$("#cmrReqNo").val(cmrInfo.mf15No);
			$("#cmrReqDt").val(cmrInfo.st03Dat);
			$("#cmrReqClient").val(cmrInfo.cm01Name); //이게 제조사를 말하는지 아니면 거래처를 말하는지는 모름...
			$("#cmrReqSign").val(cmrInfo.mf15sign);
			//사인 존재시 상태값 변경
			if(!commonFunc.isEmpty(cmrInfo.mf15sign))$("#btn-sign").text("서명완료");
			
			//출고 번호가 있을 경우 출고삭제만 버튼 활성화 
			if(!commonFunc.isEmpty(cmrInfo.st03No)){
				$("#btn-save").css("display","none");
				$("#btn-delete").css("display","");
				$("#cmrStatus").text("출고완료");
			}
			//출고 번호가 없을 경우 출고등록만 버튼 활성화
			else {
				$("#btn-save").css("display","");
				$("#btn-delete").css("display","none");
			}
			
			//그리드 로우 바인딩
            grid._flexCv.sourceCollection =  data['list'].map(item=>({
                ...item,
                select:false
            }));
            pushMsg(`${grid.getRowCnt()}행 조회 되었습니다.`);
        }).catch((e)=>{});
    }
	//출고 등록
	const cmrSave = async ()=>{
	        
	        grid.disableAutoRows();
			
			if(!grid.gridValidation()){
	            alertWarning('저장불가','그리드 오류내역을 확인하세요.');
	            return;
	        }
			
			if(signaturePad.isEmpty()) {
				alertWarning('저장불가','서명을 진행해야 출고등록이 가능합니다.');
				return;
			}
			
			let insertList = grid.gridItemListToArray(grid._flexCv.items);
			
			if(commonFunc.isEmpty(insertList)) {
				alertWarning('저장불가','출고 상세 정보가 없습니다.');
				return;
			}
			
			cmrInfo["cmrReqSign"] = $("#cmrReqSign").val();
	        let params = {
	            uri: `pda/consigned-materials-rel/save`
				,headerInfo : cmrInfo
				,insertList : insertList
	        }

	        params = {...params};
			
			confirm('저장 하시겠습니까?','출고 등록됩니다.',consts.MSGBOX.QUESTION,()=>{
	            ajax.postAjax(params,true).then(async (data)=>{
	                
	                /*await searchOfMaterial();*/
	                pushMsg('저장 되었습니다.');
					
					location.reload();
	            }).catch((e)=>{
	                console.debug(e);
	            });
	        });
	    }
		//출고 삭제
		const cmrDelete = async ()=>{
			        
	        grid.disableAutoRows();
			
	        let params = {
	            uri: `pda/consigned-materials-rel/delete`
				,headerInfo : cmrInfo
	        }

	        params = {...params};
			
			confirm('삭제 하시겠습니까?','출고 등록 삭제됩니다.',consts.MSGBOX.QUESTION,()=>{
	            ajax.postAjax(params,true).then(async (data)=>{
	                
	                /*await searchOfMaterial();*/
	                pushMsg('삭제 되었습니다.');
					
					location.reload();
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
		
		$('#btn-back').on('click',qrReadView);
		$(".btn-calc").on('click',calcBtns);
		$("#btn-test").on('click',qrTestFnc);
		$("#btn-sign").on('click',signPopupShow);
		$("#btn-save").on('click',cmrSave);
		$("#btn-delete").on('click',cmrDelete);
		
		//사인 팝업 닫기 버튼
		$("#signPopupClose").on('click',function(){$('#signPopup').modal('hide')});
		//사인 팝업 사인 저장 처리 base64 인코딩 문자열
		$("#signPopupSave").on('click',function(event){
			var data = signaturePad.toDataURL('image/png');
			$("#cmrReqSign").val(data);
			if(!signaturePad.isEmpty())$("#btn-sign").text("서명완료");
			else $("#btn-sign").text("서명 미완료");
			$('#signPopup').modal('hide');
		});
		//사인 초기화 처리
		$("#signPopupClear").on('click',function(event){
			signaturePad.clear();
		});
		//팝업 닫기 시 focus로 인한 오류로 focus off 처리
		$('#signPopup').on('hide.bs.modal', function () {
          //모달이 꺼질때 모든 버튼 인풋 셀렉트 텍스트 에어리어의 포커스를 날린다.
            $('button, input, select, textarea').each(function () {
                $(this).blur();
            });
        });
		//사인 팝업 오픈 시 canvas조절 및 기존 사인 존재시 호출 처리
		$('#signPopup').on('shown.bs.modal', async function () {
		    let canvas = $('#signature-pad')[0];
		    /*let signaturePad = new SignaturePad(canvas);*/

		    // 모달 크기에 맞게 canvas 크기 조정
		    canvas.width = $('.modal-body').width();
		    canvas.height = $('.modal-body').height();

		    // 기존 서명 불러오기 (값이 존재할 경우)
		    let savedSignature = $("#cmrReqSign").val();
		    if (!commonFunc.isEmpty(savedSignature)) {
		        try {
		            await signaturePad.fromDataURL(savedSignature, { ratio: 1, width: canvas.width, height: canvas.height });
		        } catch (error) {
		            console.error("서명 로드 중 오류 발생:", error);
		        }
		    }
			//출고 등록 했을 시 display none처리
			if(!commonFunc.isEmpty(cmrInfo.st03No)){
				signaturePad.off();
				$("#signPopupClear").css("display","none");
				$("#signPopupSave").css("display","none");
			}
		});
		//출고수량 수동입력
		$("#qtyInput").on('focusout', async function(event) {
			if(!commonFunc.isEmpty($(event.target).val())) {
				let manualValue = parseInt($(event.target).val());
				
				grid._flexGrid.rows.forEach((row,index,array)=>{
					let targetData = parseInt(manualValue);
					let limitData = commonFunc.isEmpty(row.dataItem['st01Qty']) ? 0 : parseInt(row.dataItem['st01Qty']);
					
					if(targetData > limitData) grid._flexGrid.setCellData(index,"outputQty",limitData);
					if(targetData <= limitData) grid._flexGrid.setCellData(index,"outputQty",targetData);
				});
			}
			
		});
		
    }


    return{
        init:()=>{
			
            handleEvent();
			findCmrInfo();
        }
    }
}();


$(()=>{
    returnReg.init();
});
