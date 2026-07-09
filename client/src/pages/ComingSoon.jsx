export default function ComingSoon({ title }) {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <p className="telemetry telemetry-accent">Module offline</p>
      <h1 className="font-display font-semibold text-2xl">{title}</h1>
      <p className="text-dim text-sm">This instrument comes online in a later phase.</p>
    </main>
  )
}