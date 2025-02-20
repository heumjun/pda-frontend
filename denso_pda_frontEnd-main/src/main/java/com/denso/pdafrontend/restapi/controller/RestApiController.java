package com.denso.pdafrontend.restapi.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletRequest;
//import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;

import org.apache.commons.lang3.ObjectUtils;
import org.springframework.core.io.Resource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.denso.pdafrontend.common.AuthorityDto;
import com.denso.pdafrontend.common.AuthorityService;
import com.denso.pdafrontend.response.exception.BusinessException;
import com.denso.pdafrontend.restapi.service.RestApiService;

import feign.Response;


/**
 * 모든 rest api 집결지
 */
//@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("rest-api")
public class RestApiController {

    //private final FeignClientBuilder feignClientBuilder;
    private final RestApiService restApiService;
    private final AuthorityService authorityService;
    
    // public RestApiController(ApplicationContext appContext){ 
    //     this.feignClientBuilder = new FeignClientBuilder(appContext);
    // }

    /**
     * 권한확인
     * 모든 rest-api에서 프로그램 권한을 검증한다.
     * @param request
     * @param authUrl
     */
    private void isAuthority(HttpServletRequest request, String authUrl) throws Exception {
        
        // AuthorityDto authority =  authorityService.getAuthority(request,authUrl);

        // if(!authority.getStatus()) throw new BusinessException("서버오류 입니다.");

        // if(ObjectUtils.isEmpty(authority.getData().getAuthority()) || 
        //         authority.getData().getAuthority().getAthLock().equals("Y")){
        //     throw new AccessDeniedException("");
        // }
        
    }
    
    
    @GetMapping
    public ResponseEntity<?> getMapping(@RequestParam Map<String,Object> params, HttpServletRequest request) throws Exception{
        
        //메뉴url
        String authUrl = params.get("authUrl").toString();
        //권한확인
        isAuthority(request,authUrl);


        String uri = params.get("uri").toString();
        
        //서비스명에 따라 feignClient의 서비스를 여러개 생성시켜야 하지만. 
        //feignClientBuilder를 사용하여 서비스명을 동적으로  삽입가능하게 만듬.
        //RestApiService restApiService = feignClientBuilder.forType(RestApiService.class, service).build();
        
        return restApiService.getRestAPI(params, uri);
    }
    

    @PostMapping
    public ResponseEntity<?> postMapping(@RequestBody Map<String,Object> params, HttpServletRequest request) throws Exception{
        
        //메뉴url
        String authUrl = params.get("authUrl").toString();
        //권한확인
        isAuthority(request,authUrl);

        String uri = params.get("uri").toString();
        //RestApiService restApiService = feignClientBuilder.forType(RestApiService.class, service).build();
        
        return restApiService.postRestAPI(params, uri);
    }

    @PutMapping
    public ResponseEntity<?> putMapping(@RequestBody Map<String,Object> params, HttpServletRequest request) throws Exception{
        
        //메뉴url
        String authUrl = params.get("authUrl").toString();
        //권한확인
        isAuthority(request,authUrl);

        String uri = params.get("uri").toString();
        //RestApiService restApiService = feignClientBuilder.forType(RestApiService.class, service).build();
        
        return restApiService.putRestAPI(params, uri);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteMapping(@RequestBody Map<String,Object> params, HttpServletRequest request) throws Exception{
        //메뉴url
        String authUrl = params.get("authUrl").toString();
        //권한확인
        isAuthority(request,authUrl);

        String uri = params.get("uri").toString();
        //RestApiService restApiService = feignClientBuilder.forType(RestApiService.class, service).build();
        
        return restApiService.deleteRestAPI(params, uri);
    }

    @GetMapping("check-file-exists")
    public ResponseEntity<?> checkFileExists(@RequestParam Map<String,Object> params, HttpServletRequest request) throws Exception{
        
        //메뉴url
        String authUrl = params.get("authUrl").toString();
        //권한확인
        isAuthority(request,authUrl);

        String uri = "attatch-files/check-file-exists";
        
        //서비스명에 따라 feignClient의 서비스를 여러개 생성시켜야 하지만. 
        //feignClientBuilder를 사용하여 서비스명을 동적으로  삽입가능하게 만듬.
        //RestApiService restApiService = feignClientBuilder.forType(RestApiService.class, service).build();
        
        return restApiService.getRestAPI(params, uri);

    }

    @GetMapping("download")
    public ResponseEntity<?> fileDownloadMapping(@RequestParam Map<String,Object> params, HttpServletRequest request) throws Exception{
        
        //메뉴url
        String authUrl = params.get("authUrl").toString();
        //권한확인
        isAuthority(request,authUrl);

        String uri = "attatch-files";
        
        //RestApiService restApiService = feignClientBuilder.forType(RestApiService.class, service).build();

        Response response = restApiService.fileDownLoadRestAPI(params, uri);

        InputStream inputStream = null;
        byte[] b = null;
        try {
            Response.Body body = response.body();

            inputStream = body.asInputStream();
            b = new byte[inputStream.available()];
            inputStream.read(b);

        } catch (IOException e) {
            e.printStackTrace();
        } finally{
            if(inputStream !=null){
                try {
                    inputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }

        //header 에서 첨부파일명 받아오기
        String contentDisposition = response.headers().entrySet().stream().filter(f->f.getKey().equals("content-disposition"))
                                        .collect(Collectors.toMap(Map.Entry::getKey, e->new ArrayList<>(e.getValue())))
                                        .get("content-disposition")
                                        .get(0);
        
        
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,contentDisposition)
                                  .body(b);
        
    }

    
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> fileUploadMapping(@RequestPart(value = "params") Map<String,Object> params,
                                         @RequestPart(value = "files",required = false) List<MultipartFile> files,
                                         HttpServletRequest request ) throws Exception{
    
        //메뉴url
        String authUrl = params.get("authUrl").toString();
        //권한확인
        isAuthority(request,authUrl);

        String uri = params.get("uri").toString();
        //RestApiService restApiService = feignClientBuilder.forType(RestApiService.class, service).build();
        
        return restApiService.fileUploadRestAPI(params,files, uri);
    }

    @GetMapping("image-view/{path}/{fileName}")
    public ResponseEntity<Resource> imageView(@PathVariable String path,@PathVariable String fileName) throws Exception {
        String uri = "image-view/".concat(path).concat("/") .concat(fileName);

        ResponseEntity<Resource> response = restApiService.imageView(uri);
        Resource resource = response.getBody();

        if (resource.exists() && resource.isReadable()) {
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG) // 확장자에 맞는 MIME 타입 지정
                    .body(resource);
        } else {
            return ResponseEntity.notFound().build();
        }

    }
    




    

}
