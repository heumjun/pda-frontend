package com.denso.pdafrontend.restapi.service;

import java.util.List;
import java.util.Map;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import feign.Response;

@FeignClient(name = "restapi-service", url = "${api.url}")
public interface RestApiService {
    
    @GetMapping("{uri}")
	ResponseEntity<?> getRestAPI(@RequestParam Map<String,Object> params, @PathVariable String uri);

    @PostMapping("{uri}")
	ResponseEntity<?> postRestAPI(@RequestBody Map<String,Object> params, @PathVariable String uri);

    @PutMapping("{uri}")
	ResponseEntity<?> putRestAPI(@RequestBody Map<String,Object> params, @PathVariable String uri);

    @DeleteMapping("{uri}")
	ResponseEntity<?> deleteRestAPI(@RequestBody Map<String,Object> params, @PathVariable String uri);

    
    /**
     * 첨부파일 다운로드
     * @param params
     * @param uri
     * @return
     */
    @GetMapping("{uri}")
    Response fileDownLoadRestAPI(@RequestParam Map<String,Object> params, @PathVariable String uri);

    /**
     * 첨부파일 올리기
     * @param params    파일외 파라미터들
     * @param files     첨부파일
     * @param uri
     * @return
     */
    @PostMapping(value = "{uri}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<?> fileUploadRestAPI(@RequestPart Map<String, Object> params, @RequestPart List<MultipartFile> files, @PathVariable String uri);

    /**
     * 이미지 뷰
     * @param uri
     * @return
     */
    @GetMapping("{uri}")
    ResponseEntity<Resource> imageView(@PathVariable String uri);

    
    
}
