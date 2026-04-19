import { useState, useEffect } from 'react';

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

type Page = 'onboarding'|'inscription'|'connexion'|'marketplace'|'producteur'|'profil'|'chat'|'bot'|'panier'|'livraison'|'notation'|'ajouter'|'produit'|'mes-commandes'|'gestion-produits';

const REPONSES_BOT: Record<string, string> = {
  'Irrigation': `💧 Conseil irrigation :\n\n• Tomates : 6-8L/plante/semaine\n• Oignons : 4-6L/plante/semaine\n• Mil : 3-4L/m²/semaine\n\n⚠️ Avec une humidité < 20%, irriguez immédiatement tôt le matin pour éviter l'évaporation.\n\n✅ Utilisez le goutte-à-goutte pour économiser 40% d'eau !`,
  'Météo': `🌡️ Météo Sénégal aujourd'hui :\n\n• Dakar : 28°C, vent côtier\n• Thiès : 32°C, ensoleillé\n• Saint-Louis : 35°C, sec\n• Casamance : 30°C, humide\n\n📅 Cette semaine : Saison sèche, pas de pluie prévue.\n⚠️ Protégez vos cultures du vent de l'Est !`,
  'Prix marché': `💰 Prix du marché aujourd'hui :\n\n🍅 Tomates : 300-400 FCFA/kg\n🧅 Oignons : 500-700 FCFA/kg\n🥭 Mangues : 800-1200 FCFA/kg\n🌾 Mil : 250-300 FCFA/kg\n🥜 Arachides : 400-500 FCFA/kg\n🌽 Maïs : 200-250 FCFA/kg\n\n📈 Tendance : Les oignons sont en hausse cette semaine !`,
  'Maladies': `🐛 Maladies courantes et traitements :\n\n🍅 Mildiou (tomates)\n→ Traitement : fongicide cuivrique\n→ Prévention : espacement des plants\n\n🌿 Pucerons\n→ Traitement : savon noir dilué (2%)\n→ Prévention : coccinelles naturelles\n\n🌾 Fusariose\n→ Traitement : rotation des cultures\n→ Prévention : semences certifiées\n\n💡 Inspectez vos plants chaque matin !`,
  'Calendrier': `📅 Calendrier agricole Sénégal :\n\n🌱 Janvier-Mars\nCultures maraîchères, tomates, oignons\n\n☀️ Avril-Juin\nPréparation des sols, semis de mil\n\n🌧️ Juillet-Septembre\nHivernage : mil, sorgho, niébé\n\n🌾 Octobre-Décembre\nRécoltes, arachides, riz\n\n✅ Nous sommes en saison sèche : idéal pour le maraîchage !`,
};

