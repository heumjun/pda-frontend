package com.denso.pdafrontend.utils;

import java.io.IOException;
import java.util.Properties;

import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.env.PropertiesPropertySource;
import org.springframework.core.env.PropertySource;
import org.springframework.core.io.support.EncodedResource;
import org.springframework.core.io.support.PropertySourceFactory;
import org.springframework.lang.Nullable;

/**
 * yml 파일을 @PropertySource 에서 로드할수 있도록 함.
 */
public class YamlLoadFactory implements PropertySourceFactory {

    @Override
    public PropertySource<?> createPropertySource(@Nullable String name, EncodedResource encodeResource) throws IOException {
        
        YamlPropertiesFactoryBean factory = new YamlPropertiesFactoryBean();
        factory.setResources(encodeResource.getResource());

        Properties properties = factory.getObject();


        return new PropertiesPropertySource(encodeResource.getResource().getFilename(),properties);
    }

    
}
