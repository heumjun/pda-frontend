package com.denso.pdafrontend.response;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

public class ResponseEntityUtil {

    /**
     * 정상 (데이터만 반환)
     * @param data 데이터
     * @return
     */
    public static <T> ResponseEntity<?> ok(T data){
        
        return ResponseEntity.status(HttpStatus.OK)
                .body(
                    DefaultRes.builder()
                    .status(true)    
                    .statusCode(StatusCode.OK.getStatus())
                    .data(data)
                    .build()
                );
    }

    /**
     * 데이터 생성 (insert, update, delete)
     * @return
     */
    public static ResponseEntity<?> created(){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                    DefaultRes.builder()
                    .status(true)
                    .statusCode(StatusCode.CREATED.getStatus())
                    .build()
                );
    }


    /* 
     * 200번대 정상 status 외에는 오류로 판단하여 openfeign 에서 예외처리 시켜 frontend단의 js까지 메시지 전달이 안됨.
     * 200번대 이상 오류일경우에도 httpstatus는 200번 성공처리 하고 body의 statusCode값으로 오류코드를 확인한다.
     */

    /**
     * status code 값에 따른 오류처리
     * @param statusCode
     * @return
     */
    public static ResponseEntity<?> error(StatusCode statusCode) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(
                    DefaultRes.builder()
                        .status(false)    
                        .statusCode(statusCode.getStatus())
                        .message(statusCode.getMessage())
                        .build()
                );
    }
    
    /**
     * status code 와 오류메시지를 같이 (businessException)
     * @param statusCode
     * @param message
     * @return
     */
    public static ResponseEntity<?> error(StatusCode statusCode, String message){
        return ResponseEntity.status(HttpStatus.OK)
            .body(
                DefaultRes.builder()
                    .status(false)
                    .statusCode(statusCode.getStatus())
                    .message(message)
                    .build()
            );
    }
    
    
}
