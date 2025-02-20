package com.denso.pdafrontend.common;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
/**
 * 권한DTO
 * 
 * {"statusCode":200,"status":true,"message":null,"data":{"authority":{"id":admin,"athIns":"Y","athDel":"Y","athLock":"N"}},"errors":null}
 * 
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthorityDto {
    
    private String statusCode;
    private Boolean status;
    private String message;
    private BodyData data;

    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BodyData{
        private Authority authority;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Authority{
        private String athId;
        private String athIns;
        private String athDel;
        private String athLock;
    }
}
