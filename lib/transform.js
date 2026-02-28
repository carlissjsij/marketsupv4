// lib/transform.js
// Transforms raw SG Sistemas API data into MarketSUP dashboard format

// Field name resolver — SG Sistemas uses varying field names
const get = (obj, ...keys) => {
  for (const k of keys) {
    const val = obj?.[k] ?? obj?.[k.toLowerCase()] ?? obj?.[k.toUpperCase()];
    if (val !== undefined && val !== null) return val;
  }
  return null;
};

const num = (v) => {
  if (v === null || v === undefined || v === "") return 0;
  const n = typeof v === "string" ? parseFloat(v.replace(",", ".")) : Number(v);
  return isNaN(n) ? 0 : n;
};

const str = (v) => (v == null ? "" : String(v).trim());

// Transform raw products into dashboard format
export function transformProdutos(raw = [], estoque = [], precos = [], grupos = [], subgrupos = [], marcas = []) {
  // Build lookup maps
  const estoqueMap = {};
  estoque.forEach((e) => {
    const id = get(e, "idProduto", "id_produto", "produtoId", "IdProduto", "codigo");
    if (id) estoqueMap[id] = num(get(e, "quantidade", "qtd", "saldo", "estoque", "Quantidade"));
  });

  const precoMap = {};
  precos.forEach((p) => {
    const id = get(p, "idProduto", "id_produto", "produtoId", "IdProduto", "codigo");
    if (id) precoMap[id] = num(get(p, "preco", "precoVenda", "valor", "Preco", "PrecoVenda"));
  });

  const grupoMap = {};
  grupos.forEach((g) => {
    const id = get(g, "id", "idGrupo", "codigo", "Id");
    if (id) grupoMap[id] = str(get(g, "descricao", "nome", "Descricao", "Nome"));
  });

  const subgrupoMap = {};
  subgrupos.forEach((s) => {
    const id = get(s, "id", "idSubgrupo", "codigo", "Id");
    if (id) subgrupoMap[id] = str(get(s, "descricao", "nome", "Descricao", "Nome"));
  });

  const marcaMap = {};
  marcas.forEach((m) => {
    const id = get(m, "id", "idMarca", "codigo", "Id");
    if (id) marcaMap[id] = str(get(m, "descricao", "nome", "Descricao", "Nome"));
  });

  return raw.map((p) => {
    const id = get(p, "id", "idProduto", "codigo", "Id", "Codigo");
    const custo = num(get(p, "custoMedio", "custo", "precoCusto", "CustoMedio", "PrecoCusto", "valorCusto"));
    const preco = precoMap[id] || num(get(p, "precoVenda", "preco", "PrecoVenda", "Preco", "valorVenda"));
    const est = estoqueMap[id] ?? num(get(p, "estoque", "saldoEstoque", "quantidade"));
    const grupoId = get(p, "idGrupo", "grupo", "grupoId", "IdGrupo");
    const subgrupoId = get(p, "idSubgrupo", "subgrupo", "subgrupoId", "IdSubgrupo");
    const marcaId = get(p, "idMarca", "marca", "marcaId", "IdMarca");
    const mg = preco > 0 ? ((preco - custo) / preco) * 100 : 0;

    return {
      id,
      nome: str(get(p, "descricao", "nome", "Descricao", "Nome", "produto")),
      grupo: grupoMap[grupoId] || str(grupoId) || "Sem Grupo",
      sub: subgrupoMap[subgrupoId] || str(subgrupoId) || "",
      marca: marcaMap[marcaId] || str(marcaId) || "",
      curva: str(get(p, "curva", "curvaAbc", "CurvaABC")) || "C",
      custo,
      preco,
      mg: Math.round(mg * 100) / 100,
      est,
      forn: str(get(p, "fornecedor", "nomeFornecedor", "Fornecedor")) || "",
      ativo: get(p, "ativo", "Ativo", "status") !== false && get(p, "ativo", "Ativo", "status") !== "I",
      // These will be enriched with sales data
      vd: 0,
      qtd: 0,
      lucro: 0,
      meta_mg: 25, // default
    };
  }).filter((p) => p.nome && p.id);
}

