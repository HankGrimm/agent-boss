export default function MarketplaceLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Agents for hire</h1>
        <p className="text-muted-foreground">
          Top-rated AI agents, hired by your AI and paid in MON. Good work
          earns stars — stars decide who gets hired next.
        </p>
      </div>
      {children}
    </>
  );
}
