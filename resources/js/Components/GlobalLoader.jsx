// resources/js/Components/GlobalLoader.jsx
export default function GlobalLoader({ show }) {
  if (!show) return null;

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-[99999] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Cargando"
      style={{
        background: "transparent", // 👈 SIN fondo (sin overlay)
        margin: 0,
        padding: 0,
      }}
    >
      {/* loader (centrado sí o sí) */}
      <div className="flex flex-col items-center gap-3 select-none">
        <div
          className="h-12 w-12 rounded-full border-[3px] border-black/20"
          style={{
            borderTopColor: "#58b22d", // verde logo
            animation: "spin 0.85s linear infinite",
          }}
        />
        <div className="text-center">
          <div className="text-white font-semibold drop-shadow">
            Cargando<span className="animate-pulse">…</span>
          </div>
         
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
