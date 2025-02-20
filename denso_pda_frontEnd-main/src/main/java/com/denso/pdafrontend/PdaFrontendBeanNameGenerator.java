package com.denso.pdafrontend;

import java.lang.ModuleLayer.Controller;

import java.util.Set;

import org.apache.catalina.startup.ClassLoaderFactory.Repository;
import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanNameGenerator;
import org.springframework.context.annotation.AnnotationBeanNameGenerator;
import org.springframework.core.type.AnnotationMetadata;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RestController;

public class PdaFrontendBeanNameGenerator implements BeanNameGenerator {

    private final AnnotationBeanNameGenerator defaulGenerator = new AnnotationBeanNameGenerator();

    @Override
    public String generateBeanName(BeanDefinition definition, BeanDefinitionRegistry registry) {
        final String result;
        if(isController(definition)){
            result = generatorFullBeanName((AnnotatedBeanDefinition) definition);
        }else{
            result = this.defaulGenerator.generateBeanName(definition, registry);
        }
        return result;
    }

    private boolean isController(BeanDefinition definition) {

        if(definition instanceof AnnotatedBeanDefinition){
            final Set<String> annotationTypes = getAnnotationTypes(definition);
            
            for(final String annotationType :annotationTypes){
                if(annotationType.equals(Controller.class.getName())) return true;

                if(annotationType.equals(RestController.class.getName())) return true;

                if(annotationType.equals(Service.class.getName())) return true;

                if(annotationType.equals(Repository.class.getName())) return true;

                if(annotationType.equals(Component.class.getName())) return true;
				

            }
        }
        return false;
    }

    private Set<String> getAnnotationTypes(BeanDefinition definition) {
        final AnnotatedBeanDefinition annotatedDef = (AnnotatedBeanDefinition)definition;
		final AnnotationMetadata metadata = annotatedDef.getMetadata();
		
		return metadata.getAnnotationTypes();
        
    }

    private String generatorFullBeanName(AnnotatedBeanDefinition definition){

        return definition.getMetadata().getClassName();

    }

    
}
