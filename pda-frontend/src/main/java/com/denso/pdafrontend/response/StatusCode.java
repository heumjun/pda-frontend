package com.denso.pdafrontend.response;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor   //모든 필드 값을 파라미터로 받는 생성자를 만들어줍니다
public enum StatusCode {
    /**
	 * 
	 * 200(OK) : 요청 성공의 기본 상태 코드
	 * 204(No Content) : body에 응답 내용이 없을 경우 이용
	 * 400(Bad Request) : request 형식 틀렸을 경우
	 * 401(Unathorized) : 리소스 접근 권한 없는 경우
	 * 403(Forbidden) : 해당 리소스에 접근하는 것이 허락되지 않을 경우
	 * 404(Not Found) : 존재하지 않는 URI
	 * 405(Method Not Allowed) : 존재하지 않는 request method
	 * 406(Not Acceptable) : request의 Accept header에 설정한 MIME 타입이 지원 불가능한 경우
	 * 414(URI Too Long) : 요청한 URI가 너무 김
	 * 500(Internal Server Error) : 서버에서 에러가 발생한 경우에 설정되는 기본 상태 코드
	 * 503(Service Unavailable) : 외부 서비스가 현재 멈춘 상태 이거나 이용할 수 없는 서비스

	 */
    
    OK(200,"요청성공"),
    CREATED(201,"데이터가 성공적으로 생성되었습니다."),
    NO_CONTENT(204,"내용이 없습니다."),
	BAD_REQUEST(400,"Request 형식이 틀렸습니다."),
    UNAUTHORIZED(401, "로그인 후 다시 작업하세요."),
	FORBIDDEN(403,"해당 리소스에 접근이 허락되지 않았습니다."),
    NOT_FOUND(404,"존재하지 않는 URI 입니다."),
    METHOD_NOT_ALLOWED(405, "존재하지 않는 request method 입니다."),
    NOT_ACCEPTABLE(406,"Request의 accept header의 MIME 타입이 지원불가능합니다."),
    Expired_Token(444,"토큰이 만료 되었습니다. 로그인후 다시 작업하세요."),
    INTERNAL_SERVER_ERROR(500, "서버 에러 입니다."),
    SERVICE_UNAVAILABLE(503, "서비스가 현재 멈춘 상태이거나 이용할 수 없는 서비스 입니다.")
    
    ;

    private final int status;
    private final String message;

    
    
}
