"use client";

type UsernameInputProps = {
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
};

export default function UsernameInput({
  username,
  setUsername,
}: UsernameInputProps) {
  return (
    <div className="w-full relative">
      {/* Tape accent */}
      <div className="absolute -top-3 left-4 w-12 h-5 tape-strip rotate-[-5deg] z-20" />

      {/* Torn paper wrapper */}
      <div
        className="
          bg-[var(--color-surface-container-low)]
          p-4
          torn-paper
          paper-shadow
          rotate-[1deg]
          w-full
        "
      >
        <label className="sr-only" htmlFor="player-name">
          Your Name
        </label>
        <input
          id="player-name"
          type="text"
          placeholder="Enter your scrawl..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="
            w-full
            bg-transparent
            border-none
            border-b-2
            border-[var(--color-pencil)]
            focus:border-[var(--color-on-surface)]
            focus:ring-0
            text-[24px] leading-[1.5]
            text-[var(--color-on-surface)]
            placeholder-[var(--color-pencil)]
            outline-none
            text-center
          "
          style={{ fontFamily: "var(--font-body)" }}
        />
      </div>
    </div>
  );
}