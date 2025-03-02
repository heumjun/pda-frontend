
import GridFactory from "../common/wijmo/gridFactory.js";
import * as input from "../common/wijmo/inputFactory.js";
import * as ajax from "../common/ajax.js";
import * as dateUtils from "../common/dateUtils.js";
import * as consts from "../common/constants.js";
import * as commonRestApi from "../common/commonRestApi.js";
import { pushMsg,alertError,alertWarning,alertInfo,confirm } from "../common/msgBox.js";
import * as commonFunc from "../common/common.js";

const returnReg = function(){
    /**
     * 버튼,input박스 등 모든 이벤트관리
     */
    const handleEvent = ()=>{
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
