// POST /api/sync
// Full data sync — calls all critical endpoints and returns transformed dashboard data
// Body: { baseUrl, token }

const ENDPOINTS = {
  // Core data
  produtos: "/produtos",
  estoque: "/produtos/estoque",
  precos: "/produtos/precos",
  grupos: "/produtos/grupos",
  subgrupos: "/produtos/subgrupos",
  marcas: "/produtos/marcas",
  
  // Sales
  vendas: "/vendas",
  vendasHoje: "/vendas/hoje",
  
  // Purchases
  entradas: "/entradas",
  entradasProdutos: "/entradas/produtos",
  
  // Financial
  contasReceber: "/contas/receber",
  contasPagar: "/contas/pagar",
  despesas: "/despesas",
  
  // Suppliers
  fornecedores: "/fornecedores",
  
  // Misc
  clientes: "/clientes",
  usuarios: "/usuarios",
  condicoesPagamento: "/condicoespagamento",
};

async function fetchEndpoint(baseUrl, token, endpoint) {
  try {
    const url = `${baseUrl}${endpoint}`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn(`[SYNC] WARN ${endpoint}: ${res.status}`);
      return { endpoint, success: false, status: res.status, data: [] };
    }

    const data = await res.json();
    const items = Array.isArray(data) ? data : data.data || data.items || data.result || [data];
    console.log(`[SYNC] OK ${endpoint}: ${items.length} items`);
    return { endpoint, success: true, data: items, count: items.length };
  } catch (err) {
    console.warn(`[SYNC] ERR ${endpoint}: ${err.message}`);
    return { endpoint, success: false, error: err.message, data: [] };
  }
}

export async function POST(request) {
  try {
    const { baseUrl, token } = await request.json();

    if (!baseUrl || !token) {
      return Response.json({ error: "baseUrl e token são obrigatórios" }, { status: 400 });
    }

    const cleanBase = baseUrl.replace(/\/+$/, "");
    console.log(`[SYNC] Starting full sync from ${cleanBase}`);

    // Fetch all endpoints in parallel
    const results = {};
    const entries = Object.entries(ENDPOINTS);
    
    // Batch in groups of 5 to avoid overwhelming the API
    for (let i = 0; i < entries.length; i += 5) {
      const batch = entries.slice(i, i + 5);
      const batchResults = await Promise.all(
        batch.map(([key, ep]) => fetchEndpoint(cleanBase, token, ep))
      );
      batch.forEach(([key], idx) => {
        results[key] = batchResults[idx];
      });
    }

    // Build sync report
    const report = {};
    for (const [key, result] of Object.entries(results)) {
      report[key] = {
        success: result.success,
        count: result.data?.length || 0,
        endpoint: ENDPOINTS[key],
      };
    }

    const successCount = Object.values(report).filter((r) => r.success).length;
    const totalCount = Object.keys(report).length;

    console.log(`[SYNC] Complete: ${successCount}/${totalCount} endpoints OK`);

    return Response.json({
      success: true,
      syncedAt: new Date().toISOString(),
      report,
      stats: { total: totalCount, success: successCount, failed: totalCount - successCount },
      data: {
        produtos: results.produtos?.data || [],
        estoque: results.estoque?.data || [],
        precos: results.precos?.data || [],
        grupos: results.grupos?.data || [],
        subgrupos: results.subgrupos?.data || [],
        marcas: results.marcas?.data || [],
        vendas: results.vendas?.data || [],
        vendasHoje: results.vendasHoje?.data || [],
        entradas: results.entradas?.data || [],
        entradasProdutos: results.entradasProdutos?.data || [],
        contasReceber: results.contasReceber?.data || [],
        contasPagar: results.contasPagar?.data || [],
        despesas: results.despesas?.data || [],
        fornecedores: results.fornecedores?.data || [],
        clientes: results.clientes?.data || [],
        usuarios: results.usuarios?.data || [],
        condicoesPagamento: results.condicoesPagamento?.data || [],
      },
    });
  } catch (err) {
    console.error("[SYNC] Fatal error:", err.message);
    return Response.json({ error: "Erro na sincronização", detail: err.message }, { status: 500 });
  }
}
