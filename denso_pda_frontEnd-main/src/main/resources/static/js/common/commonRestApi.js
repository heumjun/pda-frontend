/**
 * frontend에서 공통으로 사용하는 restapi 모듈
 */

import { getAjax } from "./ajax.js"

export const getMaterialCode = (query,callback)=>{
    query = query.toUpperCase();
    let params = {
        uri:`materials/autocomplete/${query}`,
    }
    getAjax(params,false).then(data=>callback(data));
}

/**
 * 운동리스트
 * @returns 
 */
export const getHealthList = ()=>{
    let params = {
        uri: `code-manage/healths`
    }
    return getAjax(params,false);
    
}

/**
 * 식단 리스트
 * @returns 
 */
export const getDietMenuList = ()=>{
    let params = {
        uri: `code-manage/diet-menus`
    }
    return getAjax(params,false);
}

/**
 * 트레이너 리스트
 * @returns 
 */
export const getTrainerList = ()=>{
    let params = {
        uri: `code-manage/trainers`,
        excludeQuit:true,
    }
    return getAjax(params,false);
    
}

/**
 * 공통코드 내역
 * @param {String} 공통코드 
 * @param {*} callback 
 */
export const getCommonCode = (groupCode)=>{
    let params = {
        uri:`code-manage/common-codes/${groupCode}`,        
        unLock:true //lock 안걸린 코드만
    };

    return getAjax(params,false);
}

