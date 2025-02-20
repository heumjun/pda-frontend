
/**
 * 비동기 통신을 위한 모듈
 */

import * as consts from "./constants.js"
import * as dateUtils from "./dateUtils.js"

import { alertError,alertInfo, alertWarning } from "./msgBox.js";

let url = "rest-api";

/**
 * GET 방식 ajax
 * @param {Object} params 파라미터
 * @param {boolean} loading 로딩바 여부
 * @example
 * let params = {
 *     uri: ``,
 * };
 * params = {...params,...ajax.getParams('#form')};   
 * 
 * 첫번째 호출의 결괏값으로 두번째 호출을 작용시킬경우 아래와 같이 사용.
 * aja.getAjax(params,true).then((data)=>{
 *      console.debug(data['test']);
 *      return ajax.getAjax(params,true);
 * }).then((data)=>{
 * 
 * }).catch((e)=>{});
 */
//export const getAjax = (params,loading)=>{
export const getAjax = (params,loading)=>{
    //return 하는 이유는 promise 사용하기위함.
    return ajax("GET",params,loading,null);
}

/**
 * POST 방식 ajax
 * @param {Object} params 파라미터
 * @param {boolean} loading 로딩바 여부
 * @example
 * let params = {
 *     uri: ``,
 * };
 * params = {...params,...ajax.getParams('#form')};   
 * 
 * 첫번째 호출의 결괏값으로 두번째 호출을 작용시킬경우 아래와 같이 사용.
 * aja.getAjax(params,true).then((data)=>{
 *      console.debug(data['test']);
 *      return ajax.getAjax(params,true);
 * }).then((data)=>{
 * 
 * }).catch((e)=>{});
 */
export const postAjax = (params,loading)=>{
    return ajax("POST",params,loading,null);
}

/**
 * PUT 방식 ajax
 * @param {Object} params 파라미터
 * @param {boolean} loading 로딩바 여부
 * @example
 * let params = {
 *     uri: ``,
 * };
 * params = {...params,...ajax.getParams('#form')};   
 * 
 * 첫번째 호출의 결괏값으로 두번째 호출을 작용시킬경우 아래와 같이 사용.
 * aja.getAjax(params,true).then((data)=>{
 *      console.debug(data['test']);
 *      return ajax.getAjax(params,true);
 * }).then((data)=>{
 * 
 * }).catch((e)=>{});
 */
export const putAjax = (params,loading)=>{
    return ajax("PUT",params,loading,null);
}

/**
 * DELETE 방식 ajax
 * @param {Object} params 파라미터
 * @param {boolean} loading 로딩바 여부
 * @example
 * let params = {
 *     uri: ``,
 * };
 * params = {...params,...ajax.getParams('#form')};   
 * 
 * 첫번째 호출의 결괏값으로 두번째 호출을 작용시킬경우 아래와 같이 사용.
 * aja.getAjax(params,true).then((data)=>{
 *      console.debug(data['test']);
 *      return ajax.getAjax(params,true);
 * }).then((data)=>{
 * 
 * }).catch((e)=>{});
 */
export const deleteAjax = (params,loading)=>{
    return ajax("DELETE",params,loading,null);
}

/**
 * 파일 업로드
 * @param {Object} params 파라미터
 * @param {array} files 첨부파일 배열
 * @param {boolean} loading 로딩바 여부
 * @returns 
 */
export const fileUploadAjax = (params,files,loading)=>{
    return ajax("POST",params,loading,files);
}

/**
 * 파일 다운로드
 * @param {object} params 파라미터
 * 
 * @example
    let params = {
        fileName: 'test.pdf',   //파일이름
        filePname: '수주_DATA/2024/20240102831001001001.PDF'    //서버에 저장되어 있는 파일명
    };
 */
export const fileDownloadAjax = async (params) => {

    params.url = `${url}/check-file-exists`;

    try {
        //첨부파일이 존재여부 확인
        await ajax('GET',params,true).then((data)=>{
            url = "rest-api";
            params = $.param(params);   //jquery로 url용 파라미터 만들기
        });    
    } catch (error) {
        console.debug("첨부파일 없음.");
        return false;
    }
    //첨부파일이 존재한다면 다운로드
    location.href = `${url}/download?${params}`;    
}




