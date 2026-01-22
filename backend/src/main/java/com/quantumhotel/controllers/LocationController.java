package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.LocationResponseDto;
import com.quantumhotel.entity.Location;
import com.quantumhotel.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/location")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    @GetMapping
    public LocationResponseDto getLocation() {
        Location loc = locationRepository.findById(1L)
                .orElseGet(() -> {
                    Location defaultLoc = new Location();
                    defaultLoc.setLatitude(45.801278);
                    defaultLoc.setLongitude(15.969584);
                    return locationRepository.save(defaultLoc);
                });

        return new LocationResponseDto(loc.getLatitude(), loc.getLongitude());
    }

    @PatchMapping
    public LocationResponseDto updateLocation(@RequestBody LocationResponseDto updated) {
        Location loc = locationRepository.findById(1L).orElse(new Location());
        loc.setLatitude(updated.getLatitude());
        loc.setLongitude(updated.getLongitude());
        loc = locationRepository.save(loc);

        return new LocationResponseDto(loc.getLatitude(), loc.getLongitude());
    }
}