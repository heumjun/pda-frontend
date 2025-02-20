package com.denso.pdafrontend.interceptor;

import java.util.Arrays;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

import com.denso.pdafrontend.login.util.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RequiredArgsConstructor
@Slf4j
public class LoggerInterceptor implements HandlerInterceptor{

	private final JwtTokenProvider jwtTokenProvider;

	@Override
	public boolean preHandle(HttpServletRequest request,HttpServletResponse response,Object handler) throws Exception{
		
		log.debug("================================ START =================================");
		log.debug("Request URI \t:  "+ request.getRequestURL());
		
		/*
		 * 브라우저를 종료하기 전까지는 토큰이 존재함.(브라우저 종료하거나 로그아웃시 쿠키삭제됨.)
		 * 발행받은 토큰이 있다면 토큰 유효성만 체크후 index로 진입시킨다.
		 * interceptor에서 링크마다 토큰을 사용자 체크하면 부하가 많이 걸림.
		 * 서버로 요청 작업할경우 server로 토큰을 던지고 서버에서 사용자 체크한다.
		 * 토큰 유효성 및 사용자인증이 되지 않으면 401에러가 발생되고 강제로그아웃 시킴(기존 쿠키는 삭제되고 login 페이지로 돌아감.) 
		 */
		String token = null; 
		
		//토큰받아오기
		if(!ObjectUtils.isEmpty(request.getCookies())) {
			token = Arrays.stream(request.getCookies())
				.filter(c->c.getName().equals("denso-pda")) //람다식
				.findFirst()	//하나만 반환
				.map( Cookie::getValue) // map: 원하는 형태로 변환, 더블콜론(람다식( (cookie)->cookie.getValue() )을 간결한 표시로 변경) 
				.orElse(null);
		}

		
		//토큰이 없고 login경로외 경로라면 login으로 무조건 진입시킴.
		if(ObjectUtils.isEmpty(token)) {
			if(!request.getRequestURI().equals("/login")){
        		response.sendRedirect("/login");
            	return false;
        	}
			return true;	//login으로 진입한다면 진입가능하게.
		}
		
		//토큰유효성 체크
		if(!jwtTokenProvider.validateToken(token)){
			
			if(!request.getRequestURI().equals("/login") ){
				response.sendRedirect("/login");
				return false;
			}

			return true;
		}

		//토근이 유효하면  로그인페이지나, root 페이지로 이동시 index 페이지로 자동 리다이렉트
		if(request.getRequestURI().equals("/login") || request.getRequestURI().equals("/")){
			response.sendRedirect("/index");
			return false;
		}

		return true;
		
	}
	
	@Override
	public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
			ModelAndView modelAndView) throws Exception {
		log.debug("================================ END =================================\n");
		return;
	}		
}
