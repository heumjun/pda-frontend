package com.denso.pdafrontend.configuration;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
//import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.denso.pdafrontend.interceptor.LoggerInterceptor;
import com.denso.pdafrontend.login.util.JwtTokenProvider;

import lombok.RequiredArgsConstructor;

/**
 * 로그를 위한 인터셉터
 */
@Configuration
@RequiredArgsConstructor
public class WebMvcConfiguration implements WebMvcConfigurer{

	private final JwtTokenProvider jwtTokenProvider;

	@Override
	public void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(new LoggerInterceptor(jwtTokenProvider))
				.excludePathPatterns("/assets/**")
				.excludePathPatterns("/vendors/**")
				.excludePathPatterns("/falcon_template/**")
				.excludePathPatterns("/css/**")
				.excludePathPatterns("/img/**")
				.excludePathPatterns("/js/**")
				.excludePathPatterns("/favicon.ico")
				.excludePathPatterns("/access-denied")
				.excludePathPatterns("/rest-api");

	}
    
}