/**
 * form태그 내부 input객체의 모든값을 object 형태로 만들어 반환
 * @param {String} form태그 selector
 * @returns object
 * 
 * @example
 * 기존 파라미터와 form에서 추출한 파라미터를 합쳐서 사용.
 * params = {...params,...ajax.getParams('#searchForm')};
 */
export const getParams = (formId)=>{
    let params = {};
    $(`${formId} .wj-control`).each(function(){
        
        let key = $(this).find('input').attr('name');
        let ctl = wijmo.Control.getControl(this);
        let value;
        
        if(ctl instanceof wijmo.input.ComboBox){    
            value = ctl.selectedValue;  //속성값 가져오기
            console.debug("combo: "+value);
        }
        if(ctl instanceof wijmo.input.InputDate){     
            //date형일경우 서버사이드에서 변경작업이 필요없게 yyyymmdd로 변경해서 반환
            //컨트롤의 format 형태를 가져온다.(월만 사용하는곳도 있기때문에)
            //let format = ctl.format.replaceAll('-','').toUpperCase();  // '-'로 붙어서 오는데 제거
            let format = ctl.format.toUpperCase();  
            wijmo.isNullOrWhiteSpace(ctl.value)? value = null : value = dateUtils.getDayjs(ctl.value).format(format);
            console.debug("inputdate: "+value);
        }
        if(ctl instanceof wijmo.input.MultiSelect){
            //select box일경우 배열형태로 체크된 모든 값이 반환
            console.debug(ctl.checkedItems);
            value = ctl.checkedItems;
            console.debug("multiselect:"+value);
        }
        if(ctl instanceof wijmo.input.AutoComplete){
            value = ctl.text;   //자동완성일경우 속성값이 따로 없기때문에 보여지는 text를 가져온다.
            console.debug("autocomplete:"+value);
        }
        if(ctl instanceof wijmo.input.ListBox){
            //리스트 박스 구현해야함.
            value = undefined;
            console.debug("listbox:"+value);
        }
        if(ctl instanceof wijmo.input.InputNumber){
            value = ctl.value;
            console.debug("inputnumber:"+value);
        }
        if(ctl instanceof wijmo.input.InputMask){
            value = ctl.value;          //mask적용된 데이터
            //value = ctl.rawValue;     //원천데이터
            console.debug("InputMask:"+value);
        }

        if(wijmo.isNullOrWhiteSpace(ctl)){

            key = $(this).attr('name');
            //체크박스, 스위치, 라디오버튼등
            switch ($(this).attr("type").toLowerCase()) {
                case "checkbox" :
                    value = $(this).prop('checked');
                    break;
                case "radio":
                    value = $("input[name="+key+"]:checked").val(); 
                    break;
                case "text":
                case "hidden":
                    value = $(this).val();  //일반 input 박스
                    break;
                default:
                    value = null;
                    break;
            }
        }

        if(wijmo.isUndefined(value)){
            console.debug(`정의되지 않은 타입입니다. key: ${key}`);
            return true;    //다음루프로 이동
        }
        
        params[key] = value;
    });

    return params;

}

/**
 * ajax 호출부
 * @param {*} method 
 * @param {*} params 
 * @param {*} loading 
 * @param {boolean} files   첨부파일
 * @param {*} callback 
 * @returns 
 */
