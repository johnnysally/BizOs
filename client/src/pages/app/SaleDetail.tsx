export function SaleDetail() {
  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Sale</p>
          <h3>Invoice detail</h3>
        </div>
      </div>
      <div className="invoice-layout">
        <div className="invoice-panel">
          <div className="customer-line"><span>Invoice</span><strong>INV-00482</strong></div>
          <div className="customer-line"><span>Customer</span><strong>James Ndungu</strong></div>
          <table>
            <thead><tr><th>Item</th><th>Qty</th><th>Total</th></tr></thead>
            <tbody>
              <tr><td>2.5mm Twin Cable</td><td>1</td><td>KES 8,500</td></tr>
              <tr><td>20A MCB</td><td>2</td><td>KES 1,300</td></tr>
            </tbody>
          </table>
        </div>
        <div className="timeline-panel">
          <h4>Timeline</h4>
          <div className="timeline-list">
            <div><span>Created</span><strong>09:42</strong></div>
            <div><span>Approved</span><strong>09:44</strong></div>
            <div><span>Paid</span><strong>M-Pesa</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
