/// <reference path ="../vendors/wijmo/Dist/controls/wijmo.d.ts"/>
/// <reference path ="../vendors/dhtmlx/codebase/dhtmlx.d.ts"/>

import { menuLoad } from "./common/commonMenu.js";

const navbar = function(){
    
	const handleEvents = ()=> {
		alert("navbar")
	}
	
	
    return {
        /**
         * 초기화
         */
        init:()=>{
            handleEvents();
			menuLoad(); 
        }
        
    };
}();

//문서 로딩후 시작점
$(()=>{
    navbar.init();
});