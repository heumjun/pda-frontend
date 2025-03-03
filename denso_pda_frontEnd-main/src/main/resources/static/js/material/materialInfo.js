
import * as ajax from "../common/ajax.js";

const material = function(){

	const goBack = () => {
		let form = $('<form></form>');
		form.attr("method","get");
		form.attr("action","view");
		form.attr("target","_self");
		form.append($('<input/>', {type: 'hidden', name: 'view', value:'materialInfo/materialScan' }));
		form.append($('<input/>', {type: 'hidden', name: 'authUrl', value:'materialInfo/materialScan' }));
		form.appendTo('body');
		form.submit();
	}
	
	const getMaterial = async ()=>{
		
		let params = {
            uri: `materialInfo/materialInfo`
			,qrCode : $('#data-params').data('params').qrCode
        }

        params = {...params};

        await ajax.postAjax(params, true).then(async (data) => {
			
			$("#qrCode").text($('#data-params').data('params').qrCode);
			$("#cm08Name").val(data.cm08Name);
			$("#st02Code").val(data.st02Code);
			$("#st01Qty").val(data.st01Qty); 
			$("#cm05Name").val(data.cm05Name);
			
        }).catch((e)=>{});
        
    }
	
	const handleEvent = ()=> {
		
		$('#goBack').on('click', goBack);
		
    }

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