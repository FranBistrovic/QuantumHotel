package com.quantumhotel.controllers;

import com.quantumhotel.controllers.dto.HotelStatisticsDTO;
import com.quantumhotel.exporters.PdfExporter;
import com.quantumhotel.exporters.XlsxExporter;
import com.quantumhotel.exporters.XmlExporter;
import com.quantumhotel.services.StatisticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StatisticsController.class)
class StatisticsControllerTest {
    @Autowired
    private MockMvc mockMvc;
    @MockBean
    private StatisticsService statisticsService;
    @MockBean
    private XmlExporter xmlExporter;
    @MockBean
    private PdfExporter pdfExporter;
    @MockBean
    private XlsxExporter xlsxExporter;
    @Test
    @WithMockUser(roles = "ADMIN")
    void shouldReturnStatistics() throws Exception {
        HotelStatisticsDTO dto = new HotelStatisticsDTO();
        when(statisticsService.generateStatistics(
                LocalDate.parse("2024-01-01"),
                LocalDate.parse("2024-01-31")
        )).thenReturn(dto);

        mockMvc.perform(get("/api/statistics")
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-01-31"))
                .andExpect(status().isOk());
    }
    @Test
    @WithMockUser(roles = {"ADMIN", "STAFF"})
    void shouldExportXml() throws Exception {
        HotelStatisticsDTO dto = new HotelStatisticsDTO();
        byte[] xmlData = "xml-content".getBytes();

        when(statisticsService.generateStatistics(any(), any()))
                .thenReturn(dto);

        when(xmlExporter.export(dto)).thenReturn(xmlData);

        mockMvc.perform(get("/api/statistics/export/xml")
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_XML));
    }

    @Test
    @WithMockUser(roles = {"ADMIN", "STAFF"})
    void shouldExportPdf() throws Exception {
        HotelStatisticsDTO dto = new HotelStatisticsDTO();
        byte[] pdfData = "pdf-content".getBytes();

        when(statisticsService.generateStatistics(any(), any()))
                .thenReturn(dto);

        when(pdfExporter.export(dto)).thenReturn(pdfData);

        mockMvc.perform(get("/api/statistics/export/pdf")
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }

    @Test
    @WithMockUser(roles = {"ADMIN", "STAFF"})
    void shouldExportXlsx() throws Exception {
        HotelStatisticsDTO dto = new HotelStatisticsDTO();
        byte[] xlsxData = "xlsx-content".getBytes();

        when(statisticsService.generateStatistics(any(), any()))
                .thenReturn(dto);

        when(xlsxExporter.export(dto)).thenReturn(xlsxData);

        mockMvc.perform(get("/api/statistics/export/xlsx")
                        .param("startDate", "2024-01-01")
                        .param("endDate", "2024-01-31"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_OCTET_STREAM));
    }
}