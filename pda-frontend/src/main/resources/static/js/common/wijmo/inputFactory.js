/// <reference path ="../../../vendors/wijmo/Dist/controls/wijmo.input.d.ts"/>

import { wijmoColumns } from "../constants.js";
import * as dateUtils from "../dateUtils.js";

/**
 * 텍스트형 input박스
 * @param {String} divId elementId ('#id')
 * @param {boolean} isUpperCase 대문자 자동 변경여부
 * @returns 
 */
 export const text = (divId,isUpperCase = false)=>{
    let input= new wijmo.input.ComboBox(divId);
    input.isRequired = false;
    
    if(isUpperCase){
        input.textChanged.addHandler((s,e)=>{
            s.text = s.text.toUpperCase();
        });
    }
    
    return input;
}

/**
 * 마스킹 텍스트 박스 생성
 * @param {String} divId elementId ('#id')
 * @param {String} mask (9999 9999 9999) 마스킹 문자열
 * 
 * @example
 * input.rawValue   // 원시값을 사용가능 123-123  => 123123
 */
export const mask = (divId,mask)=>{
    let input = new wijmo.input.InputMask(divId);
    input.mask = mask;
    input.isRequired = false;
    input.value ='';
    
    return input;
}


/**
 * 숫자형 input박스
 * @param {String} divId  elementId ('#id')
 * @param {Number} step 증감숫자
 * @param {Number} min 최소숫자
 * @param {Number} max 최대숫자
 * @param {String} format (optional) 숫자표현방법('n0', 'n2', 'c0', 'c2', 'p0', 'p2',g0, G10)
 * 
 * 숫자포맷은 https://demo.grapecity.co.kr/wijmo/learn-wijmo/Core/Globalization/Formatting/purejs 참조
 */
 export const number = (divId,step,min,max,format)=>{
    let input = new wijmo.input.InputNumber(divId);
    input.isRequired = false;
    input.step = step;
    input.min = min;
    input.max = max;
    input.format = 'n0';
    input.value = null;
    
    if(!wijmo.isUndefined(format)) input.format =format;
    
    return input;
}


/**
 * 콤보박스 생성
 * @param {String} divId elementId ('#id')
 * @param {Array} array 콤보박스 내용 배열object
 * @param {String} key 콤보박스 키값
 * @param {String} displayName 콤보박스 출력내용
 * @returns 
 * 
 * @example
 * 전체 선택 추가할경우 아래 코드를 적용
 * let allJan = [{key:0,name:'전체'}];
 * jan.itemsSource = [...allJan,...결과값배열];    //콤보박스에 전체추가
 * 
 * 사용자 정의 보여주기 적용할경우
 * let templete = `<table><tr>
                        <td>{sokName}</td>
                        <td>{sokCode}</td>
                    </tr></table>`;

    mnaSokCombo.formatItem.addHandler((s,e)=>{
        e.item.innerHTML = wijmo.format(templete,e.data);
    });
 */
export const comboBox = (divId,array,key,displayName)=>{
    let  input= new wijmo.input.ComboBox(divId);
    input.isRequired = false;
    // headerPath 그리드에서 editor로 사용할때 templete(html테그를 사용해서) formatItem을 적용해서 사용자정의로 보여주기할때 사용
    input.headerPath = displayName;     
    input.displayMemberPath = displayName;
    input.selectedValuePath = key;
    input.isAnimated = true;
    input.itemsSource = array;
    return input;
}

/**
 * 멀티 콤보박스 생성
 * @param {String} divId elementId ('#id')
 * @param {Object} array 리스트박스 내용 배열
 * @param {String} displayName 리스트박스 출력내용
 * 
 * @example
 * 초기 체크된 상태구현은 아래코드 참조
 * gbn.itemsSource.forEach((item)=>{
 *           if(item.key==9){
 *               gbn.checkedItems.push(item);
 *           }
 *       });
 * gbn.invalidate(true);
 */
export const multiComboBox = (divId,array,key,displayName)=>{
    let input = new wijmo.input.MultiSelect(divId);
    //input.placeholder = "선택";
    input.headerFormat = '{count:n0} 개';
    input.displayMemberPath = displayName;
    input.selectedValuePath = key;
    input.itemsSource = array;
    input.showSelectAllCheckbox = true;     //전체선택 활성화
    input.showFilterInput = true;           //필터기능 활성화

    return input;
}