const ajax = (method,params,loading,files)=>{
    
    params.authUrl = $('#data-params').data('params').authUrl;

    if(wijmo.isNullOrWhiteSpace(params.authUrl)){
        alertError('파라미터에 권한확인을 위한 메뉴url이 없습니다.','authUrl에 메뉴코드를 넣어야합니다.');
        return;
    }

    //넘어온 파라미터에 url 속성이 있다면 넘어온 url로 변경한다.(frontend 경로로 갈경우)
    //기본은 rest-api 경로로 backend로 바로 넘어가지만 url경로를 따로 지정한다면 frontend 측에서 처리
    if(!wijmo.isNullOrWhiteSpace(params.url)){
        url = params.url;
    }else{
        
        if(wijmo.isNullOrWhiteSpace(params.uri)){
            alertError('파라미터에 [uri] 항목이 없습니다.','경로를 입력하세요.');
            return;
        }
    }
    
    //post,put,delete일경우 파라미터값을 json형식으로 변경해서 서버단으로 전송해야함.
    if(method==='POST' || method==='PUT' || method==='DELETE'){
        
        params = JSON.stringify(params);

        //grid에서 달력표시일경우 date 타입을 사용한다. 이를 서버단으로 넘길때는 2022-12-31 형태로 변경해줌.
        let transeData = JSON.parse(params, (key, value) => {
            if (typeof value === 'string') {
                // JSON 문자열로 저장된 날짜 파싱
                let m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
                
                if(m) {
                    return dateUtils.getDayjs(value).format("YYYY-MM-DD");
                }
            }
            return value;
        });
        params = JSON.stringify(transeData);
    }
    
    let userOptions = {};
    //첨부파일이 있을경우 (첨부파일형태가 null이 아닌 배열형태로 넘어왔다면 multipart라고 간주함)
    if(wijmo.isArray(files)){

        let formData = new FormData();
        files.forEach(element => formData.append('files',element));
        //formData는 json형태를 보낼수없다. 이를 blob 형태로 변경해서 삽입
        formData.append('params', new Blob([params], {type : "application/json"}));

        //첨부파일과 json 데이터를 함께 serverside로 보낼경우 경우 아래의 옵션을 적용시켜야함.
        userOptions = {
            contentType: false,
            processData: false,
            enctype : 'multipart/form-data',
            data: formData
        }
    }


    let options = {
        url: url,
        method: method,
        cache: false,
        data: params,
        dataType: 'json',
        async: true,
        contentType: "application/json; charset=utf-8",
        beforeSend: ()=>{
            if(loading) $('#loading').show();
        }
    }

    options = {...options,...userOptions};  //옵션 병합
    
    return new Promise((resolve,reject)=>{
        $.ajax(options)
            .done((jsonData)=>{
                try {
                    //실패일경우
                    if(!jsonData['status']){
                        if(jsonData['statusCode']>=500){
                            console.debug(params);
                            console.debug('서버오류 발생');
                            alertError(jsonData['message'],'관리자에게 문의하세요.');
                            return;
                        }
                        alertWarning('작업불가',jsonData['message'],()=>{
                            let statusCode = jsonData['statusCode'];
                            switch (statusCode) {
                                //토큰인증 실패 로그인 화면 호출
                                case 401:   
                                    let redirectUrl = "/log-out";

                                    //(opener 속성이 존재하면 다른창에의해 열린창이고 속성값이 현재창과 다르다면 다른창에의해 열린창)
                                    if(opener && opener !=this){    //팝업창이라면
                                        if(parent && parent!=this){  //부모창이 있다면
                                            opener.parent.location.href = redirectUrl;
                                        }else{
                                            opener.location.href = redirectUrl;
                                        }
                                    }else{
                                        if(parent && parent!=this){  //부모창이 있다면
                                            parent.location.href = redirectUrl;	
                                        }else{
                                            location.href = redirectUrl;
                                        }	
                                    }	
                                    break;
    
                                // 권한없음     
                                case 403:   
                                    location.reload();
                                    break;    
                            }
                            //return; 
                            // false일경우 frontend에서 어떤 처리를 해줘야 할수도 있어서 reject를 반환해서 호출한 측에서
                            // catch로 받아서 예외처리를 가능하도록 해줌.
                            // reject로 반환을 했지만 호출측에서 catch로 받지 않을경우 javascript 콘솔창에 오류가 표기됨.
                            // 오류표시가 날경우 프로그램 구동에 문제는 없지만 log가 지져분하니 
                            // .catch((e)=>{}) 붙여주도록 한다.
                            reject(new Error(jsonData['message']));    
                        });
                        
                        //오류일경우 아래구문으로 내려가지 않게 return 시킴
                        //오류인데 아래로 내려갈경우 resolve를 만나면 ajax를 호출한 함수의 catch문으로 이동되어
                        //메시지창에 떠있는 상태에서 catch문 내용이 실행되기때문에 프로그래머가 의도한대로 로직이 수행되지 않는다.
                        return; 
                    }
                    // json 형태에서 date 타입은 String 형태로 넘어오기때문에 date타입인지 확인이불가능함.
                    // 이를 date 타입형태로 변환해서 값을반환함. server side에서 형태 변환필요없음.
                    let odata = JSON.stringify(jsonData['data']);
                    let transeData = JSON.parse(odata, (key, value) => {
                        if (typeof value === 'string') {
                            // JSON 문자열로 저장된 날짜 파싱
                            let m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)/);
                            if(m) {
                                return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
                            }
                            // ODATA 스타일 문자열로 저장된 날짜 파싱
                            m = value.match(/^\/Date\((\d+)\)$/);
                            if (m) {
                                return new Date(parseInt(m[1]));
                            }
                        }
                        return value;
                    });
                    resolve(transeData);
                    
                } catch (error) {
                    $('#loading').hide();
                    console.debug(error);
                    alertError("오류가 발생 하였습니다.",error.toString());
                }
            })
            .always(()=>{
                //완료후 공통작업
                $('#loading').hide();
            })
            .fail((request, status, error)=>{
                console.debug("error:"+error);
                alertError("서버 오류 입니다.","관리자에게 문의 하세요.");
            });
        
    });

}

