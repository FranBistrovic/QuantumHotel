"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Bed, Clock, Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Loading from "./loading";
import { Column } from "../../components/DataTable";


interface RoomCategory {
  id: number;
  name: string;
  unitsNumber: number;
  capacity: number;
  twinBeds: boolean;
  price: number;
  checkInTime: string;
  checkOutTime: string;
  imagePath: string;
}


/* ---------- helper za error poruke ---------- */
const getErrorMessage = async (response: Response) => {
  if (response.status === 401) return "❌ Niste prijavljeni.";
  if (response.status === 403) return "⛔ Nemate ovlasti.";
  try {
    const data = await response.json();
    return data?.message || "⚠️ Greška.";
  } catch {
    return "⚠️ Greška pri učitavanju.";
  }
};

export default function RoomCategoriesPage() {
  const [categories, setCategories] = useState<RoomCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  /* ---------- GET /api/room-categories ---------- */
  const searchParams = useSearchParams();

  
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/room-categories?t=${Date.now()}`);

        if (!res.ok) {
          if (res.status === 401) {
            setMessage("Niste prijavljeni.");
          } else if (res.status === 403) {
            setMessage("Nemate ovlasti.");
          } else {
            setMessage("Greška pri učitavanju.");
          }
          return;
        }

        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setMessage("Greška pri učitavanju kategorija.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);


  const filteredData = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ---------- TABLICA ---------- */
  const columns: Column<RoomCategory>[] = [
    {
      key: "name",
      label: "Naziv kategorije",
      sortable: true,
      render: (_, row) => (
        <Link
          href={`/room-categories/${row.id}`}
          className="text-rose-500 font-medium hover:underline"
        >
          {row.name}
        </Link>
      ),
    },
    {
      key: "capacity",
      label: "Kapacitet",
      render: (v) => `${v} osobe`,
    },
    {
      key: "twinBeds",
      label: "Kreveti",
      render: (v) => (v ? "Odvojeni" : "Bračni"),
    },
    {
      key: "price",
      label: "Cijena",
      sortable: true,
      render: (v) => `${v} €`,
    },
    {
      key: "times",
      label: "In / Out",
      render: (_, row) =>
        `${row.checkInTime?.slice(0, 5)} / ${row.checkOutTime?.slice(0, 5)}`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Kategorije soba
          </h1>
          <p className="text-muted-foreground">
            Pregledajte dostupne tipove soba i njihove karakteristike
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži kategorije..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            {message}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <Loading />
        ) : filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Nema rezultata za pretragu."
                : "Nema dostupnih kategorija."}
            </p>
          </div>
        ) : (
          /* Room Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((category) => (
              <Link
                key={category.id}
                href={`/room-categories/${category.id}`}
                className="group"
              >
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 h-full">
                  {/* Room Image */}
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {category.imagePath ? (
                      <img
                        src={ `${process.env.NEXT_PUBLIC_API_URL}${category.imagePath}` || "/placeholder.svg"}
                        alt={category.name}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Bed className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                    {/* Price Badge */}
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-primary text-primary-foreground font-semibold px-3 py-1">
                        {category.price} € / noć
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>

                    {/* Details */}
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>Kapacitet: {category.capacity}{" "}{category.capacity === 1 ? "osoba" : "osobe"}</span>

                      </div>
                      <div className="flex items-center gap-2">
                        <Bed className="h-4 w-4" />
                        <span>
                          {category.twinBeds ? "Odvojeni kreveti" : "Bračni krevet"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          Check-in {category.checkInTime?.slice(0, 5)} / Check-out{" "}
                          {category.checkOutTime?.slice(0, 5)}
                        </span>
                      </div>
                    </div>

                    
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
