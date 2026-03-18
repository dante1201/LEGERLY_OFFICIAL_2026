const API = "http://localhost:5000";

// ====================== EXPENSES ======================
export async function getExpenses() {
  const res = await fetch(`${API}/expenses`);
  return res.json();
}

export async function createExpense(body) {
  const res = await fetch(`${API}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteExpense(id) {
  return fetch(`${API}/expenses/${id}`, {
    method: "DELETE"
  });
}


export async function getEmployees() {
  const res = await fetch(`${API}/employees`);
  return res.json();
}

export async function createEmployee(body) {
  const res = await fetch(`${API}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function updateEmployee(id, body) {
  const res = await fetch(`${API}/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function deleteEmployee(id) {
  return fetch(`${API}/employees/${id}`, { method: "DELETE" });
}

export async function login(email, password) {
  const res = await fetch(`${API}/employees/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function updateExpenseStatus(id, status) {
  const res = await fetch(`${API}/expenses/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return res.json();
}
