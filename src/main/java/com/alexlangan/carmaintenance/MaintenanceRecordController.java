package com.alexlangan.carmaintenance;

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