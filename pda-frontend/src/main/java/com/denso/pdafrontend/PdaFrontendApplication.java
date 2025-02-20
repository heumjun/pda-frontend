package com.denso.pdafrontend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;

@EnableFeignClients
@ComponentScan(nameGenerator = PdaFrontendBeanNameGenerator.class)
@SpringBootApplication
public class PdaFrontendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PdaFrontendApplication.class, args);
	}

}
