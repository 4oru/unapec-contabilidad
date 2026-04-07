package com.contabilidad.unapec.backend_contabilidad.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        Server devServer = new Server();
        devServer.setUrl("http://localhost:8080");
        devServer.setDescription("Servidor de Desarrollo");

        Contact contact = new Contact();
        contact.setName("Alan Roman García");
        contact.setEmail("aroman18@unapec.edu.do");

        return new OpenAPI()
                .info(new Info()
                        .title("Sistema de Contabilidad Central - UNAPEC")
                        .version("1.0.0")
                        .contact(contact)
                        .description("### API de Integración Contable\n" +
                                "Esta API permite centralizar las operaciones de:\n" +
                                "* **Nómina:** Gestión de pagos y empleados.\n" +
                                "* **Inventario:** Control de activos y suministros.\n" +
                                "* **Facturación:** Registro de ingresos y comprobantes fiscales.\n\n" +
                                "**Tecnologías:** Java 21, Spring Boot 3.4, PostgreSQL.")
                        .license(new License().name("Apache 2.0").url("http://springdoc.org")))
                .servers(List.of(devServer));
    }
}
