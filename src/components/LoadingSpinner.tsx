export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const ring = { sm: 'w-6 h-6 border-2', md: 'w-10 h-10 border-2', lg: 'w-14 h-14 border-3' }[size];
  const pad = { sm: 'p-4', md: 'p-10', lg: 'p-16' }[size];
  return (
    <div className={`flex flex-col justify-center items-center gap-3 ${pad}`}>
      <div className={`${ring} border-gray-100 border-t-orange-500 rounded-full animate-spin`} />
      {size !== 'sm' && <p className="text-xs text-gray-400 font-medium">Yuklanmoqda...</p>}
    </div>
  );
}
