import { ReactNode } from "react";

export default function ActiveGameLayout({
  topBar,
  toolBar,
  canvasBoard,
  chatBox,
  playerList,
}: {
  topBar: ReactNode;
  toolBar: ReactNode;
  canvasBoard: ReactNode;
  chatBox: ReactNode;
  playerList: ReactNode;
}) {
  return (
    <div className="bg-dotted-paper min-h-screen flex flex-col text-[var(--color-on-surface)]">
      {/* Top Info Bar */}
      {topBar}

      {/* Main 3-Column Layout */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-6 justify-center items-start">
        {/* Left: Player List */}
        <aside className="w-full lg:w-[250px] flex-shrink-0 hidden lg:flex flex-col gap-4 order-2 lg:order-1">
          <div
            className="
              bg-[var(--color-surface-container-high)]
              sketch-border
              p-4
              rotate-[-1deg]
              relative
              min-h-[400px]
            "
          >
            {/* Tape accents */}
            <div className="tape-strip absolute w-16 h-6 -top-3 left-4 rotate-[-5deg]" />
            <div className="tape-strip absolute w-16 h-6 -top-3 right-4 rotate-[3deg]" />

            <h2
              className="text-[32px] leading-[1.2] text-[var(--color-on-surface)] mb-6 text-center border-b-2 border-[var(--color-pencil)] border-dashed pb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              PLAYERS
            </h2>
            <div className="flex flex-col gap-3">
              {playerList}
            </div>
          </div>
        </aside>

        {/* Center: Canvas + Toolbar */}
        <section className="w-full lg:w-[800px] flex-shrink-0 flex flex-col items-center order-1 lg:order-2 z-10">
          {canvasBoard}
          {toolBar}
        </section>

        {/* Right: Chat */}
        <aside className="w-full lg:w-[300px] flex-shrink-0 hidden lg:flex flex-col gap-4 order-3 h-[600px]">
          {chatBox}
        </aside>
      </main>
    </div>
  );
}
