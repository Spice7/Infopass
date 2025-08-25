package com.infopass.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan({"boot.infopass.*","com.infopass.backend"})
@MapperScan("boot.infopass.mapper")
@EnableScheduling
public class InfopassBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(InfopassBackApplication.class, args);
	}

}