/**
 * 리스트박스 생성
 * @param {String} divId elementId ('#id')
 * @param {Object} array 리스트박스 내용 배열
 * @param {String} displayName 리스트박스 출력내용
 * @param {boolean} check 리스트박스 내 체크박스 여부
 * @param {number} 리스트박스 height
 */
export const listBox = (divId,array,displayName,check,height)=>{
    let input = new wijmo.input.ListBox(divId);
    input.displayMemberPath = displayName;
    input.itemsSource = array;
    if(check) input.checkedMemberPath = 'selected';
    input.maxHeight = height;

    return input;
    
}

/**
 * 날짜 input박스
 * @param {String} divId elementId ('#id')
 * @param {date} date 초기화 날짜 (optional)
 * @param {boolean} 월만 표기여부(optional) true일경우 월까지만 표시
 * @returns input
 */
export const date = (divId,date,month = false)=>{
    
    let input = new wijmo.input.InputDate(divId);
    input.isRequired = false;
    input.mask = '9999-99-99';
    input.isAnimated = true;
    input.format = "yyyy-MM-dd";  
    
    if(wijmo.isBoolean(month)){
        if(month){
            input.mask = '9999-99';
            input.format = "yyyy-MM";  
            input.selectionMode = 'Month';
        }
    }
    
    if(wijmo.isNullOrWhiteSpace(date) || wijmo.isUndefined(date)){
        input.value = null;    
    }else{
        input.value = date;
    }
    
    //일,월 간단하게 입력시 자동입력
    input.hostElement.addEventListener('keydown',(e)=>{
        if(e.key=='Enter'){
            let date = input.text.replaceAll('_','').replaceAll('-','');
            if(date.length<1) return;

            //일자만 입력시
            if(date.length<3) {
                input.text = dateUtils.today('YYYY-MM').concat('-').concat(date.padStart(2,'0'));
            //월까지 입력시
            }else if(date.length<5){
                let mmdd = date.padStart(4,'0');
                let mm = mmdd.substr(0,2);
                let dd = mmdd.substr(2,2);

                input.text = dateUtils.today('YYYY').concat('-').concat(mm).concat('-').concat(dd);
            }
            
            //해당월의 마지막일을 초과하여 입력할경우 마지막날짜로 입력되도록 함.
            let lastDay = dateUtils.lastDayOfMonth(input.text.substring(0,7),'YYYYMMDD');
            let inputDay = input.text.replaceAll('_','').replaceAll('-','');
            
            if(inputDay>lastDay) input.text = dateUtils.getDayjs(lastDay).format('YYYY-MM-DD');
        }
    });

    

    return input;
}

/**
 * 시간 input박스
 * @param {*} divId elementId ('#id') 
 * 
 * @example
 * grid에 사용할경우 format: 'HH:mm' 설정
 */
export const time = (divId)=>{
    let input = new wijmo.input.InputTime(divId);
    input.format = 'HH:mm';     //24시간 설정
    input.step = 1;

    //true일경우 잘못된 시간을 입력해도 입력은되지만 적용되지 않음
    //false일경우 잘못된 시간이 입력자체가 안됨.
    input.isEditable = false;

    return input;
}


/**
 * 자동완성 input박스 
 * ex) input.autoComplete('#bcd','bpcCode',getData);
 * 
 * @param {String} divId elementId ('#id')
 * @param {String} displayName 자동완성 combobox에 표기될 내용
 * @param {Function} func 자동완성 가져올 코드의 함수 (autoCompleteCode.js에서 사용)
 * @param {boolean} 대문자 자동변경여부
 * @returns input
 * 
 *  @example
 * const getData = (query,callback)=>{
 *       query = query.toUpperCase();
 *       let params = {
 *           service: eurekaServices.INFORMATION,
 *           uri:`uri/${query}`,        
 *       };
 *       ajax.getAjax(params,false,(data)=>{
 *           callback(data);
 *       });
 *   }
 * 
 * 
 */
export const autoComplete = (divId,displayName,func,isUpperCase = false)=>{

    let input = new wijmo.input.AutoComplete(divId,{
        itemsSourceFunction:(query,max,callback)=>{
            if (!query) {
                callback(null);
                return;
            }
            func(query,callback); //callback에 매게변수로 값을 넣어야됨.
        },
        maxItems:10,
        showDropDownButton:true,
        displayMemberPath: displayName,
    });
    //대문자변경 이벤트
    if(isUpperCase){
        input.textChanged.addHandler((s,e)=>{
            s.text = s.text.toUpperCase();
        });
    }

    return input;
}

