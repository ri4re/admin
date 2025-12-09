// 📌 匯率自動抓取
async function fetchRate() {
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=JPY&symbols=TWD");
    const data = await res.json();

    const rate = data.rates.TWD;
    document.getElementById("rateValue").innerText = rate.toFixed(3);

    const now = new Date();
    document.getElementById("rateTime").innerText =
      now.toLocaleTimeString("zh-TW", { hour: "2-digit", minute: "2-digit" });
  } catch (err) {
    console.log("匯率取得失敗", err);
  }
}

fetchRate();
setInterval(fetchRate, 3600000);

// 📌 假資料（你之後會接 Notion）
let orders = [];

// 📌 生成流水號 AYU-YYYYMM-XX
function generateOrderId() {
  const now = new Date();
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  const existing = orders.filter(o => o.orderId.startsWith(`AYU-${ym}-`));
  const next = String(existing.length + 1).padStart(2, "0");

  return `AYU-${ym}-${next}`;
}

// 📌 打開 / 關閉新增訂單
const modal = document.getElementById("orderModal");
document.getElementById("addOrderBtn").onclick = () => {
  modal.classList.remove("hidden");

  // 訂單建立日期自動填入今天
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("orderDate").value = today;
};
document.getElementById("closeModal").onclick = () => modal.classList.add("hidden");

// 成本（日幣→台幣）
document.getElementById("costJpy").addEventListener("input", () => {
  document.getElementById("costTwd").value =
    Math.round(document.getElementById("costJpy").value * 0.21);
});

// 📌 儲存訂單
document.getElementById("saveOrder").onclick = () => {
  const price = Number(priceTwd.value);
  const cost = Number(costTwd.value);
  const paidAmt = Number(paid.value);

  const order = {
    orderId: generateOrderId(),
    date: orderDate.value,
    customerName: customerName.value,
    lineName: lineName.value,
    productName: productName.value,
    style: style.value,
    qty: quantity.value,
    price,
    profit: price - cost,
    paid: paidAmt,
    statusShip: "備貨中",
    statusPay: paidAmt >= price ? "已付清" : "待付款"
  };

  orders.push(order);
  modal.classList.add("hidden");
  renderOrders();
};

// 📌 渲染訂單列表
function renderOrders() {
  const list = document.getElementById("orderList");
  list.innerHTML = "";

  orders.forEach(o => {
    const div = document.createElement("div");
    div.className = "order-card";

    div.innerHTML = `
      <div>
        <div class="order-title">${o.orderId}</div>
        <div>${o.date}</div>
      </div>

      <div>
        <div>${o.customerName}</div>
        <div class="customer-line">● ${o.lineName}</div>
      </div>

      <div>
        <div>${o.productName}</div>
        <div class="product-style">${o.style}</div>
        <div>x${o.qty}</div>
      </div>

      <div>
        NT$ ${o.price}<br>
        <span style="color:green;">利潤：${o.profit}</span>
      </div>

      <div>
        <span class="status-pill status-ready">${o.statusShip}</span><br>
        <span class="status-pill ${o.statusPay === "已付清" ? "status-paid" : "status-unpaid"}">${o.statusPay}</span>
      </div>
    `;

    list.appendChild(div);
  });

  document.getElementById("totalOrders").innerText = orders.length;
  document.getElementById("pendingOrders").innerText = orders.filter(o => o.statusPay !== "已付清").length;
  document.getElementById("totalProfit").innerText =
    "NT$ " + orders.reduce((a, b) => a + b.profit, 0);
}

renderOrders();
