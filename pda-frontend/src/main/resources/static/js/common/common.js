//공통 함수 모음 JS

//import { modalSabun,modalDept,modalJuso,modalKakaoJuso } from "./modal.js";
import * as modal from "./modal.js";
import * as ajax from "./ajax.js";
import * as dateUtils from "./dateUtils.js";


/**
 * server side 에서 tree데이터(부모,자식 코드가 존재하는)가 있는 배열일경우
 * 이를 javascript Object 형태로 변경해줌.
 * @param {Object} array tree데이터
 * @param {String} node 노드 이름
 * @param {String} upNode 부모 노드이름
 * @returns 
 */
export const treeToObject = (array,node,upNode)=>{
    let map = new Array();
    map['-'] = {children:[]};
    
    array.forEach(item=>{
        let obj = {...item};    //원본데이터 유지하기위해 새로운 object 복사
        
        obj.children = new Array();
        map[obj[node]] = obj;
        
        if(!map[item[upNode]]){
            map['-'].children.push(obj);
        }else{
            // '||' 문법은 앞에 변수가  false, 0, '', null, undefined 일경우 뒤 변수가 초기화됨.
            let parent = item[upNode] || '-';
            if(!map[parent]){
                map[parent]={
                    children:[]
                };
            }
            map[parent].children.push(obj);
        }
    });
    return map['-'].children;
}

/**
 * tree object에서 원하는 노드 찾기
 * @param {array} items tree node 전체
 * @param {String} key   찾고싶은 노드키
 * @param {String} text  노드키값
 * @param {String} childKey 자식노드이름
 * @returns 
 */
export const getTreeFindItem = (items,key,text,childKey)=>{

    for(let item of items){
        if(item[key]==text){
            return item;
        }
        if(!wijmo.isEmpty(item[childKey])){
            let findItem = getTreeFindItem(item[childKey],key,text,childKey);
            if(findItem) return findItem;

        }

    }
    return null;
    
}

/**
 * 한글이 포함되어 있는지 여부 확인
 * @param {String} word 검사할 문자열
 * @returns  true/false
 */
export const iskorean = (word)=>{
    let korean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    return korean.test(word);
}

/**
 * 올림함수
 * @param {*} value 올림할 수
 * @param {*} len 올림할 자릿수 10단위에서 올림 2, 소숫점 2자리에서 올림 -2
 * @example
 *  getCeilNumber(1.222,-2)  // 1.3
 *  getCeilNumber(1222,2)  // 1300
 * * @returns 결과값
 */
export const getCeilNumber = (value,len)=>{
    return getCeilFloorRoundNumber(value,len,'ceil');
}
/**
 * 내림함수
 * @param {*} value 내림할 수
 * @param {*} len 내림할 자릿수 10단위에서 내림 2, 소숫점 2자리에서 내림 -2
 * @example
 *  getFloorNumber(1.222,-2)  // 1.2
 *  getFloorNumber(1222,2)  // 1200
 * * @returns 결과값
 */
export const getFloorNumber = (value,len)=>{
    return getCeilFloorRoundNumber(value,len,'floor');
}

/**
 * 반올림 함수
 * @param {*} value 반올림할 수
 * @param {*} len 반올림할 자릿수 10단위에서 반올림 2, 소숫점 2자리에서 반올림 -2
 * @example
 *  getRoundNumber(1.252,-2)  // 1.3
 *  getRoundNumber(1252,2)  // 1300
 * * @returns 결과값
 */
export const getRoundNumber = (value,len)=>{
    return getCeilFloorRoundNumber(value,len,'round');
}
/**
 * 올림,내림,반올림 함수
 * @param {*} value 
 * @param {*} len 
 * @param {*} flag 
 * @returns 
 */
const getCeilFloorRoundNumber = (value,len,flag)=>{
    if(len == 0) return value;

    if(len > 0){    //정수에서 올림
        len = 10**len; //거듭제곱
        return Math[flag](value / len)*len;
    }else{  //소숫점에서 올림
        len = (len * -1)-1;
        len = 10**len //거듭제곱
        return Math[flag](value * len)/len;
    }
}

/**
 * jquery validate 사용자 함수 정의
 */
