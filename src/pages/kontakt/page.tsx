import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Layout from '@/components/feature/Layout';

export default function Contact() {
  const { t } = useTranslation('common');
  const [formState, setFormState] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    document.title = 'Kontakt | Moto Vasić — Pozovite nas ili pošaljite upit';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Kontaktirajte Moto Vasić za kupovinu ATV kvadova, kros motora, bagija i skutera. Pozovite 062/1541944 ili 062/1541936. Servis i prodaja u Smederevu, dostava po celoj Srbiji.');
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const params = new URLSearchParams();
      formData.forEach((value, key) => {
        params.append(key, String(value));
      });

      const res = await fetch('https://readdy.ai/api/form/d82b31j29k3fss3u08p0', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      if (res.ok) {
        setFormState('success');
        form.reset();
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  return (
    <Layout>
      <div className="pt-20 md:pt-24 lg:pt-32 pb-10 md:pb-14 px-4 md:px-10 bg-[#F8FBF8]">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-[11px] font-bold tracking-[0.2em] uppercase text-brand-600 mb-3 bg-brand-50 px-3 py-1 rounded-full">
            Tu smo za vas
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-5">
            Kontaktirajte nas
          </h1>
          <p className="text-[13px] md:text-base text-gray-500 leading-relaxed max-w-lg mx-auto">
            Imate pitanje o vozilima, dostavi, servisu ili rezervnim delovima? Tu smo da vam pomognemo — odgovaramo u roku od 24h.
          </p>
        </div>
      </div>

      <div className="pb-16 md:pb-24 px-4 md:px-10 bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-12 md:mb-16">
            {[
              { icon: 'ri-phone-line', label: t('phone'), value: '062/1541944', href: 'tel:+381621541944', color: 'bg-brand-600' },
              { icon: 'ri-phone-line', label: t('phone'), value: '062/1541936', href: 'tel:+381621541936', color: 'bg-brand-600' },
              { icon: 'ri-mail-line', label: t('email'), value: 'info@motovasic.com', href: 'mailto:info@motovasic.com', color: 'bg-brand-600' },
              { icon: 'ri-map-pin-line', label: t('address'), value: 'Niš, Topličkog Partizanskog Odreda 10', href: '#', color: 'bg-brand-600' },
              { icon: 'ri-time-line', label: 'Radno vreme', value: 'Pon-Ned: 09-22h', href: '#', color: 'bg-brand-600' },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="bg-[#F8FBF8] rounded-2xl p-5 md:p-6 border border-gray-100 hover:border-brand-200 transition-all group"
              >
                <div className={`w-12 h-12 flex items-center justify-center ${item.color} rounded-xl mb-4`}>
                  <i className={`${item.icon} text-white text-xl`} />
                </div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-[14px] font-bold text-gray-800">{item.value}</p>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            <div className="rounded-2xl overflow-hidden border border-gray-100 h-fit">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2907.123456789!2d21.8958!3d43.3209!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4755b123456789ab%3A0xabcdef1234567890!2zTmnFoQ!5e0!3m2!1ssr!2srs!4v1600000000000"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa"
                className="w-full"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Pošaljite nam poruku
              </h2>
              <form
                id="contact-form"
                data-readdy-form
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('name')}</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-[#F8FBF8] border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('email')}</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-[#F8FBF8] border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('phone')}</label>
                  <input
                    type="tel"
                    name="phone"
                    className="w-full px-4 py-3 bg-[#F8FBF8] border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">{t('message')}</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-[#F8FBF8] border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition-all resize-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5">Maksimalno 500 karaktera</p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all text-sm whitespace-nowrap tracking-wide shadow-lg shadow-brand-600/20"
                >
                  {t('send_message')}
                </button>

                {formState === 'success' && (
                  <div className="flex items-center gap-2 text-[13px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl">
                    <i className="ri-check-line text-emerald-500" />
                    {t('contact_success')}
                  </div>
                )}
                {formState === 'error' && (
                  <div className="flex items-center gap-2 text-[13px] text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                    <i className="ri-error-warning-line text-red-500" />
                    {t('contact_error')}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}