/**
 * @param {*} params 
 * @param {*} loading 
 * @returns 
 * @example
 * 동기화 통신
 * 기본적으로 ajax통신의 동기통신을 해야할경우 async await로 해야 함.
 * 하지만 jquery validate에서 jQuery.validator.addMethod 의경우 async 가 안되서
 * async: false 옛날 방식을 사용함.
 * common.js 에 정의되어있음.
 * 
 * jquery validator외에는 아래와 같이 사용해야함.
 * 호출하는 함수에서 async await 호출함.
 * 아래와 같이 사용하면 1,2 순차적으로 실행됨
 * 동기화 진행하고싶은곳에 await를 사용함.
 * 
 * const test = async ()=>{
 *  let parmas = {};
 *  await ajax.getAjax(params,false).then(data=>{
 *      console.debug("1");
 *  }).catch((e)=>{});
 *  console.debug("2");
 * }
 * 
 * 
 */

export const getAjaxSync = (params,loading)=>{
    let result;
    params.authUrl = $('#data-params').data('params').authUrl;

    
    if(wijmo.isNullOrWhiteSpace(params.uri)){
        alertError('파라미터에 [uri] 항목이 없습니다.','경로를 입력하세요.');
        return;
    }
    
    
    $.ajax({
        method: "GET",
        url: url,
        cache: false,
        data: params,
        async: false,
        dataType: 'json',
        contentType: "application/json; charset=utf-8",	
        beforeSend: ()=>{
            if(loading) $('#loading').show();
        },
        success: function (jsonData) {
            
            let odata = JSON.stringify(jsonData['data']);
            let transeData = JSON.parse(odata, (key, value) => {
                if (typeof value === 'string') {
                    // JSON 문자열로 저장된 날짜 파싱
                    let m = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)/);
                    if(m) {
                        return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]));
                    }
                    // ODATA 스타일 문자열로 저장된 날짜 파싱
                    m = value.match(/^\/Date\((\d+)\)$/);
                    if (m) {
                        return new Date(parseInt(m[1]));
                    }
                }
                return value;
            });

            result = transeData;
            
        },
        error: function (error) {
            console.debug("error:"+error);
            alertError("서버 오류 입니다.","관리자에게 문의 하세요.");
        },
        
    });

    return result;
}

