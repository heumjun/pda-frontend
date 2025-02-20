
import GridFactory from "./wijmo/gridFactory.js";
import * as input from "./wijmo/inputFactory.js";
import * as ajax from "./ajax.js";
import {treeToObject,getTreeFindItem } from "./common.js";
import { alertInfo, pushMsg } from "./msgBox.js";
import {JQUERYEVENT} from "./constants.js";
//import * as commonRestApi from "./commonRestApi.js"


/**
 * 
 * @param {String} targetElement selector   모달창에서 선택후 값을 넣어야할 타켓 엘리먼트
 * @param {Object} value 넣어야될 값
 */
export const insertTarget = (targetElement,value)=>{

    //반환해야할 엘리먼트가 wijmo 객체인지 확인
    let ctl = wijmo.Control.getControl(targetElement);
    
    if(wijmo.isNullOrWhiteSpace(ctl)){
        $(targetElement).val(value);
    }else{
        switch (ctl.constructor) {
            case wijmo.input.InputNumber:
                ctl.value = value;
                break;
            case wijmo.input.ComboBox:  
                ctl.selectedValue = value;
                break;    
            case wijmo.grid.FlexGrid:
                ctl.setCellData(ctl.selection.row,ctl.selection.col,value);
                //셀 수정이벤트(cellEditEnding)가 걸려있을경우 setCellData로 셀내용을 변경할경우 cellEditEnding이벤트가 자동으로 발생되지 않음.
                //아래 startEditing, finishEditing 함수를 실행시켜 편집모드를 종료시켜 cellEditEnding 이벤트를 발생시킴.
                ctl.startEditing(false,ctl.selection.row,ctl.selection.col);
                ctl.finishEditing();
                break;
            default:
                ctl.text = value;
                break;
        }
        ctl.focus();
    }
}


/**
 * 모달 로딩
 * 모달이 추가될경우 호출함수를 추가해야함.
 */
export const modalLoad = ()=>{
    
}