export default function App() {
  const [page, setPage] = useState<Page>('onboarding');
  const [lang, setLang] = useState('FR');
  const [utilisateur, setUtilisateur] = useState<any>(
    JSON.parse(localStorage.getItem('agrinova_user') || 'null')
  );
  const [produits, setProduits] = useState<any[]>([]);
  const [chargement, setChargement] = useState(false);
  const [categorie, setCategorie] = useState('Légumes');
  const [recherche, setRecherche] = useState('');
  const [produitSelectionne, setProduitSelectionne] = useState<any>(null);
  const [panierItems, setPanierItems] = useState<any[]>([]);
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [mesCommandes, setMesCommandes] = useState<any[]>([]);
  const [mesProduits, setMesProduits] = useState<any[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState([
    {id:1,moi:false,texte:'Bonjour ! Vos tomates sont encore disponibles ?',heure:'09:12',lu:true},
    {id:2,moi:true,texte:"Oui, j'ai encore 50kg. Quelle quantité ?",heure:'09:15',lu:true},
  ]);
  const [botMessages, setBotMessages] = useState([
    {bot:true, texte:"Bonjour ! Je suis AgrinovaBot 🌱\n\nJe peux vous aider sur les cultures, les prix du marché, la météo agricole et bien plus.\n\nCliquez sur un sujet ci-dessous ou posez votre question !"},
  ]);
  const [botInput, setBotInput] = useState('');
  const [noteEtoile, setNoteEtoile] = useState(0);
  const [commentaire, setCommentaire] = useState('');
  const [noteEnvoyee, setNoteEnvoyee] = useState(false);
  const [toast, setToast] = useState('');
  const [nomProduit, setNomProduit] = useState('');
  const [prixProduit, setPrixProduit] = useState('');
  const [qteProduit, setQteProduit] = useState('');
  const [descProduit, setDescProduit] = useState('');
  const [locProduit, setLocProduit] = useState('');
  const [catProduit, setCatProduit] = useState('Légumes');
  const [formNom, setFormNom] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMdp, setFormMdp] = useState('');
  const [formRole, setFormRole] = useState('acheteur');
  const [formLoc, setFormLoc] = useState('');
  const [formErreur, setFormErreur] = useState('');
  const [statsProducteur, setStatsProducteur] = useState({
    produits:0, commandes:0, note:0.0, clients:0, revenus:0
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(()=>setToast(''), 3500);
  };

  const chargerProduits = async () => {
    setChargement(true);
    try {
      const data = await api('/produits');
      if (Array.isArray(data)) setProduits(data);
    } catch(e) { console.log('Mode démo'); }
    setChargement(false);
  };

  const chargerStatsProducteur = async () => {
    try {
      const [mp, mc, profil] = await Promise.all([
        api('/mes-produits'), api('/mes-commandes'), api('/auth/moi'),
      ]);
      const nbP = Array.isArray(mp)?mp.length:0;
      const nbC = Array.isArray(mc)?mc.length:0;
      const rev = Array.isArray(mc)?mc.reduce((s:number,c:any)=>s+(c.montant_total||0),0):0;
      const cli = Array.isArray(mc)?new Set(mc.map((c:any)=>c.acheteur_id)).size:0;
      setStatsProducteur({produits:nbP,commandes:nbC,note:profil.note_globale||0.0,clients:cli,revenus:rev});
      if (Array.isArray(mp)) setMesProduits(mp);
    } catch(e) {}
  };

  const chargerMesCommandes = async () => {
    setChargement(true);
    try {
      const data = await api('/mes-commandes');
      if (Array.isArray(data)) setMesCommandes(data);
    } catch(e) {}
    setChargement(false);
  };

  useEffect(()=>{
    if (page==='marketplace') chargerProduits();
    if (page==='producteur'&&utilisateur) chargerStatsProducteur();
    if (page==='mes-commandes'&&utilisateur) chargerMesCommandes();
    if (page==='gestion-produits'&&utilisateur) chargerStatsProducteur();
  },[page]);

  const seDeconnecter = () => {
    localStorage.removeItem('agrinova_token');
    localStorage.removeItem('agrinova_user');
    setUtilisateur(null);
    setPage('onboarding');
    showToast('👋 Déconnecté avec succès');
  };

  const envoyer = async () => {
    if (!msgInput.trim()) return;
    const texte = msgInput;
    setMsgInput('');
    setMessages(prev=>[...prev,{
      id:Date.now(), moi:true, texte,
      heure:new Date().toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'}), lu:false
    }]);
    try {
      await api('/messages','POST',{destinataire_id:1, contenu:texte});
    } catch(e) {}
    setTimeout(()=>setMessages(prev=>[...prev,{
      id:Date.now()+1, moi:false,
      texte:'✅ Message reçu ! Je vous réponds rapidement 🌾',
      heure:new Date().toLocaleTimeString('fr',{hour:'2-digit',minute:'2-digit'}), lu:false
    }]),1200);
  };

  const envoyerBot = (question?: string) => {
    const q = question || botInput;
    if (!q.trim()) return;
    setBotInput('');
    setBotMessages(prev=>[...prev,{bot:false, texte:q}]);
    setTimeout(()=>{
      const reponse = REPONSES_BOT[q] ||
        `🌱 Bonne question sur "${q}" !\n\nPour des conseils personnalisés, je vous recommande de :\n• Contacter votre agronome local\n• Appeler le service d'appui agricole (ANCAR)\n• Consulter nos producteurs certifiés sur le marketplace\n\nPuis-je vous aider sur autre chose ?`;
      setBotMessages(prev=>[...prev,{bot:true, texte:reponse}]);
    },800);
  };

  const ajouterAuPanier = (p: any) => {
    if(!utilisateur){showToast('⚠️ Connecte-toi pour commander !');setPage('connexion');return;}
    const existe = panierItems.find((i:any)=>i.id===p.id);
    if(existe){
      setPanierItems(prev=>prev.map((i:any)=>i.id===p.id?{...i,qte:i.qte+1}:i));
    }else{
      setPanierItems(prev=>[...prev,{...p,qte:1}]);
    }
    showToast(`✅ ${p.nom} ajouté au panier !`);
  };

  const totalPanier = panierItems.reduce((s:number,i:any)=>s+(i.prix*i.qte),0);
  const fraisLivraison = panierItems.length>0?500:0;
  const commission = Math.round(totalPanier*0.03);
  const totalFinal = totalPanier+fraisLivraison+commission;

  const produitsDemo = [
    {id:1,nom:'Tomates de Thiès',description:'Récoltées ce matin, fraîches et savoureuses',prix:350,localisation:'Thiès',note_globale:4.8,quantite_disponible:50,est_disponible:true,certifie:true,categorie:'Légumes',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuCa_08BP1sGbXOaRBboTAzvPKJt8IKcRg1raquKfJg80Tf9i6H97egNk4EKSry0u6rmi5cU14PLkBrI2ljb5JQW86hKD4Uv0YzYMq1xs2phSXpXPu0OhDW0Lv6mPMrg4kHqjI2VHmX9gU9VSSwsmVevv60GcIQir6ZOcJ4Z7MRkNsMnPCq_1Glj4yHc0r3mILBfjSSq6vGJm6u4_bvg3_zZAH10UdzL4BTzNvivbyi34yyBzvbvIlDX6I9LSvZCsMB84ovqVZBVDjX4'},
    {id:2,nom:'Oignons de Gandiol',description:'Gros calibre rouge, excellente conservation',prix:600,localisation:'Saint-Louis',note_globale:4.5,quantite_disponible:30,est_disponible:true,certifie:true,categorie:'Légumes',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuA4tAKmwbXmnjjm7HVtq4gicOyBsAxNc2-YjsKBB_ULGudF973i33yABoowF9D-Yn146hwpGphPbLHaoxLoCoPGNwIHrYVOjyVb3vLQ3F5oldAg_blgLUQ3uL2OY0014W04XAS11IcjCNh7-uUz4z9EqYh3Oog3YJGMNfN6accATpKYEf5QMs7KAqPSR9QVGkMbnCpBD5qQSjeEjDefRELL2wVCu6MLp8fuw6QFxcKxMYG6Ss8Ki_3dyiAHk8Ad5TXdr1rM5ef3NVvM'},
    {id:3,nom:'Mangues Kent',description:'Douces & sucrées, parfaites pour jus',prix:1200,localisation:'Casamance',note_globale:4.9,quantite_disponible:0,est_disponible:false,certifie:false,categorie:'Fruits',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuAvmW6dN0Okxa63B6P-8VCknPb19_gy9OKt_5Hn1GjzrTnNwWU4LCu6sG04ylCc7ma2r92SmVbZSz1kbMBPSqX6kdOfq00FNkrYQpoWk6oO47wxIX2NWp-NJN9XNvh286o5OKK7iqb7XLkzFlJsFrbLnIMGFrSrehboMOwUPMDat7_BroQE05IJc0RwpAg-cHEH2xBmziaL09vVT9MBNBX7eVBUmvsqxePoH27cW7omZ3FqkLfSdzzV88ZwkG7FNzrqcCWdHZ9YPy9o'},
    {id:4,nom:'Riz de la Vallée',description:'Sac de 5kg disponible, qualité premium',prix:500,localisation:'Richard Toll',note_globale:4.2,quantite_disponible:100,est_disponible:true,certifie:true,categorie:'Céréales',img:'https://lh3.googleusercontent.com/aida-public/AB6AXuA1q14-9JE_SQXuEZ2shs8EAbGHawtSYmRdinApw_cYHJoLsDVVAUPbTJ80xN97_G6eLMK8KzqvQjshjtPnvBrkuPWk6KwWY1E66ZRLIhLVEWDUGI_CnrH9GcB4wn2o_zBIpOGqWdW8hNGJHLi7XxSF-pFYIeEcmmAfO5YHKpm5EatQRA2rks7CAVbsjWEWxt7tiZ6uNK3cJjzF-clXA0bwRP31tKGRCfBVzmf1SFrNxAiLBRIl2mcGSZJEL7ZOitPqJ6w1elM7qz2M'},
    {id:5,nom:'Arachides du Saloum',description:'Fraîches et croquantes, production locale',prix:450,localisation:'Kaolack',note_globale:4.6,quantite_disponible:80,est_disponible:true,certifie:true,categorie:'Légumineuses',img:'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?q=80&w=400'},
    {id:6,nom:'Papayes de Casamance',description:'Mûres à point, très sucrées',prix:800,localisation:'Ziguinchor',note_globale:4.7,quantite_disponible:25,est_disponible:true,certifie:false,categorie:'Fruits',img:'https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=400'},
  ];

  const tousLesProduits = produits.length>0?produits:produitsDemo;
  const produitsFiltres = tousLesProduits.filter((p:any)=>{
    const matchCat = p.categorie===categorie;
    const matchRecherche = !recherche||p.nom.toLowerCase().includes(recherche.toLowerCase())||p.localisation?.toLowerCase().includes(recherche.toLowerCase());
    return matchCat&&matchRecherche;
  });

  const Nav = ({actif}:{actif:string}) => (
    <nav style={{position:'fixed',bottom:0,left:0,width:'100%',zIndex:50,display:'flex',justifyContent:'space-around',alignItems:'center',padding:'12px 16px 24px',background:'rgba(255,255,255,0.97)',backdropFilter:'blur(20px)',boxShadow:'0 -8px 30px rgba(0,0,0,0.08)',borderRadius:'40px 40px 0 0'}}>
      {[
        {icon:'🏠',label:'Accueil',p:'onboarding'},
        {icon:'🛒',label:'Marché',p:'marketplace'},
        {icon:'🤖',label:'Bot',p:'bot'},
        {icon:'💬',label:'Chat',p:'chat'},
        {icon:'👤',label:'Profil',p:utilisateur?.role==='producteur'?'producteur':'profil'},
      ].map(item=>(
        <button key={item.label} onClick={()=>setPage(item.p as Page)}
          style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',border:'none',cursor:'pointer',padding:'8px 16px',borderRadius:'20px',background:actif===item.p?'#012d1d':'transparent',color:actif===item.p?'white':'#a8a29e',position:'relative'}}>
          <span style={{fontSize:'22px'}}>{item.icon}</span>
          <span style={{fontSize:'10px',fontWeight:'900',textTransform:'uppercase',letterSpacing:'1px'}}>{item.label}</span>
          {item.p==='marketplace'&&panierItems.length>0&&(
            <span style={{position:'absolute',top:'2px',right:'6px',background:'#ef4444',color:'white',borderRadius:'50%',width:'18px',height:'18px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'bold'}}>
              {panierItems.reduce((s:number,i:any)=>s+i.qte,0)}
            </span>
          )}
        </button>
      ))}
    </nav>
  );

  const Toast = () => toast?(
    <div style={{position:'fixed',top:'20px',left:'50%',transform:'translateX(-50%)',background:'#012d1d',color:'white',padding:'14px 28px',borderRadius:'50px',fontWeight:'bold',zIndex:9999,boxShadow:'0 8px 30px rgba(0,0,0,0.2)',fontSize:'15px',whiteSpace:'nowrap',maxWidth:'90vw',textAlign:'center'}}>{toast}</div>
  ):null;

  // ── ONBOARDING ────────────────────────────────────────────
  if (page==='onboarding') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#1b4332 0%,#fbf9f4 100%)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'space-between',overflow:'hidden',position:'relative'}}>
      <Toast/>
      <div style={{width:'100%',maxWidth:'500px',padding:'32px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',zIndex:10}}>
        <button style={{background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50px',width:'56px',height:'56px',cursor:'pointer',fontSize:'24px',color:'white'}}>🔊</button>
        <div style={{display:'flex',gap:'4px',background:'rgba(255,255,255,0.15)',borderRadius:'50px',padding:'4px',border:'1px solid rgba(255,255,255,0.1)'}}>
          {['🇫🇷 FR','🇸🇳 WO','🇨🇮 PL','🇬🇧 EN'].map((l,i)=>(
            <button key={l} onClick={()=>setLang(['FR','WO','PL','EN'][i])}
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
        {utilisateur?(
          <div style={{width:'100%',maxWidth:'340px',display:'flex',flexDirection:'column',gap:'16px'}}>
            <div style={{background:'rgba(255,255,255,0.15)',borderRadius:'20px',padding:'20px',color:'white',textAlign:'center'}}>
              <p style={{fontSize:'20px',margin:'0 0 4px'}}>👋 Bonjour, {utilisateur.nom} !</p>
              <p style={{fontSize:'14px',opacity:0.7,margin:0}}>{utilisateur.role==='producteur'?'🚜 Producteur':'🛒 Acheteur'}</p>
            </div>
            <button onClick={()=>setPage(utilisateur.role==='producteur'?'producteur':'marketplace')}
              style={{width:'100%',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',padding:'20px',cursor:'pointer',fontSize:'18px',fontWeight:'900'}}>
              {utilisateur.role==='producteur'?'🚜 Mon tableau de bord':'🛒 Aller au marché'}
            </button>
            <button onClick={seDeconnecter}
              style={{width:'100%',background:'rgba(255,255,255,0.1)',color:'white',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'16px',padding:'14px',cursor:'pointer',fontSize:'15px',fontWeight:'bold'}}>
              Se déconnecter
            </button>
          </div>
        ):(
          <div style={{width:'100%',maxWidth:'340px',display:'flex',flexDirection:'column',gap:'16px'}}>
            <button onClick={()=>{setFormRole('producteur');setPage('inscription');}}
              style={{width:'100%',background:'#1B4332',color:'white',border:'none',borderRadius:'16px',padding:'24px',cursor:'pointer',fontSize:'18px',fontWeight:'bold',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',borderBottom:'4px solid rgba(0,0,0,0.2)'}}>
              <span style={{fontSize:'48px'}}>🚜</span>
              <span style={{textTransform:'uppercase',letterSpacing:'1px'}}>{lang==='FR'?'Je suis Producteur':lang==='WO'?'Mangi bay':lang==='PL'?'Miin ko mi demoowo':'I am a Producer'}</span>
            </button>
            <button onClick={()=>{setFormRole('acheteur');setPage('inscription');}}
              style={{width:'100%',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',padding:'24px',cursor:'pointer',fontSize:'18px',fontWeight:'900',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px',borderBottom:'4px solid rgba(0,0,0,0.1)'}}>
              <span style={{fontSize:'48px'}}>🛒</span>
              <span style={{textTransform:'uppercase',letterSpacing:'1px'}}>{lang==='FR'?'Je suis Acheteur':lang==='WO'?'Mangi jënd':lang==='PL'?'Miin ko mi soodoowo':'I am a Buyer'}</span>
            </button>
          </div>
        )}
      </div>
      <div style={{padding:'24px',textAlign:'center',zIndex:10}}>
        {!utilisateur&&<p style={{color:'#717973',fontSize:'15px',fontWeight:'600'}}>Déjà un compte ?{' '}<span onClick={()=>setPage('connexion')} style={{color:'#012d1d',fontWeight:'900',textDecoration:'underline',cursor:'pointer'}}>Se connecter</span></p>}
        <div style={{width:'48px',height:'6px',background:'#e4e2dd',borderRadius:'3px',margin:'16px auto 0'}}/>
      </div>
      <div style={{position:'absolute',bottom:0,left:0,width:'100%',height:'35%',opacity:0.1,overflow:'hidden',pointerEvents:'none'}}>
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000" alt="" style={{width:'100%',height:'100%',objectFit:'cover',filter:'grayscale(1)'}}/>
      </div>
    </div>
  );

  // ── INSCRIPTION ───────────────────────────────────────────
  if (page==='inscription') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#012d1d,#1b4332)',display:'flex',flexDirection:'column'}}>
      <Toast/>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <button onClick={()=>setPage('onboarding')} style={{background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',fontSize:'20px',color:'white',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <h1 style={{color:'white',fontWeight:'900',fontSize:'22px',margin:0}}>Créer un compte</h1>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',margin:0}}>{formRole==='producteur'?'🚜 Compte Producteur':'🛒 Compte Acheteur'}</p>
        </div>
      </div>
      <div style={{flex:1,padding:'0 24px 40px',display:'flex',flexDirection:'column',gap:'16px',maxWidth:'480px',width:'100%',margin:'0 auto'}}>
        <div style={{display:'flex',background:'rgba(255,255,255,0.1)',borderRadius:'16px',padding:'4px'}}>
          {['producteur','acheteur'].map(r=>(
            <button key={r} onClick={()=>setFormRole(r)}
              style={{flex:1,padding:'12px',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'14px',background:formRole===r?'white':'transparent',color:formRole===r?'#012d1d':'rgba(255,255,255,0.6)'}}>
              {r==='producteur'?'🚜 Producteur':'🛒 Acheteur'}
            </button>
          ))}
        </div>
        {[
          {label:'Nom complet',val:formNom,set:setFormNom,ph:'Ex: Fatou Diallo',type:'text'},
          {label:'Email',val:formEmail,set:setFormEmail,ph:'Ex: fatou@gmail.com',type:'email'},
          {label:'Mot de passe',val:formMdp,set:setFormMdp,ph:'Minimum 6 caractères',type:'password'},
          {label:'Localisation',val:formLoc,set:setFormLoc,ph:'Ex: Thiès, Sénégal',type:'text'},
        ].map(f=>(
          <div key={f.label}>
            <label style={{display:'block',color:'rgba(255,255,255,0.8)',fontSize:'14px',fontWeight:'bold',marginBottom:'8px'}}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
              style={{width:'100%',padding:'16px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'14px',color:'white',fontSize:'15px',outline:'none',boxSizing:'border-box'}}/>
          </div>
        ))}
        {formErreur&&<div style={{background:'rgba(186,26,26,0.2)',border:'1px solid #ba1a1a',borderRadius:'12px',padding:'12px 16px',color:'#ff6b6b',fontSize:'14px'}}>❌ {formErreur}</div>}
        <button onClick={async()=>{
          setFormErreur('');
          if(!formNom||!formEmail||!formMdp){setFormErreur('Remplis tous les champs !');return;}
          if(formMdp.length<6){setFormErreur('Mot de passe trop court (min 6 caractères)');return;}
          setChargement(true);
          try{
            const data=await api('/auth/inscription','POST',{nom:formNom,email:formEmail,mot_de_passe:formMdp,role:formRole,localisation:formLoc});
            if(data.token){
              localStorage.setItem('agrinova_token',data.token);
              localStorage.setItem('agrinova_user',JSON.stringify(data.utilisateur));
              setUtilisateur(data.utilisateur);
              showToast(`✅ Bienvenue ${data.utilisateur.nom} ! 🌾`);
              setPage(formRole==='producteur'?'producteur':'marketplace');
            }else{setFormErreur(data.detail||'Erreur inscription');}
          }catch{setFormErreur('Serveur indisponible. Réessayez.');}
          setChargement(false);
        }} style={{width:'100%',padding:'18px',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',fontWeight:'900',fontSize:'18px',cursor:'pointer',marginTop:'8px'}}>
          {chargement?'⏳ Création...':'✅ Créer mon compte'}
        </button>
        <p style={{textAlign:'center',color:'rgba(255,255,255,0.6)',fontSize:'14px'}}>Déjà un compte ?{' '}<span onClick={()=>setPage('connexion')} style={{color:'#FFA000',fontWeight:'bold',cursor:'pointer',textDecoration:'underline'}}>Se connecter</span></p>
      </div>
    </div>
  );

  // ── CONNEXION ─────────────────────────────────────────────
  if (page==='connexion') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#012d1d,#1b4332)',display:'flex',flexDirection:'column'}}>
      <Toast/>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'12px'}}>
        <button onClick={()=>setPage('onboarding')} style={{background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',fontSize:'20px',color:'white',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div>
          <h1 style={{color:'white',fontWeight:'900',fontSize:'22px',margin:0}}>Bon retour ! 👋</h1>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'13px',margin:0}}>Connectez-vous à votre compte</p>
        </div>
      </div>
      <div style={{flex:1,padding:'0 24px 40px',display:'flex',flexDirection:'column',gap:'16px',maxWidth:'480px',width:'100%',margin:'0 auto'}}>
        {[
          {label:'Email',val:formEmail,set:setFormEmail,ph:'ton@email.com',type:'email'},
          {label:'Mot de passe',val:formMdp,set:setFormMdp,ph:'••••••••',type:'password'},
        ].map(f=>(
          <div key={f.label}>
            <label style={{display:'block',color:'rgba(255,255,255,0.8)',fontSize:'14px',fontWeight:'bold',marginBottom:'8px'}}>{f.label}</label>
            <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.ph}
              style={{width:'100%',padding:'16px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'14px',color:'white',fontSize:'15px',outline:'none',boxSizing:'border-box'}}/>
          </div>
        ))}
        {formErreur&&<div style={{background:'rgba(186,26,26,0.2)',border:'1px solid #ba1a1a',borderRadius:'12px',padding:'12px 16px',color:'#ff6b6b',fontSize:'14px'}}>❌ {formErreur}</div>}
        <button onClick={async()=>{
          setFormErreur('');
          if(!formEmail||!formMdp){setFormErreur('Remplis tous les champs !');return;}
          setChargement(true);
          try{
            const data=await api('/auth/connexion','POST',{email:formEmail,mot_de_passe:formMdp});
            if(data.token){
              localStorage.setItem('agrinova_token',data.token);
              localStorage.setItem('agrinova_user',JSON.stringify(data.utilisateur));
              setUtilisateur(data.utilisateur);
              showToast(`✅ Bienvenue ${data.utilisateur.nom} 🌾`);
              setPage(data.utilisateur.role==='producteur'?'producteur':'marketplace');
            }else{setFormErreur(data.detail||'Email ou mot de passe incorrect');}
          }catch{setFormErreur('Serveur indisponible. Réessayez.');}
          setChargement(false);
        }} style={{width:'100%',padding:'18px',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'16px',fontWeight:'900',fontSize:'18px',cursor:'pointer',marginTop:'8px'}}>
          {chargement?'⏳ Connexion...':'🔐 Se connecter'}
        </button>
        <p style={{textAlign:'center',color:'rgba(255,255,255,0.6)',fontSize:'14px'}}>Pas encore de compte ?{' '}<span onClick={()=>setPage('inscription')} style={{color:'#FFA000',fontWeight:'bold',cursor:'pointer',textDecoration:'underline'}}>S'inscrire</span></p>
      </div>
    </div>
  );

  // ── MARKETPLACE ───────────────────────────────────────────
  if (page==='marketplace') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'120px'}}>
      <Toast/>
      <div style={{background:'#fbf9f4',position:'sticky',top:0,zIndex:50,boxShadow:'0 2px 20px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 24px',maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'40px',height:'40px',borderRadius:'50%',overflow:'hidden',background:'#eae8e3',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {utilisateur
                ?<div style={{width:'100%',height:'100%',background:'#1b4332',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'16px'}}>{utilisateur.nom[0].toUpperCase()}</div>
                :<img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBICydwOHLv1q4pAgCL8VlbkiZETPit4U9EDWkqBP9FesgExbdM55Jk1m0cJfKVdShoJ2PaQj3cfpYNpZV7ztAJ_U3LmuIb1EEL0vHkGhR9_LAGtDJZ640BEirzv92WVXTD1reetW70PrR02xRMBsxsnRaHYOXB50o0FMGMVazmt17VipGeomWVxgmjzgk9FN3hUdr8sgBAdQUMF3fR2st7T1wPSFPKdolgNEHhUXbvX4RdSrtkx7oXgLarjhw3A_9meghkOosn0hEj" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
              }
            </div>
            <div>
              <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',letterSpacing:'-1px',textTransform:'uppercase',margin:0}}>AGRINOVA</h1>
              {utilisateur&&<p style={{color:'#717973',fontSize:'11px',margin:0}}>Bonjour, {utilisateur.nom} 👋</p>}
            </div>
          </div>
          <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
            {panierItems.length>0&&(
              <button onClick={()=>setPage('panier')}
                style={{background:'#FFA000',border:'none',borderRadius:'50px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold',color:'#012d1d',fontSize:'13px',display:'flex',alignItems:'center',gap:'6px'}}>
                🛒 {panierItems.reduce((s:number,i:any)=>s+i.qte,0)}
              </button>
            )}
            {!utilisateur&&<button onClick={()=>setPage('connexion')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'12px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold',fontSize:'13px'}}>Se connecter</button>}
            {utilisateur&&<button onClick={()=>setPage('mes-commandes')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'22px'}} title="Mes commandes">📦</button>}
          </div>
        </div>
      </div>

      <div style={{maxWidth:'1200px',margin:'0 auto',padding:'16px 24px'}}>
        <div style={{position:'relative',marginBottom:'16px'}}>
          <span style={{position:'absolute',left:'16px',top:'50%',transform:'translateY(-50%)',fontSize:'20px'}}>🔍</span>
          <input value={recherche} onChange={e=>setRecherche(e.target.value)}
            placeholder="Chercher un produit, une région..."
            style={{width:'100%',paddingLeft:'48px',paddingRight:'48px',paddingTop:'16px',paddingBottom:'16px',background:'#e4e2dd',border:'none',borderRadius:'16px',fontSize:'16px',outline:'none',boxSizing:'border-box'}}/>
          {recherche&&<button onClick={()=>setRecherche('')} style={{position:'absolute',right:'16px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'18px',color:'#717973'}}>✕</button>}
        </div>

        <div style={{display:'flex',gap:'12px',overflowX:'auto',paddingBottom:'8px',marginBottom:'24px'}}>
          {[{label:'🥦 Légumes',cat:'Légumes'},{label:'🍊 Fruits',cat:'Fruits'},{label:'🌾 Céréales',cat:'Céréales'},{label:'🥜 Légumineuses',cat:'Légumineuses'}].map(f=>(
            <button key={f.cat} onClick={()=>setCategorie(f.cat)}
              style={{whiteSpace:'nowrap',padding:'12px 20px',borderRadius:'16px',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'14px',background:categorie===f.cat?'#012d1d':'#eae8e3',color:categorie===f.cat?'white':'#414844',transition:'all 0.2s',boxShadow:categorie===f.cat?'0 4px 12px rgba(1,45,29,0.3)':'none'}}>
              {f.label}
            </button>
          ))}
        </div>

        {recherche&&<p style={{color:'#717973',fontSize:'14px',marginBottom:'16px'}}>{produitsFiltres.length} résultat{produitsFiltres.length!==1?'s':''} pour "<strong>{recherche}</strong>"</p>}

        {chargement?(
          <div style={{textAlign:'center',padding:'60px',color:'#717973'}}>
            <p style={{fontSize:'40px',marginBottom:'16px'}}>⏳</p>
            <p style={{fontWeight:'bold'}}>Chargement des produits...</p>
          </div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',gap:'24px'}}>
            {produitsFiltres.map((p:any)=>(
              <div key={p.id} style={{background:'white',borderRadius:'32px',overflow:'hidden',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',border:'1px solid #f0eee9',transition:'transform 0.2s'}}
                onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-4px)')}
                onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
                <div style={{position:'relative',height:'200px',overflow:'hidden',background:'#f0eee9',cursor:'pointer'}} onClick={()=>{setProduitSelectionne(p);setPage('produit');}}>
                  {p.img||p.photo?<img src={p.img||p.photo} alt={p.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'64px',background:'linear-gradient(135deg,#d8f3dc,#a8d5b5)'}}>🌿</div>}
                  {p.certifie&&<div style={{position:'absolute',top:'12px',left:'12px',background:'rgba(255,255,255,0.92)',padding:'5px 10px',borderRadius:'50px',fontSize:'11px',fontWeight:'900',border:'1px solid #fbbf24',color:'#012d1d'}}>⭐ Certifié</div>}
                  <div style={{position:'absolute',bottom:'12px',left:'12px',background:p.est_disponible&&p.quantite_disponible>0?'#22c55e':'#ef4444',color:'white',padding:'3px 10px',borderRadius:'50px',fontSize:'10px',fontWeight:'bold'}}>
                    {p.est_disponible&&p.quantite_disponible>0?'✅ EN STOCK':'❌ ÉPUISÉ'}
                  </div>
                </div>
                <div style={{padding:'20px'}}>
                  <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'17px',margin:'0 0 4px',cursor:'pointer'}} onClick={()=>{setProduitSelectionne(p);setPage('produit');}}>{p.nom}</h3>
                  <p style={{fontSize:'12px',color:'#717973',margin:'0 0 10px'}}>{p.description}</p>
                  <div style={{display:'flex',alignItems:'baseline',gap:'4px',marginBottom:'10px'}}>
                    <span style={{fontSize:'24px',fontWeight:'900',color:'#4b6546'}}>{p.prix?.toLocaleString()}</span>
                    <span style={{fontSize:'13px',fontWeight:'bold',color:'#4b6546'}}>FCFA/kg</span>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingBottom:'12px',borderBottom:'1px solid rgba(193,200,194,0.3)',marginBottom:'12px'}}>
                    <span style={{fontSize:'12px',fontWeight:'bold',color:'#414844'}}>📍 {p.localisation}</span>
                    <span style={{fontSize:'12px',fontWeight:'bold',background:'#ffdfa0',color:'#261a00',padding:'3px 8px',borderRadius:'8px'}}>⭐ {p.note_globale||'N/A'}</span>
                  </div>
                  <div style={{display:'flex',gap:'8px'}}>
                    <button onClick={()=>{setProduitSelectionne(p);setPage('produit');}}
                      style={{flex:1,padding:'10px',background:'#f0eee9',color:'#012d1d',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'13px'}}>
                      👁 Détails
                    </button>
                    {p.est_disponible&&p.quantite_disponible>0&&(
                      <button onClick={()=>ajouterAuPanier(p)}
                        style={{flex:1,padding:'10px',background:'#012d1d',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'13px'}}>
                        🛒 Ajouter
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {produitsFiltres.length===0&&!chargement&&(
          <div style={{textAlign:'center',padding:'60px 20px',color:'#aaa'}}>
            <p style={{fontSize:'48px',marginBottom:'16px'}}>🌿</p>
            <p style={{fontWeight:'700',fontSize:'18px',marginBottom:'8px'}}>{recherche?`Aucun résultat pour "${recherche}"`:'Aucun produit dans cette catégorie'}</p>
            {utilisateur?.role==='producteur'&&!recherche&&<button onClick={()=>setPage('ajouter')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'14px',padding:'14px 28px',fontWeight:'bold',cursor:'pointer',fontSize:'16px',marginTop:'16px'}}>➕ Publier un produit</button>}
          </div>
        )}
      </div>
      <Nav actif="marketplace"/>
    </div>
  );

  // ── PRODUIT DÉTAILLÉ ──────────────────────────────────────
  if (page==='produit'&&produitSelectionne) return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'120px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={()=>setPage('marketplace')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'18px',margin:0,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{produitSelectionne.nom}</h1>
          {panierItems.length>0&&<button onClick={()=>setPage('panier')} style={{background:'#FFA000',border:'none',borderRadius:'50px',padding:'6px 14px',cursor:'pointer',fontWeight:'bold',color:'#012d1d',fontSize:'13px'}}>🛒 {panierItems.reduce((s:number,i:any)=>s+i.qte,0)}</button>}
        </div>
      </div>
      <div style={{height:'320px',overflow:'hidden',position:'relative',background:'linear-gradient(135deg,#d8f3dc,#a8d5b5)'}}>
        {produitSelectionne.img||produitSelectionne.photo
          ?<img src={produitSelectionne.img||produitSelectionne.photo} alt={produitSelectionne.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          :<div style={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'100px'}}>🌿</div>}
        {produitSelectionne.certifie&&<div style={{position:'absolute',top:'16px',left:'16px',background:'rgba(255,255,255,0.95)',padding:'8px 16px',borderRadius:'50px',fontSize:'13px',fontWeight:'900',border:'1px solid #fbbf24',color:'#012d1d'}}>⭐ Vendeur Certifié</div>}
        <div style={{position:'absolute',bottom:'16px',left:'16px',background:produitSelectionne.est_disponible&&produitSelectionne.quantite_disponible>0?'#22c55e':'#ef4444',color:'white',padding:'6px 16px',borderRadius:'50px',fontSize:'12px',fontWeight:'bold'}}>
          {produitSelectionne.est_disponible&&produitSelectionne.quantite_disponible>0?'✅ EN STOCK':'❌ ÉPUISÉ'}
        </div>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px',display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
            <div>
              <h2 style={{fontWeight:'900',color:'#012d1d',fontSize:'24px',margin:'0 0 4px'}}>{produitSelectionne.nom}</h2>
              <p style={{color:'#717973',fontSize:'14px',margin:0}}>{produitSelectionne.description}</p>
            </div>
            <div style={{background:'#ffdfa0',color:'#261a00',padding:'6px 12px',borderRadius:'12px',fontWeight:'bold',fontSize:'14px',flexShrink:0,marginLeft:'12px'}}>⭐ {produitSelectionne.note_globale||'N/A'}</div>
          </div>
          <div style={{display:'flex',alignItems:'baseline',gap:'6px',marginBottom:'16px'}}>
            <span style={{fontSize:'36px',fontWeight:'900',color:'#2d6a4f'}}>{produitSelectionne.prix?.toLocaleString()}</span>
            <span style={{fontSize:'16px',fontWeight:'bold',color:'#2d6a4f'}}>FCFA/kg</span>
          </div>
          <div style={{display:'flex',gap:'16px',paddingTop:'16px',borderTop:'1px solid #f0eee9',flexWrap:'wrap'}}>
            <div><p style={{fontSize:'12px',color:'#717973',margin:'0 0 2px'}}>📍 Localisation</p><p style={{fontWeight:'bold',color:'#012d1d',margin:0}}>{produitSelectionne.localisation}</p></div>
            <div><p style={{fontSize:'12px',color:'#717973',margin:'0 0 2px'}}>📦 Stock</p><p style={{fontWeight:'bold',color:'#012d1d',margin:0}}>{produitSelectionne.quantite_disponible} kg</p></div>
            <div><p style={{fontSize:'12px',color:'#717973',margin:'0 0 2px'}}>🏷️ Catégorie</p><p style={{fontWeight:'bold',color:'#012d1d',margin:0}}>{produitSelectionne.categorie||'N/A'}</p></div>
          </div>
        </div>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontWeight:'800',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>👨‍🌾 Le Producteur</h3>
          <div style={{display:'flex',alignItems:'center',gap:'16px',marginBottom:'16px'}}>
            <div style={{width:'56px',height:'56px',borderRadius:'50%',background:'linear-gradient(135deg,#012d1d,#1b4332)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'22px',flexShrink:0}}>M</div>
            <div style={{flex:1}}>
              <p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:0}}>Moussa Diop</p>
              <p style={{color:'#717973',fontSize:'13px',margin:'2px 0 0'}}>📍 {produitSelectionne.localisation} • ✅ Certifié Agrinova</p>
            </div>
            <div style={{background:'#ffdfa0',color:'#261a00',padding:'4px 10px',borderRadius:'8px',fontWeight:'bold',fontSize:'13px'}}>⭐ 4.8</div>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button onClick={()=>setPage('chat')} style={{flex:1,padding:'12px',background:'#012d1d',color:'white',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>💬 Contacter</button>
            <button onClick={()=>setPage('profil')} style={{flex:1,padding:'12px',background:'#f0faf3',color:'#012d1d',border:'1px solid #cdebc4',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>👁 Voir profil</button>
          </div>
        </div>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontWeight:'800',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>⭐ Avis clients</h3>
          {[
            {nom:'Amadou Sall',note:5,txt:'Excellent produit, très frais et bien emballé !',date:'Il y a 2 jours'},
            {nom:'Fatou Ndiaye',note:4,txt:'Bonne qualité, livraison rapide. Je recommande !',date:'La semaine dernière'},
          ].map((r,i)=>(
            <div key={i} style={{paddingBottom:'16px',marginBottom:i===0?'16px':'0',borderBottom:i===0?'1px solid #f0eee9':'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
                <div><p style={{fontWeight:'bold',color:'#012d1d',fontSize:'14px',margin:0}}>{r.nom}</p><p style={{color:'#f6be39',fontSize:'14px',margin:0}}>{'⭐'.repeat(r.note)}</p></div>
                <span style={{fontSize:'12px',color:'#717973'}}>{r.date}</span>
              </div>
              <p style={{fontSize:'14px',color:'#414844',fontStyle:'italic',margin:0}}>"{r.txt}"</p>
            </div>
          ))}
        </div>
      </div>
      {produitSelectionne.est_disponible&&produitSelectionne.quantite_disponible>0&&(
        <div style={{position:'fixed',bottom:0,left:0,right:0,padding:'16px 24px',background:'white',boxShadow:'0 -4px 20px rgba(0,0,0,0.08)',borderRadius:'24px 24px 0 0'}}>
          <div style={{display:'flex',gap:'12px',maxWidth:'600px',margin:'0 auto'}}>
            <button onClick={()=>ajouterAuPanier(produitSelectionne)}
              style={{flex:1,padding:'16px',background:'#f0faf3',color:'#012d1d',border:'2px solid #cdebc4',borderRadius:'16px',fontWeight:'900',fontSize:'16px',cursor:'pointer'}}>
              🛒 Ajouter au panier
            </button>
            <button onClick={()=>{
              if(!utilisateur){showToast('⚠️ Connecte-toi !');setPage('connexion');return;}
              setPanierItems([{...produitSelectionne,qte:1}]);
              setPage('panier');
            }} style={{flex:1,padding:'16px',background:'#012d1d',color:'white',border:'none',borderRadius:'16px',fontWeight:'900',fontSize:'16px',cursor:'pointer',boxShadow:'0 8px 24px rgba(1,45,29,0.3)'}}>
              ⚡ Commander
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // ── PRODUCTEUR ────────────────────────────────────────────
  if (page==='producteur') return (
    <div style={{minHeight:'100vh',background:'#f3f2ef',paddingBottom:'100px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 4px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 24px',maxWidth:'900px',margin:'0 auto'}}>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',letterSpacing:'-1px',margin:0}}>🌾 AGRINOVA</h1>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'22px'}}>🔔</button>
        </div>
      </div>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <div style={{background:'white',marginBottom:'12px',borderRadius:'0 0 12px 12px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{height:'160px',background:'linear-gradient(135deg,#012d1d 0%,#1b4332 50%,#2d6a4f 100%)',position:'relative'}}>
            <div style={{position:'absolute',inset:0,opacity:0.15,backgroundImage:'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000)',backgroundSize:'cover',backgroundPosition:'center'}}/>
          </div>
          <div style={{padding:'0 24px 24px'}}>
            <div style={{marginTop:'-48px',marginBottom:'12px',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'12px'}}>
              <div style={{width:'96px',height:'96px',borderRadius:'50%',border:'4px solid white',background:'linear-gradient(135deg,#012d1d,#1b4332)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'36px',boxShadow:'0 4px 16px rgba(0,0,0,0.2)'}}>
                {utilisateur?.nom?.[0]?.toUpperCase()||'P'}
              </div>
              <div style={{display:'flex',gap:'8px',paddingBottom:'4px',flexWrap:'wrap'}}>
                <button onClick={()=>setPage('ajouter')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'20px',padding:'10px 20px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>➕ Publier</button>
                <button onClick={()=>setPage('gestion-produits')} style={{background:'transparent',color:'#012d1d',border:'2px solid #012d1d',borderRadius:'20px',padding:'10px 20px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>📋 Mes produits</button>
              </div>
            </div>
            <h2 style={{fontWeight:'900',color:'#012d1d',fontSize:'22px',margin:'0 0 4px'}}>{utilisateur?.nom||'Mon Profil'}</h2>
            <p style={{color:'#414844',fontSize:'15px',margin:'0 0 4px',fontWeight:'600'}}>🚜 Producteur Agricole • Agrinova</p>
            <p style={{color:'#717973',fontSize:'14px',margin:'0 0 16px'}}>📍 {utilisateur?.localisation||'Sénégal'} • Membre depuis 2024</p>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'16px'}}>
              {['🏅 Top Producteur','✅ Certifié Agrinova','🚀 Livraison Rapide'].map(b=>(
                <span key={b} style={{background:'#f0faf3',color:'#012d1d',padding:'6px 14px',borderRadius:'50px',fontSize:'12px',fontWeight:'bold',border:'1px solid #cdebc4'}}>{b}</span>
              ))}
            </div>
            <div style={{borderTop:'1px solid #e4e2dd',paddingTop:'16px',display:'flex',gap:'24px',flexWrap:'wrap'}}>
              {[
                {v:statsProducteur.produits.toString(),l:'Produits publiés'},
                {v:statsProducteur.commandes.toString(),l:'Ventes réalisées'},
                {v:`⭐ ${statsProducteur.note.toFixed(1)}`,l:'Note moyenne'},
                {v:statsProducteur.clients.toString(),l:'Clients satisfaits'},
              ].map((s,i)=>(
                <div key={i}><p style={{fontWeight:'900',color:'#012d1d',fontSize:'18px',margin:0}}>{s.v}</p><p style={{fontSize:'12px',color:'#717973',margin:'2px 0 0'}}>{s.l}</p></div>
              ))}
            </div>
          </div>
        </div>

        <div style={{background:'white',borderRadius:'12px',padding:'20px',marginBottom:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <h3 style={{fontWeight:'800',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>Actions rapides</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            {[
              {icon:'🌾',title:'Marketplace',sub:'Voir tous les produits',action:()=>setPage('marketplace')},
              {icon:'📦',title:'Commandes',sub:'Gérer les livraisons',action:()=>setPage('livraison')},
              {icon:'💬',title:'Messages',sub:'Parler aux acheteurs',action:()=>setPage('chat')},
              {icon:'🤖',title:'AgrinovaBot',sub:'Conseils agricoles IA',action:()=>setPage('bot')},
            ].map((item,i)=>(
              <button key={i} onClick={item.action}
                style={{background:'#f9f8f6',borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',gap:'12px',border:'1px solid #e4e2dd',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.background='#f0faf3';e.currentTarget.style.borderColor='#cdebc4'}}
                onMouseLeave={e=>{e.currentTarget.style.background='#f9f8f6';e.currentTarget.style.borderColor='#e4e2dd'}}>
                <span style={{fontSize:'28px'}}>{item.icon}</span>
                <div><p style={{fontWeight:'800',color:'#012d1d',fontSize:'14px',margin:0}}>{item.title}</p><p style={{color:'#717973',fontSize:'12px',margin:0}}>{item.sub}</p></div>
              </button>
            ))}
          </div>
        </div>

        <div style={{background:'white',borderRadius:'12px',padding:'20px',marginBottom:'12px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <h3 style={{fontWeight:'800',color:'#012d1d',fontSize:'16px',margin:0}}>📊 Tableau de bord</h3>
            <span style={{fontSize:'12px',color:'#717973'}}>Données réelles</span>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
            {[
              {v:statsProducteur.revenus>0?statsProducteur.revenus.toLocaleString():'0',u:'FCFA',l:'Revenus totaux',bg:'#f0faf3',c:'#012d1d'},
              {v:statsProducteur.commandes.toString(),u:'cmd',l:'Commandes reçues',bg:'#f0faf3',c:'#2d6a4f'},
              {v:statsProducteur.produits>0?`${Math.min(Math.round((statsProducteur.commandes/Math.max(statsProducteur.produits,1))*10),100)}%`:'0%',u:'',l:'Taux de conversion',bg:'#fef9c3',c:'#854d0e'},
              {v:statsProducteur.note.toFixed(1),u:'⭐',l:'Note clients',bg:'#fef9c3',c:'#854d0e'},
            ].map((s,i)=>(
              <div key={i} style={{background:s.bg,borderRadius:'12px',padding:'16px'}}>
                <p style={{fontSize:'20px',fontWeight:'900',color:s.c,margin:0}}>{s.v} <span style={{fontSize:'13px'}}>{s.u}</span></p>
                <p style={{fontSize:'12px',color:'#717973',margin:'4px 0 0'}}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{padding:'0 0 16px'}}>
          <button onClick={seDeconnecter} style={{width:'100%',padding:'14px',background:'white',color:'#c0392b',border:'1px solid #fde8e8',borderRadius:'12px',cursor:'pointer',fontWeight:'bold',fontSize:'14px',boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
            🚪 Se déconnecter
          </button>
        </div>
      </div>
      <Nav actif="producteur"/>
    </div>
  );

  // ── GESTION PRODUITS ──────────────────────────────────────
  if (page==='gestion-produits') return (
    <div style={{minHeight:'100vh',background:'#f3f2ef',paddingBottom:'100px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 4px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={()=>setPage('producteur')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'18px',margin:0}}>📋 Mes produits ({mesProduits.length})</h1>
          <button onClick={()=>setPage('ajouter')} style={{marginLeft:'auto',background:'#012d1d',color:'white',border:'none',borderRadius:'12px',padding:'8px 16px',cursor:'pointer',fontWeight:'bold',fontSize:'13px'}}>➕ Ajouter</button>
        </div>
      </div>
      <div style={{maxWidth:'900px',margin:'0 auto',padding:'24px'}}>
        {mesProduits.length===0?(
          <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <p style={{fontSize:'48px',marginBottom:'16px'}}>🌿</p>
            <h3 style={{color:'#012d1d',marginBottom:'8px'}}>Aucun produit publié</h3>
            <p style={{color:'#717973',marginBottom:'24px'}}>Publiez votre premier produit sur le marketplace</p>
            <button onClick={()=>setPage('ajouter')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'14px',padding:'14px 28px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>➕ Publier un produit</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {mesProduits.map((p:any)=>(
              <div key={p.id} style={{background:'white',borderRadius:'20px',padding:'20px',display:'flex',gap:'16px',alignItems:'center',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <div style={{width:'70px',height:'70px',borderRadius:'14px',overflow:'hidden',background:'linear-gradient(135deg,#d8f3dc,#a8d5b5)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px'}}>
                  {p.photo?<img src={p.photo} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'🌿'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 2px'}}>{p.nom}</p>
                  <p style={{color:'#717973',fontSize:'13px',margin:'0 0 6px'}}>{p.prix?.toLocaleString()} FCFA/kg • {p.localisation}</p>
                  <div style={{display:'flex',gap:'8px',alignItems:'center',flexWrap:'wrap'}}>
                    <span style={{background:p.est_disponible?'#f0faf3':'#fde8e8',color:p.est_disponible?'#2d6a4f':'#c0392b',padding:'3px 10px',borderRadius:'50px',fontSize:'11px',fontWeight:'bold'}}>
                      {p.est_disponible?'✅ Actif':'❌ Inactif'}
                    </span>
                    <span style={{color:'#717973',fontSize:'12px'}}>Stock: {p.quantite_disponible} kg</span>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:'6px',flexShrink:0}}>
                  <button onClick={async()=>{
                    if(window.confirm(`Supprimer "${p.nom}" ?`)){
                      try{
                        await api(`/produits/${p.id}`,'DELETE');
                        showToast(`🗑️ "${p.nom}" supprimé`);
                        chargerStatsProducteur();
                      }catch{showToast('❌ Erreur suppression');}
                    }
                  }} style={{padding:'6px 12px',background:'#fde8e8',color:'#c0392b',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'12px'}}>
                    🗑️ Supprimer
                  </button>
                  <button onClick={()=>{setProduitSelectionne(p);setPage('produit');}} style={{padding:'6px 12px',background:'#f0eee9',color:'#012d1d',border:'none',borderRadius:'8px',cursor:'pointer',fontWeight:'bold',fontSize:'12px'}}>
                    👁 Voir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Nav actif="producteur"/>
    </div>
  );

  // ── MES COMMANDES ─────────────────────────────────────────
  if (page==='mes-commandes') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'100px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={()=>setPage(utilisateur?.role==='producteur'?'producteur':'profil')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'18px',margin:0}}>📦 Mes commandes</h1>
        </div>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px'}}>
        {chargement?(
          <div style={{textAlign:'center',padding:'60px'}}><p style={{fontSize:'40px'}}>⏳</p><p style={{fontWeight:'bold',color:'#717973'}}>Chargement...</p></div>
        ):mesCommandes.length===0?(
          <div style={{textAlign:'center',padding:'60px',background:'white',borderRadius:'24px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <p style={{fontSize:'48px',marginBottom:'16px'}}>📦</p>
            <h3 style={{color:'#012d1d',marginBottom:'8px'}}>Aucune commande</h3>
            <p style={{color:'#717973',marginBottom:'24px'}}>Vos commandes apparaîtront ici</p>
            <button onClick={()=>setPage('marketplace')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'14px',padding:'14px 28px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>🛒 Aller au marché</button>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {mesCommandes.map((c:any,i:number)=>(
              <div key={c.id||i} style={{background:'white',borderRadius:'20px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'12px'}}>
                  <div>
                    <p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 4px'}}>Commande #{c.id}</p>
                    <p style={{color:'#717973',fontSize:'13px',margin:0}}>{new Date(c.date_commande).toLocaleDateString('fr-FR')}</p>
                  </div>
                  <span style={{
                    padding:'4px 12px',borderRadius:'50px',fontSize:'12px',fontWeight:'bold',
                    background:c.statut==='livree'?'#f0faf3':c.statut==='expediee'?'#fef9c3':c.statut==='confirmee'?'#e8f4fd':'#f0eee9',
                    color:c.statut==='livree'?'#2d6a4f':c.statut==='expediee'?'#854d0e':c.statut==='confirmee'?'#1a56db':'#717973'
                  }}>
                    {c.statut==='livree'?'✅ Livré':c.statut==='expediee'?'🚚 Expédié':c.statut==='confirmee'?'✓ Confirmé':'⏳ En attente'}
                  </span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'12px',borderTop:'1px solid #f0eee9'}}>
                  <div><p style={{fontSize:'12px',color:'#717973',margin:'0 0 2px'}}>Quantité</p><p style={{fontWeight:'bold',color:'#012d1d',margin:0}}>{c.quantite} kg</p></div>
                  <div><p style={{fontSize:'12px',color:'#717973',margin:'0 0 2px'}}>Paiement</p><p style={{fontWeight:'bold',color:'#012d1d',margin:0,textTransform:'capitalize'}}>{c.methode_paiement||'Wave'}</p></div>
                  <div style={{textAlign:'right'}}><p style={{fontSize:'12px',color:'#717973',margin:'0 0 2px'}}>Total</p><p style={{fontWeight:'900',color:'#012d1d',fontSize:'18px',margin:0}}>{c.montant_total?.toLocaleString()} FCFA</p></div>
                </div>
                {c.statut==='livree'&&(
                  <button onClick={()=>setPage('notation')} style={{width:'100%',marginTop:'12px',padding:'12px',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'12px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>
                    ⭐ Laisser un avis
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Nav actif="profil"/>
    </div>
  );

  // ── PROFIL ────────────────────────────────────────────────
  if (page==='profil') return (
    <div style={{minHeight:'100vh',background:'#f3f2ef',paddingBottom:'120px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 4px rgba(0,0,0,0.08)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 24px'}}>
          <span style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',letterSpacing:'-1px'}}>🌾 AGRINOVA</span>
          <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'22px'}}>🔔</button>
        </div>
      </div>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>
        <div style={{background:'white',borderRadius:'0 0 12px 12px',overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',marginBottom:'12px'}}>
          <div style={{height:'160px',background:'linear-gradient(135deg,#012d1d,#2d6a4f)'}}/>
          <div style={{padding:'0 24px 24px'}}>
            <div style={{marginTop:'-48px',marginBottom:'12px',display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'12px'}}>
              <div style={{width:'96px',height:'96px',borderRadius:'50%',border:'4px solid white',background:'linear-gradient(135deg,#012d1d,#1b4332)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:'bold',fontSize:'36px'}}>
                {utilisateur?.nom?.[0]?.toUpperCase()||'?'}
              </div>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                <button onClick={()=>setPage('mes-commandes')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'20px',padding:'10px 20px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>📦 Commandes</button>
                <button onClick={()=>setPage('chat')} style={{background:'transparent',color:'#012d1d',border:'2px solid #012d1d',borderRadius:'20px',padding:'10px 16px',fontWeight:'bold',cursor:'pointer',fontSize:'14px'}}>💬</button>
                <button onClick={seDeconnecter} style={{background:'transparent',color:'#c0392b',border:'1px solid #fde8e8',borderRadius:'20px',padding:'10px 16px',fontWeight:'bold',cursor:'pointer',fontSize:'13px'}}>Déco</button>
              </div>
            </div>
            {utilisateur?(
              <>
                <h2 style={{fontWeight:'900',color:'#012d1d',fontSize:'22px',margin:'0 0 4px'}}>{utilisateur.nom}</h2>
                <p style={{color:'#414844',fontSize:'15px',margin:'0 0 4px',fontWeight:'600'}}>🛒 Acheteur • Agrinova</p>
                <p style={{color:'#717973',fontSize:'14px',margin:'0 0 16px'}}>📍 {utilisateur.localisation||'Sénégal'} • {utilisateur.email}</p>
                <div style={{borderTop:'1px solid #e4e2dd',paddingTop:'16px',display:'flex',gap:'24px',flexWrap:'wrap'}}>
                  {[{v:mesCommandes.length.toString(),l:'Commandes'},{v:'⭐ 5.0',l:'Satisfaction'},{v:'2024',l:'Membre depuis'}].map((s,i)=>(
                    <div key={i}><p style={{fontWeight:'900',color:'#012d1d',fontSize:'18px',margin:0}}>{s.v}</p><p style={{fontSize:'12px',color:'#717973',margin:'2px 0 0'}}>{s.l}</p></div>
                  ))}
                </div>
              </>
            ):(
              <div style={{textAlign:'center',padding:'40px 0'}}>
                <p style={{fontSize:'48px',marginBottom:'16px'}}>👤</p>
                <h3 style={{color:'#012d1d',marginBottom:'16px'}}>Connecte-toi pour voir ton profil</h3>
                <button onClick={()=>setPage('connexion')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'14px',padding:'14px 28px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>Se connecter</button>
              </div>
            )}
          </div>
        </div>
        {utilisateur&&(
          <div style={{background:'white',borderRadius:'12px',padding:'20px',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
            <h3 style={{fontWeight:'800',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>Accès rapide</h3>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {[
                {icon:'📦',title:'Mes commandes',sub:'Suivre mes achats',action:()=>setPage('mes-commandes')},
                {icon:'🛒',title:'Marketplace',sub:'Acheter des produits',action:()=>setPage('marketplace')},
                {icon:'💬',title:'Messages',sub:'Contacter un vendeur',action:()=>setPage('chat')},
                {icon:'🤖',title:'AgrinovaBot',sub:'Conseils agricoles IA',action:()=>setPage('bot')},
              ].map((item,i)=>(
                <button key={i} onClick={item.action}
                  style={{background:'#f9f8f6',borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',gap:'12px',border:'1px solid #e4e2dd',cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.background='#f0faf3'}}
                  onMouseLeave={e=>{e.currentTarget.style.background='#f9f8f6'}}>
                  <span style={{fontSize:'28px'}}>{item.icon}</span>
                  <div><p style={{fontWeight:'800',color:'#012d1d',fontSize:'14px',margin:0}}>{item.title}</p><p style={{color:'#717973',fontSize:'12px',margin:0}}>{item.sub}</p></div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Nav actif="profil"/>
    </div>
  );

  // ── CHAT ──────────────────────────────────────────────────
  if (page==='chat') return (
    <div style={{height:'100vh',background:'#fbf9f4',display:'flex',flexDirection:'column'}}>
      <Toast/>
      <div style={{background:'white',padding:'16px 24px',display:'flex',alignItems:'center',gap:'12px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',flexShrink:0}}>
        <button onClick={()=>setPage('marketplace')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
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
          <div style={{padding:'16px',borderBottom:'1px solid #f0eee9'}}><p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:0}}>💬 Messages</p></div>
          {[
            {id:1,nom:'Aminata Sarr',msg:'Je veux 10kg...',heure:'09:20',nonLu:2,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDOWXx1wjM1nkHElV0AyKpeZN0A_uV81LAdAgeawM2e6JzzOZzX-2BQVilybDmqFgTMJ8mcMACWNu8r11pilus21ubhmeXejg4g5kdbjIut0cEZRV7duwn6cL9clE-6qy71s6xZWQ2FDTftIMANZpKni7GvvOYweZmW-F39Z1hTQBVqSxCtfDat9a2Ym6PrYn_7Era0tazFdbecuTf_AluwXvJ76laCSR4d_9YCI6jNCUBBfy6qFn1NUW5ybeVN3mL93sYQAPXlMilV'},
            {id:2,nom:'Moussa Ba',msg:'Commande passée ✅',heure:'Hier',nonLu:0,img:'https://lh3.googleusercontent.com/aida-public/AB6AXuDvcRfgyU7MMvrz_s_Ogqj0vVvASK1DJfK3o4wSQvUcdwYZ3jik7_RkAjCVzXIJPABdOjyPj9p7o0rhwLQDck7rOzrupZekUaXz11LXjtaP-3uT07Sv_tYWig79qGeUNw1sqjjxWFaKTOEHdh_U5zEHBHH3CNBUlAK4PXfVxEJW3eZtkF-RdOYN31oqblPXhg1y1DAJQQ_0Ab1aEaM7WY0uxuNkZPPRWjHX1rM8dnDcWpTW89XDERcY1_c1GdvmK8uDE3UcdVM630DT'},
          ].map(c=>(
            <div key={c.id} style={{padding:'14px 16px',display:'flex',gap:'10px',alignItems:'center',cursor:'pointer',borderBottom:'1px solid #f9f8f6',background:c.id===1?'#f0faf3':'white'}}>
              <div style={{position:'relative',flexShrink:0}}>
                <div style={{width:'44px',height:'44px',borderRadius:'50%',overflow:'hidden',background:'#eae8e3'}}><img src={c.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
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
            {messages.map(m=>(
              <div key={m.id} style={{display:'flex',justifyContent:m.moi?'flex-end':'flex-start',alignItems:'flex-end',gap:'8px'}}>
                {!m.moi&&<div style={{width:'28px',height:'28px',borderRadius:'50%',overflow:'hidden',background:'#eae8e3',flexShrink:0}}><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOWXx1wjM1nkHElV0AyKpeZN0A_uV81LAdAgeawM2e6JzzOZzX-2BQVilybDmqFgTMJ8mcMACWNu8r11pilus21ubhmeXejg4g5kdbjIut0cEZRV7duwn6cL9clE-6qy71s6xZWQ2FDTftIMANZpKni7GvvOYweZmW-F39Z1hTQBVqSxCtfDat9a2Ym6PrYn_7Era0tazFdbecuTf_AluwXvJ76laCSR4d_9YCI6jNCUBBfy6qFn1NUW5ybeVN3mL93sYQAPXlMilV" alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>}
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
              <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&envoyer()}
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

  // ── BOT FONCTIONNEL ───────────────────────────────────────
  if (page==='bot') return (
    <div style={{height:'100vh',background:'linear-gradient(180deg,#012d1d 0%,#1b4332 30%,#fbf9f4 100%)',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'20px 24px',display:'flex',alignItems:'center',gap:'12px',flexShrink:0}}>
        <button onClick={()=>setPage('marketplace')} style={{background:'rgba(255,255,255,0.15)',border:'none',cursor:'pointer',fontSize:'20px',color:'white',width:'40px',height:'40px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
        <div style={{flex:1,textAlign:'center'}}>
          <p style={{color:'white',fontWeight:'900',fontSize:'18px',margin:0}}>🤖 AgrinovaBot</p>
          <p style={{color:'rgba(255,255,255,0.6)',fontSize:'12px',margin:0}}>{utilisateur?`Bonjour ${utilisateur.nom} !`:'Votre assistant agricole IA'}</p>
        </div>
        <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px'}}>🌾</div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'0 16px 20px',display:'flex',flexDirection:'column',gap:'12px'}}>
        <div style={{textAlign:'center',padding:'12px 0'}}>
          <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(255,255,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px',margin:'0 auto 8px'}}>🤖</div>
          <p style={{color:'white',fontWeight:'700',fontSize:'15px',margin:0}}>AgrinovaBot</p>
        </div>
        {botMessages.map((m,i)=>(
          <div key={i} style={{display:'flex',justifyContent:m.bot?'flex-start':'flex-end',gap:'8px',alignItems:'flex-end'}}>
            {m.bot&&<div style={{width:'28px',height:'28px',borderRadius:'50%',background:'#cdebc4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0}}>🤖</div>}
            <div style={{maxWidth:'82%',background:m.bot?'white':'#012d1d',padding:'12px 16px',borderRadius:m.bot?'20px 20px 20px 4px':'20px 20px 4px 20px',boxShadow:'0 4px 12px rgba(0,0,0,0.1)',fontSize:'14px',lineHeight:'1.6',color:m.bot?'#1b1c19':'white',whiteSpace:'pre-line'}}>
              {m.texte}
            </div>
          </div>
        ))}
      </div>

      <div style={{background:'white',borderRadius:'32px 32px 0 0',padding:'16px 20px 24px',flexShrink:0}}>
        <div style={{display:'flex',gap:'8px',overflowX:'auto',marginBottom:'16px',paddingBottom:'4px'}}>
          {[
            {label:'💧 Irrigation',key:'Irrigation'},
            {label:'🌡️ Météo',key:'Météo'},
            {label:'💰 Prix marché',key:'Prix marché'},
            {label:'🐛 Maladies',key:'Maladies'},
            {label:'📅 Calendrier',key:'Calendrier'},
          ].map(s=>(
            <button key={s.key}
              onClick={()=>envoyerBot(s.key)}
              style={{whiteSpace:'nowrap',padding:'10px 18px',borderRadius:'50px',border:'2px solid #e4e2dd',background:'white',cursor:'pointer',fontSize:'13px',fontWeight:'bold',color:'#012d1d',flexShrink:0,transition:'all 0.2s'}}
              onMouseEnter={e=>{e.currentTarget.style.background='#012d1d';e.currentTarget.style.color='white';e.currentTarget.style.borderColor='#012d1d'}}
              onMouseLeave={e=>{e.currentTarget.style.background='white';e.currentTarget.style.color='#012d1d';e.currentTarget.style.borderColor='#e4e2dd'}}>
              {s.label}
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:'10px',alignItems:'center'}}>
          <div style={{flex:1,display:'flex',alignItems:'center',background:'#f0eee9',borderRadius:'24px',padding:'4px 16px'}}>
            <input
              value={botInput}
              onChange={e=>setBotInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&envoyerBot()}
              placeholder="Posez votre question agricole..."
              style={{flex:1,background:'none',border:'none',outline:'none',fontSize:'14px',color:'#1b1c19',padding:'12px 0'}}/>
            <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'20px',color:'#012d1d'}}>🎤</button>
          </div>
          <button onClick={()=>envoyerBot()} style={{width:'48px',height:'48px',borderRadius:'50%',background:'#012d1d',color:'white',border:'none',cursor:'pointer',fontSize:'20px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>➤</button>
        </div>
      </div>
    </div>
  );

  // ── PANIER DYNAMIQUE ──────────────────────────────────────
  if (page==='panier') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'40px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={()=>setPage('marketplace')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',margin:0}}>🛒 Mon Panier ({panierItems.reduce((s:number,i:any)=>s+i.qte,0)})</h1>
        </div>
      </div>
      {panierItems.length===0?(
        <div style={{textAlign:'center',padding:'80px 24px'}}>
          <p style={{fontSize:'64px',marginBottom:'16px'}}>🛒</p>
          <h3 style={{color:'#012d1d',marginBottom:'8px'}}>Panier vide</h3>
          <p style={{color:'#717973',marginBottom:'24px'}}>Ajoutez des produits depuis le marketplace</p>
          <button onClick={()=>setPage('marketplace')} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'14px',padding:'14px 28px',fontWeight:'bold',cursor:'pointer',fontSize:'16px'}}>🛒 Aller au marché</button>
        </div>
      ):(
        <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px'}}>
          <div style={{background:'white',borderRadius:'24px',padding:'20px',marginBottom:'16px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>🌾 Produits sélectionnés</h3>
            {panierItems.map((item:any)=>(
              <div key={item.id} style={{display:'flex',gap:'12px',alignItems:'center',padding:'12px 0',borderBottom:'1px solid #f0eee9'}}>
                <div style={{width:'60px',height:'60px',borderRadius:'12px',overflow:'hidden',background:'linear-gradient(135deg,#d8f3dc,#a8d5b5)',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px'}}>
                  {item.img?<img src={item.img} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:'🌿'}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{fontWeight:'800',color:'#012d1d',fontSize:'14px',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.nom}</p>
                  <p style={{color:'#717973',fontSize:'12px',margin:0}}>{item.prix?.toLocaleString()} FCFA/kg</p>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'8px',background:'#f0eee9',borderRadius:'12px',padding:'4px 10px'}}>
                  <button onClick={()=>{
                    if(item.qte===1){setPanierItems(prev=>prev.filter((i:any)=>i.id!==item.id));}
                    else{setPanierItems(prev=>prev.map((i:any)=>i.id===item.id?{...i,qte:i.qte-1}:i));}
                  }} style={{background:'none',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'20px',color:'#012d1d',lineHeight:1,padding:'0 2px'}}>−</button>
                  <span style={{fontWeight:'bold',color:'#012d1d',minWidth:'20px',textAlign:'center'}}>{item.qte}</span>
                  <button onClick={()=>setPanierItems(prev=>prev.map((i:any)=>i.id===item.id?{...i,qte:i.qte+1}:i))}
                    style={{background:'none',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'20px',color:'#012d1d',lineHeight:1,padding:'0 2px'}}>+</button>
                </div>
                <p style={{fontWeight:'900',color:'#012d1d',fontSize:'15px',margin:0,minWidth:'80px',textAlign:'right'}}>
                  {(item.prix*item.qte).toLocaleString()} F
                </p>
              </div>
            ))}
            <button onClick={()=>setPanierItems([])} style={{marginTop:'12px',background:'none',border:'none',cursor:'pointer',color:'#c0392b',fontSize:'13px',fontWeight:'bold',padding:0}}>
              🗑️ Vider le panier
            </button>
          </div>

          <div style={{background:'white',borderRadius:'24px',padding:'20px',marginBottom:'16px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>📍 Adresse de livraison *</h3>
            <input value={adresseLivraison} onChange={e=>setAdresseLivraison(e.target.value)}
              placeholder="Ex: Dakar Plateau, Rue de Thiong, Apt 3..."
              style={{width:'100%',padding:'14px 16px',background:'#f0eee9',border:adresseLivraison?'2px solid #22c55e':'2px solid #f0eee9',borderRadius:'14px',fontSize:'14px',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}/>
          </div>

          <div style={{background:'white',borderRadius:'24px',padding:'20px',marginBottom:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
            <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:'0 0 16px'}}>📋 Récapitulatif</h3>
            {[
              {l:'Sous-total',v:`${totalPanier.toLocaleString()} FCFA`},
              {l:'Frais de livraison',v:`${fraisLivraison.toLocaleString()} FCFA`},
              {l:'Commission Agrinova (3%)',v:`${commission.toLocaleString()} FCFA`},
            ].map(r=>(
              <div key={r.l} style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
                <span style={{color:'#717973',fontSize:'14px'}}>{r.l}</span>
                <span style={{fontWeight:'bold',color:'#012d1d',fontSize:'14px'}}>{r.v}</span>
              </div>
            ))}
            <div style={{borderTop:'2px solid #f0eee9',paddingTop:'12px',display:'flex',justifyContent:'space-between'}}>
              <span style={{fontWeight:'900',color:'#012d1d',fontSize:'18px'}}>TOTAL</span>
              <span style={{fontWeight:'900',color:'#012d1d',fontSize:'24px'}}>{totalFinal.toLocaleString()} FCFA</span>
            </div>
          </div>

          <h3 style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',marginBottom:'16px'}}>💳 Choisir le paiement</h3>
          <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            {[
              {icon:'📱',nom:'Wave',couleur:'#1a56db',sub:'Paiement instantané — Recommandé',recommande:true},
              {icon:'🟠',nom:'Orange Money',couleur:'#ff6b00',sub:'Disponible 24h/24',recommande:false},
              {icon:'🤝',nom:'Paiement à la livraison',couleur:'#012d1d',sub:'Payez en cash à la réception',recommande:false},
            ].map((p,i)=>(
              <button key={p.nom}
                onClick={async()=>{
                  if(!adresseLivraison.trim()){showToast('⚠️ Entrez votre adresse de livraison !');return;}
                  const num=`AG-${Math.floor(Math.random()*90000+10000)}`;
                  showToast(`⏳ Traitement du paiement ${p.nom}...`);
                  try{
                    for(const item of panierItems){
                      await api('/commandes','POST',{
                        produit_id:item.id, quantite:item.qte,
                        adresse_livraison:adresseLivraison,
                        methode_paiement:p.nom.toLowerCase().replace(/\s+/g,'_')
                      });
                    }
                  }catch(e){console.log('Commande en mode local');}
                  await new Promise(r=>setTimeout(r,2000));
                  showToast(`✅ Commande N° ${num} confirmée !`);
                  setPanierItems([]);
                  setAdresseLivraison('');
                  await new Promise(r=>setTimeout(r,1500));
                  setPage('livraison');
                }}
                style={{padding:'16px 20px',borderRadius:'16px',border:`2px solid ${i===0?p.couleur:'#e4e2dd'}`,background:i===0?`${p.couleur}12`:'white',cursor:'pointer',display:'flex',alignItems:'center',gap:'16px',textAlign:'left',width:'100%',transition:'all 0.2s'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=p.couleur;e.currentTarget.style.background=`${p.couleur}12`}}
                onMouseLeave={e=>{if(i!==0){e.currentTarget.style.borderColor='#e4e2dd';e.currentTarget.style.background='white'}}}>
                <span style={{fontSize:'28px'}}>{p.icon}</span>
                <div style={{flex:1}}>
                  <p style={{fontWeight:'900',color:'#012d1d',fontSize:'16px',margin:0}}>{p.nom}</p>
                  <p style={{color:'#717973',fontSize:'12px',margin:0}}>{p.sub}</p>
                </div>
                {p.recommande&&<span style={{background:p.couleur,color:'white',padding:'4px 10px',borderRadius:'50px',fontSize:'11px',fontWeight:'bold',whiteSpace:'nowrap'}}>⭐ Top</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // ── LIVRAISON ─────────────────────────────────────────────
  if (page==='livraison') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'40px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={()=>setPage('marketplace')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <div><h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'18px',margin:0}}>📦 Suivi de Livraison</h1><p style={{color:'#717973',fontSize:'12px',margin:0}}>Commande #AG-8821</p></div>
          <div style={{marginLeft:'auto',background:'#cdebc4',color:'#012d1d',padding:'6px 14px',borderRadius:'50px',fontWeight:'bold',fontSize:'12px'}}>⏱ 14:30</div>
        </div>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px',display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={{borderRadius:'32px',height:'200px',background:'linear-gradient(135deg,#cdebc4,#a8d5b5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
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
          ].map((s,i)=>(
            <div key={s.label} style={{display:'flex',gap:'16px',alignItems:'flex-start',marginBottom:i<3?'20px':'0'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                <div style={{width:'48px',height:'48px',borderRadius:'50%',background:s.fait?'#012d1d':'#e4e2dd',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0,boxShadow:s.actif?'0 0 0 4px rgba(193,236,212,0.5)':'none'}}>{s.fait?s.icon:'○'}</div>
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
          <div style={{width:'64px',height:'64px',borderRadius:'16px',overflow:'hidden',flexShrink:0}}>
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
        <button onClick={()=>setPage('notation')}
          style={{width:'100%',padding:'20px',background:'#FFA000',color:'#012d1d',border:'none',borderRadius:'20px',fontWeight:'900',fontSize:'18px',cursor:'pointer',boxShadow:'0 8px 30px rgba(255,160,0,0.3)'}}>
          ✅ Confirmer la réception
        </button>
      </div>
    </div>
  );

  // ── NOTATION ──────────────────────────────────────────────
  if (page==='notation') return (
    <div style={{minHeight:'100vh',background:'linear-gradient(180deg,#012d1d 0%,#fbf9f4 50%)',display:'flex',flexDirection:'column',alignItems:'center',padding:'40px 24px'}}>
      <Toast/>
      {noteEnvoyee?(
        <div style={{textAlign:'center',marginTop:'80px'}}>
          <div style={{fontSize:'80px',marginBottom:'24px'}}>🎉</div>
          <h2 style={{color:'#012d1d',fontWeight:'900',fontSize:'28px',marginBottom:'12px'}}>Merci pour votre avis !</h2>
          <p style={{color:'#717973',fontSize:'16px',marginBottom:'40px'}}>Votre note aide la communauté Agrinova 🌾</p>
          <button onClick={()=>{setNoteEnvoyee(false);setNoteEtoile(0);setCommentaire('');setPage('marketplace');}} style={{background:'#012d1d',color:'white',border:'none',borderRadius:'16px',padding:'16px 40px',fontWeight:'900',fontSize:'18px',cursor:'pointer'}}>Retour au marché →</button>
        </div>
      ):(
        <>
          <div style={{textAlign:'center',marginBottom:'32px'}}>
            <h1 style={{color:'white',fontWeight:'900',fontSize:'28px',margin:'0 0 8px'}}>⭐ Évaluer votre commande</h1>
            <p style={{color:'rgba(255,255,255,0.7)',fontSize:'15px',margin:0}}>Comment s'est passée votre expérience ?</p>
          </div>
          <div style={{background:'white',borderRadius:'32px',padding:'32px',width:'100%',maxWidth:'420px',boxShadow:'0 20px 60px rgba(0,0,0,0.15)'}}>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <div style={{width:'80px',height:'80px',borderRadius:'50%',background:'#1b4332',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'32px',fontWeight:'bold',margin:'0 auto 12px'}}>M</div>
              <p style={{fontWeight:'900',color:'#012d1d',fontSize:'18px',margin:0}}>Moussa Diop</p>
              <p style={{color:'#717973',fontSize:'13px',margin:0}}>Producteur • Agrinova</p>
            </div>
            <div style={{textAlign:'center',marginBottom:'24px'}}>
              <p style={{fontWeight:'bold',color:'#012d1d',fontSize:'15px',marginBottom:'16px'}}>{noteEtoile===0?'Touchez une étoile pour noter':noteEtoile===5?'Excellent ! 🎉':noteEtoile>=4?'Très bien ! 😊':noteEtoile>=3?'Bien 👍':'Peut mieux faire 😐'}</p>
              <div style={{display:'flex',justifyContent:'center',gap:'8px'}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setNoteEtoile(n)}
                    style={{fontSize:'44px',background:'none',border:'none',cursor:'pointer',transform:noteEtoile>=n?'scale(1.1)':'scale(1)',transition:'transform 0.15s'}}>
                    {noteEtoile>=n?'⭐':'☆'}
                  </button>
                ))}
              </div>
            </div>
            <textarea value={commentaire} onChange={e=>setCommentaire(e.target.value)}
              placeholder="Laissez un commentaire (optionnel)..."
              style={{width:'100%',padding:'14px 16px',background:'#f0eee9',border:'none',borderRadius:'16px',fontSize:'14px',outline:'none',resize:'none',height:'100px',boxSizing:'border-box',marginBottom:'20px',fontFamily:'inherit'}}/>
            <button onClick={async()=>{
              if(noteEtoile===0){showToast('⚠️ Choisissez une note d\'abord !');return;}
              try{await api('/avis','POST',{commande_id:1,note:noteEtoile,commentaire});}catch{}
              setNoteEnvoyee(true);
            }} style={{width:'100%',padding:'16px',background:noteEtoile>0?'#012d1d':'#ccc',color:'white',border:'none',borderRadius:'16px',fontWeight:'900',fontSize:'18px',cursor:noteEtoile>0?'pointer':'not-allowed',transition:'all 0.2s'}}>
              Envoyer mon avis ⭐
            </button>
          </div>
        </>
      )}
    </div>
  );

  // ── AJOUTER PRODUIT ───────────────────────────────────────
  if (page==='ajouter') return (
    <div style={{minHeight:'100vh',background:'#fbf9f4',paddingBottom:'40px'}}>
      <Toast/>
      <div style={{background:'white',position:'sticky',top:0,zIndex:40,boxShadow:'0 2px 12px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px',padding:'16px 24px'}}>
          <button onClick={()=>setPage('producteur')} style={{background:'none',border:'none',cursor:'pointer',fontSize:'24px'}}>←</button>
          <h1 style={{color:'#012d1d',fontWeight:'900',fontSize:'20px',margin:0}}>➕ Publier un produit</h1>
        </div>
      </div>
      <div style={{maxWidth:'600px',margin:'0 auto',padding:'24px',display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',textAlign:'center'}}>
          <div style={{width:'120px',height:'120px',borderRadius:'24px',background:'#f0eee9',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',cursor:'pointer',border:'2px dashed #c1c8c2'}}>
            <span style={{fontSize:'36px'}}>📷</span>
            <p style={{fontSize:'12px',color:'#717973',margin:'8px 0 0',fontWeight:'bold'}}>Ajouter photo</p>
          </div>
          <p style={{color:'#717973',fontSize:'13px',margin:0}}>Prenez une belle photo de votre produit</p>
        </div>
        <div style={{background:'white',borderRadius:'24px',padding:'24px',boxShadow:'0 2px 12px rgba(0,0,0,0.06)',display:'flex',flexDirection:'column',gap:'16px'}}>
          {[
            {label:'🌾 Nom du produit *',placeholder:'Ex: Tomates cerises de Thiès',val:nomProduit,set:setNomProduit,type:'text'},
            {label:'📝 Description',placeholder:'Ex: Récoltées ce matin, très fraîches',val:descProduit,set:setDescProduit,type:'text'},
            {label:'💰 Prix (FCFA/kg) *',placeholder:'Ex: 350',val:prixProduit,set:setPrixProduit,type:'number'},
            {label:'📦 Quantité disponible (kg) *',placeholder:'Ex: 50',val:qteProduit,set:setQteProduit,type:'number'},
            {label:'📍 Localisation *',placeholder:'Ex: Thiès, Sénégal',val:locProduit,set:setLocProduit,type:'text'},
          ].map(f=>(
            <div key={f.label}>
              <label style={{display:'block',fontWeight:'bold',color:'#012d1d',fontSize:'14px',marginBottom:'8px'}}>{f.label}</label>
              <input type={f.type} value={f.val} onChange={e=>f.set(e.target.value)} placeholder={f.placeholder}
                style={{width:'100%',padding:'14px 16px',background:'#f0eee9',border:f.val?'2px solid #22c55e':'2px solid transparent',borderRadius:'14px',fontSize:'14px',outline:'none',boxSizing:'border-box',transition:'border 0.2s'}}/>
            </div>
          ))}
          <div>
            <label style={{display:'block',fontWeight:'bold',color:'#012d1d',fontSize:'14px',marginBottom:'8px'}}>🏷️ Catégorie</label>
            <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
              {[{v:'Légumes',i:'🥦'},{v:'Fruits',i:'🍊'},{v:'Céréales',i:'🌾'},{v:'Légumineuses',i:'🥜'}].map(c=>(
                <button key={c.v} onClick={()=>setCatProduit(c.v)}
                  style={{padding:'10px 16px',borderRadius:'12px',border:'none',cursor:'pointer',fontWeight:'bold',fontSize:'13px',background:catProduit===c.v?'#012d1d':'#f0eee9',color:catProduit===c.v?'white':'#414844',transition:'all 0.2s'}}>
                  {c.i} {c.v}
                </button>
              ))}
            </div>
          </div>
        </div>
        <button onClick={async()=>{
          if(!nomProduit||!prixProduit||!qteProduit||!locProduit){showToast('⚠️ Remplis les champs obligatoires (*) !');return;}
          if(parseFloat(prixProduit)<=0){showToast('⚠️ Le prix doit être supérieur à 0');return;}
          setChargement(true);
          try{
            const data=await api('/produits','POST',{
              nom:nomProduit, description:descProduit,
              prix:parseFloat(prixProduit), quantite_disponible:parseInt(qteProduit),
              localisation:locProduit, categorie:catProduit,
            });
            if(data.produit||data.message){
              showToast(`✅ "${nomProduit}" publié sur le marketplace ! 🌾`);
              setNomProduit('');setDescProduit('');setPrixProduit('');setQteProduit('');setLocProduit('');
              setTimeout(()=>setPage('marketplace'),2000);
            }else{showToast('❌ '+(data.detail||'Erreur de publication'));}
          }catch{showToast('❌ Serveur indisponible. Réessayez.');}
          setChargement(false);
        }} style={{width:'100%',padding:'20px',background:'#012d1d',color:'white',border:'none',borderRadius:'20px',fontWeight:'900',fontSize:'18px',cursor:'pointer',boxShadow:'0 8px 30px rgba(1,45,29,0.3)'}}>
          {chargement?'⏳ Publication en cours...':'🌾 Publier sur le Marketplace'}
        </button>
      </div>
    </div>
  );

  return null;
}