(() => {
  const STORE = 'frutaverse-ai-v1';
  const initial = { series: [], characters: [], episodes: [] };
  let data;
  try { data = JSON.parse(localStorage.getItem(STORE)) || structuredClone(initial); } catch { data = structuredClone(initial); }
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const save = () => { localStorage.setItem(STORE, JSON.stringify(data)); render(); };
  let toastTimer;
  function toast(message) { const el=$('#toast'); el.textContent=message; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2800); }
  function navigate(page) {
    $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===page));
    const names={inicio:'Visão geral',series:'Minhas séries',personagens:'Personagens',roteiros:'Roteiros'};
    $('#page-title').textContent=names[page]||'FrutaVerse AI';
  }
  function modal(title, body, onReady) {
    const root=$('#modal-root');
    root.innerHTML=`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><div><div class="eyebrow">FRUTAVERSE AI STUDIO</div><h2>${title}</h2></div><button class="icon-btn" data-close aria-label="Fechar">×</button></div><div class="modal-body">${body}</div></div></div>`;
    root.querySelector('[data-close]').onclick=closeModal;
    root.querySelector('.modal-backdrop').addEventListener('click',e=>{if(e.target.classList.contains('modal-backdrop'))closeModal()});
    if(onReady) onReady(root);
  }
  function closeModal(){ $('#modal-root').innerHTML=''; }
  function createSeries() {
    modal('Criar uma nova série', `
      <form id="series-form" class="form-grid">
        <label class="full">Nome da série<input name="name" placeholder="Ex.: O Reino das Frutas" required maxlength="70"></label>
        <label>Gênero<select name="genre"><option>Drama e mistério</option><option>Comédia</option><option>Romance</option><option>Suspense e traição</option><option>Aventura</option><option>Fantasia</option></select></label>
        <label>Tom da história<select name="tone"><option>Cinematográfico e emocionante</option><option>Engraçado e leve</option><option>Sombrio e cheio de suspense</option><option>Emocionante e familiar</option></select></label>
        <label>Duração desejada<select name="duration"><option value="45–60 segundos">45–60 segundos</option><option value="60–90 segundos">60–90 segundos</option><option value="2–3 minutos">2–3 minutos</option></select></label>
        <label>Personagens iniciais<select name="cast"><option value="3">3 personagens</option><option value="4">4 personagens</option><option value="5">5 personagens</option></select></label>
        <label class="full">Ideia inicial<textarea name="premise" rows="3" placeholder="Ex.: Uma maçã descobre que o rei abacaxi esconde um segredo..."></textarea></label>
        <div class="full modal-note">A série será salva neste navegador. A conexão com uma IA real será configurada numa próxima etapa.</div>
        <div class="full form-actions"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary" type="submit">Criar série →</button></div>
      </form>`, root=>{
      root.querySelector('#series-form').onsubmit=e=>{
        e.preventDefault(); const f=new FormData(e.currentTarget); const item={id:crypto.randomUUID(),name:f.get('name').trim(),genre:f.get('genre'),tone:f.get('tone'),duration:f.get('duration'),premise:f.get('premise').trim(),createdAt:new Date().toISOString()};
        data.series.unshift(item);
        const fruits=[['🍎','Maçã','A protagonista, corajosa e curiosa'],['🍍','Abacaxi','Uma figura poderosa com um passado misterioso'],['🍊','Laranja','Leal, esperta e cheia de energia'],['🍌','Banana','Engraçado, mas guarda uma preocupação'],['🍓','Morango','Observadora e determinada']];
        const count=Number(f.get('cast'));
        fruits.slice(0,count).forEach(([emoji,name,personality],i)=>data.characters.push({id:crypto.randomUUID(),seriesId:item.id,name,fruit:name,emoji,personality,appearance:`Personagem antropomórfico de ${name.toLowerCase()}, animação 3D cinematográfica, materiais detalhados, iluminação de filme.`,voice:'Português brasileiro; personalidade marcante.',relations:'A definir no roteiro',createdAt:new Date().toISOString()}));
        closeModal(); save(); navigate('series'); toast('Série criada! Agora crie o roteiro do episódio 1.'); openSeries(item.id);
      };
    });
  }
  function createCharacter(preselected='') {
    const options=data.series.map(s=>`<option value="${s.id}" ${s.id===preselected?'selected':''}>${esc(s.name)}</option>`).join('');
    if(!data.series.length){toast('Crie uma série primeiro.');createSeries();return;}
    modal('Adicionar personagem',`<form id="char-form" class="form-grid">
      <label class="full">Série<select name="seriesId" required>${options}</select></label>
      <label>Nome do personagem<input name="name" required placeholder="Ex.: Rei Abacaxi"></label>
      <label>Fruta<input name="fruit" required placeholder="Ex.: Abacaxi"></label>
      <label>Emoji de referência<input name="emoji" value="🍍" maxlength="4"></label>
      <label>Voz e forma de falar<input name="voice" placeholder="Ex.: grave, confiante"></label>
      <label class="full">Personalidade<textarea name="personality" rows="2" placeholder="Objetivos, qualidades, defeitos..." required></textarea></label>
      <label class="full">Aparência que deve continuar igual<textarea name="appearance" rows="3" placeholder="Rosto, cores, roupas, acessórios, estilo 3D..." required></textarea></label>
      <label class="full">Relações e segredos<textarea name="relations" rows="2" placeholder="Família, aliados, rivais e segredos"></textarea></label>
      <div class="full form-actions"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary">Salvar personagem</button></div>
    </form>`,root=>{root.querySelector('#char-form').onsubmit=e=>{e.preventDefault();const f=new FormData(e.currentTarget);data.characters.push({id:crypto.randomUUID(),seriesId:f.get('seriesId'),name:f.get('name').trim(),fruit:f.get('fruit').trim(),emoji:f.get('emoji')||'🍎',voice:f.get('voice'),personality:f.get('personality'),appearance:f.get('appearance'),relations:f.get('relations'),createdAt:new Date().toISOString()});closeModal();save();toast('Personagem salvo!');};});
  }
  function openSeries(id) {
    const s=data.series.find(x=>x.id===id); if(!s)return;
    const eps=data.episodes.filter(e=>e.seriesId===id).sort((a,b)=>a.number-b.number);
    const chars=data.characters.filter(c=>c.seriesId===id);
    const last=eps[eps.length-1];
    modal(s.name,`<div class="series-detail"><div class="detail-cover">${chars.slice(0,3).map(c=>`<span>${esc(c.emoji)}</span>`).join('')||'<span>🍎</span><span>🍍</span><span>🍊</span>'}</div>
      <div class="detail-meta"><span class="tag">${esc(s.genre)}</span><span class="tag">${esc(s.duration)}</span></div>
      <p>${esc(s.premise||'A premissa ainda não foi definida. Você pode construir a história ao criar o próximo episódio.')}</p>
      <div class="detail-stats"><span><b>${chars.length}</b> personagens</span><span><b>${eps.length}</b> episódios</span></div>
      <h3>Bíblia da série</h3><p class="muted small">Os personagens e acontecimentos anteriores serão usados como referência de continuidade.</p>
      <div class="mini-character-list">${chars.map(c=>`<div><span>${esc(c.emoji)}</span><div><b>${esc(c.name)}</b><small>${esc(c.personality)}</small></div></div>`).join('')||'<p class="muted">Cadastre os personagens principais.</p>'}</div>
      <h3>Episódios</h3><div class="episode-mini-list">${eps.map(e=>`<button class="episode-row" data-episode="${e.id}"><span class="episode-num">EP ${e.number}</span><span><b>${esc(e.title)}</b><small>${esc(statusName(e.status))}</small></span><span>→</span></button>`).join('')||'<p class="muted">Ainda não há episódios.</p>'}</div>
      <div class="form-actions"><button class="btn btn-ghost" data-add-character>＋ Personagem</button><button class="btn btn-primary" data-new-episode>＋ Criar roteiro</button></div>
      </div>`,root=>{
        root.querySelector('[data-add-character]').onclick=()=>{closeModal();createCharacter(id)};
        root.querySelector('[data-new-episode]').onclick=()=>{closeModal();createEpisode(id)};
        root.querySelectorAll('[data-episode]').forEach(b=>b.onclick=()=>{closeModal();openEpisode(b.dataset.episode)});
    });
  }
  function createEpisode(seriesId) {
    const s=data.series.find(x=>x.id===seriesId); if(!s)return;
    const eps=data.episodes.filter(e=>e.seriesId===seriesId).sort((a,b)=>a.number-b.number);
    const chars=data.characters.filter(c=>c.seriesId===seriesId);
    const next=eps.length+1;
    const previous=eps.map(e=>`EPISÓDIO ${e.number}: ${e.title}\n${e.summary}\nDesfecho: ${e.cliffhanger||'não definido'}`).join('\n\n');
    modal('Preparar episódio '+next,`<div class="ai-status"><span class="status-orb">✦</span><div><b>Roteiro aguardando criação</b><p>Este ambiente ainda não está conectado a um modelo de IA. Você pode montar um rascunho de demonstração para testar o fluxo, ou configurar a API numa próxima etapa.</p></div></div>
      <form id="episode-form" class="form-grid">
        <label class="full">Título provisório<input name="title" value="Episódio ${next}: O segredo começa" required></label>
        <label class="full">O que deve acontecer neste episódio?<textarea name="direction" rows="3" placeholder="Ex.: A Maçã encontra uma pista escondida no poço...">${next===1?esc(s.premise):''}</textarea></label>
        <label class="full">Personagens neste episódio<select name="cast" multiple size="3">${chars.map(c=>`<option value="${c.id}" selected>${esc(c.emoji)} ${esc(c.name)}</option>`).join('')}</select><small class="field-help">Use Ctrl ou Command para selecionar vários personagens no computador.</small></label>
        <label class="full">Resumo anterior (continuidade)<textarea rows="3" readonly>${previous||'Este é o primeiro episódio da série.'}</textarea></label>
        <div class="full modal-note warning-note">O botão abaixo cria somente um rascunho demonstrativo local. Não é uma chamada real de IA e não gera vídeo nem cobra créditos.</div>
        <div class="full form-actions"><button type="button" class="btn btn-ghost" data-close>Cancelar</button><button class="btn btn-primary">Criar rascunho de demonstração</button></div>
      </form>`,root=>{
      root.querySelector('#episode-form').onsubmit=e=>{
        e.preventDefault();const f=new FormData(e.currentTarget);const title=f.get('title').trim();const direction=f.get('direction').trim();const selected=[...root.querySelector('[name="cast"]').selectedOptions].map(o=>o.value);const cast=chars.filter(c=>selected.includes(c.id));
        const ep={id:crypto.randomUUID(),seriesId,number:next,title,summary:direction||'A trama começa a se desenrolar e os personagens se deparam com uma situação inesperada.',direction,castIds:cast.map(c=>c.id),status:'draft',demo:true,scenes:[{title:'Cena 1 — O começo',description:`Estabelecer o cenário de ${s.name} com visual 3D cinematográfico, luz volumétrica, cores ricas e enquadramento vertical 9:16.`,dialogue:cast[0]?`${cast[0].name}: “Tem alguma coisa errada por aqui...”`:'Narrador: “Tudo estava prestes a mudar.”'},{title:'Cena 2 — A descoberta',description:direction||'O protagonista encontra uma pista inesperada que muda o rumo da história.',dialogue:cast[1]?`${cast[1].name}: “Você não devia ter vindo até aqui.”`:'Personagem: “Precisamos descobrir a verdade.”'},{title:'Cena 3 — Gancho final',description:'Close cinematográfico na reação do protagonista; a revelação é interrompida por um acontecimento misterioso.',dialogue:'Narrador: “Mas o que descobriram era apenas o começo...”'}],cliffhanger:'Uma descoberta levanta uma nova pergunta para o próximo episódio.',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
        data.episodes.push(ep);closeModal();save();openEpisode(ep.id);toast('Rascunho criado. Revise antes de aprovar.');
      };
    });
  }
  function statusName(s){return ({draft:'Rascunho demonstrativo',pending:'Aguardando aprovação',approved:'Aprovado para produção',production:'Em produção',done:'Concluído',rejected:'Precisa de alterações'})[s]||s;}
  function openEpisode(id) {
    const ep=data.episodes.find(e=>e.id===id);if(!ep)return;const s=data.series.find(x=>x.id===ep.seriesId);
    modal('Episódio '+ep.number,`<div class="episode-editor"><div class="ai-status"><span class="status-orb">${ep.demo?'✎':'✦'}</span><div><b>${ep.demo?'Rascunho de demonstração':'Roteiro'}</b><p>${ep.demo?'Este texto foi montado localmente para testar o aplicativo. Ainda não foi escrito por uma IA conectada.':'Roteiro salvo.'}</p></div></div>
      <div class="detail-meta"><span class="tag">${esc(statusName(ep.status))}</span><span class="tag">${esc(s?.name||'Série')}</span></div>
      <label>Título do episódio<input id="ep-title" value="${esc(ep.title)}"></label>
      <label>Resumo / direção da história<textarea id="ep-summary" rows="4">${esc(ep.direction||ep.summary)}</textarea></label>
      <h3>Cenas do episódio</h3><div class="scene-list">${ep.scenes.map((sc,i)=>`<div class="scene-card"><div class="scene-number">CENA 0${i+1}</div><b>${esc(sc.title)}</b><p>${esc(sc.description)}</p><blockquote>${esc(sc.dialogue)}</blockquote></div>`).join('')}</div>
      <label>Gancho para o próximo episódio<textarea id="ep-cliffhanger" rows="2">${esc(ep.cliffhanger||'')}</textarea></label>
      <div class="production-block"><b>Produção de vídeo</b><p>Bloqueada até conectar um provedor de vídeo e configurar as credenciais com segurança. Aprovar este rascunho não gera vídeo automaticamente.</p><button class="btn btn-ghost btn-full" disabled>Integração de vídeo pendente</button></div>
      <div class="form-actions stacked-actions"><button class="btn btn-ghost" data-save-draft>Salvar alterações</button><button class="btn btn-primary" data-approve>✓ Aprovar roteiro</button></div>
      <button class="text-btn" data-revise>Marcar para alterações</button>
      </div>`,root=>{
      root.querySelector('[data-save-draft]').onclick=()=>{ep.title=root.querySelector('#ep-title').value.trim()||ep.title;ep.direction=root.querySelector('#ep-summary').value;ep.summary=ep.direction;ep.cliffhanger=root.querySelector('#ep-cliffhanger').value;ep.updatedAt=new Date().toISOString();save();closeModal();toast('Alterações salvas.');};
      root.querySelector('[data-approve]').onclick=()=>{ep.title=root.querySelector('#ep-title').value.trim()||ep.title;ep.direction=root.querySelector('#ep-summary').value;ep.summary=ep.direction;ep.cliffhanger=root.querySelector('#ep-cliffhanger').value;ep.status='approved';ep.updatedAt=new Date().toISOString();save();closeModal();toast('Roteiro aprovado. Vídeo ainda bloqueado até conectar a IA.');};
      root.querySelector('[data-revise]').onclick=()=>{ep.status='rejected';ep.updatedAt=new Date().toISOString();save();closeModal();toast('Marcado para alterações.');};
    });
  }
  function seriesCard(s) {
    const chars=data.characters.filter(c=>c.seriesId===s.id);const eps=data.episodes.filter(e=>e.seriesId===s.id);const last=eps[eps.length-1];
    return `<article class="series-card"><button class="cover-art" data-open-series="${s.id}"><span class="cover-orbit"></span><span class="cover-fruits">${chars.slice(0,3).map(c=>esc(c.emoji)).join(' ')||'🍎 🍍 🍊'}</span><span class="cover-label">SÉRIE ORIGINAL</span></button><div class="series-card-body"><div class="card-topline"><span class="tag">${esc(s.genre)}</span><span class="more-dot">•••</span></div><h3>${esc(s.name)}</h3><p>${esc(s.premise||'Uma nova história esperando para ser criada.')}</p><div class="card-footer"><span>${eps.length} episódio(s)</span><button class="text-btn" data-open-series="${s.id}">${last?'Continuar':'Abrir série'} →</button></div></div></article>`;
  }
  function render(){
    $('#stat-series').textContent=data.series.length;$('#stat-characters').textContent=data.characters.length;$('#stat-pending').textContent=data.episodes.filter(e=>e.status==='draft'||e.status==='pending'||e.status==='rejected').length;$('#stat-done').textContent=data.episodes.filter(e=>e.status==='done').length;
    $('#home-series').innerHTML=data.series.slice(0,3).map(seriesCard).join('')||'<div class="empty-state"><span>🍓</span><h3>Sua primeira série começa aqui</h3><p>Crie um universo, seus personagens e a primeira história.</p><button class="btn btn-primary" id="empty-create">＋ Criar primeira série</button></div>';
    $('#all-series').innerHTML=data.series.map(seriesCard).join('')||'<div class="empty-state"><span>🎬</span><h3>Nenhuma série ainda</h3><p>Crie sua primeira série de frutas em 3D.</p><button class="btn btn-primary" id="empty-create">＋ Criar primeira série</button></div>';
    $('#character-list').innerHTML=data.characters.map(c=>`<article class="character-card"><div class="character-avatar">${esc(c.emoji)}</div><div class="character-info"><span class="tag">${esc(data.series.find(s=>s.id===c.seriesId)?.name||'Série removida')}</span><h3>${esc(c.name)}</h3><p>${esc(c.personality)}</p><details><summary>Ver identidade visual</summary><p>${esc(c.appearance)}</p><p><b>Voz:</b> ${esc(c.voice)}</p><p><b>Relações:</b> ${esc(c.relations)}</p></details></div><button class="icon-btn" title="Excluir personagem" data-delete-char="${c.id}">×</button></article>`).join('')||'<div class="empty-state"><span>♟</span><h3>Seu elenco está vazio</h3><p>Crie uma série e cadastre seus personagens.</p></div>';
    const episodes=[...data.episodes].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
    $('#script-list').innerHTML=episodes.map(e=>`<button class="script-row" data-open-episode="${e.id}"><span class="script-icon">✎</span><span class="script-info"><b>${esc(e.title)}</b><small>${esc(data.series.find(s=>s.id===e.seriesId)?.name||'Série')} · Episódio ${e.number}</small></span><span class="tag ${e.status==='approved'?'tag-green':''}">${esc(statusName(e.status))}</span><span>→</span></button>`).join('')||'<div class="empty-state"><span>✎</span><h3>Nenhum roteiro ainda</h3><p>Crie uma série para começar a planejar seus episódios.</p><button class="btn btn-primary" id="empty-create">＋ Criar série</button></div>';
    $$('[data-open-series]').forEach(b=>b.onclick=()=>openSeries(b.dataset.openSeries));
    $$('[data-open-episode]').forEach(b=>b.onclick=()=>openEpisode(b.dataset.openEpisode));
    $$('[data-delete-char]').forEach(b=>b.onclick=()=>{const c=data.characters.find(x=>x.id===b.dataset.deleteChar);if(c&&confirm('Excluir o personagem '+c.name+'?')){data.characters=data.characters.filter(x=>x.id!==c.id);save();toast('Personagem excluído.');}});
    const empty=$('#empty-create');if(empty)empty.onclick=createSeries;
  }
  $$('.nav-item').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.page)));
  $$('[data-goto]').forEach(b=>b.addEventListener('click',()=>navigate(b.dataset.goto)));
  $('#new-series-top').onclick=createSeries;$('#hero-new').onclick=createSeries;$('#new-series-list').onclick=createSeries;$('#new-character').onclick=()=>createCharacter();
  render();
})();