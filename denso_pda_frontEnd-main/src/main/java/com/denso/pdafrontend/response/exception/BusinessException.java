package com.denso.pdafrontend.response.exception;

/**
 * 비지니스 로직에서 사용할 공통 예외처리
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message){
        super(message);
    }
}
