// 開啟 / 關閉 Modal
const addOrderBtn = document.getElementById("addOrderBtn");
const orderModal = document.getElementById("orderModal");
const closeModal = document.getElementById("closeModal");
const saveOrder = document.getElementById("saveOrder");

addOrderBtn.onclick = () => orderModal.classList.remove("hidden");
closeModal.onclick = () => orderModal.classList.add("hidden");

// 成本換算（日幣 → 台幣）
const costJpy = document.getElementById("costJpy");
const costTwd = document.getElementById("costTwd");

costJpy.addEventListener("input", () => {
  costTwd.value = Math.round(costJpy.value * 0.21);
});

// 生成流水號 B: AYU-YYYYMM-XX
function generateOrderId(existing = []) {
  const d = new Date();
  const ym = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}`;

  const prefix = `AYU-${ym}-`;
  const sameMonth = existing.filter(id => id.startsWith(prefix));

  let max = 0;
  sameMonth.forEach(id => {
    const num = parseInt(id.split("-")[2]);
    if (num > max) max = num;
  });

  const next = String(max + 1).padStart(2, "0");
  return `${prefix}${next}`;
}

let orderData = []; // 暫存（之後改為 Notion資料）

// 儲存訂單
saveOrder.onclick = () => {
  const price = Number(document.getElementById("priceTwd").value);
  const cost = Number(costTwd.value);
  const paid = Number(document.getElementById("paid").value);

  const id = generateOrderId(orderData.map(o => o.orderId));

  const order = {
    orderId: id,
    lineName: lineName.value,
    customerName: customerName.value,
    productName: productName.value,
    style: style.value,
    quantity: quantity.value,
    priceTwd: price,
    costTwd: cost,
    profit: price - cost,
    paid,
    remain: price - paid,
  };

  orderData.push(order);
  renderOrders();
  orderModal.classList.add("hidden");
};

// 渲染訂單列表
function renderOrders() {
  const list = document.getElementById("orderList");
  list.innerHTML = "";

  orderData.forEach(o => {
    const card = document.createElement("div");
    card.className = "order-card";

    card.innerHTML = `
      <span><b>${o.orderId}</b></span>
      <span>${o.productName} x${o.quantity}</span>
      <span>售價：$${o.priceTwd}</span>
      <span>成本：$${o.costTwd}</span>
      <span>利潤：$${o.profit}</span>
      <span>已付：$${o.paid}</span>
      <span>剩餘：$${o.remain}</span>
    `;

    list.appendChild(card);
  });
}

renderOrders();
