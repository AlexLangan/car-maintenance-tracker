package com.example.carmaintenance;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Car {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String make;
    private String model;
    private int year;

    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL)
    private List<MaintenanceRecord> maintenanceRecords;

    // getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public List<MaintenanceRecord> getMaintenanceRecords() { return maintenanceRecords; }
    public void setMaintenanceRecords(List<MaintenanceRecord> maintenanceRecords) {
        this.maintenanceRecords = maintenanceRecords;
    }
}
