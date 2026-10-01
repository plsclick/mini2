import { materials } from "../../mock/materials";
export function MaterialDeliveryTable() {
  return (
    <section className="card data-table">
      <div className="card-head">
        <div>
          <p className="eyebrow">MATERIAL DELIVERY</p>
          <h2>Supply watch</h2>
        </div>
        <button className="link">View all deliveries</button>
      </div>
      {materials.map((material) => (
        <div className="data-row material-row" key={material.id}>
          <div>
            <b>{material.name}</b>
            <small>
              {material.availableQuantity} available ·{" "}
              {material.requiredQuantity} required
            </small>
          </div>
          <span>
            Required <b>{material.requiredDate}</b>
            <small>Expected {material.expectedDelivery}</small>
          </span>
          <span className={material.status === "delayed" ? "red" : ""}>
            {material.status === "delayed" ? "DELAYED" : "ON TRACK"}
            <small>Impact {material.impact}</small>
          </span>
        </div>
      ))}
    </section>
  );
}
