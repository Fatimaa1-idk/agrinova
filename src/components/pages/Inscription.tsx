import React, { useState } from 'react';
import { Button, Input, Icon } from '../ui';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useRouter } from '../../router/RouterContext';
import { api } from '../../services/api';

const ROLES = [
  {
    value: 'producteur' as const,
    label: 'Producteur',
    emoji: '🌾',
    description: 'Je vends mes récoltes',
    detail: 'Publiez vos produits, gérez vos commandes et discutez avec les acheteurs.',
    color: 'from-emerald-600 to-emerald-800',
    badge: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
  },
  {
    value: 'acheteur' as const,
    label: 'Acheteur',
    emoji: '🛒',
    description: 'J\'achète des produits frais',
    detail: 'Commandez directement aux producteurs locaux, suivez vos achats et chattez avec les vendeurs.',
    color: 'from-blue-600 to-blue-900',
    badge: 'bg-blue-400/20 text-blue-200 border-blue-400/30',
  },
];

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

  const selectedRole = ROLES.find(r => r.value === formRole)!;

  const handleSubmit = async () => {
    setFormErreur('');

    if (!formNom || !formEmail || !formMdp) {
      setFormErreur('Remplissez tous les champs obligatoires.');
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

      login(data.utilisateur, data.token);
      showToast(`Bienvenue ${data.utilisateur.nom} !`);
      navigate('accueil');
    } catch (e: any) {
      setFormErreur(e?.message || 'Serveur indisponible. Réessayez plus tard.');
    }

    setChargement(false);
  };

  return (
    <div className={cn(
      'min-h-screen flex flex-col transition-all duration-500 bg-gradient-to-br',
      selectedRole.color
    )}>
      {/* Header */}
      <div className="p-5 flex items-center gap-3">
        <button
          onClick={() => navigate('onboarding')}
          className="p-2 rounded-lg bg-white/15 backdrop-blur text-white hover:bg-white/25 transition-colors"
        >
          <Icon name="←" size={20} />
        </button>
        <div>
          <h1 className="text-white font-black text-xl">Créer un compte</h1>
          <p className="text-white/60 text-xs">Rejoindre Agrinova Sénégal</p>
        </div>
      </div>

      <div className="flex-1 px-5 pb-10 flex flex-col max-w-lg mx-auto w-full gap-5">

        {/* Role selector */}
        <div className="space-y-2">
          <p className="text-white/70 text-xs font-bold uppercase tracking-widest text-center">Je suis un...</p>
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map(role => (
              <button
                key={role.value}
                onClick={() => setFormRole(role.value)}
                className={cn(
                  'relative flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all duration-200 gap-2',
                  formRole === role.value
                    ? 'bg-white/20 border-white shadow-lg scale-[1.02]'
                    : 'bg-white/8 border-white/20 hover:bg-white/12 hover:border-white/40'
                )}
              >
                {formRole === role.value && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <span className="text-[10px]">✓</span>
                  </span>
                )}
                <span className="text-3xl">{role.emoji}</span>
                <div>
                  <p className="text-white font-black text-sm">{role.label}</p>
                  <p className="text-white/65 text-[10px] font-semibold mt-0.5">{role.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Role detail */}
          <div className={cn(
            'px-4 py-3 rounded-xl border text-xs font-semibold leading-relaxed',
            selectedRole.badge
          )}>
            <span className="mr-1">{selectedRole.emoji}</span>
            {selectedRole.detail}
          </div>
        </div>

        {/* Form fields */}
        <div className="space-y-3">
          <Input
            label="Nom complet *"
            value={formNom}
            onChange={(e) => setFormNom(e.target.value)}
            placeholder="Ex: Fatou Diallo"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            label="Adresse email *"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            placeholder="ex: fatou@gmail.com"
            type="email"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            label="Mot de passe *"
            value={formMdp}
            onChange={(e) => setFormMdp(e.target.value)}
            placeholder="Minimum 6 caractères"
            type="password"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Input
            label="Localisation (ville / région)"
            value={formLoc}
            onChange={(e) => setFormLoc(e.target.value)}
            placeholder="Ex: Thiès, Kaolack, Dakar..."
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
        </div>

        {formErreur && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-100 text-sm font-medium">
            <Icon name="❌" size={14} className="mr-2" />
            {formErreur}
          </div>
        )}

        <Button
          variant="secondary"
          size="lg"
          onClick={handleSubmit}
          loading={chargement}
          disabled={chargement}
          className="w-full"
        >
          {chargement ? (
            <>
              <Icon name="⏳" size={16} className="mr-2 animate-spin" />
              Création du compte...
            </>
          ) : (
            <>
              <span className="mr-2">{selectedRole.emoji}</span>
              Créer mon compte {selectedRole.label}
            </>
          )}
        </Button>

        <p className="text-center text-white/60 text-sm">
          Déjà un compte ?{' '}
          <span
            onClick={() => navigate('connexion')}
            className="text-white font-bold cursor-pointer hover:underline"
          >
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );
};

export { Inscription };
