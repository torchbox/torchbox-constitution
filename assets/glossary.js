(function () {
  // Skip auto-linking on the glossary page itself
  if (location.pathname.toLowerCase().includes('/glossary')) return;

  function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function walk(node, re, termsMap) {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_SKIP;
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_SKIP;
        // Don’t decorate inside these:
        if (p.closest('a, code, pre, kbd, samp, .glossary-term, .no-glossary, .md-header, .md-nav')) return NodeFilter.FILTER_SKIP;
        if (p.closest('h1, h2, h3, h4, h5, h6')) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const replacements = [];
    while (walker.nextNode()) {
      const tn = walker.currentNode;
      const text = tn.nodeValue;
      if (!re.test(text)) continue;
      const frag = document.createDocumentFragment();
      let last = 0; re.lastIndex = 0; let m;
      while ((m = re.exec(text)) !== null) {
        const term = m[0];
        const def = termsMap[term.toLowerCase()];
        if (!def) continue;
        if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        const span = document.createElement('span');
        span.className = 'glossary-term';
        span.textContent = term;
        span.setAttribute('data-def', def);
        span.setAttribute('tabindex', '0'); // keyboard focusable
        frag.appendChild(span);
        last = m.index + term.length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      replacements.push([tn, frag]);
    }
    for (const [tn, frag] of replacements) tn.parentNode.replaceChild(frag, tn);
  }

  function enhance() {
    fetch(new URL('glossary.json', document.currentScript.src))
      .then(r => r.json())
      .then(data => {
        const terms = Object.keys(data).filter(Boolean).sort((a, b) => b.length - a.length);
        if (!terms.length) return;
        const map = {}; terms.forEach(t => map[t.toLowerCase()] = data[t]);

        // Whole-word-ish match; handles multi-word terms and punctuation
        const pattern = '\\b(' + terms.map(escapeRegExp).join('|') + ')\\b';
        const re = new RegExp(pattern, 'gi');

        const content = document.querySelector('.md-content');
        if (!content) return;
        walk(content, re, map);
      })
      .catch(() => {});
  }

  enhance();

  // Re-run on Material’s instant navigation events
  document.addEventListener('navigation', enhance);
})();