/**
 * 비동기 멀티 자동완성 input
 * @param {String} divId elementId ('#id')
 * @param {String} displayName 자동완성 combobox에 표기될 내용
 * @param {Function} func 자동완성 가져올 코드의 함수 (autoCompleteCode.js에서 사용)
 * @returns input
*/
export const multiAutoCompleteAsync = (divId,displayName,func)=>{
    let input = new wijmo.input.MultiAutoComplete(divId,{
        itemsSourceFunction:(query,max,callback)=>{
            if(!query){
                callback(null);
                return;
            }
            func(query,callback);
        },
        maxItems:10,
        displayMemberPath: displayName,
        selectedIndex: -1,
        placeholder: '입력'
    });
    
    return input;
}
/**
 * 멀티 자동완성 input
 * @param {String} divId elementId ('#id')
 * @param {String} displayName combobox에 표기될 내용
 * @param {array} array 데이터
 * @returns 
 */
export const multiAutoComplete = (divId,displayName,array)=>{

    let input = new wijmo.input.MultiAutoComplete(divId,{
        placeholder: '입력',
        displayMemberPath: displayName,
        itemsSource: array,
        maxItems:10,
        selectedIndex: -1
    });
    return input;
}


/**
 * 엔터키 클릭시 다음 엘리먼트로 이동시키는 이벤트 설정
 * @param {String} eventId Enter키 이벤트를 적용시킬 elementId ('#id')
 * @param {String} nextFocusId Enter키 클릭시 이동될 elementId (#id)
 */
export const nextFocusEvent = (eventId,nextFocusId)=>{
    let ctl = wijmo.Control.getControl($(eventId));         //이벤트를 처리할 ele
    let ctl2 = wijmo.Control.getControl($(nextFocusId));    //포커스를 이동시킬 ele
    
    if(!wijmo.isNullOrWhiteSpace(ctl)){
        //wijmo 컨트롤일경우     
        ctl.hostElement.addEventListener('keyup',(e)=>{
            if(e.key=='Enter'){
                e.stopPropagation();    //이벤트 리스터 전파중지(전역 이벤트 리스너 중지됨.)
                
                if(!wijmo.isNullOrWhiteSpace(ctl2)) ctl2.focus();
                else document.querySelector(nextFocusId).focus();
                //else $(nextFocusId).trigger('focus');            
                //참조 : jquery로 포커스를 이동시킬때 이동시키는 엘리먼트(ex: 버튼)가 disable되어있는경우
                //  해당 엘리먼트로 이동이 되지 않는데 다시 enable 상태로 변경이 되어도 focus이동이 되지 않는다.
                //  pureJs는 바로 적용됨.
            } 
        });
        
    }else{
        //html 엘리먼트일경우
        $(eventId).on('keyup',(e)=>{
            if(e.key=='Enter'){
                e.stopPropagation();
                
                if(!wijmo.isNullOrWhiteSpace(ctl2)) ctl2.focus();
                else document.querySelector(nextFocusId).focus();
                
            }
        });
    }

}

/**
 * jquery validate 적용
 * input 박스들 포커스아웃될때 validate 수행시켜 유효성 체크 갱신
 * 
 * @param {String} formId  elementId ('#id')
 * @param {*} params rules,message 자바스크립트 오브젝트
 * @example
 * let params = {
 *  rules:{
 *      menUpcd:{required : true},
 *      menCode:{required: true},
 *      menName:{required: true},
 *      orderDat: {
 *                   required: (e)=>{
 *                      return wijmo.isNullOrWhiteSpace($('input[name=lotNo]').val());
 *                   }
 *               },
 *      },
 *  messages:{
 *       menUpcd:{required : '[상위 메뉴코드]를 입력하세요'},
 *      menCode:{required: '[메뉴코드]를 입력하세요'},
 *      menName:{required: '[메뉴명]를 입력하세요'},
 *      email:{email: (params,e)=>{
 *          return $.validator.format('{0} 은 잘못된 값입니다.',e.value);
 *      }},
 *  }
 * }
 * 
 * 새로운 함수 정의 가능함
 * jQuery.validator.addMethod("validTel", function(value, element) {
 *       
 *      if(!value) return true;
 *		var rgEx = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-[0-9]{3,4}-[0-9]{4}$/;
 *		var OK = rgEx.test(value);
 *		if(!OK)
 *			return false;
 *		else
 *			return true
 *		
 *	});
 *
 *  //클래스로 룰 추가 가능함.
 * jQuery.validator.addClassRules("chkLength", {
 *		validTel: true
 *	});

   // 전송 함수전에 validate 실행
    if(!$('#form').valid()){
        return false;
    }

 */
