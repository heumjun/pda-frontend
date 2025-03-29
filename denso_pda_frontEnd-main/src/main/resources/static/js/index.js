/// <reference path ="../vendors/wijmo/Dist/controls/wijmo.d.ts"/>
/// <reference path ="../vendors/dhtmlx/codebase/dhtmlx.d.ts"/>

import * as ajax from "./common/ajax.js";
import * as commonFunc from "./common/common.js";
import { menuLoad } from "./common/commonMenu.js";
import { pushMsg } from "./common/msgBox.js";

const index = function(){
    
	const getOuputReqSel = (code)=> {
		let params = {
			uri: 'output/outputReqSel',
			mf13No : code
		}
		let data = ajax.getAjaxSync(params);
		if (data == null) {
			pushMsg(`해당 작업요청서는 존재하지 않습니다.`);
		} else {
			return data['detailInfo'][0];
		}
		
	};
	
	const handleEvents = ()=> {
		
		// pu20250305001(발주서), ot2025030500003(출고요청서), EK24092700169-001(품목)
		/*var barcode = "OT2025032400011".toUpperCase(); 
		var linkType = barcode.substr(0, 2);
		var codeData = barcode.substr(2, barcode.length-1);
    	console.log(linkType);
    	console.log(codeData);*/
		
		// 입고 테스트
		/*let form = $('<form></form>');
		form.attr("method","get");
		form.attr("action","view");
		form.attr("target","_self");
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'warehousing/warehousing' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'warehousing/warehousing' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'입고 처리' }));
		form.append($('<input/>', {type: 'hidden', name: 'pu01No', value: codeData }));
		form.appendTo('body');
		form.submit();*/
		
		// 자재조회 테스트
		/*let form = $('<form></form>');
		form.attr("method","get");
		form.attr("action","view");
		form.attr("target","_self");
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'materialInfo/materialInfo' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'materialInfo/materialInfo' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'자재 조회' }));
		form.append($('<input/>', {type: 'hidden', name: 'qrCode', value: barcode }));
		form.appendTo('body');
		form.submit();*/
		
		// 출고 테스트
		/*let otInfo = getOuputReqSel(codeData);
		console.log(otInfo.mf13No);
       	console.log(otInfo.mf13Dat);
       	console.log(otInfo.mf13DatTime);
       	console.log(otInfo.mf13LineCode);
       	console.log(otInfo.mf13LineNm);
		
		let form = $('<form></form>');
		form.attr("method","get");
		form.attr("action","view");
		form.attr("target","_self");
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'output/outputRegister' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'output/outputRegister' }));
		form.append($('<input/>', {type: 'hidden', name: 'title', value:'출고 처리' }));
		form.append($('<input/>', {type: 'hidden', name: 'mf13No', value: otInfo.mf13No }));
		form.append($('<input/>', {type: 'hidden', name: 'mf13Dat', value: otInfo.mf13Dat }));
		form.append($('<input/>', {type: 'hidden', name: 'mf13DatTime', value: otInfo.mf13DatTime }));
		form.append($('<input/>', {type: 'hidden', name: 'mf13LineCode', value: otInfo.mf13LineCode }));
		form.append($('<input/>', {type: 'hidden', name: 'mf13LineNm', value: otInfo.mf13LineNm }));
		form.appendTo('body');
		form.submit();*/
	}
	
	// 스캐너 값 얻기
	$(document).scannerDetection({
		timeBeforeScanTest: 50, // 다음스캔까지 딜레이
	    /*startChar: [16], // 접두사 문자(OPL6845R)
	    endChar: [9, 13], // 키이벤트 감지 유니코드 13(엔터키)
	    avgTimeByChar: 40, // 스캔시 40ms 이내로 읽지 못하면 감지 안함*/
	    onComplete: function(barcode, qty) {
	    	
	    	// pu20250305001(발주서), ot2025030500003(출고요청서), EK24092700169-001(품목)
	    	//var barcode = "ot2025030500003".toUpperCase();
			barcode = barcode.toUpperCase();
	    	var linkType = barcode.substr(0, 2);
			var codeData = barcode.substr(2, barcode.length-1);
			let form = $('<form></form>');
			form.attr("method","get");
			form.attr("action","view");
			form.attr("target","_self");
			
			/*form.append($('<input/>', {type: 'hidden', name: 'view', value:'restore/restore' }));
			form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'restore/restore' }));
			form.append($('<input/>', {type: 'hidden', name: 'title', value:'반납 등록' }));
			form.append($('<input/>', {type: 'hidden', name: 'st10No', value: "2025021900001" }));
			form.appendTo('body');
			form.submit();*/
			
			
			if (linkType == 'PU') {
				form.append($('<input/>', {type: 'hidden', name: 'view', value:'warehousing/warehousing' }));
				form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'warehousing/warehousing' }));
				form.append($('<input/>', {type: 'hidden', name: 'title', value:'입고 처리' }));
				form.append($('<input/>', {type: 'hidden', name: 'pu01No', value: codeData }));
			} else if (linkType == 'OT') {
				/*let otInfo = getOuputReqSel(codeData);
				otInfo.COMP_GBN = Y 
				FLASE Aalert -> 자재 > SMD출고
				ELSE */
				
				let otInfo = getOuputReqSel(codeData);
				
				alert(otInfo.mf13CompGbn);
				if (otInfo.mf13CompGbn == "N") {
					// 출고요청
					//OT2025032800003
					form.append($('<input/>', {type: 'hidden', name: 'view', value:'output/outputRegister' }));
					form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'system/outputRegister' }));
					form.append($('<input/>', {type: 'hidden', name: 'title', value:'출고 처리' }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13No', value: otInfo.mf13No }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13Dat', value: otInfo.mf13Dat }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13DatTime', value: otInfo.mf13DatTime }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13LineCode', value: otInfo.mf13LineCode }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13LineNm', value: otInfo.mf13LineNm }));
					
				} else {
					// 출고요청완료 SMD 입고
					//OT2025032300002
					form.append($('<input/>', {type: 'hidden', name: 'view', value:'smd/smdInput' }));
					form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'smd/smdInput' }));
					form.append($('<input/>', {type: 'hidden', name: 'title', value:'SMD 입고처리' }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13No', value: otInfo.mf13No }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13Dat', value: otInfo.mf13Dat }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13DatTime', value: otInfo.mf13DatTime }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13LineCode', value: otInfo.mf13LineCode }));
					form.append($('<input/>', {type: 'hidden', name: 'mf13LineNm', value: otInfo.mf13LineNm }));
				}
				
			} else if (linkType == 'OC') { // 부품투입
										
			} else if (linkType == 'RE') { //RESTORE 반납
				form.append($('<input/>', {type: 'hidden', name: 'view', value:'restore/restore' }));
				form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'restore/restore' }));
				form.append($('<input/>', {type: 'hidden', name: 'title', value:'반납 등록' }));
				form.append($('<input/>', {type: 'hidden', name: 'st10No', value: codeData }));
			} else if (linkType == 'RT') { //RETURN 반품
													
			} else  {
				form.append($('<input/>', {type: 'hidden', name: 'view', value:'materialInfo/materialInfo' }));
				form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'materialInfo/materialInfo' }));
				form.append($('<input/>', {type: 'hidden', name: 'title', value:'자재 조회' }));
				form.append($('<input/>', {type: 'hidden', name: 'qrCode', value: barcode }));
			}
			
			form.appendTo('body');
			form.submit();
			
	    },
		onerror : function (barcode, qty) {
			pushMsg(`바코드를 인식할 수 없습니다.\n관리자에게 문의 해주세요.`);
		}
	});
	
    return {
        /**
         * 초기화
         */
        init:()=>{
            handleEvents();
			menuLoad();
			$("#textInput").focus();
        }
        
    };
}();

//문서 로딩후 시작점
$(()=>{
    index.init();
});
