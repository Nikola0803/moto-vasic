import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/feature/Layout';

export default function NotFound() {
  const { t } = useTranslation('common');
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
        <div className="w-20 h-20 flex items-center justify-center bg-brand-50 rounded-full mb-6">
          <i className="ri-error-warning-line text-4xl text-brand-500" />
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-xl md:text-2xl font-bold text-gray-700 mb-3">
          Stranica nije pronađena
        </h2>
        <p className="text-sm text-gray-500 mb-8 max-w-md">
          Stranica koju tražite možda je uklonjena, promenjen joj je naziv ili privremeno nedostupna.
        </p>
        <Link
          to="/"
          className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-8 py-3 rounded-full transition-colors text-sm whitespace-nowrap"
        >
          {t('nav_home')}
        </Link>
      </div>
    </Layout>
  );
}