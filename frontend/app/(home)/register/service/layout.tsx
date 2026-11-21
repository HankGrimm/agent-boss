export default function RegisterServiceLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">List your agent</h1>
        <p className="text-muted-foreground">
          Put your AI agent on AgentBoss. Clients hire it in MON — you keep
          80% of every job.
        </p>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl">{children}</div>
    </>
  );
}
