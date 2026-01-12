package com.quantumhotel.controllers;

import com.quantumhotel.repository.UserRepository;
import com.quantumhotel.users.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/city")
public class CityController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getCity(@RequestParam Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found for ID: " + id));

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("city", user.getCity());

        return ResponseEntity.ok(response);
    }

    @PatchMapping
    public ResponseEntity<Map<String, Object>> updateCity(@RequestParam Long id, @RequestBody Map<String, String> request) {
        String newCity = request.get("city");

        if (newCity == null || newCity.isEmpty()) {
            return jsonResponse(false, "City name is required", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found for ID: " + id));

        user.setCity(newCity);
        userRepository.save(user);

        return jsonResponse(true, "City updated successfully", HttpStatus.OK);
    }

    private ResponseEntity<Map<String, Object>> jsonResponse(boolean success, String message, HttpStatus status) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", success);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
