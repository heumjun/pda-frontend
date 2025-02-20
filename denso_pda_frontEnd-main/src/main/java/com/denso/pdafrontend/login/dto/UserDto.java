package com.denso.pdafrontend.login.dto;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserDto implements UserDetails{

    private String userId;      //id
    private String password;    //비밀번호
    private String username;    //이름
    private String tel;         //전화번호
    private String entdt;       //입사일자
    private String jan;        //지점(1001:창원본점,1002:마산점,1003:진해점 등)
    private String role;        //권한 롤 => 기본적으로 USER_ROLE 다 넣어줘야함.
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Collection<? extends GrantedAuthority> authorities;
    
    // 이하 코드는 security 를 위한 용도
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return this.authorities;
    }
    @Override
    public String getPassword() {
        return this.password;
    }
    @Override
    public String getUsername() {
        return this.username;
    }
    @Override
    public boolean isAccountNonExpired() {
        return false;
    }
    @Override
    public boolean isAccountNonLocked() {
        return false;
    }
    @Override
    public boolean isCredentialsNonExpired() {
        return false;
    }
    @Override
    public boolean isEnabled() {
        return false;
    }

    
    
}
