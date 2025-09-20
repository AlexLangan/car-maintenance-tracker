package com.example.carmaintenance;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maintenance")
public class MaintenanceRecordController {

    @Autowired
    private MaintenanceRecordRepository maintenanceRecordRepository;

    @Autowired
    private CarRepository carRepository;

    // Get all records
    @GetMapping
    public List<MaintenanceRecord> getAllRecords() {
        return maintenanceRecordRepository.findAll();
    }

    // Add a record to a car
    @PostMapping("/car/{carId}")
    public MaintenanceRecord addRecord(
            @PathVariable Long carId,
            @RequestBody MaintenanceRecord record) {

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Car not found"));
        record.setCar(car);
        return maintenanceRecordRepository.save(record);
    }
}


//what is spring boot?
//Spring Boot is an open-source Java-based framework used to create microservices, web applications, and standalone applications. It is built on top of the Spring Framework and provides a simplified way to set up and configure Spring applications with minimal boilerplate code. Spring Boot offers features such as embedded servers (like Tomcat or Jetty), auto-configuration, and production-ready metrics, making it easier for developers to build and deploy applications quickly.
//what is jpa?
//JPA (Java Persistence API) is a specification in Java that provides a standard way to manage relational data in applications. It defines a set of interfaces and annotations for mapping Java objects to database tables, allowing developers to perform CRUD (Create, Read, Update, Delete) operations on the database using Java objects. JPA is often used in conjunction with ORM (Object-Relational Mapping) frameworks like Hibernate, which implement the JPA specification and provide additional features for database interaction and management.
//what can spring boot do? that java cant do?
//Spring Boot simplifies the process of building and deploying Java applications by providing a range of features that are not available in standard Java. Some of the key capabilities of Spring Boot that enhance Java development include:
//1. Auto-Configuration: Spring Boot automatically configures your application based on the dependencies you include, reducing the need for manual configuration.
//2. Embedded Servers: Spring Boot includes embedded servers like Tomcat or Jetty, allowing you to run web applications without needing to deploy them to an external server.
//3. Starter Dependencies: Spring Boot provides starter dependencies that bundle commonly used libraries, making it easier to add functionality to your application.
//4. Production-Ready Features: Spring Boot includes features like health checks, metrics, and monitoring, which help in managing and maintaining applications in production environments.
//5. Simplified Dependency Management: Spring Boot uses Maven or Gradle to manage dependencies, making it easier to handle library versions and updates.
//6. Rapid Development: With Spring Boot's conventions and tools, developers can quickly create and iterate on applications, speeding up the development process.
//Overall, Spring Boot enhances Java development by providing a more streamlined