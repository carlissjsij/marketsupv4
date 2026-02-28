// POST /api/auth
// Authenticates with SG Sistemas API and returns JWT token
// Body: { url, user, pass }

export async function POST(request) {
  try {
    const { url, user, pass } = await request.json();

    if (!url || !user || !pass) {
      return Response.json({ error: "URL, usuário e senha são obrigatórios" }, { status: 400 });
    }

    // Clean URL — remove trailing slash
    const baseUrl = url.replace(/\/+$/, "");
    const authUrl = `${baseUrl}/autorizacao`;

    console.log(`[AUTH] Connecting to: ${authUrl}`);

    // Call SG Sistemas auth endpoint
    const res = await fetch(authUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario: user, senha: pass }),
      // Allow self-signed certs in dev
      ...(process.env.NODE_ENV === "development" ? {} : {}),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error(`[AUTH] Failed: ${res.status} ${errorText}`);
      return Response.json(
        { error: `Falha na autenticação: ${res.status}`, detail: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("[AUTH] Success — token received");

    // SG Sistemas usually returns token in data.token or data.access_token or directly
    const token = data.token || data.access_token || data.Token || data;

    return Response.json({
      success: true,
      token: typeof token === "string" ? token : JSON.stringify(token),
      raw: data,
    });
  } catch (err) {
    console.error("[AUTH] Error:", err.message);
    return Response.json(
      { error: "Erro de conexão com a API", detail: err.message },
      { status: 500 }
    );
  }
}
