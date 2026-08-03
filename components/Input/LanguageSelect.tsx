"use client";

type LanguageSelectProps = {
  language: string;
  setLanguage: React.Dispatch<React.SetStateAction<string>>;
};

export default function LanguageSelect({
  language,
  setLanguage,
}: LanguageSelectProps) {
  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      className="w-48 rounded bg-white px-3 text-lg"
    >
      <option>English</option>
      <option>Hindi</option>
      <option>Spanish</option>
    </select>
  );
}