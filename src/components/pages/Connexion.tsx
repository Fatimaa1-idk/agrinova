import React, { useState } from 'react';
import { Button, Input, Icon } from '../ui';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

const Connexion = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [formEmail, setFormEmail] = useState('');
  const [formMdp, setFormMdp] = useState('');
  const [formErreur, setFormErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async () => {
    setFormErreur('');

    if (!formEmail || !formMdp) {
      setFormErreur('Remplissez tous les champs !');
      return;
    }

    setChargement(true);

    try {
      const data = await api('/auth/connexion', 'POST', {
        email: formEmail,
        mot_de_passe: formMdp,
      });

      login(data.utilisateur, data.token);
      showToast(`Bienvenue ${data.utilisateur.nom} !`);
      navigate('accueil');
    } catch (e: any) {
      setFormErreur(e?.message || 'Email ou mot de passe incorrect');
    }

    setChargement(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-container flex flex-col">
      <div className="p-5 flex items-center gap-3">
        <button
          onClick={() => navigate('onboarding')}
          className="p-2 rounded-lg bg-white/15 backdrop-blur text-white hover:bg-white/25 transition-colors"
        >
          <Icon name="←" size={20} />
        </button>
        <div>
          <h1 className="text-white font-black text-xl flex items-center gap-2">
            Bon retour !
            <Icon name="👋" size={20} />
          </h1>
          <p className="text-white/60 text-xs">Connectez-vous à votre compte</p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-10 flex flex-col max-w-lg mx-auto w-full justify-center">
        <div className="space-y-4">
          <Input
            label="Email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="ton@email.com"
            type="email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            label="Mot de passe"
            value={formMdp}
            onChange={(e) => setFormMdp(e.target.value)}
            placeholder="••••••••"
            type="password"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          {formErreur && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-100 text-sm font-medium">
              <Icon name="❌" size={14} className="mr-2" />
              {formErreur}
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          size="lg"
          onClick={handleSubmit}
          loading={chargement}
          disabled={chargement}
          className="w-full mt-8"
        >
          {chargement ? (
            <>
              <Icon name="⏳" size={16} className="mr-2 animate-spin" />
              Connexion...
            </>
          ) : (
            <>
              <Icon name="🔐" size={16} className="mr-2" />
              Se connecter
            </>
          )}
        </Button>

        <p className="text-center text-white/60 text-sm mt-6">
          Pas encore de compte ?{' '}
          <span
            onClick={() => navigate('inscription')}
            className="text-agri-gold font-bold cursor-pointer hover:text-agri-gold-hover underline"
          >
            S'inscrire
          </span>
        </p>
        <p className="text-center text-white/40 text-xs mt-2">
          Mot de passe oublié ?{' '}
          <span className="text-white/60 cursor-pointer hover:text-white/80 underline">
            Réinitialiser
          </span>
        </p>
      </div>
    </div>
  );
};

export { Connexion };
