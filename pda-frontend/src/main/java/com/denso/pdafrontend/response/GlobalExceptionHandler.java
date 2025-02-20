package com.denso.pdafrontend.response;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.denso.pdafrontend.response.exception.BusinessException;
import com.denso.pdafrontend.response.exception.UnathorizedException;

import lombok.extern.slf4j.Slf4j;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    
    /**
     * 사용자 정의 예외처리
     * @param e
     * @return
     */ 
    @ExceptionHandler(BusinessException.class)
    protected ResponseEntity<?> handleBusinessException(BusinessException e){
        log.error("handleBusinessException", e.getMessage());
        return ResponseEntityUtil.error(StatusCode.NO_CONTENT,e.getMessage());
    }
    
    /**
     * 사용자 정의 예외처리 외 모든 예외
     * @param e
     * @return
     */
    @ExceptionHandler(Exception.class)
    protected ResponseEntity<?> handleException(Exception e){
        log.error("handleException", e);
        return ResponseEntityUtil.error(StatusCode.INTERNAL_SERVER_ERROR);
    }

    /**
     * Authentication 객체가 필요한 권한을 보유하지 않은 경우 발생함 (권한관리)
     * RestApiController 에서 사용
     */
    @ExceptionHandler(AccessDeniedException.class)
    protected ResponseEntity<?> handleAccessDeniedException(AccessDeniedException e){
        log.error("handleAccessDeniedException");
        return ResponseEntityUtil.error(StatusCode.FORBIDDEN);
    }

    /**
     * 토큰인증 안됨.
     * JwtTokenProvider 에서 사용
     * @param e
     * @return
     */
    @ExceptionHandler(UnathorizedException.class)  //예외클래스 따로 만듬.
    protected ResponseEntity<?> handleUnathorizedException(UnathorizedException e){
        log.error("handleUnathorizedException");
        return ResponseEntityUtil.error(StatusCode.UNAUTHORIZED);
    }


}
