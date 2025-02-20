
package com.denso.pdafrontend.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfiguration{
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception{
        
        http
            .httpBasic(c->c.disable())  // security에서 기본으로 생성하는 login페이지 사용 안 함 
            .csrf(c->c.disable())       //csrf 사용안함 (REST API 사용하기때문에) =>  csrf(모놀리식 구조에 적합함)
            .authorizeHttpRequests(auth->auth.anyRequest().permitAll())  //모든링크 허용
            .headers(headers->headers.frameOptions(frame->frame.sameOrigin()))  //spring security 에선 frame 적용이 기본적으로 막혀있음. sameorigin 옵션을 두어 동일한 origin에서는 가능토록 설정
            .sessionManagement(sessionManagement->sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS)); //JWT 사용으로 session 사용안함.

        return http.build(); 

        
    }

}