// Transform fornecedores
export function transformFornecedores(raw = [], condicoes = []) {
  const condMap = {};
  condicoes.forEach((c) => {
    const id = get(c, "id", "codigo", "Id");
    if (id) condMap[id] = str(get(c, "descricao", "nome", "Descricao"));
  });

  return raw.map((f) => ({
    n: str(get(f, "razaoSocial", "nome", "nomeFantasia", "RazaoSocial", "Nome", "NomeFantasia", "descricao")),
    id: get(f, "id", "idFornecedor", "codigo", "Id", "Codigo"),
    cnpj: str(get(f, "cnpj", "cpfCnpj", "CNPJ")),
    cp: 0, // Will be enriched from entradas
    pr: 0,
    lt: num(get(f, "prazoEntrega", "leadTime", "PrazoEntrega")) || 3,
    cd: condMap[get(f, "idCondicaoPagamento", "condicaoPagamento")] || str(get(f, "condicaoPagamento", "CondicaoPagamento")) || "—",
    uc: "",
    fone: str(get(f, "telefone", "fone", "Telefone")),
    email: str(get(f, "email", "Email")),
  })).filter((f) => f.n);
}

// Transform vendas — aggregate sales data
export function transformVendas(vendas = []) {
  let totalVenda = 0;
  let totalQtd = 0;
  let cupons = 0;
  const porProduto = {};
  const porDia = {};

  vendas.forEach((v) => {
    const valor = num(get(v, "valorTotal", "total", "valor", "ValorTotal"));
    const qtd = num(get(v, "quantidade", "qtd", "Quantidade")) || 1;
    totalVenda += valor;
    totalQtd += qtd;
    cupons++;

    // By product
    const prodId = get(v, "idProduto", "produtoId", "IdProduto", "codigoProduto");
    if (prodId) {
      if (!porProduto[prodId]) porProduto[prodId] = { vd: 0, qtd: 0 };
      porProduto[prodId].vd += valor;
      porProduto[prodId].qtd += qtd;
    }

    // By day
    const data = str(get(v, "data", "dataVenda", "Data", "DataVenda"));
    const dia = data.substring(0, 10);
    if (dia) {
      if (!porDia[dia]) porDia[dia] = { v: 0, m: 0 };
      porDia[dia].v += valor;
    }
  });

  return { totalVenda, totalQtd, cupons, porProduto, porDia };
}

// Transform entradas (purchases)
export function transformEntradas(entradas = [], entradasProdutos = []) {
  let totalCompra = 0;
  const porFornecedor = {};

  entradas.forEach((e) => {
    const valor = num(get(e, "valorTotal", "total", "valor", "ValorTotal"));
    totalCompra += valor;

    const fornId = get(e, "idFornecedor", "fornecedorId", "IdFornecedor");
    if (fornId) {
      if (!porFornecedor[fornId]) porFornecedor[fornId] = { cp: 0, count: 0, lastDate: "" };
      porFornecedor[fornId].cp += valor;
      porFornecedor[fornId].count++;
      const dt = str(get(e, "dataEntrada", "data", "Data", "DataEntrada"));
      if (dt > porFornecedor[fornId].lastDate) porFornecedor[fornId].lastDate = dt;
    }
  });

  return { totalCompra, porFornecedor };
}

// Transform financeiro
export function transformFinanceiro(receber = [], pagar = [], despesas = []) {
  const totalReceber = receber.reduce((a, r) => a + num(get(r, "valor", "valorOriginal", "Valor")), 0);
  const totalPagar = pagar.reduce((a, p) => a + num(get(p, "valor", "valorOriginal", "Valor")), 0);
  const totalDespesas = despesas.reduce((a, d) => a + num(get(d, "valor", "Valor")), 0);

  return { totalReceber, totalPagar, totalDespesas, saldo: totalReceber - totalPagar };
}

