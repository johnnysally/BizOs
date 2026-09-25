export function ProductForm() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Catalog</p>
          <h3>Add product</h3>
        </div>
      </div>

      <div className="form-layout">
        <div className="form-card">
          <div className="field-grid two-col">
            <label className="field"><span>Product name</span><input defaultValue="LED Bulb 18W" /></label>
            <label className="field"><span>SKU</span><input defaultValue="LGT-18W" /></label>
            <label className="field"><span>Category</span><select><option>Lighting</option></select></label>
            <label className="field"><span>Unit</span><select><option>Piece</option></select></label>
            <label className="field"><span>Cost price</span><input defaultValue="KES 280" /></label>
            <label className="field"><span>Selling price</span><input defaultValue="KES 420" /></label>
            <label className="field"><span>Stock</span><input defaultValue="42" /></label>
            <label className="field"><span>Reorder level</span><input defaultValue="16" /></label>
          </div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="secondary-button" type="button">Cancel</button>
        <button className="primary-button" type="button">Save</button>
      </div>
    </div>
  );
}
