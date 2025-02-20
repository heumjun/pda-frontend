package com.denso.pdafrontend.utils;

import java.io.IOException;
import java.io.Reader;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public final class JsonUtils {
	
	private JsonUtils() {
        throw new UnsupportedOperationException();
    }

    private static ObjectMapper getObjectMapper() {
        return StandardObjectMapper.getInstance();
    }

    public static String serialize(final Object value) {
        try {
            return getObjectMapper().writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new RuntimeException(e);
        }
    }

    public static byte[] serializeAsBytes(final Object value) {
        try {
            return getObjectMapper().writeValueAsBytes(value);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static <T> T deserialize(final String json, final Class<T> clazz) {
        try {
            return getObjectMapper().readValue(json, clazz);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static <T> T deserialize(final String json, final TypeReference<T> typeReference) {
        try {
            return getObjectMapper().readValue(json, typeReference);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    
    public static <T> T deserialize(final Object json, final Class<T> clazz) {
        try {
            return getObjectMapper().convertValue(json, clazz);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public static <T> T deserialize(final Object json, final TypeReference<T> typeReference) {
        try {
            return getObjectMapper().convertValue(json, typeReference);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    
    public static <T> T deserialize(final byte[] data, final Class<T> clazz) {
        try {
            return getObjectMapper().readValue(data, clazz);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static <T> T deserialize(final byte[] data, final TypeReference<T> typeReference) {
        try {
            return getObjectMapper().readValue(data, typeReference);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    public static <T> T deserialize(final Reader reader, final Class<T> clazz) {
        try {
            return getObjectMapper().readValue(reader, clazz);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    

}