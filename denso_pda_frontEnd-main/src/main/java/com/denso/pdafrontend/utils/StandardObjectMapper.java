package com.denso.pdafrontend.utils;

import java.text.SimpleDateFormat;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

public final class StandardObjectMapper extends ObjectMapper {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ssXXX";

    public StandardObjectMapper() {
        super();
        SimpleModule simpleModule = new SimpleModule();
        simpleModule.addSerializer(Long.class, ToStringSerializer.instance);
        simpleModule.addSerializer(Long.TYPE, ToStringSerializer.instance);
        this.registerModule(simpleModule);
        this.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true)	//작은따옴표 지원
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)  // Map데이터와 매핑되는 class의 필드가 기본적으로 같아야 매핑이 되지만 같지 않아도 매핑되는 옵션 추가
            .setDateFormat(new SimpleDateFormat(DEFAULT_DATE_FORMAT));
    }

    public static StandardObjectMapper getInstance() {
        return InstanceHolder.INSTANCE;
    }

    private static final class InstanceHolder {

        private static final StandardObjectMapper INSTANCE = new StandardObjectMapper();

    }
}
