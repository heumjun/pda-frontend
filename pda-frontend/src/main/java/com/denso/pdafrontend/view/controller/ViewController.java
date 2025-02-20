package com.denso.pdafrontend.view.controller;

import java.util.Arrays;
import java.util.Map;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.ObjectUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;

import com.denso.pdafrontend.common.AuthorityDto;
import com.denso.pdafrontend.common.AuthorityService;
import com.denso.pdafrontend.login.dto.UserDto;
import com.denso.pdafrontend.login.util.JwtTokenProvider;
import com.denso.pdafrontend.response.StatusCode;
import com.denso.pdafrontend.utils.JsonUtils;

import lombok.RequiredArgsConstructor;


/**
 * html view 담당 controller
 */
@RestController
@RequiredArgsConstructor
public class ViewController {

    private final AuthorityService authorityService;
    private final JwtTokenProvider jwtTokenProvider;
    
    
    /**
     * view 파라미터로 받은 html경로로 던져준다.
     * 
     * @param params 뷰단으로 파라미터를 던져야 할경우 
     * @return
     */
    @GetMapping("view")
    public ModelAndView view(@RequestParam Map<String,Object> params,HttpServletRequest request) throws Exception {

        ModelAndView mv = new ModelAndView();
        //mv.addObject("params", params.get("params"));
        mv.addObject("params", params);
        
        /**
         * url, authUrl 두개를 나눠놓은 이유는 view는 html이 있는경로이고 authUrl은 권한키 이다.
         * 이 두개의 값은 같다. 권한관리에서도 페이지경로가 중복되지 않기때문에 이를 키로 잡아서 관리 하고있다.
         * 하지만 한페이지에서 팝업을 호출하는 페이지가 있다고 한다면. 팝업페이지는 페이지 경로가 부모랑 다르다.
         * 이는 부모페이지와 팝업페이지 모두 권한관리에 넣어줘야 페이지가 호출된다.
         * 자식 페이지는 부모페이지에 종속되기때문에 부모페이지의 권한을 이어 받으면된다.
         * 이러한 문제때문에 view와 authUrl을 따로둬서 일반페이지에서는 이두개값은 같을것이다. 하지만 부모페이지에 귀속되는 팝업이나 기타 기능페이지들은 view는 해당페이지주소로, 
         * authUrl은 부모페이지 키값을 사용하여 부모페이지의 권한으로 검증받도록 한다.
         */
        String url = params.get("view").toString();
        String authUrl = params.get("authUrl").toString();

        //권한체크
        // AuthorityDto authority =  authorityService.getAuthority(request,authUrl);
        
        // //서버 응답 실패
        // if(!authority.getStatus()){
        //     mv.addObject("statusCode", authority.getStatusCode());
        //     mv.addObject("message", authority.getMessage());
        //     mv.setViewName("403");
        //     return mv;
        // } 

        // //권한이 없거나 lock 걸렸을경우
        // if(ObjectUtils.isEmpty(authority.getData().getAuthority()) || 
        //         authority.getData().getAuthority().getAthLock().equals("Y")){

        //     mv.addObject("statusCode", StatusCode.FORBIDDEN.getStatus());
        //     mv.addObject("message", StatusCode.FORBIDDEN.getMessage());
        //     mv.setViewName("403");
        //     return mv;
        // }

        String token = Arrays.stream(request.getCookies())
                    .filter(c->c.getName().equals("denso-pda")) //람다식
                    .findFirst()	//하나만 반환
                    .map( Cookie::getValue) // map: 원하는 형태로 변환, 더블콜론(람다식( (cookie)->cookie.getValue() )을 간결한 표시로 변경) 
                    .orElse(null);

        //사용자 정보
        UserDto userInfo = jwtTokenProvider.getUserInfoByToken(token);
        mv.addObject("userInfo", userInfo); //topbar에 사용자 정보를 뿌려줌.
        params.put("userInfo", userInfo);
        
        
        
        //등록 삭제권한을 페이지로 가져감. frontEnd(javascript쪽에서 권한 컨트롤함.)
        // params.put("athIns", authority.getData().getAuthority().getAthIns().equalsIgnoreCase("Y"));
        // params.put("athDel", authority.getData().getAuthority().getAthDel().equalsIgnoreCase("Y"));

        //파라미터를 json으로 변환해서 내보냄.
        //html에서 data-params div에 파라미터를 넣어둠.
        //기존에는 input hidden태그를 만들어서 파라미터 하나씩 넣었는데 보내야 할 공통 파라미터가 많아질경우 모든 html 파일에 
        //파라미터 수만큼 input 태그를 추가해야하는 문제가 있음.
        mv.addObject("params", JsonUtils.serialize(params));

        mv.setViewName(url);



        return mv;
    }

    /**
     * 권한이 없을경우 페이지 이동
     * 페이지 이동시에는 view에서 이루어 지고 rest-api로 확인시 권한이 없다면(403) ajax.js에서 accessDenied 컨트롤로 리다이렉션시킨다.
     * @return
     * @throws Exception
     */
    @GetMapping("access-denied")
    public ModelAndView accessDenied() throws Exception {
        ModelAndView mv = new ModelAndView();
        mv.setViewName("403");
        return mv;
    }



    


}
