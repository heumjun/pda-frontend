package com.denso.pdafrontend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

@EnableFeignClients
@ComponentScan(nameGenerator = PdaFrontendBeanNameGenerator.class)
@SpringBootApplication
//public class PdaFrontendApplication {
public class PdaFrontendApplication extends SpringBootServletInitializer {

	public static void main(String[] args) {
		SpringApplication.run(PdaFrontendApplication.class, args);
	}

	@Override
	protected SpringApplicationBuilder configure(SpringApplicationBuilder builder) {
		return builder.sources(PdaFrontendApplication.class);
	}

}
