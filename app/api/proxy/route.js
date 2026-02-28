// POST /api/proxy
// Generic proxy to SG Sistemas API
// Body: { baseUrl, token, endpoint, method?, body?, params? }
// Returns the raw API response

export async function POST(request) {
  try {
    const { baseUrl, token, endpoint, method = "GET", body, params } = await request.json();

    if (!baseUrl || !token || !endpoint) {
      return Response.json({ error: "baseUrl, token e endpoint são obrigatórios" }, { status: 400 });
    }

    const cleanBase = baseUrl.replace(/\/+$/, "");
    let url = `${cleanBase}${endpoint}`;

    // Add query params if provided
    if (params && Object.keys(params).length > 0) {
      const qs = new URLSearchParams(params).toString();
      url += `?${qs}`;
    }

    console.log(`[PROXY] ${method} ${url}`);

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    const fetchOpts = { method, headers };
    if (body && method !== "GET") {
      fetchOpts.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOpts);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`[PROXY] Error ${res.status}: ${errorText.substring(0, 200)}`);
      return Response.json(
        { error: `API retornou ${res.status}`, detail: errorText.substring(0, 500), endpoint },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(`[PROXY] OK ${endpoint} — ${Array.isArray(data) ? data.length + " items" : "object"}`);

    return Response.json({ success: true, data, endpoint });
  } catch (err) {
    console.error("[PROXY] Error:", err.message);
    return Response.json(
      { error: "Erro ao conectar com a API", detail: err.message },
      { status: 500 }
    );
  }
}
