package com.denso.pdafrontend.login.dto;

import java.util.Collection;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class UserDto implements UserDetails{

	private String userId;
	private String username;
	private String password;
	private String company;
	private String factory;
	private Integer empNo;
	private String companyName; 
	private String factoryName;
	private Integer limitFileCnt;
	private Integer limitStorage;
	private String empName;
	//우리 mes에서 사용되는 role과는 다르지만 spring security에서 사용해야함.
	private String role;  //권한 롤 => 기본적으로 USER_ROLE 다 넣어줘야함.
	private String companyUseType;
	private String companyLock;		//사용중지 여부
	private String ip;

	private int seq;

	// 이하 코드는 security 를 위한 용도
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private Collection<? extends GrantedAuthority> authorities;


	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		// TODO Auto-generated method stub
		return this.authorities;
	}

	@Override
	public String getPassword() {
		// TODO Auto-generated method stub
		return this.password;
	}

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Override
	public boolean isAccountNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@JsonProperty(access  =JsonProperty.Access.WRITE_ONLY)
	@Override
	public boolean isAccountNonLocked() {
		// TODO Auto-generated method stub
		return true;
	}

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Override
	public boolean isCredentialsNonExpired() {
		// TODO Auto-generated method stub
		return true;
	}

	@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
	@Override
	public boolean isEnabled() {
		// TODO Auto-generated method stub
		return true;
	}

    
}
