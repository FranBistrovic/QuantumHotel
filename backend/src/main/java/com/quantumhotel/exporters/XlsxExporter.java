package com.quantumhotel.exporters;


import com.quantumhotel.controllers.dto.HotelStatisticsDTO;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.Map;

@Component
public class XlsxExporter {

    public byte[] export(HotelStatisticsDTO statistics) throws Exception {
        Workbook workbook = new XSSFWorkbook();

        // Create styles
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle currencyStyle = createCurrencyStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);

        // Summary Sheet
        createSummarySheet(workbook, statistics, headerStyle, titleStyle, currencyStyle, numberStyle);

        // Demographics Sheet
        createDemographicsSheet(workbook, statistics, headerStyle, titleStyle);

        // Accommodations Sheet
        createAccommodationsSheet(workbook, statistics, headerStyle, titleStyle, currencyStyle);

        // Amenities Sheet
        createAmenitiesSheet(workbook, statistics, headerStyle, titleStyle, currencyStyle);

        // Write to byte array
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();

        return outputStream.toByteArray();
    }

    private void createSummarySheet(Workbook workbook, HotelStatisticsDTO statistics,
                                    CellStyle headerStyle, CellStyle titleStyle,
                                    CellStyle currencyStyle, CellStyle numberStyle) {
        Sheet sheet = workbook.createSheet("Summary");
        sheet.setColumnWidth(0, 7000);
        sheet.setColumnWidth(1, 5000);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Hotel Statistics Report");
        titleCell.setCellStyle(titleStyle);
        rowNum++;

        // Period
        Row periodRow = sheet.createRow(rowNum++);
        periodRow.createCell(0).setCellValue("Report Period:");
        periodRow.createCell(1).setCellValue(statistics.getStartDate() + " to " + statistics.getEndDate());
        rowNum++;

        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        Cell metricHeader = headerRow.createCell(0);
        metricHeader.setCellValue("Metric");
        metricHeader.setCellStyle(headerStyle);

        Cell valueHeader = headerRow.createCell(1);
        valueHeader.setCellValue("Value");
        valueHeader.setCellStyle(headerStyle);

        // Data rows
        addDataRow(sheet, rowNum++, "Total Reservations", statistics.getTotalReservations(), numberStyle);
        addDataRow(sheet, rowNum++, "Completed Reservations", statistics.getCompletedReservations(), numberStyle);
        addDataRow(sheet, rowNum++, "Cancelled Reservations", statistics.getCancelledReservations(), numberStyle);

        Row revenueRow = sheet.createRow(rowNum++);
        revenueRow.createCell(0).setCellValue("Total Revenue");
        Cell revenueCell = revenueRow.createCell(1);
        revenueCell.setCellValue(statistics.getTotalRevenue().doubleValue());
        revenueCell.setCellStyle(currencyStyle);

        Row avgDurationRow = sheet.createRow(rowNum++);
        avgDurationRow.createCell(0).setCellValue("Average Stay Duration (days)");
        avgDurationRow.createCell(1).setCellValue(statistics.getAverageStayDuration().doubleValue());
    }

    private void createDemographicsSheet(Workbook workbook, HotelStatisticsDTO statistics,
                                         CellStyle headerStyle, CellStyle titleStyle) {
        Sheet sheet = workbook.createSheet("Demographics");
        sheet.setColumnWidth(0, 5000);
        sheet.setColumnWidth(1, 4000);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Guest Demographics");
        titleCell.setCellStyle(titleStyle);
        rowNum++;

        // By City
        if (statistics.getReservationsByCity() != null && !statistics.getReservationsByCity().isEmpty()) {
            rowNum = addDemographicSection(sheet, rowNum, "Reservations by City",
                    statistics.getReservationsByCity(), headerStyle);
            rowNum++;
        }

        // By Gender
        if (statistics.getReservationsByGender() != null && !statistics.getReservationsByGender().isEmpty()) {
            rowNum = addDemographicSection(sheet, rowNum, "Reservations by Gender",
                    statistics.getReservationsByGender(), headerStyle);
            rowNum++;
        }

        // By Age Group
        if (statistics.getReservationsByAgeGroup() != null && !statistics.getReservationsByAgeGroup().isEmpty()) {
            rowNum = addDemographicSection(sheet, rowNum, "Reservations by Age Group",
                    statistics.getReservationsByAgeGroup(), headerStyle);
        }
    }

    private void createAccommodationsSheet(Workbook workbook, HotelStatisticsDTO statistics,
                                           CellStyle headerStyle, CellStyle titleStyle,
                                           CellStyle currencyStyle) {
        Sheet sheet = workbook.createSheet("Top Accommodations");
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 4000);
        sheet.setColumnWidth(2, 4000);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Top Accommodations");
        titleCell.setCellStyle(titleStyle);
        rowNum++;

        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        Cell nameHeader = headerRow.createCell(0);
        nameHeader.setCellValue("Category Name");
        nameHeader.setCellStyle(headerStyle);

        Cell countHeader = headerRow.createCell(1);
        countHeader.setCellValue("Reservation Count");
        countHeader.setCellStyle(headerStyle);

        Cell revenueHeader = headerRow.createCell(2);
        revenueHeader.setCellValue("Total Revenue");
        revenueHeader.setCellStyle(headerStyle);

        // Data
        if (statistics.getTopAccommodations() != null) {
            for (HotelStatisticsDTO.AccommodationStats acc : statistics.getTopAccommodations()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(acc.getCategoryName());
                row.createCell(1).setCellValue(acc.getReservationCount());

                Cell revenueCell = row.createCell(2);
                revenueCell.setCellValue(acc.getTotalRevenue().doubleValue());
                revenueCell.setCellStyle(currencyStyle);
            }
        }
    }

    private void createAmenitiesSheet(Workbook workbook, HotelStatisticsDTO statistics,
                                      CellStyle headerStyle, CellStyle titleStyle,
                                      CellStyle currencyStyle) {
        Sheet sheet = workbook.createSheet("Popular Amenities");
        sheet.setColumnWidth(0, 6000);
        sheet.setColumnWidth(1, 4000);
        sheet.setColumnWidth(2, 4000);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Popular Amenities");
        titleCell.setCellStyle(titleStyle);
        rowNum++;

        // Headers
        Row headerRow = sheet.createRow(rowNum++);
        Cell nameHeader = headerRow.createCell(0);
        nameHeader.setCellValue("Amenity Name");
        nameHeader.setCellStyle(headerStyle);

        Cell countHeader = headerRow.createCell(1);
        countHeader.setCellValue("Usage Count");
        countHeader.setCellStyle(headerStyle);

        Cell revenueHeader = headerRow.createCell(2);
        revenueHeader.setCellValue("Total Revenue");
        revenueHeader.setCellStyle(headerStyle);

        // Data
        if (statistics.getPopularAmenities() != null) {
            for (HotelStatisticsDTO.AmenityStats amenity : statistics.getPopularAmenities()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(amenity.getAmenityName());
                row.createCell(1).setCellValue(amenity.getUsageCount());

                Cell revenueCell = row.createCell(2);
                revenueCell.setCellValue(amenity.getTotalRevenue().doubleValue());
                revenueCell.setCellStyle(currencyStyle);
            }
        }
    }

    private int addDemographicSection(Sheet sheet, int startRow, String sectionTitle,
                                      Map<String, Integer> data, CellStyle headerStyle) {
        // Section title
        Row sectionRow = sheet.createRow(startRow++);
        sectionRow.createCell(0).setCellValue(sectionTitle);

        // Headers
        Row headerRow = sheet.createRow(startRow++);
        Cell categoryHeader = headerRow.createCell(0);
        categoryHeader.setCellValue("Category");
        categoryHeader.setCellStyle(headerStyle);

        Cell countHeader = headerRow.createCell(1);
        countHeader.setCellValue("Count");
        countHeader.setCellStyle(headerStyle);

        // Data
        for (Map.Entry<String, Integer> entry : data.entrySet()) {
            Row row = sheet.createRow(startRow++);
            row.createCell(0).setCellValue(entry.getKey());
            row.createCell(1).setCellValue(entry.getValue());
        }

        return startRow;
    }

    private void addDataRow(Sheet sheet, int rowNum, String label, int value, CellStyle numberStyle) {
        Row row = sheet.createRow(rowNum);
        row.createCell(0).setCellValue(label);
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(numberStyle);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        style.setFont(font);
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        return style;
    }
}