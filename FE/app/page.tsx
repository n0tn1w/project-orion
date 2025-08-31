export default function HomePage() {
  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center text-center bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/high-quality-nebula-background.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>

      <div className="relative z-10">
        <h1 className="text-6xl font-bold text-white drop-shadow-lg">Project Orion</h1>
      </div>
    </div>
  )
}
