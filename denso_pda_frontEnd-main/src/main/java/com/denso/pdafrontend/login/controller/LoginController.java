package com.denso.pdafrontend.login.controller;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.denso.pdafrontend.login.dto.UserDto;
import com.denso.pdafrontend.login.util.JwtTokenProvider;
import com.denso.pdafrontend.response.ResponseEntityUtil;
import com.denso.pdafrontend.response.exception.BusinessException;
import com.denso.pdafrontend.restapi.service.RestApiService;
import com.denso.pdafrontend.utils.JsonUtils;
import com.fasterxml.jackson.core.type.TypeReference;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class LoginController {
    
    private final JwtTokenProvider jwtTokenProvider;
    private final RestApiService restApiService;
    /**
     * 로그인 화면
     * @return
     */
    @GetMapping("login")
    public ModelAndView loginView(){
        ModelAndView mv = new ModelAndView();
        mv.setViewName("login");
        return mv;
    }

    /**
     * 로그인 토큰 발행 
     * @param params
     * @param response
     * @return
     * @throws Exception
     */
    @PostMapping("login")
    public ResponseEntity<?> login(@RequestBody UserDto params,HttpServletResponse response) throws Exception{
        
        if(ObjectUtils.isEmpty(params.getCompany())){
            throw new BusinessException("사번을 입력하세요.");
        }

        if(ObjectUtils.isEmpty(params.getFactory())){
            throw new BusinessException("비밀번호를 입력하세요.");
        }
        
        if(ObjectUtils.isEmpty(params.getUserId())){
        	throw new BusinessException("사번을 입력하세요.");
        }
        
        if(ObjectUtils.isEmpty(params.getPassword())){
        	throw new BusinessException("비밀번호를 입력하세요.");
        }

        Map<String,Object> param = new HashMap<String,Object>();
        param.put("company", params.getCompany());
        param.put("factory", params.getFactory());
        param.put("userId", params.getUserId());
        param.put("password", params.getPassword());
//        param.put("jan", params.getJan());      //지점
        ResponseEntity<?> responseEntity = restApiService.postRestAPI(param, "login");
        
        Map<String,Object> body = JsonUtils.deserialize(responseEntity.getBody(), new TypeReference<Map<String,Object>>() {});
        boolean status = (boolean) body.get("status");

        if(!status){
            if(Integer.parseInt(body.get("statusCode").toString())<500)
                throw new BusinessException(body.get("message").toString());
            else
                throw new RuntimeException();
        } 
        
        Map<String,Object> data = JsonUtils.deserialize(body.get("data"), new TypeReference<Map<String,Object>>() {});
        
        String token = data.get("token").toString();
        if(StringUtils.isBlank(token)) throw new BusinessException("토큰발행에 실패하였습니다.");

        
        //받아온 토큰을 쿠키에 저장함.
        Cookie cookie = new Cookie("denso-pda", token);  
        cookie.setPath("/");
        cookie.setHttpOnly(true);   //js에서 쿠키 접근 불가능(http 요청시 자동으로 첨부됨.)
        response.addCookie(cookie);
        
        return ResponseEntityUtil.ok(null);
        
    }   

    /**
     * 로그아웃
     * @param response
     * @return
     * @throws Exception
     */
    @GetMapping("log-out")
    public ModelAndView logout(HttpServletResponse response) throws Exception{
        Cookie cookie = new Cookie("denso-pda", null);
        cookie.setMaxAge(0);    //브라우저 종료시까지 쿠키 살아있음
        cookie.setPath("/");

        response.addCookie(cookie);

        ModelAndView mv = new ModelAndView();
        mv.setViewName("redirect:login");
        return mv;
    }

    /**
     * 초기화면
     * @return
     * @throws Exception
     */
    @RequestMapping("index")
    public ModelAndView index(HttpServletRequest request) throws Exception{
        
        ModelAndView mv = new ModelAndView();

        //토큰받아오기
		if(!ObjectUtils.isEmpty(request.getCookies())) {
			String token = Arrays.stream(request.getCookies())
                        .filter(c->c.getName().equals("denso-pda")) //람다식
                        .findFirst()	//하나만 반환
                        .map( Cookie::getValue) // map: 원하는 형태로 변환, 더블콜론(람다식( (cookie)->cookie.getValue() )을 간결한 표시로 변경) 
                        .orElse(null);

            //사용자 정보
            UserDto userInfo = jwtTokenProvider.getUserInfoByToken(token);
            
            mv.addObject("userInfo", userInfo);

            Map<String,Object> params = new HashMap<String,Object>();
            params.put("userInfo", userInfo);
            params.put("authUrl", "index");
            params.put("title", "작업 - QR 스캔");
            mv.addObject("params", JsonUtils.serialize(params));
		}
        
        mv.setViewName("index");
        return mv;
    }


    
}
