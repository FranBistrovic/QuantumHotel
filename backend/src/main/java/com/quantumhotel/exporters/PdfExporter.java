package com.quantumhotel.exporters;

import com.itextpdf.text.*;
import com.itextpdf.text.Font;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;
import com.quantumhotel.controllers.dto.HotelStatisticsDTO;
import org.springframework.stereotype.Component;


import java.awt.*;


import java.io.ByteArrayOutputStream;
import java.util.Map;

@Component
public class PdfExporter {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.DARK_GRAY);
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 14, Font.BOLD, BaseColor.BLACK);
    private static final Font NORMAL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.BLACK);
    private static final Font BOLD_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.BLACK);

    public byte[] export(HotelStatisticsDTO statistics) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, outputStream);

        document.open();

        // Title
        Paragraph title = new Paragraph("Hotel Statistics Report", TITLE_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Period
        Paragraph period = new Paragraph(
                String.format("Period: %s to %s",
                        statistics.getStartDate(),
                        statistics.getEndDate()),
                NORMAL_FONT
        );
        period.setAlignment(Element.ALIGN_CENTER);
        period.setSpacingAfter(20);
        document.add(period);

        // Summary Section
        addSectionHeader(document, "Summary");
        PdfPTable summaryTable = new PdfPTable(2);
        summaryTable.setWidthPercentage(100);
        summaryTable.setSpacingBefore(10);
        summaryTable.setSpacingAfter(15);

        addTableRow(summaryTable, "Total Reservations", String.valueOf(statistics.getTotalReservations()));
        addTableRow(summaryTable, "Completed Reservations", String.valueOf(statistics.getCompletedReservations()));
        addTableRow(summaryTable, "Cancelled Reservations", String.valueOf(statistics.getCancelledReservations()));
        addTableRow(summaryTable, "Total Revenue", "$" + statistics.getTotalRevenue().toString());
        addTableRow(summaryTable, "Average Stay Duration", statistics.getAverageStayDuration() + " days");

        document.add(summaryTable);

        // Demographics Section
        addSectionHeader(document, "Guest Demographics");

        // By City
        if (statistics.getReservationsByCity() != null && !statistics.getReservationsByCity().isEmpty()) {
            addSubHeader(document, "Reservations by City");
            PdfPTable cityTable = createDemographicTable(statistics.getReservationsByCity());
            document.add(cityTable);
        }

        // By Gender
        if (statistics.getReservationsByGender() != null && !statistics.getReservationsByGender().isEmpty()) {
            addSubHeader(document, "Reservations by Gender");
            PdfPTable genderTable = createDemographicTable(statistics.getReservationsByGender());
            document.add(genderTable);
        }

        // By Age Group
        if (statistics.getReservationsByAgeGroup() != null && !statistics.getReservationsByAgeGroup().isEmpty()) {
            addSubHeader(document, "Reservations by Age Group");
            PdfPTable ageTable = createDemographicTable(statistics.getReservationsByAgeGroup());
            document.add(ageTable);
        }

        // Top Accommodations
        if (statistics.getTopAccommodations() != null && !statistics.getTopAccommodations().isEmpty()) {
            addSectionHeader(document, "Top Accommodations");

            PdfPTable accomTable = new PdfPTable(3);
            accomTable.setWidthPercentage(100);
            accomTable.setSpacingBefore(10);
            accomTable.setSpacingAfter(15);

            addHeaderCell(accomTable, "Category Name");
            addHeaderCell(accomTable, "Reservations");
            addHeaderCell(accomTable, "Total Revenue");

            for (HotelStatisticsDTO.AccommodationStats acc : statistics.getTopAccommodations()) {
                accomTable.addCell(new PdfPCell(new Phrase(acc.getCategoryName(), NORMAL_FONT)));
                accomTable.addCell(new PdfPCell(new Phrase(String.valueOf(acc.getReservationCount()), NORMAL_FONT)));
                accomTable.addCell(new PdfPCell(new Phrase("$" + acc.getTotalRevenue().toString(), NORMAL_FONT)));
            }

            document.add(accomTable);
        }

        // Popular Amenities
        if (statistics.getPopularAmenities() != null && !statistics.getPopularAmenities().isEmpty()) {
            addSectionHeader(document, "Popular Amenities");

            PdfPTable amenityTable = new PdfPTable(3);
            amenityTable.setWidthPercentage(100);
            amenityTable.setSpacingBefore(10);
            amenityTable.setSpacingAfter(15);

            addHeaderCell(amenityTable, "Amenity Name");
            addHeaderCell(amenityTable, "Usage Count");
            addHeaderCell(amenityTable, "Total Revenue");

            for (HotelStatisticsDTO.AmenityStats amenity : statistics.getPopularAmenities()) {
                amenityTable.addCell(new PdfPCell(new Phrase(amenity.getAmenityName(), NORMAL_FONT)));
                amenityTable.addCell(new PdfPCell(new Phrase(String.valueOf(amenity.getUsageCount()), NORMAL_FONT)));
                amenityTable.addCell(new PdfPCell(new Phrase("$" + amenity.getTotalRevenue().toString(), NORMAL_FONT)));
            }

            document.add(amenityTable);
        }

        document.close();
        return outputStream.toByteArray();
    }

    private void addSectionHeader(Document document, String text) throws DocumentException {
        Paragraph header = new Paragraph(text, HEADER_FONT);
        header.setSpacingBefore(15);
        header.setSpacingAfter(5);
        document.add(header);
    }

    private void addSubHeader(Document document, String text) throws DocumentException {
        Paragraph subHeader = new Paragraph(text, BOLD_FONT);
        subHeader.setSpacingBefore(10);
        subHeader.setSpacingAfter(5);
        document.add(subHeader);
    }

    private void addTableRow(PdfPTable table, String label, String value) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, BOLD_FONT));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, NORMAL_FONT));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }

    private void addHeaderCell(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, BOLD_FONT));
        cell.setBackgroundColor(BaseColor.LIGHT_GRAY);
        cell.setPadding(5);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private PdfPTable createDemographicTable(Map<String, Integer> data) {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(70);
        table.setSpacingBefore(10);
        table.setSpacingAfter(15);

        addHeaderCell(table, "Category");
        addHeaderCell(table, "Count");

        for (Map.Entry<String, Integer> entry : data.entrySet()) {
            table.addCell(new PdfPCell(new Phrase(entry.getKey(), NORMAL_FONT)));
            table.addCell(new PdfPCell(new Phrase(String.valueOf(entry.getValue()), NORMAL_FONT)));
        }

        return table;
    }
}