/**
 * 메시지 박스 관련 공통 모듈
 */


/**
 * 메시지 박스(confirm)
 * ex) msgbox.confirm("등록 하시겠습니까?","등록 후 반영됩니다.",constants.conmsgBox.QUESTION,()=>{});
 * 
 * @param {String} title 타이틀
 * @param {String} text  내용
 * @param {String} icon : constants.MSGBOX
 * @param {function} callback 
 */
 export const confirm = (title, text, icon, callback)=> {
    
    
    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        showCancelButton: true,
        confirmButtonText: '네',
        cancelButtonText: '아니요',
        reverseButtons: true,
        allowOutsideClick: false,
        confirmButtonColor:'#2c7be5'
        
    }).then((result)=>{
        if (result.isConfirmed) {
            if(wijmo.isFunction(callback)) callback();
        }
    });  
}

/**
 * 정보 출력용 메시지 박스
 * @param {String} title 
 * @param {String} text 
 * @param {function} callback 콜백함수 (생략가능)
 */
export const alertInfo = (title,text,callback)=>{
    alert(title,text,"info",callback);
}

/**
 * 에러 출력용 메시지 박스
 * @param {String} title 
 * @param {String} text 
 * @param {function} callback 콜백함수 (생략가능)
 */

export const alertError = (title,text,callback)=>{
    alert(title,text,"error",callback);
    
}

/**
 * 경고 출력용 메시지 박스
 * @param {String} title 
 * @param {String} text 
 * @param {function} callback 콜백함수 (생략가능)
 */
export const alertWarning = (title,text,callback)=>{
    alert(title,text,"warning",callback);
}

const alert = (title,text,icon,callback)=>{

    Swal.fire({
        title: title,
        text: text,
        icon: icon,
        
    }).then((result)=>{
        if(result.isConfirmed){
            //if(wijmo.isFunction(callback)) callback();
            //보통은 메시지 박스 출력시 확인버튼을 누르면 특정 이벤트를 발생시키는데(보통은 focus)
            //이때 순식간에 작동이되어 정상적으로 작동이 안됨(추측상 rendering 끝나기 전인것 같음)
            //그래서 setTimeout을 적용시켜 시간은 조금 지연시키고 callback함수를 실행시킴.
            if(wijmo.isFunction(callback)){
                setTimeout(() => {
                    callback();
                }, 400);
            }
        }
    });
    
}


const Toast = Swal.mixin({
    toast: true,
    position: 'bottom-end',        //'top', 'top-start', 'top-end', 'center', 'center-start', 'center-end', 'bottom', 'bottom-start', or 'bottom-end'.
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
})

/**
 * 푸시메시지
 * @param {String} text 메시지 내용
 */
export const pushMsg = (text)=>{
    Toast.fire({
        icon: 'success',
        title: text
    })
}

