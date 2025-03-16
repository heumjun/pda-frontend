
import * as ajax from "../common/ajax.js";

const material = function(){

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
	
	const getMaterial = (barcode)=>{
		
		var st02LotSeq = "";
		var qrCode = "";
		
		if ( barcode != undefined ) {
		
			if(barcode.substring(0,3) == '3N1') {
				qrCode = "";
				st02LotSeq = barcode.split(" ")[2];
				//st02LotSeq = barcode.substring(23,35).trim();
			} else {
				qrCode = barcode;
				st02LotSeq = "";
			}
			
			let params = {
	            uri: `materialInfo/materialInfo`
				,qrCode : qrCode
				,st02LotSeq : st02LotSeq
	        }

	        params = {...params};

	        ajax.postAjax(params, true).then(async (data) => {
				
				$("#qrCode").text(barcode);
				$("#cm08Name").val(data.cm08Name);
				$("#st02Code").val(data.st02Code);
				$("#st01Qty").val(data.st01Qty); 
				$("#cm05Name").val(data.cm05Name);
				
	        }).catch((e)=>{});
			
		}
		
    }
	
	const handleEvent = ()=> {
		var qrCode = $('#data-params').data('params').qrCode;
		getMaterial(qrCode);
		$('#btnBack').on('click', goBack);
    }
	
	// 스캐너 값 얻기
	 $(document).scannerDetection({
	     //timeBeforeScanTest: 50, // wait for the next character for upto 200ms
	     //startChar: [16], // Prefix character for the cabled scanner (OPL6845R)
	     //endChar: [9, 13], // be sure the scan is complete if key 13 (enter) is detected
	     //avgTimeByChar: 40, // it's not a barcode if a character takes longer than 40ms
	     onComplete: function(barcode, qty) {
	 		
			barcode = barcode.toUpperCase();
			
			if (barcode.length > 0) {
				//getMaterial('barcode');	
				getMaterial(barcode);	
			}
	 		/*let form = $('<form></form>');
			form.attr("method","get");
			form.attr("action","view");
			form.attr("target","_self");
			form.append($('<input/>', {type: 'hidden', name: 'view', value:'warehousing/warehousing' }));
			form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'warehousing/warehousing' }));
			form.append($('<input/>', {type: 'hidden', name: 'title', value:'입고처리' }));
			form.append($('<input/>', {type: 'hidden', name: 'pu01No', value: '20250304001' }));
			form.appendTo('body');
			form.submit();*/
	 		
	 		
	     },
	 	onerror : function (barcode, qty) {
	 		alert("바코드를 인식할 수 없습니다.\n관리자에게 문의 해주세요."); 
	 	}
	});

    return{
        init:()=>{
            handleEvent();
			getMaterial();
        }
    }
}();


$(()=>{
    material.init();
});