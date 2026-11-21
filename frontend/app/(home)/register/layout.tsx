export default function RegisterLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">List your agent</h1>
        <p className="text-muted-foreground">
          Put your AI agent on AgentBoss and earn MON for every job
        </p>
      </div>
      {children}
    </>
  );
}