const customJqueryValidator = ()=>{

    //전화번호 유효성
    jQuery.validator.addMethod("validTel", (value, element)=> {
        
        if(!value) return true;

		var rgEx = /^(01[016789]{1}|02|0[3-9]{1}[0-9]{1})-[0-9]{3,4}-[0-9]{4}$/;
		var OK = rgEx.test(value);
		if(!OK)
			return false;
		else
			return true
		
	},'휴대전화 형식을 확인하세요.');

    //주민번호 유효성체크
    jQuery.validator.addMethod('validJumin',(value,element)=>{
        if(!value) return true; //번호가 있을경우만 유효성 확인

        var reg = /^(\d{6})-?(\d{7})$/;
        if (!reg.test(value)) {
            return false;
        }
        let match = reg.exec(value);
        let num = match[1]+match[2];

        // 생년월일 유효성 검사
        let birthYear = (num.charAt(6) <='2')? '19' + num.substring(0,2):'20'+num.substring(0,2);
        let birthMonth = num.substring(2, 4);
        var birthDay = num.substring(4, 6);
        var birthDate = new Date(birthYear, birthMonth - 1, birthDay);
        if (birthDate.getFullYear() != birthYear || birthDate.getMonth() + 1 != birthMonth || birthDate.getDate() != birthDay) {
            return false;
        }

        // 검증 번호 계산
        let weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
        let sum = weights.reduce((acc,weight,index)=>acc+parseInt(num.charAt(index)) * weight,0);
        
        // for (var i = 0; i < 12; i++) {
        //     sum += parseInt(num.charAt(i)) * weights[i];
        // }
        let checkDigit = (11 - (sum % 11)) % 10;

        // 마지막 검증 번호와 일치하는지 확인
        return checkDigit == parseInt(num.charAt(12));


    },'주민등록번호를 확인하세요.');

    

    /**
     * 엘리먼트를 그룹화해서 하나이상 입력된 엘리먼트 여부를 찾을때.
     * 보통 조회 조건에서 하나이상의 조건문을 입력해야만 조회가 가능토록할경우
     * @param[만족해야하는 엘리먼트갯수, 그룹화 시킬 엘리먼트의 선택자]
     * @example
     * rules:{
            searchA:{ require_from_group: [1, ".search-group"] },
            searchB:{ require_from_group: [1, ".search-group"] },
            searchC:{ require_from_group: [1, ".search-group"] },
        },messages:{
            searchA:'조회조건 중 하나 이상을 입력하세요.',
            searchB:'조회조건 중 하나 이상을 입력하세요.',
            searchC:'조회조건 중 하나 이상을 입력하세요.',
        }
     */
    jQuery.validator.addMethod("require_from_group", function(value, element, options) {
            
        var $fields = $(options[1], element.form); // 그룹화된 필드들을 찾기
        let params = ajax.getParams(`#${element.form.id}`);
        
        var filledFieldsCount = $fields.filter(function() {
            let name = $(this).find('input').attr('name');
            let value = params[name];
            return value.trim() !== ""; // 공백 제거 후 체크
        }).length;
        
        return filledFieldsCount >= options[0];
    });
}



/**
 * 파일 확장자를 넣으면 fontawesome 아이콘 css 반환
 * @param {*} extension 확장자
 */
export const getFileIconByExtension = (extension)=>{
    const extensionIconMap = {
        pdf: 'far fa-file-pdf',
        doc: 'far fa-file-word',
        docx: 'far fa-file-word',
        xls: 'far fa-file-excel',
        xlsx: 'far fa-file-excel',
        ppt: 'far fa-file-powerpoint',
        pptx: 'far fa-file-powerpoint',
        jpg: 'far fa-file-image',
        png: 'far fa-file-image',
        gif: 'far fa-file-image',
        txt: 'far fa-file-alt',
        zip: 'far fa-file-archive',
        rar: 'far fa-file-archive',
        mp4: 'far fa-file-video',
        mp3: 'far fa-file-audio',
        // 기타 확장자 추가 가능
        default: 'fa-file'
    }
    
    return extensionIconMap[extension.toLowerCase()] || extensionIconMap['default'];
}

/**
 * 비밀번호 변경
 */
const saveOfPassword = async ()=>{

    let oldPassword= $('#oldPassword').val();
    let newPassword= $('#newPassword').val();
    let newPasswordConfirm= $('#newPasswordConfirm').val();
    
    if(wijmo.isNullOrWhiteSpace(oldPassword)){
        alertWarning('변경불가.','기존 비밀번호를 입력해주세요.',()=>$('#oldPassword').trigger('focus'));
        return;
    }
    if(wijmo.isNullOrWhiteSpace(newPassword)){
        alertWarning('변경불가.','새로운 비밀번호를 입력해주세요.',()=>$('#newPassword').trigger('focus'));
        return;
    }
    if(wijmo.isNullOrWhiteSpace(newPasswordConfirm)){
        alertWarning('변경불가.','비밀번호 확인을 입력해주세요.',()=>$('#newPasswordConfirm').trigger('focus'));
        return;
    }

    if(newPassword != newPasswordConfirm){
        alertWarning('변경불가.','새로운 비밀번호와 비밀번호 확인이 일치하지 않습니다.',()=>$('#newPasswordConfirm').trigger('focus'));
        return;
    }
    
    
    let params = {
        uri: 'login/change-password',
        oldPassword: oldPassword,
        newPassword: newPassword,
    }

    try {
        await ajax.putAjax(params);
        alertInfo('비밀번호 변경','비밀번호가 변경되었습니다.');
    } catch (error) {
        alertError('비밀번호 변경','비밀번호 변경에 실패하였습니다.');
    }

}

