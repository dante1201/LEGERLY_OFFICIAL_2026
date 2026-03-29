//const API = process.env.REACT_APP_API_URL;
const API = "https://legerly-official-2026.onrender.com";
//console.log("API URL:", API);
console.log("Using API:", API);

// ====================== EXPENSES ======================
export async function getExpenses() {
  try {
    const res = await fetch(`${API}/expenses`);
    const data = await res.json();
    if (!res.ok) return [];
    return data;
  } catch (err) {
    console.error("getExpenses error:", err);
    return [];
  }
}

export async function createExpense(body) {
  try {
    const res = await fetch(`${API}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || "Unable to create expense." };
    }

    return data;
  } catch (err) {
    console.error("createExpense error:", err);
    return { error: "Unable to create expense." };
  }
}

export async function deleteExpense(id) {
  try {
    const res = await fetch(`${API}/expenses/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.error("deleteExpense error:", err);
    return { error: "Unable to delete expense." };
  }
}

export async function getEmployees() {
  try {
    const res = await fetch(`${API}/employees`);
    const data = await res.json();
    if (!res.ok) return [];
    return data;
  } catch (err) {
    console.error("getEmployees error:", err);
    return [];
  }
}

export async function createEmployee(body) {
  try {
    const res = await fetch(`${API}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error("createEmployee error:", err);
    return { error: "Unable to create employee." };
  }
}

export async function updateEmployee(id, body) {
  try {
    const res = await fetch(`${API}/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err) {
    console.error("updateEmployee error:", err);
    return { error: "Unable to update employee." };
  }
}

export async function deleteEmployee(id) {
  try {
    const res = await fetch(`${API}/employees/${id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (err) {
    console.error("deleteEmployee error:", err);
    return { error: "Unable to delete employee." };
  }
}

export async function login(email, password) {
  try {
    const res = await fetch(`${API}/employees/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { error: data.error || data.message || "Login failed." };
    }

    return data;
  } catch (err) {
    console.error("login error:", err);
    return { error: "Unable to connect to server." };
  }
}

export async function updateExpenseStatus(id, status) {
  try {
    const res = await fetch(`${API}/expenses/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    return await res.json();
  } catch (err) {
    console.error("updateExpenseStatus error:", err);
    return { error: "Unable to update expense status." };
  }
}

export async function syncEmployee(user) {
  try {
    const res = await fetch(`${API}/employees/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        auth0_id: user.sub,
        email: user.email,
        full_name: user.name,
        role:
          user["https://ledgerly-app/role"] ||
          ((user["https://ledgerly-app/roles"] || []).includes("admin") ? "admin" : "user")
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("syncEmployee failed:", data);
      return { error: data.error || "Unable to sync employee." };
    }

    return data;
  } catch (err) {
    console.error("syncEmployee error:", err);
    return { error: "Unable to sync employee." };
  }
}