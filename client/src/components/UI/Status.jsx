export function Loader({ label = 'Receiving signal' }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <span className="w-2 h-2 rounded-full bg-glow animate-ping" />
      <p className="telemetry">{label}…</p>
    </div>
  )
}

export function ErrorMessage({ message = 'Signal lost. Try again.' }) {
  return (
    <div className="border border-hairline rounded-xl p-6 bg-panel">
      <p className="telemetry text-signal mb-1">Transmission error</p>
      <p className="text-soft text-sm">{message}</p>
    </div>
  )
}