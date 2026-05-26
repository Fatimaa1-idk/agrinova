import React, { useState } from 'react';
import { Button, Input, Icon } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

const Inscription = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const { navigate } = useRouter();

  const [formRole, setFormRole] = useState<'producteur' | 'acheteur'>('producteur');
  const [formNom, setFormNom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMdp, setFormMdp] = useState('');
  const [formLoc, setFormLoc] = useState('');
  const [formErreur, setFormErreur] = useState('');
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async () => {
    setFormErreur('');

    if (!formNom || !formEmail || !formMdp) {
      setFormErreur('Remplissez tous les champs !');
      return;
    }

    if (formMdp.length < 6) {
      setFormErreur('Mot de passe trop court (minimum 6 caractères)');
      return;
    }

    setChargement(true);

    try {
      const data = await api('/auth/inscription', 'POST', {
        nom: formNom,
        email: formEmail,
        mot_de_passe: formMdp,
        role: formRole,
        localisation: formLoc,
      });

      if (data.token) {
        localStorage.setItem('agrinova_token', data.token);
        localStorage.setItem('agrinova_user', JSON.stringify(data.utilisateur));
        login(data.utilisateur);
        showToast(`Bienvenue ${data.utilisateur.nom} !`);
        navigate('accueil');
      } else {
        setFormErreur(data.detail || "Erreur lors de l'inscription");
      }
    } catch {
      setFormErreur('Serveur indisponible. Réessayez plus tard.');
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
          <h1 className="text-white font-black text-xl">Créer un compte</h1>
          <p className="text-white/60 text-xs flex items-center">
            {formRole === 'producteur' ? (
              <>
                <Icon name="🚜" size={12} className="mr-1" />
                Compte Producteur
              </>
            ) : (
              <>
                <Icon name="🛒" size={12} className="mr-1" />
                Compte Acheteur
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 pb-10 flex flex-col max-w-lg mx-auto w-full">
        <div className="flex bg-white/10 backdrop-blur rounded-2xl p-1 mb-6">
          {[
            { value: 'producteur', label: 'Producteur', icon: '🚜' },
            { value: 'acheteur', label: 'Acheteur', icon: '🛒' },
          ].map((role) => (
            <button
              key={role.value}
              onClick={() => setFormRole(role.value as 'producteur' | 'acheteur')}
              className={cn(
                'flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200',
                formRole === role.value
                  ? 'bg-white text-primary shadow-lg'
                  : 'text-white/80 hover:text-white'
              )}
            >
              <Icon name={role.icon} size={16} className="mr-2" />
              {role.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 flex-1">
          <Input
            label="Nom complet"
            value={formNom}
            onChange={(e) => setFormNom(e.target.value)}
            placeholder="Ex: Fatou Diallo"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            label="Email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="Ex: fatou@gmail.com"
            type="email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            label="Mot de passe"
            value={formMdp}
            onChange={(e) => setFormMdp(e.target.value)}
            placeholder="Minimum 6 caractères"
            type="password"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            label="Localisation"
            value={formLoc}
            onChange={(e) => setFormLoc(e.target.value)}
            placeholder="Ex: Thiès, Sénégal"
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
          className="w-full mt-6"
        >
          {chargement ? (
            <>
              <Icon name="⏳" size={16} className="mr-2 animate-spin" />
              Création...
            </>
          ) : (
            <>
              <Icon name="✅" size={16} className="mr-2" />
              Créer mon compte
            </>
          )}
        </Button>

        <p className="text-center text-white/60 text-sm mt-4">
          Déjà un compte ?{' '}
          <span
            onClick={() => navigate('connexion')}
            className="text-agri-gold font-bold cursor-pointer hover:text-agri-gold-hover underline"
          >
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
};

export { Inscription };
