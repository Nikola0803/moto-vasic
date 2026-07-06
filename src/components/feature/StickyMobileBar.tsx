export default function StickyMobileBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.3)] md:hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <a
          href="tel:+381621541944"
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-lg text-[13px] whitespace-nowrap"
        >
          <i className="ri-phone-line text-white text-sm" />
          062/1541944
        </a>
        <a
          href="tel:+381621541936"
          className="flex-1 flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-lg text-[13px] whitespace-nowrap"
        >
          <i className="ri-phone-line text-white text-sm" />
          062/1541936
        </a>
      </div>
    </div>
  );
}
