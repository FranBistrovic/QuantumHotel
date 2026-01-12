"use client";

import { useState, useEffect } from "react";
import { LocationPicker } from "../../../components/LocationPicker";

export default function AdminLocationForm() {
  const [lat, setLat] = useState(45.801278);
  const [lng, setLng] = useState(15.969584);

  useEffect(() => {
    fetch("/api/location")
      .then(res => res.json())
      .then(data => {
        setLat(data.latitude);
        setLng(data.longitude);
      });
  }, []);

  const handleSave = async () => {
    await fetch("/api/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: lat, longitude: lng }),
    });
    alert("Lokacija je spremljena!");
  };

  return (
    <div>
      <h3 className="text-xl font-semibold">Odaberite lokaciju hotela</h3>
      <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => {
        setLat(newLat);
        setLng(newLng);
      }} />
      <button onClick={handleSave} className="mt-2 bg-red-600 text-white px-4 py-2 rounded">
        Spremi lokaciju
      </button>
    </div>
  );
}
