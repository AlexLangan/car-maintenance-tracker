package com.alexlangan.carmaintenance;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .authorizeHttpRequests()
                .requestMatchers("/", "/index.html", "/css/**", "/js/**").permitAll()
                .requestMatchers("/cars/**", "/maintenance/**").authenticated()
                .and()
                .formLogin()
                .permitAll()
                .and()
                .httpBasic() // lets curl/Postman authenticate
                .and()
                .logout()
                .permitAll();

        return http.build();
    }
}
