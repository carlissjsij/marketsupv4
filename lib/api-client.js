// lib/api-client.js
// Frontend API client — all calls go through Vercel API Routes (proxy)

export async function authenticate(url, user, pass) {
  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, user, pass }),
  });
  return res.json();
}

export async function syncAll(baseUrl, token) {
  const res = await fetch("/api/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, token }),
  });
  return res.json();
}

export async function proxyCall(baseUrl, token, endpoint, params) {
  const res = await fetch("/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ baseUrl, token, endpoint, params }),
  });
  return res.json();
}