// Build complete dashboard data from all transformed sources
export function buildDashboard(rawData) {
  const produtos = transformProdutos(
    rawData.produtos,
    rawData.estoque,
    rawData.precos,
    rawData.grupos,
    rawData.subgrupos,
    rawData.marcas
  );

  const fornecedores = transformFornecedores(rawData.fornecedores, rawData.condicoesPagamento);
  const vendasData = transformVendas(rawData.vendas);
  const entradasData = transformEntradas(rawData.entradas, rawData.entradasProdutos);
  const finData = transformFinanceiro(rawData.contasReceber, rawData.contasPagar, rawData.despesas);

  // Enrich products with sales data
  produtos.forEach((p) => {
    const vd = vendasData.porProduto[p.id];
    if (vd) {
      p.vd = vd.vd;
      p.qtd = vd.qtd;
      p.lucro = Math.round((p.mg / 100) * vd.vd);
    }
  });

  // Enrich fornecedores with purchase data
  fornecedores.forEach((f) => {
    const ed = entradasData.porFornecedor[f.id];
    if (ed) {
      f.cp = ed.cp;
      f.uc = ed.lastDate;
    }
    f.pr = produtos.filter((p) => p.forn === f.n || p.fornId === f.id).length;
  });

  // Build setores from product groups
  const grupoMap = {};
  produtos.forEach((p) => {
    if (!grupoMap[p.grupo]) grupoMap[p.grupo] = { n: p.grupo, vd: 0, cp: 0, sk: 0, mgSum: 0, mgCount: 0 };
    grupoMap[p.grupo].vd += p.vd;
    grupoMap[p.grupo].sk++;
    if (p.mg) { grupoMap[p.grupo].mgSum += p.mg; grupoMap[p.grupo].mgCount++; }
  });
  
  const totalVdSetores = Object.values(grupoMap).reduce((a, s) => a + s.vd, 0);
  const setores = Object.values(grupoMap).map((s) => ({
    n: s.n,
    vd: s.vd,
    cp: Math.round(s.vd * 0.72), // estimate if no direct data
    mg: s.mgCount > 0 ? Math.round((s.mgSum / s.mgCount) * 100) / 100 : 0,
    pt: totalVdSetores > 0 ? Math.round((s.vd / totalVdSetores) * 1000) / 10 : 0,
    rcv: s.vd > 0 ? Math.round((s.vd * 0.72 / s.vd) * 1000) / 10 : 0,
    mv: Math.round(s.vd * 1.05), // 5% growth target
    mm: 25,
    sk: s.sk,
  })).sort((a, b) => b.vd - a.vd);

  // Build daily sales for chart
  const vendasDiarias = Object.entries(vendasData.porDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([d, v]) => ({
      d: new Date(d).toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", ""),
      v: v.v,
      m: v.v * 1.05,
    }));

  return {
    produtos: produtos.sort((a, b) => b.vd - a.vd),
    setores,
    fornecedores: fornecedores.sort((a, b) => b.cp - a.cp),
    vendasDiarias: vendasDiarias.length > 0 ? vendasDiarias : null,
    kpis: {
      receitaBruta: vendasData.totalVenda,
      totalCompra: entradasData.totalCompra,
      rcv: vendasData.totalVenda > 0 ? Math.round((entradasData.totalCompra / vendasData.totalVenda) * 10000) / 100 : 0,
      totalQtd: vendasData.totalQtd,
      cupons: vendasData.cupons,
      ticketMedio: vendasData.cupons > 0 ? Math.round((vendasData.totalVenda / vendasData.cupons) * 100) / 100 : 0,
      contasReceber: finData.totalReceber,
      contasPagar: finData.totalPagar,
      saldo: finData.saldo,
      despesas: finData.totalDespesas,
      totalProdutos: produtos.length,
      totalFornecedores: fornecedores.length,
      totalClientes: rawData.clientes?.length || 0,
      totalUsuarios: rawData.usuarios?.length || 0,
    },
    syncedAt: new Date().toISOString(),
    rawCounts: {
      produtos: rawData.produtos?.length || 0,
      estoque: rawData.estoque?.length || 0,
      precos: rawData.precos?.length || 0,
      vendas: rawData.vendas?.length || 0,
      entradas: rawData.entradas?.length || 0,
      fornecedores: rawData.fornecedores?.length || 0,
    },
  };
}
