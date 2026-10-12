/* The Monday-Morning Test: the page behaviour. Reads the response model from
   assets/mmt-model.js (window.MMT) and never interprets answers itself.

   Privacy, by construction: answers and optional names live in the `state` object
   for the life of the tab. Nothing here stores, submits, logs or transmits them, and
   nothing is written to the URL. All user text reaches the page through textContent,
   never as markup. The model test in .claude/qa/mmt checks this file for storage,
   network and HTML-injection APIs. */
(function () {
  'use strict';
  var M = window.MMT;
  if (!M) return;

  var $ = function (id) { return document.getElementById(id); };
  var SVG = 'http://www.w3.org/2000/svg';
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var PROGRAMME_NOTE = 'Some objectives may have been fixed externally. Answer about how the substance was developed; this does not assume delivery teams could change every objective.';
  var GAP_FULL = { authorship: 'Participation gap reported', budget: 'Resource mismatch reported', ownership: 'Assignment gap reported', reporting: 'Information gap reported' };
  var GAP_SHORT = { authorship: 'Participation gap', budget: 'Resource mismatch', ownership: 'Assignment gap', reporting: 'Information gap' };
  var SHORT = { support: 'Supporting arrangement', concern: 'Worth examining', unknown: 'Information to clarify' };
  var COLOUR = { support: '#193ABF', concern: '#973811', gap: '#973811', unknown: '#626475' };

  function fresh() { return { context: null, name: '', other: '', answers: {}, index: 0, committed: null, selected: null, restarted: false }; }
  var state = fresh();

  /* ---------- small helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVG, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function fullLabel(m) { return m.status === 'gap' ? (GAP_FULL[m.id] || M.statusLabels.gap) : M.statusLabels[m.status]; }
  function shortLabel(m) { return m.status === 'gap' ? (GAP_SHORT[m.id] || 'Reported gap') : SHORT[m.status]; }

  /* The status marker. Drawn in SVG rather than as a CSS background so it survives
     printing with background graphics switched off. Solid circle, solid square, or a
     grey outlined circle with a question mark. Always paired with written status text. */
  function marker(status, size) {
    size = size || 13;
    var s = svgEl('svg', { width: size, height: size, viewBox: '0 0 13 13', 'aria-hidden': 'true', focusable: 'false', 'class': 'mk mk-' + status });
    if (status === 'gap') s.append(svgEl('rect', { x: 0.5, y: 0.5, width: 12, height: 12, fill: COLOUR.gap }));
    else if (status === 'unknown') {
      s.append(svgEl('circle', { cx: 6.5, cy: 6.5, r: 5.6, fill: '#fff', stroke: COLOUR.unknown, 'stroke-width': 1.4 }));
      var q = svgEl('text', { x: 6.5, y: 9.6, 'text-anchor': 'middle', 'font-size': 8.5, 'font-weight': 600, 'font-family': 'Inter,Arial,sans-serif', fill: COLOUR.unknown });
      q.textContent = '?';
      s.append(q);
    } else s.append(svgEl('circle', { cx: 6.5, cy: 6.5, r: 6.2, fill: COLOUR[status] }));
    return s;
  }

  function contextLabel() { return M.context(state.context).label; }
  /* The work's title: the optional name, else the Something-else description, else the context. */
  function workTitle(s) {
    s = s || state;
    if (s.name) return s.name;
    if (s.context === 'other' && s.other) return s.other;
    return M.context(s.context).label;
  }
  /* The name with the context label alongside it, so the same work stays in view. */
  function workLine() {
    var t = workTitle();
    return t === contextLabel() ? t : t + ' · ' + contextLabel();
  }
  /* The centre of the diagram holds a bounded label; the full title sits above the reading. */
  function centreLabel() {
    var t = workTitle();
    if (t.length <= 42) return t;
    return state.context === 'other' ? 'This work' : contextLabel();
  }

  function goTo(node) {
    node.scrollIntoView({ block: 'start', behavior: REDUCED ? 'instant' : 'smooth' });
  }
  function announce(text) {
    var s = $('mmt-status');
    s.textContent = '';
    window.setTimeout(function () { s.textContent = text; }, 60);
  }
  function show(id) {
    ['intro', 'questionnaire', 'results'].forEach(function (x) { $(x).hidden = x !== id; });
    document.body.setAttribute('data-screen', id);
    $('test').scrollIntoView({ block: 'start', behavior: 'instant' });
  }

  /* ---------- the introduction ---------- */
  function readFields() {
    var picked = document.querySelector('input[name="context"]:checked');
    var ctx = picked ? picked.value : null;
    return { context: ctx, name: $('work-name').value.trim(), other: ctx === 'other' ? $('other-name').value.trim() : '' };
  }
  function started() { return Object.keys(state.answers).length > 0; }
  function changedWork() {
    var c = state.committed, f = readFields();
    return !!c && (f.context !== c.context || f.name !== c.name || f.other !== c.other);
  }
  function refreshStart() {
    var notice = $('restart-notice');
    if (started() && changedWork()) {
      notice.textContent = 'You have started answering for ' + workTitle(state.committed) + '. Applying this change will clear your answers, so that the questions refer to the newly selected work.';
      notice.hidden = false;
      $('start').textContent = 'Clear answers and start again';
    } else {
      notice.hidden = true;
      notice.textContent = '';
      $('start').textContent = started() ? 'Return to the questions' : 'Start the test';
    }
  }
  function setContextUI(ctx) {
    $('other-fields').hidden = ctx !== 'other';
    if (ctx) $('work-name').placeholder = 'For example: ' + M.context(ctx).example.toLowerCase();
  }
  function buildContexts() {
    var box = $('context-options');
    box.replaceChildren();
    M.contexts.forEach(function (c) {
      var label = el('label', 'choice');
      var input = el('input');
      input.type = 'radio'; input.name = 'context'; input.value = c.id;
      input.addEventListener('change', function () {
        $('context-error').textContent = '';
        $('contexts').removeAttribute('aria-invalid');
        setContextUI(c.id);
        refreshStart();
      });
      label.append(input, el('span', '', c.label));
      box.append(label);
    });
  }
  function fillFields(c) {
    document.querySelectorAll('input[name="context"]').forEach(function (i) { i.checked = !!c && i.value === c.context; });
    $('work-name').value = c ? c.name : '';
    $('other-name').value = c ? c.other : '';
    setContextUI(c ? c.context : null);
  }
  function intro() {
    if (state.committed) fillFields(state.committed);
    refreshStart();
    show('intro');
    $('intro-heading').focus({ preventScroll: true });
  }
  function start() {
    var f = readFields();
    if (!f.context) {
      $('context-error').textContent = 'Choose what you would like to examine.';
      $('contexts').setAttribute('aria-invalid', 'true');
      document.querySelector('input[name="context"]').focus();
      return;
    }
    if (started() && changedWork()) {
      state.answers = {};
      state.index = 0;
      state.restarted = true;
      clearReading();
    } else if (!started()) state.index = 0;
    state.context = f.context; state.name = f.name; state.other = f.other;
    state.committed = { context: f.context, name: f.name, other: f.other };
    question();
  }

  /* ---------- the questions ---------- */
  function renderSteps() {
    var list = $('step-list');
    list.replaceChildren();
    M.mechanisms.forEach(function (m, i) {
      var li = el('li');
      var b = el('button', 'step' + (state.answers[m.id] ? ' done' : ''));
      b.type = 'button';
      var done = !!state.answers[m.id];
      b.setAttribute('aria-label', 'Question ' + (i + 1) + ', ' + m.name + ', ' + (done ? 'answered' : 'not answered'));
      if (i === state.index) b.setAttribute('aria-current', 'step');
      b.append(el('span', 'step-n', String(i + 1).padStart(2, '0')), el('span', 'step-name', m.name), el('span', 'step-state', done ? 'Answered' : 'Not answered'));
      b.addEventListener('click', function () { state.index = i; question(); });
      li.append(b);
      list.append(li);
    });
  }
  function question(focus) {
    var m = M.mechanisms[state.index];
    show('questionnaire');
    renderSteps();
    $('context-caption').textContent = workLine();
    var note = $('q-notice');
    if (state.restarted) {
      note.textContent = 'Your previous answers were cleared. The questions now refer to ' + workTitle() + '.';
      note.hidden = false;
      state.restarted = false;
    } else { note.hidden = true; note.textContent = ''; }
    $('question-meta').textContent = 'Question ' + (state.index + 1) + ' of 5 · ' + m.name;
    $('question-title').textContent = m.question(state.context);
    $('question-hint').textContent = m.note + (state.context === 'programme' && m.id === 'authorship' ? ' ' + PROGRAMME_NOTE : '');
    $('answer-error').textContent = '';
    $('answers').removeAttribute('aria-invalid');
    var box = $('answer-options');
    box.replaceChildren();
    m.options.forEach(function (o) {
      var label = el('label', 'choice');
      var input = el('input');
      input.type = 'radio'; input.name = 'answer-' + m.id; input.value = o.id;
      input.checked = state.answers[m.id] === o.id;
      input.addEventListener('change', function () {
        state.answers[m.id] = o.id;
        $('answer-error').textContent = '';
        $('answers').removeAttribute('aria-invalid');
        renderSteps();
        $('to-results').hidden = !M.derive(state.answers).complete || state.index === 4;
      });
      label.append(input, el('span', '', M.optionText(m.id, o.id, state.context)));
      box.append(label);
    });
    $('back').hidden = state.index === 0;
    $('next').textContent = state.index === 4 ? 'See your reading' : 'Continue';
    $('to-results').hidden = !M.derive(state.answers).complete || state.index === 4;
    if (focus !== false) $('question-title').focus({ preventScroll: true });
  }
  function missing(text) {
    $('answer-error').textContent = text;
    $('answers').setAttribute('aria-invalid', 'true');
  }
  function next() {
    var m = M.mechanisms[state.index];
    if (!state.answers[m.id]) {
      missing('Choose the closest answer, or select “I do not know”.');
      $('answer-options').querySelector('input').focus();
      return;
    }
    if (state.index === 4) results();
    else { state.index++; question(); }
  }

  /* ---------- the reading ---------- */
  function clearReading() {
    ['date', 'reading-name', 'summary', 'result-scope', 'centre-title'].forEach(function (id) { $(id).textContent = ''; });
    $('result-scope').hidden = true;
    $('map-svg').replaceChildren();
    $('map-labels').replaceChildren();
    $('map-detail').replaceChildren();
    $('group-cards').replaceChildren();
    $('conn-keep').querySelectorAll('.group-card').forEach(function (c) { c.remove(); });
    $('cross-list').replaceChildren();
    $('cross-block').hidden = true;
    $('connections').hidden = true;
    $('signal-cards').replaceChildren();
    state.selected = null;
  }
  function results() {
    var model = M.derive(state.answers);
    if (!model.complete) {
      state.index = model.mechanisms.findIndex(function (m) { return !m.answered; });
      question();
      missing('Please answer this question to complete your reading.');
      return;
    }
    clearReading();
    $('date').textContent = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    $('reading-name').textContent = workLine();
    $('summary').textContent = model.summary;
    if (state.context === 'other') {
      $('result-scope').textContent = 'Exploratory use: these questions may not fit every aspect of ' + (state.other || 'this work') + '.';
      $('result-scope').hidden = false;
    }
    renderMap(model);
    renderDetail(null);
    renderConnections(model);
    renderSignals(model);
    show('results');
    $('result-heading').focus({ preventScroll: true });
  }

  /* The approved circular outline: 600 x 600, five equal fitted pieces, white interiors,
     curved joins, labels at radius 207. Position carries no meaning of sequence. */
  function P(angle, r) {
    var t = angle * Math.PI / 180;
    return (300 + Math.cos(t) * r).toFixed(3) + ' ' + (300 + Math.sin(t) * r).toFixed(3);
  }
  function piecePath(i) {
    var base = -126 + i * 72, a = base + 2, b = base + 70;
    return 'M ' + P(a, 285) + ' A 285 285 0 0 1 ' + P(b, 285) + ' Q ' + P(b + 6, 198) + ' ' + P(b, 112) +
      ' A 112 112 0 0 0 ' + P(a, 112) + ' Q ' + P(a + 6, 198) + ' ' + P(a, 285) + ' Z';
  }
  function renderMap(model) {
    var svg = $('map-svg'), labels = $('map-labels');
    $('centre-title').textContent = centreLabel();
    model.mechanisms.forEach(function (m, i) {
      var path = svgEl('path', { d: piecePath(i), 'class': 'piece ' + m.status, 'data-mech': m.id });
      path.addEventListener('click', function () { select(m.id); });
      svg.append(path);
      var base = -126 + i * 72, t = (base + 36) * Math.PI / 180;
      var b = el('button', 'map-label ' + m.status);
      b.type = 'button';
      b.style.left = ((300 + Math.cos(t) * 207) / 6) + '%';
      b.style.top = ((300 + Math.sin(t) * 207) / 6) + '%';
      b.setAttribute('aria-label', m.name + ': ' + fullLabel(m) + '. Show this signal.');
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('data-mech', m.id);
      b.append(marker(m.status), el('span', 'nm', m.name), el('small', '', shortLabel(m)));
      b.addEventListener('click', function () { select(m.id); });
      labels.append(b);
    });
  }
  function select(id) {
    var model = M.derive(state.answers);
    var m = model.mechanisms.find(function (x) { return x.id === id; });
    state.selected = id;
    $('map-svg').querySelectorAll('.piece').forEach(function (p) { p.classList.toggle('selected', p.getAttribute('data-mech') === id); });
    $('map-labels').querySelectorAll('.map-label').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mech') === id)); });
    renderDetail(m);
  }
  function renderDetail(m) {
    var box = $('map-detail');
    box.replaceChildren();
    if (!m) { box.append(el('p', 'detail-empty', 'Select a mechanism in the diagram to see its signal here.')); return; }
    var head = el('p', 'detail-head');
    head.append(el('strong', '', m.name));
    var st = el('span', 'status');
    st.append(marker(m.status), document.createTextNode(fullLabel(m)));
    head.append(st);
    var go = el('button', 'linkbtn', 'Go to the full reading');
    go.type = 'button';
    go.addEventListener('click', function () {
      var card = $('signal-' + m.id);
      goTo(card);
      card.focus({ preventScroll: true });
    });
    box.append(head, el('p', 'detail-reading', m.reading), go);
  }
  function mechName(id) { return M.mechanisms.find(function (m) { return m.id === id; }).name; }
  /* The connected readings and cross-group questions, exactly as the model returns them for
     the current answers: every applicable item, unranked, no display limit. Screen and print
     render this same DOM. */
  function renderConnections(model) {
    var groups = $('group-cards'), list = $('cross-list');
    $('connection-limits').textContent = model.limits;
    model.groups.forEach(function (g, i) {
      var card = el('article', 'group-card');
      var prompt = el('p', 'prompt');
      prompt.append(el('b', '', 'Question worth examining'), document.createTextNode(g.question));
      card.append(el('p', 'group-mechs', g.mechanisms.map(mechName).join(' · ')), el('h4', '', g.title), el('p', 'observation', g.observation), prompt);
      // The first reading sits inside the keep-together block with the section heading.
      if (i === 0) $('conn-keep').append(card); else groups.append(card);
    });
    model.crossQuestions.forEach(function (q) {
      var li = el('li', 'cross-item');
      li.append(el('b', 'cross-mechs', q.mechanisms.map(mechName).join(' + ')), el('span', '', q.question));
      list.append(li);
    });
    $('cross-block').hidden = model.crossQuestions.length === 0;
    $('connections').hidden = model.groups.length === 0;
  }
  function renderSignals(model) {
    var box = $('signal-cards');
    model.mechanisms.forEach(function (m, i) {
      var card = el('article', 'signal-card ' + m.status);
      card.id = 'signal-' + m.id;
      card.tabIndex = -1;
      card.setAttribute('aria-labelledby', 'signal-h-' + m.id);
      var head = el('div', 'signal-head');
      var h = el('h4', '', m.name);
      h.id = 'signal-h-' + m.id;
      var badge = el('span', 'status');
      badge.append(marker(m.status), document.createTextNode(fullLabel(m)));
      head.append(h, badge);
      var answer = el('p', 'answer');
      answer.append(el('b', '', 'Your answer'), document.createTextNode(M.optionText(m.id, m.answer.id, state.context)));
      var edit = el('button', 'linkbtn card-edit', 'Change this answer');
      edit.type = 'button';
      edit.setAttribute('aria-label', 'Change your ' + m.name + ' answer');
      edit.addEventListener('click', function () { state.index = i; question(); });
      card.append(head, answer, el('p', 'observation', m.reading), edit);
      box.append(card);
    });
  }

  /* ---------- a new reading ---------- */
  function reset() {
    state = fresh();
    fillFields(null);
    $('context-error').textContent = '';
    $('contexts').removeAttribute('aria-invalid');
    $('answer-error').textContent = '';
    $('answer-options').replaceChildren();
    $('step-list').replaceChildren();
    clearReading();
    refreshStart();
    show('intro');
    document.querySelector('input[name="context"]').focus({ preventScroll: true });
    announce('A new reading has started. Previous answers and names have been cleared.');
  }

  /* ---------- wiring ---------- */
  buildContexts();
  ['work-name', 'other-name'].forEach(function (id) { $(id).addEventListener('input', refreshStart); });
  $('start').addEventListener('click', start);
  $('next').addEventListener('click', next);
  $('to-results').addEventListener('click', results);
  $('back').addEventListener('click', function () { state.index = Math.max(0, state.index - 1); question(); });
  $('change-context').addEventListener('click', intro);
  $('edit-answers').addEventListener('click', function () { state.index = 0; question(); });
  $('print').addEventListener('click', function () { window.print(); });
  $('reset').addEventListener('click', reset);
  $('test').classList.add('js');
  refreshStart();
})();
