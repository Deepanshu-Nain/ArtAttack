"use client";

type CreateRoomButtonProps = {
  onCreateRoom: () => void;
};

export default function CreateRoomButton({
  onCreateRoom,
}: CreateRoomButtonProps) {
  return (
    <button
      onClick={onCreateRoom}
      className="
        mt-3
        w-full
        rounded
        bg-sky-500
        py-3
        text-2xl
        text-white
        transition
        hover:brightness-110
        active:scale-95
      "
    >
      Create Private Room
    </button>
  );
}