export const inputValidate = (formId,params)=>{

    
    //포커스 아웃될때 validate 수행
    // $(`${formId} input`).on('focusout',function(){
    //     $('.wj-control').removeClass('wj-state-invalid');
    //     $('.wj-error').remove();
    //     $(`${formId}`).valid();
    // });

    let error = {
        errorPlacement:(error,element)=>{
            setTimeout(()=>{
                
                $(element).closest('.wj-control').addClass('wj-state-invalid');
                $(element).closest('.wj-labeled-input').children('.wj-error').remove();
                $(element).closest('.wj-labeled-input').append(`<div class="wj-error" tabindex="-1">${error.text()}</div>`)
                
            },100)
        }
    }
    params = {...params,...error}

    return $(formId).validate(params);

    //validation rules
    // $(formId).validate(...params,...{
    //     //rules: rules,
    //     //messages: messages,
    //     errorPlacement:(error,element)=>{
    //         setTimeout(()=>{
                
    //             $(element).closest('.wj-control').addClass('wj-state-invalid');
    //             $(element).closest('.wj-labeled-input').children('.wj-error').remove();
    //             $(element).closest('.wj-labeled-input').append(`<div class="wj-error" tabindex="-1">${error.text()}</div>`)
                
    //         },100)
    //     }
    // });
}

/**
 * jquery validate로 발생한 오류 css 초기화시킨다.
 * 일반적으로 validation 체크후 오류난 input박스에 정상 값을 넣으면 오류는 사라지지만
 *  사라지지않는 항목도 있음 이를 초기화 해줌. 
 * 
 * 보통 form 저장시에 inputValidateReset으로 초기화후 jquery validation 검사 다시 시행
 * 
 * @param {Object} inputValidate 함수로 생성한 validator 객체 
 */
export const inputValidateReset = (formValidator)=>{
    if (wijmo.isNullOrWhiteSpace(formValidator)) return;  // 이것도.

    let validList = formValidator.invalid;  //오류발생한 항목을 object로 반환함.
    //console.debug(validList);
    
    Object.keys(validList).forEach(item=>{   // 다른 폼의 같은 name끼리 겹치는 경우 때문에 수정. 이래도 되는지?
        //aria-invlalid="false"도 validList에 포함되므로 제외(부서명, 사번 readonly box)
        
        // if(item !== '') $('#'+formValidator.currentForm.id + ' #'+item).removeClass('wj-state-invalid');
        if(item !== '') $(`#${formValidator.currentForm.id} input[name="${item}"]`).closest('.wj-state-invalid').removeClass('wj-state-invalid');
    });
}

/**
 * 폼태그 안에 wijmo 포함 모든 input박스 초기화
 * @param {String} formId 폼id
 */
export const formInputReset = (formId)=>{
    $(`${formId} .wj-control`).each(function(){
        let ctl = wijmo.Control.getControl(this);

        switch(true){
            case(ctl instanceof wijmo.input.MultiSelect):
                ctl.checkedItems = [];
                break;
            case(ctl instanceof wijmo.input.InputNumber):
            case(ctl instanceof wijmo.input.InputMask):
            case(ctl instanceof wijmo.input.InputDate):
                ctl.value = null;
                break;
            case(ctl instanceof wijmo.input.ComboBox):
            case(ctl instanceof wijmo.input.AutoComplete):
                ctl.selectedValue = null;
                ctl.text = null;
                break;
            default:
                break;
        }
        
        //wijmo 컨트롤이 아닐경우
        if(wijmo.isNullOrWhiteSpace(ctl)){
            let key = $(this).attr('name');
            
            switch ($(this).attr("type").toLowerCase()) {
                case "checkbox":
                case "radio":
                    $(`input[name=${key}]`).prop('checked',false);
                    break;
                case "text":
                case "hidden":
                    $(this).val('');
                    break;
                default:
                    break;
            }   
        }
    });
}

