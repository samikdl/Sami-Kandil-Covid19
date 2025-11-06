package com.covid19.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry r) {
        r.addMapping("/**")
         .allowedOrigins("http://localhost:5173", "http://10.74.253.137:5173")
         .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
         .allowedHeaders("*")
         .allowCredentials(false);
      }
    };
  }
}
