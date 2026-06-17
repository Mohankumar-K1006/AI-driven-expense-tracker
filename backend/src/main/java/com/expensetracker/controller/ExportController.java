package com.expensetracker.controller;

import com.expensetracker.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/export")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @GetMapping("/csv")
    public ResponseEntity<?> exportCsv(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            String csv = exportService.exportCsv(userId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("expense_report.csv").build());

            return new ResponseEntity<>(csv, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }

    @GetMapping("/pdf")
    public ResponseEntity<?> exportPdf(Authentication auth) {
        try {
            Long userId = (Long) auth.getPrincipal();
            byte[] pdf = exportService.exportPdf(userId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDisposition(ContentDisposition.attachment()
                    .filename("expense_report.pdf").build());

            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage() != null ? e.getMessage() : e.toString()));
        }
    }
}