/**
 * 모든 페이지에 공통으로 넣어줘야할 공통코드
 * 문서 실행시 공통으로 실행되야할 모듈 모음
 */

$(()=>{

    let title = $('#data-params').data('params').title;
    $('#title').text(title);
    if(!wijmo.isUndefined($('#menuTitle').get(0))){
        // 타이틀 표시
        let typed = new Typed("#menuTitle",{
            strings: [title],
            typeSpeed: 30
            //cursorChar: '.'
        });
    }
    

    //문서로딩이 다되면 로딩바 없애기
    $('#loading').hide();  
    
    //모달창 드래그 가능
    $('.modal-dialog').draggable({
        handle: ".modal-header"
    });

    //페이지 타이틀 => 탭이동시 필요함.
    // let params = $('#data-params').data('params');
    // $('title').text(params.title);

    //앵커기능(스크롤 이동되며 바로가기 기능)
    //태그 엘리먼트에 data-anchor-target 속성을 넣고 id값을 부여해야함.
    //해당 id를 가지는 엘리먼트로 스크롤되어 이동됨.
    $('[data-anchor-target]').on('click',function(){
        let scrollPosition = $($(this).data('anchorTarget')).offset().top-100;
        window.scrollTo({top:scrollPosition,behavior:'smooth'});
    });

    //페이지가 길어서 스크롤바 내릴경우 위로가기 버튼 보이기
    $(document).on('scroll',()=>{
        let totalScroll = $(document).scrollTop();

		if (totalScroll >= 200) {
			$('[data-click=scroll-top]').addClass('show');
		} else {
			$('[data-click=scroll-top]').removeClass('show');
		}
    });
    //위로가기 버튼 클릭시 화면 위로 올리기
    $('[data-click=scroll-top]').on('click',()=>{
        $('html, body').animate({
			scrollTop: $("body").offset().top
		}, 100);
    });

    //공통 모달 로딩
    modal.modalLoad();
   
    //jquery validate 커스텀 함수 정의
    customJqueryValidator();
	
    //문자열 byte수로 변경
    String.prototype.getBytes = function() {
        const contents = this;
        
        let str_character;
        let int_char_count = 0;
        let int_contents_length = contents.length;
        let k;
    
        for (k = 0; k < int_contents_length; k++) {
            str_character = contents.charAt(k);
            if(encodeURI(str_character).length > 4)
                int_char_count += 2;
            else
                int_char_count++;
        }
        
        return int_char_count;
    }


    /**
     * input박스 등 엘리먼트 엔터키(enter) 입력시 다음 엘리먼트로 자동 이동
     * form 태그안에서만 작동
     */
    $(document).on('keyup','form',function(e){
        if(e.key=='Enter'){

            let currentElement = document.activeElement;
            //button 태그일경우 빠져나감 
            //아래 e.preventDefault() 구문때문에 버튼으로 focus가 있는데도 enter 키를 입력시 버튼 클릭이벤트가 발생되지 않음.
            if(currentElement.tagName==='BUTTON'){
                return;
            } 
            
            //수동으로 포커스를 이동시킬경우(input.nextFocusEvent) 엔터키 기본기능이 활성화 되면 
            //input.nextFocusEvent() 함수에서 enter키 인식이 자동 활성화 되어 그다음 포커스로 이동해버림
            //그래서 기본동작을 막는 코드 적용
            e.preventDefault(); 

            let focusableElements = $('input:not([type="hidden"]),select,textarea,.wj-control').toArray();    //jquery 엘리먼트에서 javascript 배열로 반환
            //let focusableElements = Array.from(document.querySelectorAll('input:not([type="hidden"]),select,textarea,.wj-control'));

            let currentIndex = focusableElements.indexOf(currentElement);

            if(currentIndex>-1 && currentIndex < focusableElements.length -1){
                let nextElement = focusableElements[currentIndex+1];
                nextElement.focus();    
            }

        }
    });

    //nav 메뉴 클릭시 해당 페이지로 이동
    $('[data-path]').on('click',function(e){
        e.preventDefault();
        let view = $(this).attr('href');
        let title = $(this).data('path');
        let url = `view?view=${view}&title=${title}&authUrl=${view}`;

        location.href =url;
    });

    /**
     * 로그아웃
     */
    $("#btn-logOut").on('click',()=>{
        location.href ="/log-out";
    });    

    $('#btn-setting-save').on('click',saveOfPassword); //비밀번호 변경

    
    
});


