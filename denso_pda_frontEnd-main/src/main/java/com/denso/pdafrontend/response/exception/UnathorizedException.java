package com.denso.pdafrontend.response.exception;

/**
 * 토큰인증이 실패하였을경우 ExceptionHandleController 에서 해당 클래스로 예외처리를 던지면
 * GlobalExceptionhandler 에서 잡아서 예외처리됨.
 */
public class UnathorizedException extends RuntimeException{
    
}
