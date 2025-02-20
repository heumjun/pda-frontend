package com.denso.pdafrontend.feign.configuration;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.boot.autoconfigure.http.HttpMessageConverters;
import org.springframework.cloud.openfeign.support.SpringEncoder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.denso.pdafrontend.feign.model.FeignErrorDecode;

import feign.RequestInterceptor;
import feign.codec.Encoder;
import feign.form.spring.SpringFormEncoder;

/**
 * feign 개별적으로 configuration 을 주려면 아래 @configuration 삭제시켜야함.
 */
@Configuration
public class FeignConfiguration {
	
	
	/**
	 * 쿠키 전송
	 * @return
	 */
	@Bean("requestInterceptor")
	public RequestInterceptor requestInterceptor() {
		return template->{
			ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
			HttpServletRequest request = attributes.getRequest();
			String cookie = request.getHeader("Cookie");
			template.header("Cookie",cookie);
		};
		
	}

	/**
	 * 멀티파트 관련 인코더
	 */
	@Bean
	public Encoder multipartFormEncoder() {

		return new SpringFormEncoder(new SpringEncoder(new ObjectFactory<HttpMessageConverters>() {
			@Override
			public HttpMessageConverters getObject() throws BeansException{
				return new HttpMessageConverters(new RestTemplate().getMessageConverters());
			}
		}));
	}
	
	
	/**
	 * http응답코드가 200 번대이상(실패) 코드일경우 작동하는 decoder
	 * GlobalExceptionHandler에서 모든 오류는 처리하기때문에 사실상 필요없음.
	 * @return
	 */ 
	@Bean
    public FeignErrorDecode decoder() {
        return new FeignErrorDecode();
    }
	
	
}
