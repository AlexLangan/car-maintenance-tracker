package com.example.carmaintenance;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class MaintenanceRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate date;
    private String description;
    private double cost;

    @ManyToOne
    @JoinColumn(name = "car_id")
    private Car car;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public double getCost() { return cost; }
    public void setCost(double cost) { this.cost = cost; }

    public Car getCar() { return car; }
    public void setCar(Car car) { this.car = car; }
}