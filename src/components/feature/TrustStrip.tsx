import { useTranslation } from 'react-i18next';

const trustItems = [
  { icon: 'ri-truck-line', text: 'Besplatna dostava preko 50.000 RSD' },
  { icon: 'ri-hand-coin-line', text: 'Plaćanje pouzećem' },
  { icon: 'ri-shield-check-line', text: 'Garancija do 2 godine' },
  { icon: 'ri-tools-line', text: 'Servis i rezervni delovi' },
];

export default function TrustStrip() {
  const { t } = useTranslation('common');
  return (
    <div className="bg-brand-900 text-white py-2.5 px-4">
      <div className="max-w-[1440px] mx-auto flex items-center justify-center gap-6 md:gap-10 flex-wrap">
        {trustItems.map((item) => (
          <div key={item.text} className="flex items-center gap-2 text-[11px] md:text-xs font-medium">
            <div className="w-5 h-5 flex items-center justify-center text-brand-300">
              <i className={`${item.icon}`} />
            </div>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}