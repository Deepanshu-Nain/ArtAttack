export default function WordSelectionWaiting({ drawerName }: { drawerName: string }) {
  return (
    <div className="text-center animate-pulse">
      <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">⏳</span>
      </div>
      <h2 className="text-2xl font-bold text-slate-700">
        {drawerName} is choosing a word...
      </h2>
    </div>
  );
}
