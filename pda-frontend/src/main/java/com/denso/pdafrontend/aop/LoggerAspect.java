package com.denso.pdafrontend.aop;


import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

@Component
@Aspect
@Slf4j
public class LoggerAspect {
    //포인트컷 표현식
	// * : 모든 리턴타입, com.denso..controller: com.denso 패키지안에 모든 controller패키지
	// *Controller: 이름이 Controller로 끝나는 모든 클래스, *(..) : 모든 메소드
    @Around("execution(* com.denso..controller.*Controller.*(..)) or execution(* com.denso..service.*Service.*(..)) or execution(* com.denso..mapper.*Mapper.*(..))")
	public Object logPrint(ProceedingJoinPoint joinPoint) throws Throwable{
		String type = "";
		String name = joinPoint.getSignature().getDeclaringTypeName();	//클래스명
		if(name.indexOf("Controller")>-1) {
			type="Controller \t:	";
		}
		else if(name.indexOf("Service")> -1) {
			type = "Service	\t:	";
		}
		else if(name.indexOf("Mapper") > -1) {
			type = "Mapper	\t:	";
		}
				
		log.debug(type + name + "."+ joinPoint.getSignature().getName()+"()");	//메소드명
		
		return joinPoint.proceed();
		
	}
    
}