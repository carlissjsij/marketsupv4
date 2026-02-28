export const metadata = {
  title: "MarketSUP.AI — BI para Supermercados",
  description: "Plataforma SaaS de Business Intelligence para Supermercados",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: "#0C0C10" }}>{children}</body>
    </html>
  );
}
