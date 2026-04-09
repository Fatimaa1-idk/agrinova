import { useState, useEffect } from 'react';

// ── API Backend ───────────────────────────────────────────
const API = 'https://agrinova-backend-yt2f.onrender.com/api';

async function api(endpoint: string, method = 'GET', body?: object) {
  const token = localStorage.getItem('agrinova_token');
  const res = await fetch(`${API}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  return res.json();
}

type Page = 'onboarding'|'inscription'|'connexion'|'marketplace'|'producteur'|'profil'|'chat'|'bot'|'panier'|'livraison'|'notation'|'ajouter';

export default function App() {
  const [page, setPage] = useState<Page>('onboarding');
  const [lang, setLang] = useState('FR');
  const [utilisateur, setUtilisateur] = useState<any>(
    JSON.parse(localStorage.getItem('agrinova_user') || 'null')
  );
  const [produits, setProduits] = useState<any[]>([]);
  const [chargement, setChargement] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState([
    {id:1,moi:false,texte:'Bonjour ! Vos tomates sont encore disponibles ?',heure:'09:12',lu:true},
    {id:2,moi:true,texte:"Oui, j'ai encore 50kg. Quelle quantité ?",heure:'09:15',lu:true},
  ]);
  const [noteEtoile, setNoteEtoile] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [noteEnvoyee, setNoteEnvoyee] = useState(false);
  const [toast, setToast] = useState('');
  const [nomProduit, setNomProduit] = useState('');
  const [prixProduit, setPrixProduit] = useState('');
  const [qteProduit, setQteProduit] = useState('');

  // Formulaires inscription/connexion
  const [formNom, setFormNom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMdp, setFormMdp] = useState('');
  const [formRole, setFormRole] = useState('acheteur');
  const [formLoc, setFormLoc] = useState('');
  const [formErreur, setFormErreur] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // Charger les produits depuis le backend
  const chargerProduits = async () => {
    setChargement(true);
    try {
      const data = await api('/produits');
      if (Array.isArray(data)) setProduits(data);
    } catch (e) {
      console.log('Backend non disponible, mode démo');
    }
    setChargement(false);
  };

  useEffect(() => {
    if (page === 'marketplace') chargerProduits();
  }, [page]);

  const seDeconnecter = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    setUtilisateur(null);
    setPage('onboarding');
    showToast('👋 Déconnecté avec succès');
  };

  const envoyer = () => {
    if (!msgInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), moi: true,
      texte: msgInput,
      heure: new Date().toLocaleTimeString('fr', {hour:'2-digit', minute:'2-digit'}),
      lu: false
    }]);
    setMsgInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now()+1, moi: false,
        texte: '✅ Message reçu, merci ! 🌾',
        heure: new Date().toLocaleTimeString('fr', {hour:'2-digit', minute:'2-digit'}),
        lu: false
      }]);
    }, 1000);
  };

  // Produits démo si backend vide
  const produitsDemo = [
    {id:1, nom:'Tomates de Thiès', description:'Récoltées ce matin', prix:350, localisation:'Thiès', note_globale:4.8, quantite_disponible:50, est_disponible:true, certifie:true, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCa_08BP1sGbXOaRBboTAzvPKJt8IKcRg1raquKfJg80Tf9i6H97egNk4EKSry0u6rmi5cU14PLkBrI2ljb5JQW86hKD4Uv0YzYMq1xs2phSXpXPu0OhDW0Lv6mPMrg4kHqjI2VHmX9gU9VSSwsmVevv60GcIQir6ZOcJ4Z7MRkNsMnPCq_1Glj4yHc0r3mILBfjSSq6vGJm6u4_bvg3_zZAH10UdzL4BTzNvivbyi34yyBzvbvIlDX6I9LSvZCsMB84ovqVZBVDjX4'},
    {id:2, nom:'Oignons de Gandiol', description:'Gros calibre, rouge', prix:600, localisation:'Saint-Louis', note_globale:4.5, quantite_disponible:30, est_disponible:true, certifie:true, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuA4tAKmwbXmnjjm7HVtq4gicOyBsAxNc2-YjsKBB_ULGudF973i33yABoowF9D-Yn146hwpGphPbLHaoxLoCoPGNwIHrYVOjyVb3vLQ3F5oldAg_blgLUQ3uL2OY0014W04XAS11IcjCNh7-uUz4z9EqYh3Oog3YJGMNfN6accATpKYEf5QMs7KAqPSR9QVGkMbnCpBD5qQSjeEjDefRELL2wVCu6MLp8fuw6QFxcKxMYG6Ss8Ki_3dyiAHk8Ad5TXdr1rM5ef3NVvM'},
    {id:3, nom:'Mangues Kent', description:'Douces & sucrées', prix:1200, localisation:'Casamance', note_globale:4.9, quantite_disponible:0, est_disponible:false, certifie:false, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuAvmW6dN0Okxa63B6P-8VCknPb19_gy9OKt_5Hn1GjzrTnNwWU4LCu6sG04ylCc7ma2r92SmVbZSz1kbMBPSqX6kdOfq00FNkrYQpoWk6oO47wxIX2NWp-NJN9XNvh286o5OKK7iqb7XLkzFlJsFrbLnIMGFrSrehboMOwUPMDat7_BroQE05IJc0RwpAg-cHEH2xBmziaL09vVT9MBNBX7eVBUmvsqxePoH27cW7omZ3FqkLfSdzzV88ZwkG7FNzrqcCWdHZ9YPy9o'},
    {id:4, nom:'Riz de la Vallée', description:'Sac de 5kg disponible', prix:500, localisation:'Richard Toll', note_globale:4.2, quantite_disponible:100, est_disponible:true, certifie:true, img:'https://lh3.googleusercontent.com/aida-public/AB6AXuA1q14-9JE_SQXuEZ2shs8EAbGHawtSYmRdinApw_cYHJoLsDVVAUPbTJ80xN97_G6eLMK8KzqvQjshjtPnvBrkuPWk6KwWY1E66ZRLIhLVEWDUGI_CnrH9GcB4wn2o_zBIpOGqWdW8hNGJHLi7XxSF-pFYIeEcmmAfO5YHKpm5EatQRA2rks7CAVbsjWEWxt7tiZ6uNK3cJjzF-clXA0bwRP31tKGRCfBVzmf1SFrNxAiLBRIl2mcGSZJEL7ZOitPqJ6w1elM7qz2M'},
  ];

  const listeProduits = produits.length > 0 ? produits : produitsDemo;

  // ── NAVIGATION ────────────────────────────────────────────
  const Nav = ({actif}: {actif: string}) => (
    <nav style={{position:'fixed',bottom:0,left:0,width:'100%',zIndex:50,display:'flex',justifyContent:'space-around',alignItems:'center',padding:'12px 16px 24px',background:'rgba(255,255,255,0.95)',backdropFilter:'blur(20px)',boxShadow:'0 -8px 30px rgba(0,0,0,0.08)',borderRadius:'40px 40px 0 0'}}>
      {[
        {icon:'🏠', label:'Accueil', p:'onboarding'},
        {icon:'🛒', label:'Marché', p:'marketplace'},
        {icon:'🤖', label:'Bot', p:'bot'},
        {icon:'💬', label:'Chat', p:'chat'},
        {icon:'👤', label:'Profil', p: utilisateur?.role === 'producteur' ? 'producteur' : 'profil'},
      ].map(item => (
        <button key={item.label} onClick={() => setPage(item.p as Page)}
          style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',border:'none',cursor:'pointer',padding:'8px 16px',borderRadius:'20px',background:actif===item.p?'#012d1d':'transparent',color:actif===item.p?'white':'#a8a29e'}}>
          <span style={{fontSize:'22px'}}>{item.icon}</span>
          <span style={{fontSize:'10px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'1px'}}>{item.label}</span>
        </button>
      ))}
    </nav>
  );

  // ── TOAST ─────────────────────────────────────────────────
  const Toast = () => toast ? (
    <div style={{position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',background:'#012d1d',color:'white',padding:'14px 28px',borderRadius:'50px',fontWeight:'bold',zIndex:999,boxShadow:'0 8px 30px rgba(0,0,0,0.2)',fontSize:'15px',whiteSpace:'nowrap'}}>
      {toast}
    </div>
  ) : null;

  // ── ONBOARDING ────────────────────────────────────────────
  if (page === 'onboarding') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1b4332 0%,#fbf9f4 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',overflow:'hidden',position:'relative'}}>
      <Toast/>
      <div style={{width:'100%',maxWidth:'500px',padding:'32px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
        <button style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50px',width:'56px',height:'56px',cursor:'pointer',fontSize:'24px',color:'white'}}>🔊</button>
        <div style={{display:'flex',gap:'4px',background:'rgba(255,255,255,0.15)',borderRadius:'50px',padding:'4px',border:'1px solid rgba(255,255,255,0.1)'}}>
          {['🇫🇷 FR','🇸🇳 WO','🇨🇮 PL','🇬🇧 EN'].map((l,i) => (
            <button key={l} onClick={() => setLang(['FR','WO','PL','EN'][i])}
              style={{padding:'8px 12px',borderRadius:'50px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:'bold',background:lang===['FR','WO','PL','EN'][i]?'rgba(255,255,255,0.4)':'transparent',color:'white'}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',padding:'0 32px',zIndex:10,flex:1,justifyContent:'center'}}>
        <div style={{width:'112px',height:'112px',background:'#012d1d',borderRadius:'32px',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 20px 60px rgba(0,0,0,0.3)',border:'2px solid rgba(255,255,255,0.1)',fontSize:'56px',marginBottom:'24px'}}>🌱</div>
        <h1 style={{fontWeight:'900',fontSize:'2.5rem',color:'white',letterSpacing:'-2px',marginBottom:'8px'}}>AGRINOVA</h1>
        <p style={{color:'rgba(255,255,255,0.8)',fontSize:'16px',lineHeight:'1.6',maxWidth:'280px',marginBottom:'48px'}}>
          {lang==='FR'&&'La technologie qui parle ta langue et veille sur ta terre'}
          {lang==='WO'&&'Xarala giy wax sa làmmiñ tey sàmm sa suuf'}
          {lang==='PL'&&'Karallaagal kaaloowo ɗemngal maa'}
          {lang==='EN'&&'Technology that speaks your language and watches over your land'}
        </p>

        {utilisateur ? (
          <div style={{width:'100%',maxWidth:'340px',display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'20px',padding:'20px',color:'white',textAlign:'center'}}>
              <p style={{fontSize:'20px',margin:'0 0 4px'}}>👋 Bonjour, {utilisateur.nom} !</p>
              <p style={{fontSize:'14px',opacity:0.7,margin:0}}>{utilisateur.role === 'producteur' ? '🚜 Producteur' : '🛒 Acheteur'}</p>
            </div>
            <button onClick={() => setPage(utilisateur.role === 'producteur' ? 'producteur' : 'marketplace')}
              style={{width:'100%',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',padding:'20px',cursor:'pointer',fontSize:'18px',fontWeight:'900'}}>
              {utilisateur.role === 'producteur' ? '🚜 Mon tableau de bord' : '🛒 Aller au marché'}
            </button>
            <button onClick={seDeconnecter}
              style={{width:'100%',background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'16px',padding:'14px',cursor:'pointer',fontSize:'15px',fontWeight:'bold'}}>
              Se déconnecter
            </button>
          </div>
        ) : (
          <div style={{width:'100%',maxWidth:'340px',display:'flex',flexDirection:'column',gap:'16px'}}>
            <button onClick={() => { setFormRole('producteur'); setPage('inscription'); }}
              style={{width:'100%',background:'#1B4332',color:'white',border:'none',borderRadius:'16px',padding:'24px',cursor:'pointer',fontSize:'18px',fontWeight:'bold',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',borderBottom:'4px solid rgba(0,0,0,0.2)'}}>
              <span style={{fontSize:'48px'}}>🚜</span>
              <span style={{textTransform:'uppercase',letterSpacing:'1px'}}>
                {lang==='FR'?'Je suis Producteur':lang==='WO'?'Mangi bay':lang==='PL'?'Miin ko mi demoowo':'I am a Producer'}
              </span>
            </button>
            <button onClick={() => { setFormRole('acheteur'); setPage('inscription'); }}
              style={{width:'100%',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',padding:'24px',cursor:'pointer',fontSize:'18px',fontWeight:'900',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',borderBottom:'4px solid rgba(0,0,0,0.1)'}}>
              <span style={{fontSize:'48px'}}>🛒</span>
              <span style={{textTransform:'uppercase',letterSpacing:'1px'}}>
                {lang==='FR'?'Je suis Acheteur':lang==='WO'?'Mangi jënd':lang==='PL'?'Miin ko mi soodoowo':'I am a Buyer'}
              </span>
            </button>
          </div>
        )}
      </div>

      <div style={{padding:'24px',textAlign:'center',zIndex:10}}>
        {!utilisateur && (
          <p style={{color:'#717973',fontSize:'15px',fontWeight:'600'}}>
            Déjà un compte ?{' '}
            <span onClick={() => setPage('connexion')} style={{color:'#012d1d',fontWeight:'900',textDecoration:'underline',cursor:'pointer'}}>
              Se connecter
            </span>
          </p>
        )}
        <div style={{width:'48px',height:'6px',background:'#e4e2dd',borderRadius:'3px',margin:'16px auto 0'}}/>
      </div>
      <div style={{position:'absolute',bottom:0,left:0,width:'100%',height:'35%',opacity:0.1,overflow:'hidden',pointerEvents:'none'}}>
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000" alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(1)'}}/>
      </div>
    </div>
  );

  // ── INSCRIPTION ───────────────────────────────────────────
  if (page === 'inscription') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#012d1d,#1b4332)',display:'flex',flexDirection:'column',padding:'0'}}>
      <Toast/>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <button onClick={() => setPage('onboarding')} style={{background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',fontSize:'20px',color:'white',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <h1 style={{color:'white',fontWeight:'900',fontSize:'22px',margin:0}}>Créer un compte</h1>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',margin:0}}>
            {formRole === 'producteur' ? '🚜 Compte Producteur' : '🛒 Compte Acheteur'}
          </p>
        </div>
      </div>

      <div style={{flex:1,padding:'0 24px 40px',display:'flex',flexDirection:'column',gap:'16px',maxWidth:'480px',width:'100%',margin:'0 auto'}}>
        {/* Toggle rôle */}
        <div style={{display:'flex',background:'rgba(255,255,255,0.1)',borderRadius:'16px',padding:'4px'}}>
          {['producteur','acheteur'].map(r => (
            <button key={r} onClick={() => setFormRole(r)}
              style={{flex:1,padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'14px',background:formRole===r?'white':'transparent',color:formRole===r?'#012d1d':'rgba(255,255,255,0.6)',transition:'all 0.2s'}}>
              {r === 'producteur' ? '🚜 Producteur' : '🛒 Acheteur'}
            </button>
          ))}
        </div>

        {[
          {label:'Nom complet',val:formNom,set:setFormNom,ph:'Ex: Fatou Diallo',type:'text'},
          {label:'Email',val:formEmail,set:setFormEmail,ph:'Ex: fatou@gmail.com',type:'email'},
          {label:'Mot de passe',val:formMdp,set:setFormMdp,ph:'Minimum 6 caractères',type:'password'},
          {label:'Localisation',val:formLoc,set:setFormLoc,ph:'Ex: Thiès, Sénégal',type:'text'},
        ].map(f => (
          <div key={f.label}>
            <label style={{display:'block',color:'rgba(255,255,255,0.8)',fontSize:'14px',fontWeight:'bold',marginBottom:'8px'}}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              style={{width:'100%',padding:'16px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'14px',color:'white',fontSize:'15px',outline:'none',boxSizing:'border-box'}}/>
          </div>
        ))}

        {formErreur && (
          <div style={{background:'rgba(186,26,26,0.2)',border:'1px solid #ba1a1a',borderRadius:'12px',padding:'12px 16px',color:'#ff6b6b',fontSize:'14px'}}>
            ❌ {formErreur}
          </div>
        )}

        <button
          onClick={async () => {
            setFormErreur('');
            if (!formNom || !formEmail || !formMdp) { setFormErreur('Remplis tous les champs !'); return; }
            if (formMdp.length < 6) { setFormErreur('Mot de passe trop court (min 6 caractères)'); return; }
            setChargement(true);
            try {
              const data = await api('/auth/inscription', 'POST', {
                nom: formNom, email: formEmail, mot_de_passe: formMdp,
                role: formRole, localisation: formLoc
              });
              if (data.token) {
                localStorage.setItem('agrinova_token', data.token);
                localStorage.setItem('agrinova_user', JSON.stringify(data.utilisateur));
                setUtilisateur(data.utilisateur);
                showToast(`✅ Bienvenue ${data.utilisateur.nom} ! 🌾`);
                setPage(formRole === 'producteur' ? 'producteur' : 'marketplace');
              } else {
                setFormErreur(data.detail || 'Erreur lors de l\'inscription');
              }
            } catch {
              setFormErreur('Impossible de contacter le serveur');
            }
            setChargement(false);
          }}
          style={{width:'100%',padding:'18px',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',fontWeight:'900',fontSize:'18px',cursor:'pointer',marginTop:'8px'}}>
          {chargement ? '⏳ Création...' : "✅ Créer mon compte"}
        </button>

        <p style={{textAlign:'center',color:'rgba(255,255,255,0.6)',fontSize:'14px'}}>
          Déjà un compte ?{' '}
          <span onClick={() => setPage('connexion')} style={{color:'#FFA000',fontWeight:'bold',cursor:'pointer',textDecoration:'underline'}}>
            Se connecter
          </span>
        </p>
      </div>
    </div>
  );

  // ── CONNEXION ─────────────────────────────────────────────
  if (page === 'connexion') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#012d1d,#1b4332)',display:'flex',flexDirection:'column'}}>
      <Toast/>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <button onClick={() => setPage('onboarding')} style={{background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',fontSize:'20px',color:'white',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <h1 style={{color:'white',fontWeight:'900',fontSize:'22px',margin:0}}>Bon retour ! 👋</h1>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',margin:0}}>Connectez-vous à votre compte</p>
        </div>
      </div>

      <div style={{flex:1,padding:'0 24px 40px',display:'flex',flexDirection:'column',gap:'16px',maxWidth:'480px',width:'100%',margin:'0 auto'}}>
        {[
          {label:'Email',val:formEmail,set:setFormEmail,ph:'ton@email.com',type:'email'},
          {label:'Mot de passe',val:formMdp,set:setFormMdp,ph:'••••••••',type:'password'},
        ].map(f => (
          <div key={f.label}>
            <label style={{display:'block',color:'rgba(255,255,255,0.8)',fontSize:'14px',fontWeight:'bold',marginBottom:'8px'}}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('btn-connexion')?.click()}
              style={{width:'100%',padding:'16px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'14px',color:'white',fontSize:'15px',outline:'none',boxSizing:'border-box'}}/>
          </div>
        ))}

        {formErreur && (
          <div style={{background:'rgba(186,26,26,0.2)',border:'1px solid #ba1a1a',borderRadius:'12px',padding:'12px 16px',color:'#ff6b6b',fontSize:'14px'}}>
            ❌ {formErreur}
          </div>
        )}

        <button id="btn-connexion"
          onClick={async () => {
            setFormErreur('');
            if (!formEmail || !formMdp) { setFormErreur('Remplis tous les champs !'); return; }
            setChargement(true);
            try {
              const data = await api('/auth/connexion', 'POST', {
                email: formEmail, mot_de_passe: formMdp
              });
              if (data.token) {
                localStorage.setItem('agrinova_token', data.token);
                localStorage.setItem('agrinova_user', JSON.stringify(data.utilisateur));
                setUtilisateur(data.utilisateur);
                showToast(`✅ Connexion réussie ! Bienvenue ${data.utilisateur.nom} 🌾`);
                setPage(data.utilisateur.role === 'producteur' ? 'producteur' : 'marketplace');
              } else {
                setFormErreur(data.detail || 'Email ou mot de passe incorrect');
              }
            } catch {
              setFormErreur('Impossible de contacter le serveur');
            }
            setChargement(false);
          }}
          style={{width:'100%',padding:'18px',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',fontWeight:'900',fontSize:'18px',cursor:'pointer',marginTop:'8px'}}>
          {chargement ? '⏳ Connexion...' : '🔐 Se connecter'}
        </button>

        <p style={{textAlign:'center',color:'rgba(255,255,255,0.6)',fontSize:'14px'}}>
          Pas encore de compte ?{' '}
          <span onClick={() => setPage('inscription')} style={{color:'#FFA000',fontWeight:'bold',cursor:'pointer',textDecoration:'underline'}}>
            S'inscrire
          </span>
        </p>
      </div>
    </div>
  );

  // ── MARKETPLACE ───────────────────────────────────────────
  if (page === 'marketplace') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'120px'}}>
      <Toast/>
      <div style={{background:'#fbf9f4',position:'sticky',top:0,zIndex:50,boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'50%',overflow:'hidden',background:'#eae8e3'}}>
              {utilisateur ? (
                <div style={{width:'100%',height:'100%',background:'#1b4332',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'16px'}}>
                  {utilisateur.nom[0].toUpperCase()}
                </div>
              ) : (
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBICydwOHLv1q4pAgCL8VlbkiZETPit4U9EDWkqBP9FesgExbdM55Jk1m0cJfKVdShoJ2PaQj3cfpYNpZV7ztAJ_U3LmuIb1EEL0vHkGhR9_LAGtDJZ640BEirzv92WVXTD1reetW70PrR02xRMBsxsnRaHYOXB50o0FMGMVazmt17VipGeomWVxgmjzgk9FN3hUdr8sgBAdQUMF3fR2st7T1wPSFPKdolgNEHhUXbvX4RdSrtkx7oXgLarjhw3A_9meghkOosn0hEj" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              )}
            </div>
            <div>
              <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',letterSpacing:'-1px',textTransform:'uppercase',margin:0}}>AGRINOVA</h1>
              {utilisateur && <p style={{color:'#717973',fontSize:'11px',margin:0}}>Bonjour, {utilisateur.nom} 👋</p>}
            </div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            {!utilisateur && (
              <button onClick={() => setPage('connexion')}
                style={{background:'#012d1d',color:'white',border:'none',borderRadius:'12px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold',fontSize:'13px'}}>
                Se connecter
              </button>
            )}
            <button onClick={() => setPage('chat')} style={{width:'40px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',border:'none',background:'transparent',cursor:'pointer',fontSize:'22px'}}>💬</button>
          </div>
        </div>
      </div>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'16px 24px'}}>
        <div style={{position:'relative',marginBottom:'24px'}}>
          <span style={{position:'absolute',left:'16px',top:'50%',transform:'translateY(-50%)',fontSize:'20px'}}>🔍</span>
          <input placeholder={lang==='FR'?'Chercher un produit...':'Search product...'} style={{width:'100%',paddingLeft:'48px',paddingRight:'80px',paddingTop:'16px',paddingBottom:'16px',background:'#e4e2dd',border:'none',borderRadius:'16px',fontSize:'16px',outline:'none',boxSizing:'border-box'}}/>
          <div style={{position:'absolute',right:'16px',top:'50%',transform:'translateY(-50%)',display:'flex',gap:'8px',alignItems:'center'}}>
            <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:'#012d1d'}}>🎤</button>
          </div>
        </div>

        <div style={{display:'flex',gap:'12px',overflowX:'auto',paddingBottom:'8px',marginBottom:'32px'}}>
          {['🥦 Légumes','🍊 Fruits','🌾 Céréales','🚚 Livraison'].map((f,i) => (
            <button key={f} style={{whiteSpace:'nowrap',padding:'12px 20px',borderRadius:'16px',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'14px',background:i===0?'#012d1d':'#eae8e3',color:i===0?'white':'#414844'}}>
              {f}
            </button>
          ))}
        </div>

        {chargement ? (
          <div style={{textAlign:'center',padding:'60px',color:'#717973'}}>
            <p style={{fontSize:'40px',marginBottom:'16px'}}>⏳</p>
            <p style={{fontWeight:'bold'}}>Chargement des produits...</p>
          </div>
        ) : (
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',gap:'24px'}}>
            {listeProduits.map((p: any) => (
              <div key={p.id} style={{background:'white',borderRadius:'32px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid #f0eee9',transition:'transform 0.2s'}}
                onMouseEnter={e => (e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e => (e.currentTarget.style.transform='translateY(0)')}>
                <div style={{position:'relative',height:'220px',overflow:'hidden',background:'#f0eee9'}}>
                  {p.img || p.photo ? (
                    <img src={p.img || p.photo} alt={p.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  ) : (
                    <div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'64px',background:'linear-gradient(135deg,#d8f3dc,#a8d5b5)'}}>🌿</div>
                  )}
                  {p.certifie && <div style={{position:'absolute',top:'12px',left:'12px',background:'rgba(255,255,255,0.9)',padding:'5px 10px',borderRadius:'50px',fontSize:'11px',fontWeight:'900',border:'1px solid #fbbf24',color:'#012d1d'}}>⭐ Certifié</div>}
                  <div style={{position:'absolute',bottom:'12px',left:'12px',background:p.est_disponible&&p.quantite_disponible>0?'#22c55e':'#ef4444',color:'white',padding:'3px 10px',borderRadius:'50px',fontSize:'10px',fontWeight:'bold'}}>
                    {p.est_disponible&&p.quantite_disponible>0?'✅ EN STOCK':'❌ ÉPUISÉ'}
                  </div>
                </div>
                <div style={{padding:'20px'}}>
                  <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'18px',margin:'0 0 4px'}}>{p.nom}</h3>
                  <p style={{fontSize:'12px',color:'#717973',margin:'0 0 12px'}}>{p.description}</p>
                  <div style={{display:'flex',alignItems:'baseline',gap:'4px',marginBottom:'12px'}}>
                    <span style={{fontSize:'26px',fontWeight:'900',color:'#4b6546'}}>{p.prix?.toLocaleString()}</span>
                    <span style={{fontSize:'13px',fontWeight:'bold',color:'#4b6546'}}>FCFA/kg</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'12px',borderTop:'1px solid rgba(193,200,194,0.3)',marginBottom:p.est_disponible&&p.quantite_disponible>0?'12px':'0'}}>
                    <span style={{fontSize:'12px',fontWeight:'bold',color:'#414844'}}>📍 {p.localisation}</span>
                    <span style={{fontSize:'12px',fontWeight:'bold',background:'#ffdfa0',color:'#261a00',padding:'3px 8px',borderRadius:'8px'}}>⭐ {p.note_globale||'N/A'}</span>
                  </div>
                  {p.est_disponible&&p.quantite_disponible>0 && (
                    <button onClick={() => {
                      if (!utilisateur) { showToast('⚠️ Connecte-toi pour commander !'); setPage('connexion'); return; }
                      setPage('panier');
                    }} style={{width:'100%',padding:'12px',background:'#012d1d',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>
                      🛒 Commander
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {listeProduits.length === 0 && !chargement && (
          <div style={{textAlign:'center',padding:'60px 20px',color:'#aaa'}}>
            <p style={{fontSize:'48px',marginBottom:'16px'}}>🌿</p>
            <p style={{fontWeight:'700',fontSize:'18px',marginBottom:'8px'}}>Aucun produit pour l'instant</p>
            <p style={{fontSize:'14px',marginBottom:'24px'}}>Sois le premier à publier un produit !</p>
            {utilisateur?.role === 'producteur' && (
              <button onClick={() => setPage('ajouter')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'14px',padding:'14px 28px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>
                ➕ Publier un produit
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{position:'fixed',bottom:'96px',left:0,width:'100%',display:'flex',justifyContent:'center',zIndex:40}}>
        <button onClick={() => chargerProduits()} style={{background:'#012d1d',color:'white',padding:'16px 32px',borderRadius:'50px',fontWeight:'900',fontSize:'16px',border:'none',cursor:'pointer',boxShadow:'0 8px 30px rgba(1,45,29,0.4)'}}>
          🔄 {lang==='FR'?'Actualiser':'Refresh'} ({listeProduits.length})
        </button>
      </div>
      <Nav actif="marketplace"/>
    </div>
  );

  // ── PRODUCTEUR ────────────────────────────────────────────
  if (page === 'producteur') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'100px'}}>
      <Toast/>
      <div style={{background:'#fbf9f4',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'#1b4332',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'18px'}}>
              {utilisateur?.nom?.[0]?.toUpperCase() || 'P'}
            </div>
            <div>
              <span style={{display:'block',fontSize:'11px',fontWeight:'600',color:'#717973',textTransform:'uppercase',letterSpacing:'2px'}}>Producteur</span>
              <h1 style={{color:'#012d1d',fontWeight:'bold',fontSize:'18px',margin:0}}>Bonjour, {utilisateur?.nom || 'Producteur'} 👋</h1>
            </div>
          </div>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'22px'}}>🔔</button>
        </div>
      </div>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'16px 24px',display:'flex',flexDirection:'column',gap:'24px'}}>
        <div style={{background:'#cdebc4',padding:'20px',borderRadius:'24px',display:'flex',alignItems:'center',gap:'16px',cursor:'pointer'}}>
          <div style={{width:'56px',height:'56px',background:'white',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>🔊</div>
          <div>
            <p style={{fontSize:'11px',fontWeight:'bold',textTransform:'uppercase',letterSpacing:'2px',opacity:0.7,margin:'0 0 4px'}}>Conseil du jour</p>
            <p style={{fontSize:'16px',fontWeight:'900',color:'#012d1d',margin:0}}>Vos capteurs indiquent une humidité de 15% — Irriguer ce soir !</p>
          </div>
        </div>

        <div>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:'16px'}}>
            <h2 style={{fontSize:'20px',fontWeight:'900',color:'#012d1d',margin:0}}>État de la Parcelle A</h2>
            <span style={{fontSize:'10px',color:'#717973',textTransform:'uppercase'}}>5m ago</span>
          </div>
          <div style={{background:'#f5f3ee',padding:'24px',borderRadius:'32px',display:'flex',alignItems:'center',justifyContent:'space-between',borderLeft:'8px solid #ba1a1a',marginBottom:'16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
              <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'#ba1a1a',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>💧</div>
              <div>
                <p style={{fontSize:'12px',fontWeight:'bold',color:'#717973',textTransform:'uppercase',margin:'0 0 4px'}}>Humidité Sol</p>
                <p style={{fontSize:'32px',fontWeight:'900',color:'#012d1d',margin:0}}>15.2%</p>
              </div>
            </div>
            <span style={{padding:'4px 12px',borderRadius:'50px',background:'rgba(186,26,26,0.1)',color:'#ba1a1a',fontSize:'10px',fontWeight:'900',textTransform:'uppercase'}}>⚠️ Action Requise</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
            {[{i:'🌡️',l:'Temp. Sol',v:'28.4°C',c:'#22c55e',s:'Optimal ✅',tc:'#16a34a'},{i:'🧪',l:'pH',v:'6.8',c:'#f59e0b',s:'À surveiller',tc:'#d97706'}].map(x => (
              <div key={x.l} style={{background:'#f5f3ee',padding:'20px',borderRadius:'32px',borderTop:`8px solid ${x.c}`}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                  <span style={{fontSize:'28px'}}>{x.i}</span>
                  <span style={{width:'12px',height:'12px',borderRadius:'50%',background:x.c,display:'inline-block'}}/>
                </div>
                <p style={{fontSize:'10px',fontWeight:'bold',color:'#717973',textTransform:'uppercase',margin:'0 0 4px'}}>{x.l}</p>
                <p style={{fontSize:'24px',fontWeight:'900',color:'#012d1d',margin:'0 0 8px'}}>{x.v}</p>
                <p style={{fontSize:'10px',fontWeight:'bold',color:x.tc,margin:0}}>{x.s}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <button onClick={() => setPage('ajouter')} style={{aspectRatio:'1',background:'#012d1d',color:'white',borderRadius:'32px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px',border:'none',cursor:'pointer',boxShadow:'0 8px 30px rgba(1,45,29,0.2)'}}>
            <span style={{fontSize:'40px'}}>➕</span>
            <span style={{fontWeight:'bold',textAlign:'center'}}>Publier un produit</span>
          </button>
          <button onClick={() => setPage('livraison')} style={{aspectRatio:'1',background:'white',borderRadius:'32px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'16px',border:'1px solid #c1c8c2',cursor:'pointer'}}>
            <span style={{fontSize:'40px'}}>📦</span>
            <span style={{fontWeight:'bold',textAlign:'center',color:'#012d1d'}}>Mes commandes</span>
          </button>
        </div>

        <div style={{background:'#f0eee9',padding:'24px',borderRadius:'32px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <h3 style={{fontSize:'11px',fontWeight:'bold',color:'#717973',textTransform:'uppercase',letterSpacing:'2px',margin:0}}>Résumé des Ventes</h3>
            <span>🔒</span>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:'8px',marginBottom:'16px'}}>
            <span style={{fontSize:'32px',fontWeight:'900',color:'#012d1d'}}>1.250.000</span>
            <span style={{fontSize:'12px',fontWeight:'bold',color:'#717973',textTransform:'uppercase'}}>FCFA</span>
          </div>
          <div style={{height:'6px',background:'#d4d0c8',borderRadius:'3px',overflow:'hidden',marginBottom:'8px'}}>
            <div style={{height:'100%',background:'#012d1d',width:'65%',borderRadius:'3px'}}/>
          </div>
          <p style={{fontSize:'11px',color:'#717973',margin:0}}>65% de votre objectif mensuel atteint</p>
        </div>

        <button onClick={seDeconnecter} style={{padding:'14px',background:'transparent',color:'#c0392b',border:'1px solid #c0392b',borderRadius:'14px',cursor:'pointer',fontWeight:'bold',fontSize:'14px'}}>
          Se déconnecter
        </button>
      </div>
      <Nav actif="producteur"/>
    </div>
  );

  // ── PROFIL ────────────────────────────────────────────────
  if (page === 'profil') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'120px'}}>
      <Toast/>
      <div style={{background:'#fbf9f4',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px'}}>
          <span style={{color:'#012d1d',fontWeight:'900',fontSize:'24px',letterSpacing:'-1px'}}>AGRINOVA</span>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'22px'}}>🔔</button>
        </div>
      </div>
      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'0 16px'}}>
        <div style={{position:'relative',borderRadius:'32px',overflow:'hidden',aspectRatio:'16/7',background:'#eae8e3'}}>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuARYiDEhU0Qj4GZ5JGJ2oTEtT_ER0dOHF8BxwwoHtWNEHUNJLn2lO7O_T7eyEKrARC0_3Fhp2Q3Bja3MXJBMoDLHKmk0CZNYLR2_9CGhliUI-wgDlWgIRSziowqhuGlmh1V_nI27ky3D_rxhs4Uzx0RlVII3Qt5Y_pg128kDW8GX0pvG5l17V9dGRBbaDZhTBnE-SkmS7iHXS6_S8gs_H78QlOv0_sBtk2kGCIbo5znpgnVBycE7iAO0vz0n-awWlw8H3jwz6LeaP4H" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(1,45,29,0.6),transparent)'}}/>
        </div>
        <div style={{padding:'0 24px',marginTop:'-64px',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'16px',marginBottom:'24px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{width:'128px',height:'128px',borderRadius:'24px',border:'4px solid white',overflow:'hidden',boxShadow:'0 8px 30px rgba(0,0,0,0.2)',background:'#1b4332',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'48px'}}>
              {utilisateur?.nom?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 style={{fontSize:'28px',fontWeight:'900',color:'#012d1d',letterSpacing:'-1px',margin:0}}>{utilisateur?.nom || 'Mon Profil'}</h1>
              <p style={{color:'#717973',fontWeight:'500',margin:'4px 0 0'}}>📍 {utilisateur?.localisation || 'Sénégal'}</p>
            </div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={() => setPage('chat')} style={{background:'#012d1d',color:'white',padding:'12px 32px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',fontSize:'16px'}}>Messages</button>
            <button onClick={seDeconnecter} style={{background:'#fde8e8',color:'#c0392b',padding:'12px 24px',borderRadius:'12px',fontWeight:'bold',border:'none',cursor:'pointer',fontSize:'14px'}}>Déconnexion</button>
          </div>
        </div>
        {utilisateur && (
          <div style={{padding:'0 24px',marginBottom:'24px'}}>
            <div style={{background:'#f5f3ee',borderRadius:'24px',padding:'20px',display:'flex',gap:'24px',justifyContent:'center'}}>
              {[{v:utilisateur.role==='producteur'?'🚜':'🛒',l:utilisateur.role==='producteur'?'Producteur':'Acheteur'},{v:'⭐ 0.0',l:'Note'},{v:'0',l:'Commandes'}].map((s,i) => (
                <div key={i} style={{textAlign:'center'}}>
                  <p style={{fontSize:'20px',fontWeight:'900',color:'#012d1d',margin:0}}>{s.v}</p>
                  <p style={{fontSize:'11px',textTransform:'uppercase',letterSpacing:'1px',color:'#717973',margin:'4px 0 0'}}>{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!utilisateur && (
          <div style={{padding:'40px 24px',textAlign:'center'}}>
            <p style={{fontSize:'48px',marginBottom:'16px'}}>👤</p>
            <h2 style={{color:'#012d1d',marginBottom:'8px'}}>Connecte-toi pour voir ton profil</h2>
            <button onClick={() => setPage('connexion')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'14px',padding:'14px 28px',fontWeight:'bold',cursor:'pointer',fontSize:'16px',marginTop:'16px'}}>
              Se connecter
            </button>
          </div>
        )}
      </div>
      <Nav actif="profil"/>
    </div>
  );

  // ── CHAT ──────────────────────────────────────────────────
  if (page === 'chat') return (
    <div style={{height:'100vh',background:'#fbf9f4',display:'flex',flexDirection:'column'}}>
      <Toast/>
      <div style={{background:'white',padding:'16px 24px',display:'flex',alignItems:'center',gap:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',flexShrink:0}}>
        <button onClick={() => setPage('marketplace')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
        <div style={{width:'40px',height:'40px',borderRadius:'50%',overflow:'hidden',background:'#eae8e3',flexShrink:0}}>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOWXx1wjM1nkHElV0AyKpeZN0A_uV81LAdAgeawM2e6JzzOZzX-2BQVilybDmqFgTMJ8mcMACWNu8r11pilus21ubhmeXejg4g5kdbjIut0cEZRV7duwn6cL9clE-6qy71s6xZWQ2FDTftIMANZpKni7GvvOYweZmW-F39Z1hTQBVqSxCtfDat9a2Ym6PrYn_7Era0tazFdbecuTf_AluwXvJ76laCSR4d_9YCI6jNCUBBfy6qFn1NUW5ybeVN3mL93sYQAPXlMilV" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
        </div>
        <div style={{flex:1}}>
          <p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:0}}>Aminata Sarr</p>
          <p style={{color:'#22c55e',fontSize:'12px',fontWeight:'600',margin:0}}>🟢 En ligne</p>
        </div>
        <button style={{background:'#012d1d',color:'white',border:'none',borderRadius:'12px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold',fontSize:'13px'}}>📞 Appeler</button>
      </div>
      <div style={{flex:1,display:'flex',overflow:'hidden'}}>
        <div style={{width:'260px',background:'white',borderRight:'1px solid #f0eee9',overflowY:'auto',flexShrink:0}}>
          <div style={{padding:'16px',borderBottom:'1px solid #f0eee9'}}>
            <p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:0}}>💬 Messages</p>
          </div>
          {[
            {id:1,nom:'Aminata Sarr',msg:'Je veux 10kg...',heure:'09:20',nonLu:2,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDOWXx1wjM1nkHElV0AyKpeZN0A_uV81LAdAgeawM2e6JzzOZzX-2BQVilybDmqFgTMJ8mcMACWNu8r11pilus21ubhmeXejg4g5kdbjIut0cEZRV7duwn6cL9clE-6qy71s6xZWQ2FDTftIMANZpKni7GvvOYweZmW-F39Z1hTQBVqSxCtfDat9a2Ym6PrYn_7Era0tazFdbecuTf_AluwXvJ76laCSR4d_9YCI6jNCUBBfy6qFn1NUW5ybeVN3mL93sYQAPXlMilV'},
            {id:2,nom:'Moussa Ba',msg:'Commande passée ✅',heure:'Hier',nonLu:0,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDvcRfgyU7MMvrz_s_Ogqj0vVvASK1DJfK3o4wSQvUcdwYZ3jik7_RkAjCVzXIJPABdOjyPj9p7o0rhwLQDck7rOzrupZekUaXz11LXjtaP-3uT07Sv_tYWig79qGeUNw1sqjjxWFaKTOEHdh_U5zEHBHH3CNBUlAK4PXfVxEJW3eZtkF-RdOYN31oqblPXhg1y1DAJQQ_0Ab1aEaM7WY0uxuNkZPPRWjHX1rM8dnDcWpTW89XDERcY1_c1GdvmK8uDE3UcdVM630DT'},
          ].map(c => (
            <div key={c.id} style={{padding:'14px 16px',display:'flex',gap:'10px',alignItems:'center',cursor:'pointer',borderBottom:'1px solid #f9f8f6',background:c.id===1?'#f0faf3':'white'}}>
              <div style={{position:'relative',flexShrink:0}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',overflow:'hidden',background:'#eae8e3'}}>
                  <img src={c.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>
                {c.nonLu>0&&<span style={{position:'absolute',top:'-2px',right:'-2px',background:'#ef4444',color:'white',borderRadius:'50%',width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'bold'}}>{c.nonLu}</span>}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}>
                  <p style={{fontWeight:'800',color:'#012d1d',fontSize:'13px',margin:0}}>{c.nom}</p>
                  <span style={{fontSize:'10px',color:'#717973'}}>{c.heure}</span>
                </div>
                <p style={{fontSize:'12px',color:'#717973',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.msg}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{flex:1,overflowY:'auto',padding:'20px',display:'flex',flexDirection:'column',gap:'12px',background:'#f9f8f6'}}>
            {messages.map(m => (
              <div key={m.id} style={{display:'flex',justifyContent:m.moi?'flex-end':'flex-start',alignItems:'flex-end',gap:'8px'}}>
                {!m.moi&&<div style={{width:'28px',height:'28px',borderRadius:'50%',overflow:'hidden',background:'#eae8e3',flexShrink:0}}>
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOWXx1wjM1nkHElV0AyKpeZN0A_uV81LAdAgeawM2e6JzzOZzX-2BQVilybDmqFgTMJ8mcMACWNu8r11pilus21ubhmeXejg4g5kdbjIut0cEZRV7duwn6cL9clE-6qy71s6xZWQ2FDTftIMANZpKni7GvvOYweZmW-F39Z1hTQBVqSxCtfDat9a2Ym6PrYn_7Era0tazFdbecuTf_AluwXvJ76laCSR4d_9YCI6jNCUBBfy6qFn1NUW5ybeVN3mL93sYQAPXlMilV" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                </div>}
                <div style={{maxWidth:'65%'}}>
                  <div style={{padding:'12px 16px',borderRadius:m.moi?'20px 20px 4px 20px':'20px 20px 20px 4px',background:m.moi?'#012d1d':'white',color:m.moi?'white':'#1b1c19',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',fontSize:'14px',lineHeight:'1.5'}}>{m.texte}</div>
                  <div style={{display:'flex',justifyContent:m.moi?'flex-end':'flex-start',gap:'4px',marginTop:'3px'}}>
                    <span style={{fontSize:'10px',color:'#717973'}}>{m.heure}</span>
                    {m.moi&&<span style={{fontSize:'10px',color:m.lu?'#22c55e':'#717973'}}>{m.lu?'✓✓':'✓'}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{padding:'12px 16px',background:'white',borderTop:'1px solid #f0eee9',display:'flex',gap:'10px',alignItems:'center',flexShrink:0}}>
            <div style={{flex:1,display:'flex',alignItems:'center',background:'#f0eee9',borderRadius:'24px',padding:'4px 16px'}}>
              <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key==='Enter'&&envoyer()}
                placeholder="Écrire un message..."
                style={{flex:1,background:'none',border:'none',outline:'none',fontSize:'14px',color:'#1b1c19',padding:'10px 0'}}/>
              <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#012d1d'}}>🎤</button>
            </div>
            <button onClick={envoyer} style={{width:'44px',height:'44px',borderRadius:'50%',background:'#012d1d',color:'white',border:'none',cursor:'pointer',fontSize:'18px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>➤</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── BOT ───────────────────────────────────────────────────
  if (page === 'bot') return (
    <div style={{height:'100vh',background:'linear-gradient(180deg,#012d1d 0%,#1b4332 30%,#fbf9f4 100%)',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
        <button onClick={() => setPage('marketplace')} style={{background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',fontSize:'20px',color:'white',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div style={{flex:1,textAlign:'center'}}>
          <p style={{color:'white',fontWeight:'900',fontSize:'18px',margin:0}}>🤖 AgrinovaBot</p>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'12px',margin:0}}>Votre assistant agricole IA</p>
        </div>
        <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🌾</div>
      </div>
      <div style={{flex:1,overflowY:'auto',padding:'0 20px 20px',display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{textAlign:'center',padding:'20px 0'}}>
          <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px',margin:'0 auto 12px'}}>🤖</div>
          <p style={{color:'white',fontWeight:'700',fontSize:'16px',margin:'0 0 4px'}}>AgrinovaBot</p>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',margin:0}}>
            {utilisateur ? `Bonjour ${utilisateur.nom} ! Comment puis-je vous aider ?` : "Comment puis-je vous aider aujourd'hui ?"}
          </p>
        </div>
        {[
          {t:"Bonjour ! Je suis AgrinovaBot 🌱 Je peux vous aider sur les cultures, les prix du marché, la météo et bien plus."},
          {t:"💡 Conseil du jour : Les tomates ont besoin de 6-8 litres d'eau par plante. Avec 15% d'humidité, pensez à irriguer ce soir !"},
        ].map((m,i) => (
          <div key={i} style={{display:'flex',gap:'10px',alignItems:'flex-end'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'#cdebc4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>🤖</div>
            <div style={{maxWidth:'80%',background:'white',padding:'14px 18px',borderRadius:'20px 20px 20px 4px',boxShadow:'0 4px 16px rgba(0,0,0,0.1)',fontSize:'14px',lineHeight:'1.6',color:'#1b1c19'}}>{m.t}</div>
          </div>
        ))}
      </div>
      <div style={{background:'white',borderRadius:'32px 32px 0 0',padding:'20px',flexShrink:0}}>
        <div style={{display:'flex',gap:'8px',overflowX:'auto',marginBottom:'16px',paddingBottom:'4px'}}>
          {['💧 Irrigation','🌡️ Météo','💰 Prix marché','🐛 Maladies','📅 Calendrier'].map(s => (
            <button key={s} style={{whiteSpace:'nowrap',padding:'10px 18px',borderRadius:'50px',border:'2px solid #e4e2dd',background:'white',cursor:'pointer',fontSize:'13px',fontWeight:'bold',color:'#012d1d',flexShrink:0}}
              onMouseEnter={e => {e.currentTarget.style.background='#012d1d';e.currentTarget.style.color='white'}}
              onMouseLeave={e => {e.currentTarget.style.background='white';e.currentTarget.style.color='#012d1d'}}>
              {s}
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
          <div style={{flex:1,display:'flex',alignItems:'center',background:'#f0eee9',borderRadius:'24px',padding:'4px 16px'}}>
            <input placeholder="Posez votre question..." style={{flex:1,background:'none',border:'none',outline:'none',fontSize:'14px',color:'#1b1c19',padding:'12px 0'}}/>
            <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:'#012d1d'}}>🎤</button>
          </div>
          <button style={{width:'48px',height:'48px',borderRadius:'50%',background:'#012d1d',color:'white',border:'none',cursor:'pointer',fontSize:'20px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>➤</button>
        </div>
      </div>
    </div>
  );

  // ── PANIER ────────────────────────────────────────────────
  if (page === 'panier') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'40px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={() => setPage('marketplace')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',margin:0}}>🛒 Mon Panier</h1>
        </div>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px'}}>
        <div style={{background:'white',borderRadius:'24px',padding:'20px',marginBottom:'16px',display:'flex',gap:'16px',alignItems:'center',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{width:'80px',height:'80px',borderRadius:'16px',overflow:'hidden',flexShrink:0,background:'#f0eee9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'40px'}}>🍅</div>
          <div style={{flex:1}}>
            <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 4px'}}>Tomates de Thiès</h3>
            <p style={{color:'#717973',fontSize:'13px',margin:'0 0 8px'}}>Moussa Diop • Thiès</p>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#f0eee9',borderRadius:'12px',padding:'4px 12px'}}>
                <button style={{background:'none',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'18px',color:'#012d1d'}}>−</button>
                <span style={{fontWeight:'bold',color:'#012d1d'}}>10</span>
                <button style={{background:'none',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'18px',color:'#012d1d'}}>+</button>
              </div>
              <span style={{fontWeight:'900',color:'#012d1d',fontSize:'18px'}}>3 500 FCFA</span>
            </div>
          </div>
        </div>

        <div style={{background:'white',borderRadius:'24px',padding:'20px',marginBottom:'16px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>📍 Adresse de livraison</h3>
          <input placeholder="Ex: Dakar Plateau, Rue de Thiong..." style={{width:'100%',padding:'14px 16px',background:'#f0eee9',border:'none',borderRadius:'14px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
        </div>

        <div style={{background:'white',borderRadius:'24px',padding:'20px',marginBottom:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>📋 Récapitulatif</h3>
          {[{l:'Sous-total',v:'3 500 FCFA'},{l:'Livraison',v:'500 FCFA'},{l:'Commission (3%)',v:'105 FCFA'}].map(r => (
            <div key={r.l} style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
              <span style={{color:'#717973',fontSize:'14px'}}>{r.l}</span>
              <span style={{fontWeight:'bold',color:'#012d1d',fontSize:'14px'}}>{r.v}</span>
            </div>
          ))}
          <div style={{borderTop:'2px solid #f0eee9',paddingTop:'12px',display:'flex',justifyContent:'space-between'}}>
            <span style={{fontWeight:'900',color:'#012d1d',fontSize:'18px'}}>TOTAL</span>
            <span style={{fontWeight:'900',color:'#012d1d',fontSize:'24px'}}>4 105 FCFA</span>
          </div>
        </div>

        <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',marginBottom:'16px'}}>💳 Choisir le paiement</h3>
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {[
            {icon:'📱',nom:'Wave',couleur:'#1a56db',sub:'Paiement instantané'},
            {icon:'🟠',nom:'Orange Money',couleur:'#ff6b00',sub:'Disponible 24h/24'},
            {icon:'🤝',nom:'Paiement à la livraison',couleur:'#012d1d',sub:'Payez en recevant'},
          ].map((p,i) => (
            <button key={p.nom}
              onClick={() => {
                if (!utilisateur) { showToast('⚠️ Connecte-toi pour passer commande !'); setPage('connexion'); return; }
                showToast(`✅ Commande via ${p.nom} ! N° AG-${Math.floor(Math.random()*10000)}`);
                setTimeout(() => setPage('livraison'), 2000);
              }}
              style={{padding:'16px 20px',borderRadius:'16px',border:`2px solid ${i===0?p.couleur:'#e4e2dd'}`,background:i===0?`${p.couleur}15`:'white',cursor:'pointer',display:'flex',alignItems:'center',gap:'16px',textAlign:'left'}}>
              <span style={{fontSize:'28px'}}>{p.icon}</span>
              <div>
                <p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:0}}>{p.nom}</p>
                <p style={{color:'#717973',fontSize:'12px',margin:0}}>{p.sub}</p>
              </div>
              {i===0&&<span style={{marginLeft:'auto',background:p.couleur,color:'white',padding:'4px 12px',borderRadius:'50px',fontSize:'11px',fontWeight:'bold'}}>Recommandé</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // ── LIVRAISON ─────────────────────────────────────────────
  if (page === 'livraison') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'40px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={() => setPage('marketplace')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <div>
            <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'18px',margin:0}}>📦 Suivi de Livraison</h1>
            <p style={{color:'#717973',fontSize:'12px',margin:0}}>Commande #AG-8821</p>
          </div>
          <div style={{marginLeft:'auto',background:'#cdebc4',color:'#012d1d',padding:'6px 14px',borderRadius:'50px',fontWeight:'bold',fontSize:'12px'}}>⏱ 14:30</div>
        </div>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px',display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={{borderRadius:'32px',overflow:'hidden',height:'200px',background:'linear-gradient(135deg,#cdebc4,#a8d5b5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:'48px',marginBottom:'8px'}}>🗺️</div>
            <p style={{fontWeight:'bold',color:'#012d1d',margin:0}}>Plateau, Avenue Marchand</p>
            <p style={{color:'#4b6546',fontSize:'13px',margin:0}}>📍 Position actuelle du livreur</p>
          </div>
        </div>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontWeight:'900',color:'#012d1d',margin:'0 0 24px'}}>Statut de la commande</h3>
          {[
            {icon:'✅',label:'Commande validée',heure:'09:15',fait:true},
            {icon:'📦',label:'En cours de préparation',heure:'10:45',fait:true},
            {icon:'🚚',label:'En route',heure:'11:30 (En cours)',fait:true,actif:true},
            {icon:'🏠',label:'Livré',heure:'Prévu 14:30',fait:false},
          ].map((s,i) => (
            <div key={s.label} style={{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:i<3?'20px':'0'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'50%',background:s.fait?'#012d1d':'#e4e2dd',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0,boxShadow:s.actif?'0 0 0 4px rgba(193,236,212,0.5)':'none'}}>
                  {s.fait?s.icon:'○'}
                </div>
                {i<3&&<div style={{width:'2px',height:'20px',background:s.fait?'#012d1d':'#e4e2dd',marginTop:'4px'}}/>}
              </div>
              <div style={{paddingTop:'10px'}}>
                <p style={{fontWeight:'bold',color:s.fait?'#012d1d':'#717973',fontSize:'15px',margin:'0 0 2px'}}>{s.label}</p>
                <p style={{color:'#717973',fontSize:'12px',margin:0}}>{s.heure}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:'#1b4332',borderRadius:'24px',padding:'20px',display:'flex',gap:'16px',alignItems:'center',color:'white'}}>
          <div style={{width:'64px',height:'64px',borderRadius:'16px',overflow:'hidden',flexShrink:0,background:'#cdebc4'}}>
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcDKsTDd1mmJznDJKcv4GRFYiI2V6-E25Qfr_v457uLbjIlDBksrbm6GdrM92Xn3DaqthfCEgGFy92wZYFjusrepsC-vxPVYkf4FSICY4N-QEwpLSqcis7QmWeJEjySQKK5OQfqjVg7ZnQVUKPywjxn0stnzAWVbucLI1VoLavQtRyT3ix9kKQmRtPT3dGq_LFdWJN2nXtAJ-awY2NhIAxBGcK4UBSRmTdgY8hdTj9sWTeefqMBROsujYMnYKEOnBZwZffRgMfEf8y" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
          <div style={{flex:1}}>
            <p style={{fontWeight:'900',fontSize:'16px',margin:'0 0 2px'}}>Moussa Traoré</p>
            <p style={{color:'rgba(255,255,255,0.7)',fontSize:'12px',margin:'0 0 8px'}}>Livreur certifié ⭐ 4.9</p>
            <div style={{display:'flex',gap:'8px'}}>
              <button style={{background:'white',color:'#012d1d',border:'none',borderRadius:'10px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold',fontSize:'13px'}}>📞 Appeler</button>
              <button style={{background:'rgba(255,255,255,0.15)',color:'white',border:'none',borderRadius:'10px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold',fontSize:'13px'}}>🎤 Vocal</button>
            </div>
          </div>
        </div>
        <button onClick={() => setPage('notation')}
          style={{width:'100%',padding:'20px',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'20px',fontWeight:'900',fontSize:'18px',cursor:'pointer',boxShadow:'0 8px 30px rgba(255,160,0,0.3)'}}>
          ✅ Confirmer la réception
        </button>
      </div>
    </div>
  );

  // ── NOTATION ──────────────────────────────────────────────
  if (page === 'notation') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#012d1d 0%,#fbf9f4 50%)',display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 24px'}}>
      <Toast/>
      {noteEnvoyee ? (
        <div style={{textAlign:'center',marginTop:'80px'}}>
          <div style={{fontSize:'80px',marginBottom:'24px'}}>🎉</div>
          <h2 style={{color:'#012d1d',fontWeight:'900',fontSize:'28px',marginBottom:'12px'}}>Merci pour votre avis !</h2>
          <p style={{color:'#717973',fontSize:'16px',marginBottom:'40px'}}>Votre note aide la communauté Agrinova 🌾</p>
          <button onClick={() => setPage('marketplace')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'16px',padding:'16px 40px',fontWeight:'900',fontSize:'18px',cursor:'pointer'}}>
            Retour au marché →
          </button>
        </div>
      ) : (
        <>
          <div style={{textAlign:'center',marginBottom:'32px'}}>
            <h1 style={{color:'white',fontWeight:'900',fontSize:'28px',margin:'0 0 8px'}}>⭐ Évaluer votre commande</h1>
            <p style={{color:'rgba(255,255,255,0.7)',fontSize:'15px',margin:0}}>Commande #AG-8821 • Tomates de Thiès</p>
          </div>
          <div style={{background:'white',borderRadius:'32px',padding:'32px',width:'100%',maxWidth:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'80px',height:'80px',borderRadius:'50%',overflow:'hidden',margin:'0 auto 12px',background:'#1b4332',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'32px',fontWeight:'bold'}}>M</div>
              <p style={{fontWeight:'900',color:'#012d1d',fontSize:'18px',margin:0}}>Moussa Diop</p>
              <p style={{color:'#717973',fontSize:'13px',margin:0}}>Producteur • Thiès</p>
            </div>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <p style={{fontWeight:'bold',color:'#012d1d',fontSize:'15px',marginBottom:'16px'}}>
                {noteEtoile===0?'Touchez une étoile':noteEtoile===5?'Excellent ! 🎉':noteEtoile>=4?'Très bien ! 😊':'Merci 👍'}
              </p>
              <div style={{display:'flex',justifyContent:'center',gap:'8px'}}>
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setNoteEtoile(n)}
                    style={{fontSize:'44px',background:'none',border:'none',cursor:'pointer',transform:noteEtoile>=n?'scale(1.1)':'scale(1)',transition:'transform 0.15s'}}>
                    {noteEtoile>=n?'⭐':'☆'}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
              placeholder="Laissez un commentaire (optionnel)..."
              style={{width:'100%',padding:'14px 16px',background:'#f0eee9',border:'none',borderRadius:'16px',fontSize:'14px',outline:'none',resize:'none',height:'100px',boxSizing:'border-box',marginBottom:'20px',fontFamily:'inherit'}}/>
            <button onClick={() => {
              if (noteEtoile===0) { showToast('⚠️ Choisissez une note !'); return; }
              setNoteEnvoyee(true);
            }} style={{width:'100%',padding:'16px',background:noteEtoile>0?'#012d1d':'#ccc',color:'white',border:'none',borderRadius:'16px',fontWeight:'900',fontSize:'18px',cursor:noteEtoile>0?'pointer':'not-allowed'}}>
              Envoyer mon avis ⭐
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ── AJOUTER PRODUIT ───────────────────────────────────────
  if (page === 'ajouter') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'40px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={() => setPage('producteur')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',margin:0}}>➕ Publier un produit</h1>
        </div>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px',display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',textAlign:'center'}}>
          <div style={{width:'120px',height:'120px',borderRadius:'24px',background:'#f0eee9',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',cursor:'pointer',border:'2px dashed #c1c8c2'}}>
            <span style={{fontSize:'36px'}}>📷</span>
            <p style={{fontSize:'12px',color:'#717973',margin:'8px 0 0',fontWeight:'bold'}}>Ajouter photo</p>
          </div>
        </div>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',display:'flex',flexDirection:'column',gap:'16px'}}>
          {[
            {label:'🌾 Nom du produit',placeholder:'Ex: Tomates cerises de Thiès',val:nomProduit,set:setNomProduit},
            {label:'💰 Prix (FCFA/kg)',placeholder:'Ex: 350',val:prixProduit,set:setPrixProduit,type:'number'},
            {label:'📦 Quantité (kg)',placeholder:'Ex: 50',val:qteProduit,set:setQteProduit,type:'number'},
          ].map(f => (
            <div key={f.label}>
              <label style={{display:'block',fontWeight:'bold',color:'#012d1d',fontSize:'14px',marginBottom:'8px'}}>{f.label}</label>
              <input type={f.type||'text'} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                style={{width:'100%',padding:'14px 16px',background:'#f0eee9',border:'none',borderRadius:'14px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
            </div>
          ))}
          <div>
            <label style={{display:'block',fontWeight:'bold',color:'#012d1d',fontSize:'14px',marginBottom:'8px'}}>📍 Localisation</label>
            <input placeholder="Ex: Thiès, Sénégal"
              style={{width:'100%',padding:'14px 16px',background:'#f0eee9',border:'none',borderRadius:'14px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
          </div>
        </div>
        <button onClick={async () => {
          if (!nomProduit||!prixProduit||!qteProduit) { showToast('⚠️ Remplis tous les champs !'); return; }
          setChargement(true);
          try {
            const data = await api('/produits', 'POST', {
              nom: nomProduit,
              prix: parseFloat(prixProduit),
              quantite_disponible: parseInt(qteProduit),
              localisation: 'Sénégal',
              categorie: 'Légumes',
            });
            if (data.produit || data.message) {
              showToast(`✅ "${nomProduit}" publié sur le marketplace ! 🌾`);
              setNomProduit(''); setPrixProduit(''); setQteProduit('');
              setTimeout(() => setPage('marketplace'), 2000);
            } else {
              showToast('❌ Erreur : ' + (data.detail || 'Essaie encore'));
            }
          } catch {
            showToast('❌ Impossible de contacter le serveur');
          }
          setChargement(false);
        }}
          style={{width:'100%',padding:'20px',background:'#012d1d',color:'white',border:'none',borderRadius:'20px',fontWeight:'900',fontSize:'18px',cursor:'pointer',boxShadow:'0 8px 30px rgba(1,45,29,0.3)'}}>
          {chargement ? '⏳ Publication...' : '🌾 Publier sur le Marketplace'}
        </button>
      </div>
    </div>
  );

  return null;
}