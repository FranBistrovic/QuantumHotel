interface RoomCategory {
  id: number;
  name: string;
  unitsNumber: number;
  capacity: number;
  twinBeds: boolean;
  price: number;
  checkInTime: string;
  checkOutTime: string;
}

export function RoomCategoryDetails({
  category,
}: {
  category: RoomCategory;
}) {
  return (
    <div className="form-vertical-layout">
      <div className="form-group">
        <label>Kapacitet</label>
        <p>{category.capacity} osoba</p>
      </div>

      <div className="form-group">
        <label>Broj jedinica</label>
        <p>{category.unitsNumber}</p>
      </div>

      <div className="form-group">
        <label>Cijena noćenja</label>
        <p>{category.price} €</p>
      </div>

      <div className="form-group">
        <label>Tip kreveta</label>
        <p>{category.twinBeds ? "Odvojeni (Twin)" : "Bračni"}</p>
      </div>

      <div className="form-group">
        <label>Check-in / Check-out</label>
        <p>
          {category.checkInTime.substring(0, 5)} /{" "}
          {category.checkOutTime.substring(0, 5)}
        </p>
      </div>
    </div>
  );
}
