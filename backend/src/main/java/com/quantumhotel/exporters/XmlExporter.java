package com.quantumhotel.exporters;

import com.quantumhotel.controllers.dto.HotelStatisticsDTO;
import org.springframework.stereotype.Component;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.ByteArrayOutputStream;
import java.util.Map;

@Component
public class XmlExporter {

    public byte[] export(HotelStatisticsDTO statistics) throws Exception {
        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
        Document doc = docBuilder.newDocument();

        // Root element
        Element rootElement = doc.createElement("HotelStatistics");
        doc.appendChild(rootElement);

        // Period
        Element period = doc.createElement("Period");
        rootElement.appendChild(period);

        Element startDate = doc.createElement("StartDate");
        startDate.setTextContent(statistics.getStartDate().toString());
        period.appendChild(startDate);

        Element endDate = doc.createElement("EndDate");
        endDate.setTextContent(statistics.getEndDate().toString());
        period.appendChild(endDate);

        // Summary
        Element summary = doc.createElement("Summary");
        rootElement.appendChild(summary);

        addElement(doc, summary, "TotalReservations", String.valueOf(statistics.getTotalReservations()));
        addElement(doc, summary, "CompletedReservations", String.valueOf(statistics.getCompletedReservations()));
        addElement(doc, summary, "CancelledReservations", String.valueOf(statistics.getCancelledReservations()));
        addElement(doc, summary, "TotalRevenue", statistics.getTotalRevenue().toString());
        addElement(doc, summary, "AverageStayDuration", statistics.getAverageStayDuration().toString());

        // Demographics
        Element demographics = doc.createElement("Demographics");
        rootElement.appendChild(demographics);

        // By City
        Element byCity = doc.createElement("ByCity");
        demographics.appendChild(byCity);
        addMapElements(doc, byCity, statistics.getReservationsByCity(), "City");

        // By Gender
        Element byGender = doc.createElement("ByGender");
        demographics.appendChild(byGender);
        addMapElements(doc, byGender, statistics.getReservationsByGender(), "Gender");

        // By Age Group
        Element byAge = doc.createElement("ByAgeGroup");
        demographics.appendChild(byAge);
        addMapElements(doc, byAge, statistics.getReservationsByAgeGroup(), "AgeGroup");

        // Top Accommodations
        Element accommodations = doc.createElement("TopAccommodations");
        rootElement.appendChild(accommodations);

        if (statistics.getTopAccommodations() != null) {
            for (HotelStatisticsDTO.AccommodationStats acc : statistics.getTopAccommodations()) {
                Element accommodation = doc.createElement("Accommodation");
                addElement(doc, accommodation, "CategoryName", acc.getCategoryName());
                addElement(doc, accommodation, "ReservationCount", String.valueOf(acc.getReservationCount()));
                addElement(doc, accommodation, "TotalRevenue", acc.getTotalRevenue().toString());
                accommodations.appendChild(accommodation);
            }
        }

        // Popular Amenities
        Element amenities = doc.createElement("PopularAmenities");
        rootElement.appendChild(amenities);

        if (statistics.getPopularAmenities() != null) {
            for (HotelStatisticsDTO.AmenityStats amenity : statistics.getPopularAmenities()) {
                Element amenityElement = doc.createElement("Amenity");
                addElement(doc, amenityElement, "AmenityName", amenity.getAmenityName());
                addElement(doc, amenityElement, "UsageCount", String.valueOf(amenity.getUsageCount()));
                addElement(doc, amenityElement, "TotalRevenue", amenity.getTotalRevenue().toString());
                amenities.appendChild(amenityElement);
            }
        }

        // Write to byte array
        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");
        transformer.setOutputProperty("{http://xml.apache.org/xslt}indent-amount", "2");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        DOMSource source = new DOMSource(doc);
        StreamResult result = new StreamResult(outputStream);
        transformer.transform(source, result);

        return outputStream.toByteArray();
    }

    private void addElement(Document doc, Element parent, String name, String value) {
        Element element = doc.createElement(name);
        element.setTextContent(value != null ? value : "");
        parent.appendChild(element);
    }

    private void addMapElements(Document doc, Element parent, Map<String, Integer> map, String elementName) {
        if (map != null) {
            for (Map.Entry<String, Integer> entry : map.entrySet()) {
                Element element = doc.createElement(elementName);
                element.setAttribute("name", entry.getKey());
                element.setAttribute("count", String.valueOf(entry.getValue()));
                parent.appendChild(element);
            }
        }
    }
}