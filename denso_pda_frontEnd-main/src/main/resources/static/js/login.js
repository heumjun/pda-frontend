/// <reference path ="../vendors/wijmo/Dist/controls/wijmo.d.ts"/>
/// <reference path ="../vendors/sweetalert2/sweetalert2.d.ts"/>


import * as ajax from "./common/ajax.js";

/**
 * 로그인 관련 js
 * 모듈 패턴으로 함수를 정의함(함수 캡슐화, 전역스코프 중복방지)
 * => es6 이후에는 import,export 를 사용함으로 자동 모듈이 되어 모듈패턴적용안해도 함수 캡슐화 자동으로 됨.
 * 
 * 화살표함수(익명함수) 사용법
 * https://inpa.tistory.com/entry/JS-%F0%9F%93%9A-%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8-%ED%99%94%EC%82%B4%ED%91%9C-%ED%95%A8%EC%88%98-%EC%A0%95%EB%A6%AC
 * 
 * 화살표함수 사용시 jquery this 차이점
 * https://m.blog.naver.com/10hsb04/221732759112
 * 
 */
const login = function(){
    
    //이벤트 핸들러
    const handleEvent = ()=>{
        //로그인 버튼 이벤트
        $("#button-login").on("click",login);

        //jquery validate
        $("#login-form").validate({
            rules:{
                id:{
                    required: true,
                },
                pw:{
                    required: true
                }
            },
            messages:{
                id:{
                    required: "[아이디]는 필수 입력입니다.",
                },
                pw:{
                    required: "[비밀번호]는 필수 입력입니다."
                }
            },
            errorPlacement: function(error,element){
                element.after(error);
            }
        });
    }
    
    //로그인 처리
    const login = (e)=>{
        
        // form태그속의 button type이 submit일경우 페이지이동 또는 새로고침이 기본동작 이기때문에 기본동작을 막기위해 e.preventDefault 사용
        e.preventDefault(); 
        
        //jquery validate
        if(!$('#login-form').valid()){
			return false;
		}
        
        let params = {
            url: 'login',       //front단 controller, url 로 호출할경우 front 단 controller이기 때문에 backend주소인 uri는 필요없음.
            company: $("#company").val(),
            factory: $("#factory").val(),
            userId: $("#userId").val(),
            password: $("#password").val()
        }
        
        ajax.postAjax(params,true).then((data) => {
            window.location.href = "/index";
        }).catch((err) => {});
        
    }

    return{
        init:()=>{
            handleEvent();
        }
    };

}();

//문서 로딩후 시작점

$(()=>{
    
    login.init();
});


