/* CyberSecure — interações locais do protótipo. Não conecta dados externos. */
(() => {
  'use strict';
  const sidebar = document.getElementById('sidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const menuToggle = document.getElementById('menuToggle');
  function setMenu(open) {
    sidebar.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    backdrop.hidden = !open;
  }
  menuToggle.addEventListener('click', () => setMenu(!sidebar.classList.contains('is-open')));
  backdrop.addEventListener('click', () => setMenu(false));
  sidebar.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 980) setMenu(false); });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  const articles = [...document.querySelectorAll('.article-card[data-category]')];
  function filterArticles(category) {
    const count = articles.reduce((n, article) => {
      const visible = category === 'todos' || article.dataset.category === category;
      article.hidden = !visible;
      return n + Number(visible);
    }, 0);
    filterButtons.forEach(button => {
      const selected = button.dataset.filter === category;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    document.getElementById('filterEmpty').hidden = count > 0;
  }
  filterButtons.forEach(button => button.addEventListener('click', () => filterArticles(button.dataset.filter)));
  document.querySelectorAll('[data-filter-nav]').forEach(link => link.addEventListener('click', () => filterArticles(link.dataset.filterNav)));
  document.querySelectorAll('a[href="#artigos"]:not([data-filter-nav])').forEach(link => link.addEventListener('click', () => filterArticles('todos')));

  const dialog = document.getElementById('searchDialog');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const entries = [
    ['Visão geral', 'Página inicial', '#inicio'],
    ['Serviços e soluções', 'Institucional', '#servicos'],
    ['Portfólio e projetos', 'Institucional', '#portfolio'],
    ['Notícias e artigos', 'Conteúdo', '#artigos'],
    ['SOC: visibilidade, logs e monitoramento', 'Guia técnico', '#artigo-soc'],
    ['Vulnerabilidades e CVEs', 'Artigo', '#artigo-cves'],
    ['Cloud Security, IAM e identidades', 'Artigo', '#artigo-cloud'],
    ['Segurança e segmentação de redes', 'Artigo', '#artigo-redes'],
    ['Tutorial Zabbix e monitoramento', 'Tutorial', '#artigo-zabbix'],
    ['Resposta a incidentes', 'Artigo', '#artigo-incidentes'],
    ['Biblioteca de referências', 'Recursos', '#referencias'],
    ['Sobre a marca', 'Institucional', '#sobre'],
    ['Contato', 'Institucional', '#contato']
  ];
  const safe = value => value.replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  function renderResults(query) {
    const normal = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const matches = entries.filter(([title, type]) => normal(title + ' ' + type).includes(normal(query))).slice(0, 9);
    searchResults.innerHTML = matches.length
      ? matches.map(([title, type, href]) => `<a class="search-result" href="${href}"><span>${safe(title)}</span><small>${safe(type)} ↗</small></a>`).join('')
      : '<p class="no-results">Nenhum resultado local encontrado.</p>';
  }
  function openSearch() { if (!dialog.open) dialog.showModal(); searchInput.value = ''; renderResults(''); searchInput.focus(); }
  document.getElementById('searchToggle').addEventListener('click', openSearch);
  document.getElementById('searchClose').addEventListener('click', () => dialog.close());
  searchInput.addEventListener('input', () => renderResults(searchInput.value.trim()));
  searchResults.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.hash.startsWith('#artigo-')) filterArticles('todos');
    dialog.close();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  window.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearch(); }
    if (event.key === 'Escape' && sidebar.classList.contains('is-open')) setMenu(false);
  });

  // Atualiza o destaque da navegação lateral conforme o trecho visualizado.
  if ('IntersectionObserver' in window) {
    const sections = [...document.querySelectorAll('main section[id]')];
    const sideLinks = [...document.querySelectorAll('.side-link:not([data-filter-nav])')];
    const observer = new IntersectionObserver(items => {
      const current = items.filter(item => item.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!current) return;
      sideLinks.forEach(link => {
        const active = link.getAttribute('href') === '#' + current.target.id;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    }, {rootMargin:'-16% 0px -60% 0px',threshold:[0,.15,.35]});
    sections.forEach(section => observer.observe(section));
  }
})();
