"use client";

type PlayButtonProps = {
  onPlay: () => void;
};

export default function PlayButton({
  onPlay,
}: PlayButtonProps) {
  return (
    <button
      onClick={onPlay}
      className="
        mt-5
        w-full
        rounded
        bg-lime-500
        py-4
        text-4xl
        font-bold
        text-white
        transition
        hover:brightness-110
        active:scale-95
      "
    >
      Play!
    </button>
  );
}