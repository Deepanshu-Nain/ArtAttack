import HomeInteractive from "./HomeInteractive";

export default function HomeCard() {
  return (
    <section
      className="
        w-full
        max-w-[800px]
        min-h-[600px]
        bg-[var(--color-drawing-surface)]
        paper-shadow-lg
        flex flex-col md:flex-row
        relative
        rotate-[-1deg]
        transition-transform
        hover:rotate-0
        duration-300
      "
    >
      {/* Spiral Binding — Desktop (vertical left edge) */}
      <div
        className="
          hidden md:block
          w-12
          border-r-2
          border-[var(--color-outline-variant)]
          h-full
          spiral-binding
          shrink-0
          absolute left-0 top-0 bottom-0
          z-10
        "
      />

      {/* Spiral Binding — Mobile (horizontal top edge) */}
      <div
        className="
          md:hidden
          h-8
          border-b-2
          border-[var(--color-outline-variant)]
          w-full
          spiral-binding-horizontal
          shrink-0
        "
      />

      {/* Content Area */}
      <div className="flex-1 p-8 md:pl-20 flex flex-col items-center justify-center gap-12 relative overflow-hidden">
        {/* Tape accents */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-32 h-8 tape-strip rotate-[-2deg] z-20" />
        <div className="absolute bottom-4 right-8 w-24 h-6 tape-strip rotate-[4deg] z-20" />

        <HomeInteractive />
      </div>
    </section>
  );
}