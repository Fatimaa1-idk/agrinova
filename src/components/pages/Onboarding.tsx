import React, { useState } from 'react';
import { Button, Icon } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { Marketplace } from './Marketplace';
import { Volume2, Sprout, Hand, Wrench, ShoppingCart, User } from 'lucide-react';

const Onboarding = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();
  const [lang, setLang] = useState('FR');

  const languages = [
    { code: 'FR', label: '🇫🇷 FR' },
    { code: 'WO', label: '🇸🇳 WO' },
    { code: 'PL', label: '🇨🇮 PL' },
    { code: 'EN', label: '🇬🇧 EN' },
  ];

  const translations = {
    FR: {
      title: 'AGRINOVA',
      subtitle: 'La technologie qui parle ta langue et veille sur ta terre',
      welcome: `Bonjour, ${user?.nom || ''} !`,
      producerDashboard: 'Mon tableau de bord',
      goToMarket: 'Allez au marché',
      logout: 'Se déconnecter',
      iamProducer: 'Je suis Producteur',
      iamBuyer: 'Je suis Acheteur',
      alreadyAccount: 'Déjà un compte ?',
      login: 'Se connecter',
    },
    WO: {
      title: 'AGRINOVA',
      subtitle: 'Xarala giy wax sa làmmiñ tey sàmm sa suuf',
      welcome: `Naka def, ${user?.nom || ''} !`,
      producerDashboard: 'Sam potal',
      goToMarket: 'Dem wa market',
      logout: 'Yaq',
      iamProducer: 'Mangi bay',
      iamBuyer: 'Mangi jënd',
      alreadyAccount: 'Amul kont ?',
      login: 'Tëb',
    },
    PL: {
      title: 'AGRINOVA',
      subtitle: 'Karallaagal kaaloowo ɗemngal maa',
      welcome: `Ngonka ${user?.nom || ''} !`,
      producerDashboard: 'Potal am',
      goToMarket: 'Yah to market',
      logout: 'Yaltu',
      iamProducer: 'Miin ko mi demoowo',
      iamBuyer: 'Miin ko mi soodoowo',
      alreadyAccount: 'Hontatakonte ?',
      login: 'Seŋ',
    },
    EN: {
      title: 'AGRINOVA',
      subtitle: 'Technology that speaks your language and watches over your land',
      welcome: `Hello, ${user?.nom || ''} !`,
      producerDashboard: 'My dashboard',
      goToMarket: 'Go to market',
      logout: 'Logout',
      iamProducer: 'I am a Producer',
      iamBuyer: 'I am a Buyer',
      alreadyAccount: 'Already have an account?',
      login: 'Login',
    },
  };

  const t = translations[lang as keyof typeof translations];

  const handleLogout = () => {
    logout();
    showToast('Déconnecté avec succès');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-surface flex flex-col justify-between overflow-hidden relative">
      <div className="w-full max-w-md mx-auto p-6 flex justify-between items-center z-10">
        <button className="bg-white/20 backdrop-blur border border-white/10 rounded-full w-14 h-14 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
          <Volume2 size={24} />
        </button>

        <div className="flex bg-white/15 backdrop-blur border border-white/10 rounded-full p-1">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => setLang(language.code)}
              className={cn(
                'px-3 py-2 rounded-full text-xs font-bold transition-colors',
                lang === language.code
                  ? 'bg-white/40 text-white'
                  : 'text-white/80 hover:text-white'
              )}
            >
              {language.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center text-center px-8 z-10 justify-center">
        <div className="w-28 h-28 bg-primary rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/20 mb-6">
          <Sprout size={56} className="text-white" />
        </div>

        <h1 className="font-black text-4xl text-white tracking-tight mb-2">
          {t.title}
        </h1>

        <p className="text-white/80 text-base leading-relaxed max-w-xs mb-12">
          {t.subtitle}
        </p>

        {user ? (
          <div className="w-full max-w-sm flex flex-col gap-4">
            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 text-white text-center">
              <p className="text-xl mb-1">
                <Hand size={20} className="mr-2 inline" />
                {t.welcome}
              </p>
              <p className="text-sm opacity-70">
                {user.role === 'producteur' ? (
                  <>
                    <Wrench size={16} className="mr-1 inline" />
                    Producteur
                  </>
                ) : (
                  <>
                    <ShoppingCart size={16} className="mr-1 inline" />
                    Acheteur
                  </>
                )}
              </p>
            </div>

            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('accueil')}
              className="w-full "
            >
              {user.role === 'producteur' ? (
                <>
                  <Wrench size={20} className="mr-2" />
                  {t.producerDashboard}
                </>
              ) : (
                <>
                  <ShoppingCart size={20} className="mr-2" />
                  {t.goToMarket}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="md"
              onClick={handleLogout}
              className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              {t.logout}
            </Button>
          </div>
        ) : (
          <div className="w-full max-w-md flex flex-col gap-4">
            {/* Producteur — dark green card */}
            <button
              onClick={() => navigate('inscription', { role: 'producteur' })}
              className="w-full rounded-3xl py-4 px-2 flex flex-col items-center gap-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] shadow-2xl"
              style={{ backgroundColor: '#2d5a3d' }}
            >
              <span className="text-5xl leading-none select-none">🚜</span>
              <span className="text-white font-black text-xl uppercase tracking-widest">{t.iamProducer}</span>
            </button>

            {/* Acheteur — amber/yellow card */}
            <button
              onClick={() => navigate('inscription', { role: 'acheteur' })}
              className="w-full rounded-3xl py-4 px-2 flex flex-col items-center gap-5 transition-all duration-200 hover:scale-[1.02] active:scale-[0.97] shadow-2xl"
              style={{ backgroundColor: '#f5a623' }}
            >
              <span className="text-5xl leading-none select-none">🛒</span>
              <span className="font-black text-xl uppercase tracking-widest" style={{ color: '#3d2a00' }}>{t.iamBuyer}</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-6 text-center z-10">
        {!user && (
          <p className="text-primary/60 text-sm font-semibold mb-4">
            {t.alreadyAccount}{' '}
            <span
              onClick={() => navigate('connexion')}
              className="text-primary font-black underline cursor-pointer hover:text-primary/80"
            >
              {t.login}
            </span>
          </p>
        )}
        <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto" />
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-10 overflow-hidden pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000"
          alt=""
          className="w-full h-full object-cover filter grayscale"
        />
      </div>
    </div>
  );
};

export { Onboarding };
