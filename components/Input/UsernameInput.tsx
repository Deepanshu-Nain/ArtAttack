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
    <input
      type="text"
      placeholder="Enter your nickname"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      className="flex-1 rounded bg-white p-3 text-lg outline-none"
    />
  );
}