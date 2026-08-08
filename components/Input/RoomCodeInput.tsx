"use client";

type RoomCodeInputProps = {
  roomCode: string;
  setRoomCode: React.Dispatch<React.SetStateAction<string>>;
};

export default function RoomCodeInput({
  roomCode,
  setRoomCode,
}: RoomCodeInputProps) {
  return (
    <div className="w-full relative">
      {/* Tape accent */}
      <div className="absolute -top-3 left-8 w-12 h-5 tape-strip rotate-[3deg] z-20" />

      {/* Torn paper wrapper */}
      <div
        className="
          bg-[var(--color-surface-container-low)]
          p-4
          torn-paper
          paper-shadow
          rotate-[-1deg]
          w-full
        "
      >
        <label className="sr-only" htmlFor="room-code">
          Room Code
        </label>
        <input
          id="room-code"
          type="text"
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          placeholder="Private room code..."
          value={roomCode}
          onChange={(e) =>
            setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
          }
          className="
            w-full
            bg-transparent
            border-none
            border-b-2
            border-[var(--color-pencil)]
            focus:border-[var(--color-on-surface)]
            focus:ring-0
            text-[24px] leading-[1.5]
            tracking-[0.15em]
            text-[var(--color-on-surface)]
            placeholder-[var(--color-pencil)]
            outline-none
            text-center
            uppercase
          "
          style={{ fontFamily: "var(--font-display)" }}
        />
      </div>
    </div>
  );
}