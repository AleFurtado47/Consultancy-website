/* The Monday-Morning Test: the response model. One source of truth for response IDs,
   contextual wording, statuses, summaries and the connected readings.
   - Questions, answers, statuses and individual readings: the 12 October 2026 launch
     handoff (reference/prototype/dist/model.js), unchanged in meaning.
   - Connected readings and cross-group questions: the relationship review package of the
     same day (relationship-model.cjs), integrated here so screen and print share one
     engine. It replaces the earlier six selective connection rules (decision 154).
   Framework-independent: the page reads window.MMT, and .claude/qa/mmt runs this same file
   through the handoff's model test and the package's exhaustive audit. */
(function (root) {
  'use strict';
  const contexts = [
    { id: 'strategy', label: 'Organisational strategy', reference: 'this strategy', example: 'Organisational strategy 2026–2030' },
    { id: 'programme', label: 'Programme or project plan', reference: 'this plan', example: 'Regional livelihoods programme' },
    { id: 'unit', label: 'Unit or department strategy / workplan', reference: 'this strategy or workplan', example: 'Country office workplan' },
    { id: 'other', label: 'Something else', reference: 'this work', example: 'Describe the work you want to examine' }
  ];
  const context = id => contexts.find(c => c.id === id) || contexts[0];
  const reference = id => context(id).reference;
  const unknown = () => ({ id: 'unknown', text: 'I do not know.', status: 'unknown', reading: 'You could not confirm this arrangement. This is information to clarify, rather than evidence of an organisational gap.', prompt: 'Who or what could help you establish how this works in practice?' });
  const mechanisms = [
    {
      id: 'authorship', name: 'Authorship', short: 'Who shaped the work',
      question: c => `Who developed the substance of ${reference(c)}: the intended results and the work needed to achieve them?`,
      note: 'Developing the substance means shaping the commitments and work, rather than only writing the document or commenting on a draft.',
      options: [
        { id: 'teams', text: 'Teams responsible for delivery developed it, drawing on knowledge of the people and contexts it needs to serve.', status: 'support', reading: 'Your answer places delivery teams in a role developing the commitments and work, drawing on knowledge of the people and contexts involved.', prompt: 'How was that knowledge reflected in the commitments and delivery arrangements?' },
        { id: 'joint', text: 'A smaller group and delivery teams developed it together.', status: 'support', reading: 'Your answer describes delivery teams jointly developing the substance, alongside a smaller group.', prompt: 'Which substantive choices did delivery teams help shape?' },
        { id: 'consulted', text: 'A smaller group developed it, with delivery teams asked to comment.', status: 'concern', reading: 'Your answer places delivery teams in a consultation role rather than a role in developing the substance. It does not establish whether their input changed the final commitments.', prompt: 'Do the commitments reflect what delivering the work and achieving the intended outcomes will require?' },
        { id: 'limited', text: 'A smaller group developed it, with little or no involvement from delivery teams.', status: 'gap', reading: 'You report little or no involvement from delivery teams in developing the substance. How their knowledge informed the commitments remains to be examined.', prompt: 'How did knowledge of delivery conditions reach the people shaping the commitments?' },
        unknown()
      ]
    },
    {
      id: 'budget', name: 'Budget', short: 'What funded work covers',
      question: c => `Someone needs to spend time on work ${reference(c)} requires. Which best describes how that time is funded?`,
      note: 'This question examines funded staff time. Other resources, the amount available and restrictions on use would need a closer review.',
      options: [
        { id: 'covered', text: 'An agreed allocation covers that work, through dedicated funding or existing budgets.', status: 'support', reading: 'You identify an agreed allocation covering the required work. Its sufficiency and availability remain untested.', prompt: 'Does the allocation cover the time required, and can that time be used when needed?' },
        { id: 'unmapped', text: 'Time is charged to existing project or operational budgets, but the work those budgets fund has not been mapped against what this plan or strategy requires.', status: 'concern', reading: 'Coverage of the required work by existing funded commitments has not been established. This does not mean funds are unavailable.', prompt: 'Which required work is covered by existing funded commitments, and which may fall outside them?' },
        { id: 'outside', text: 'The required work falls outside funded commitments, so time has to be taken from other work.', status: 'gap', reading: 'You report that required work falls outside funded commitments and draws time from other work.', prompt: 'How are those competing demands on time resolved, and who can agree a workable allocation?' },
        { id: 'unknown', text: 'I do not know which allocation would cover it.', status: 'unknown', reading: 'You could not identify which allocation covers this work. That does not establish that no allocation exists.', prompt: 'Is the allocation unresolved, or is it not visible from your role?' }
      ]
    },
    {
      id: 'ownership', name: 'Ownership', short: 'What people formally carry',
      question: c => `For the main components of work needed to achieve the intended outcomes of ${reference(c)}, responsibility sits with…`,
      note: 'The same person may carry an outcome and its components. What matters here is whether the components have entered formal commitments.',
      options: [
        { id: 'formal', text: 'Named people, with those components explicitly included in their agreed workplans or performance objectives.', status: 'support', reading: 'You report that responsibility for the components has entered named people’s formal commitments. Their authority and capacity remain untested.', prompt: 'Do those commitments cover the essential work, and can the people responsible fulfil them?' },
        { id: 'overall', text: 'Named people or outcome owners, but responsibility for the components is not explicit in agreed workplans or performance objectives.', status: 'concern', reading: 'People are identified, but responsibility for components has not clearly entered formal commitments. This does not mean nobody is doing that work.', prompt: 'Which component responsibilities need to be made explicit in agreed workplans or performance objectives?' },
        { id: 'unassigned', text: 'No one yet, because responsibility for those components has not been assigned.', status: 'gap', reading: 'You report that responsibility has not yet been assigned for the components of work.', prompt: 'Which essential components need an agreed owner and a place in their formal commitments?' },
        unknown()
      ]
    },
    {
      id: 'reporting', name: 'Reporting', short: 'What the information reveals',
      question: c => `The information used to review ${reference(c)} mainly shows…`,
      note: 'Outcomes may take time to emerge. Early evidence can still help explain whether the work is on course to produce the intended change.',
      options: [
        { id: 'attention', text: 'What has been delivered, what that means for progress towards the intended outcomes, and where attention is needed.', status: 'support', reading: 'You describe information connecting delivery to intended outcomes and making issues needing attention visible.', prompt: 'What evidence supports that connection, and how are attention points identified?' },
        { id: 'outcomes', text: 'What has been delivered and what that means for progress towards the intended outcomes, but not clearly where attention is needed.', status: 'concern', reading: 'You describe an output–outcome connection, while the points needing attention remain unclear.', prompt: 'What would help people identify where progress needs closer attention?' },
        { id: 'outputs', text: 'Which activities or outputs were completed and how much was spent, with little explanation of what this means for the intended outcomes.', status: 'concern', reading: 'The reported information explains delivery and spending, with little explanation of progress towards intended outcomes.', prompt: 'What information would help explain whether the delivered work is contributing to the intended change?' },
        { id: 'none', text: 'No regular information is available to review progress.', status: 'gap', reading: 'You report that regular information is not available to review progress.', prompt: 'What information is needed, and how could it be made available for regular review?' },
        unknown()
      ]
    },
    {
      id: 'deciding', name: 'Deciding', short: 'Where authority is exercised',
      question: c => `When decisions are needed to move ${reference(c)} forward, how is authority exercised in practice?`,
      note: 'Choose the closest description of usual practice. The patterns may overlap. Some decisions appropriately belong with senior management because of their scope or consequences.',
      options: [
        { id: 'appropriate', text: 'Decisions are taken at the level authorised to make them, with escalation when they exceed that authority.', status: 'support', reading: 'You describe authority being exercised within delegated boundaries, with escalation beyond those boundaries. Whether the boundaries fit the decisions required remains to be examined.', prompt: 'Does the allocation of authority fit the decisions needed to move the work forward?' },
        { id: 'delegated', text: 'Authority is formally delegated, but decisions within that authority are regularly passed upwards.', status: 'concern', reading: 'You report that formal delegation is not consistently exercised and that decisions within it regularly move upwards.', prompt: 'What drives escalation of decisions that people are already authorised to make?' },
        { id: 'unclear', text: 'Decision boundaries are unclear in practice, so issues are repeatedly passed upwards.', status: 'concern', reading: 'You report unclear decision boundaries in practice and repeated escalation.', prompt: 'Which boundaries need clarification, and what would enable decisions at the appropriate level?' },
        { id: 'centralised', text: 'Decisions are routinely referred to senior management or the chief executive, with little authority exercised elsewhere.', status: 'concern', reading: 'You describe a broadly centralised pattern. This does not establish whether formal delegation exists or why authority is concentrated.', prompt: 'Does that concentration fit the decisions required, and which decisions could appropriately be taken elsewhere?' },
        unknown()
      ]
    }
  ];
  const relationships = [
    ['authorship','budget','How does the work developed fit the commitments that budgets fund?'],
    ['authorship','ownership','How can people carrying formal commitments shape or seek changes to the work?'],
    ['authorship','reporting','Does progress information test the assumptions behind the intended results and work?'],
    ['authorship','deciding','Who can revisit commitments or delivery arrangements when experience challenges them?'],
    ['budget','ownership','Do funded commitments cover the work people are formally expected to deliver?'],
    ['budget','reporting','Does the information help relate funded work to the intended outcomes?'],
    ['budget','deciding','Who can resolve a mismatch between required work and its funding?'],
    ['ownership','reporting','Can people carrying the work see what their contribution means for intended outcomes?'],
    ['ownership','deciding','How does responsibility for the work relate to authority to resolve issues?'],
    ['reporting','deciding','When information identifies an issue needing attention, can the appropriate level act on it?']
  ].map(([source,target,prompt]) => ({ id: `${source}-${target}`, source, target, prompt }));
  const statusLabels = { support: 'Supporting arrangement reported', concern: 'Worth examining', gap: 'Gap reported', unknown: 'Information to clarify', unanswered: 'Not yet answered' };
  function optionText(mechanismId, optionId, contextId) {
    const option = mechanisms.find(m => m.id === mechanismId)?.options.find(o => o.id === optionId);
    if (!option) return '';
    return option.text.replace('this plan or strategy', reference(contextId));
  }
  /* ---------- Connected readings (relationship review, 12 October 2026) ----------
     Two explanatory groupings, not clusters or gates: how the work enters delivery
     commitments (Authorship, Budget, Ownership) and how progress monitoring informs
     decisions (Reporting, Deciding). Text is chosen from the exact answer IDs, never from
     status colours, so unknown answers stay uncertainty and supportive answers keep their
     status. Authorship + Reporting, Authorship + Deciding and Budget + Reporting stay
     internal hypotheses for the paid Review (see assessPair). */
  const ids = mechanisms.map(m => m.id);
  const RELATION_LIMITS = 'These connections are questions raised by your answers. They do not establish causes, delivery failure or an order for making changes.';
  const authorship={
   teams:'Delivery teams developed the substance of the work, drawing on knowledge of the people and contexts it needs to serve.',
   joint:'Delivery teams developed the substance of the work together with a smaller group.',
   consulted:'Delivery teams were asked to comment on work developed by a smaller group; whether their input changed the commitments is not established.',
   limited:'You report little or no delivery-team involvement in developing the substance of the work.',
   unknown:'You could not confirm how delivery teams were involved in developing the substance of the work.'
  };
  // Each entry explicitly distinguishes an unknown allocation from an absent one.
  const commitments={
   'covered|formal':[
    'You report an allocation covering the required work and component responsibilities included in named people’s formal commitments.',
    'Do the funded and assigned commitments cover the same components of work?'],
   'covered|overall':[
    'An allocation covers the required work, but responsibility for its components is not explicit in named people’s workplans or performance objectives.',
    'How does the funded work connect to what named people are formally expected to deliver?'],
   'covered|unassigned':[
    'An allocation covers the required work, while responsibility for its components has not yet been assigned.',
    'Who is expected to carry the funded work, and where will that responsibility be agreed?'],
   'covered|unknown':[
    'An allocation covers the required work, but you could not confirm how responsibility for its components is assigned.',
    'Can the funded components be traced to the people responsible for delivering them?'],
   'unmapped|formal':[
    'People formally carry responsibility for components of the work, but coverage of the required work by existing funded commitments has not been established.',
    'Do the funded commitments cover the components people are formally expected to deliver?'],
   'unmapped|overall':[
    'Coverage by existing funded commitments has not been established, and component responsibilities are not explicit in named people’s workplans or performance objectives.',
    'Can the required components be traced to both funded work and agreed responsibilities?'],
   'unmapped|unassigned':[
    'Coverage by existing funded commitments has not been established, while responsibility for the components has not yet been assigned.',
    'How will the required components enter both funded work and agreed responsibilities?'],
   'unmapped|unknown':[
    'Coverage by existing funded commitments has not been established, and you could not confirm how responsibility for components is assigned.',
    'Which components are covered by funded work, and who is responsible for them?'],
   'outside|formal':[
    'People formally carry responsibility for work that falls outside funded commitments, so delivering it draws time from other work.',
    'How are the competing demands on those people’s time resolved?'],
   'outside|overall':[
    'Required work draws time from other funded commitments, while responsibility for its components is not explicit in named people’s workplans or performance objectives.',
    'How are expectations for this work reconciled with people’s funded and formally assigned commitments?'],
   'outside|unassigned':[
    'Required work falls outside funded commitments, and responsibility for its components has not yet been assigned.',
    'How is the work expected to proceed when both funded coverage and assigned responsibility are unresolved?'],
   'outside|unknown':[
    'Required work falls outside funded commitments, and you could not confirm how responsibility for its components is assigned.',
    'Who is expected to carry this work, and how are competing demands on their time resolved?'],
   'unknown|formal':[
    'People formally carry responsibility for components of the work, but you could not identify the allocation covering it.',
    'Which allocation covers the work people are formally expected to deliver?'],
   'unknown|overall':[
    'Responsibility for components is not explicit in named people’s workplans or performance objectives, and you could not identify the allocation covering the work.',
    'Can the main components be traced to both an agreed responsibility and the allocation covering the time required?'],
   'unknown|unassigned':[
    'Responsibility for components has not yet been assigned, and you could not identify the allocation covering the work.',
    'Who will carry the required work, and what allocation would cover their time?'],
   'unknown|unknown':[
    'You could not confirm either the allocation covering the work or how responsibility for its components is assigned.',
    'What would establish how the required work enters funded and assigned commitments?']
  };
  const reporting={
   attention:'Progress information connects delivered work to intended outcomes and identifies where attention is needed.',
   outcomes:'Progress information connects delivered work to intended outcomes, but does not clearly identify where attention is needed.',
   outputs:'Progress information mainly describes completed activities or outputs and spending, with little explanation of what they mean for intended outcomes.',
   none:'You report no regular information for reviewing progress.',
   unknown:'You could not confirm what the information used to review progress shows.'
  };
  const deciding={
   appropriate:'Decisions are taken within authorised boundaries, with escalation when they exceed that authority.',
   delegated:'Decisions within formally delegated authority are nevertheless regularly passed upwards.',
   unclear:'Decision boundaries are unclear in practice, and issues are repeatedly passed upwards.',
   centralised:'Decisions are routinely referred to senior management or the chief executive, with little authority exercised elsewhere.',
   unknown:'You could not confirm how decision authority is exercised in practice.'
  };
  const actionQuestions={
   attention:{
    appropriate:'When information identifies an issue, can the authorised level act on it and review the effect of its decision?',
    delegated:'Does passing decisions upwards delay action on issues already identified in the progress information?',
    unclear:'Can the issues identified in progress information be matched to a clear level of decision authority?',
    centralised:'Does concentrating decisions at senior level allow the issues identified in progress information to receive the response they need?',
    unknown:'Who is authorised to act on the issues identified in progress information?'
   },
   outcomes:{
    appropriate:'How do authorised decision-makers identify what needs attention from the information available?',
    delegated:'How are issues requiring action identified, and why are decisions within delegated authority passed upwards?',
    unclear:'How is an issue recognised as needing action and directed to a level authorised to decide?',
    centralised:'How are issues needing attention identified and brought to the senior level where decisions are concentrated?',
    unknown:'How are issues needing attention identified, and who is authorised to act on them?'
   },
   outputs:{
    appropriate:'What evidence informs whether those decisions will help progress towards the intended outcomes?',
    delegated:'What outcome evidence informs the decisions being passed upwards, and does that escalation help resolve the issue?',
    unclear:'What evidence identifies the response needed, and which level is authorised to decide on it?',
    centralised:'What evidence about intended outcomes reaches the senior level where decisions are concentrated?',
    unknown:'What evidence about outcomes informs decisions, and who is authorised to make them?'
   },
   none:{
    appropriate:'What information do authorised decision-makers use to judge progress and the need for a response?',
    delegated:'What information informs the decisions being passed upwards when regular progress information is unavailable?',
    unclear:'How do people establish what needs a response and where authority to decide sits?',
    centralised:'What information reaches senior decision-makers when regular progress information is unavailable?',
    unknown:'What information is needed to review progress, and who is authorised to decide on a response?'
   },
   unknown:{
    appropriate:'What information do authorised decision-makers use to connect their decisions to progress towards outcomes?',
    delegated:'What information accompanies decisions passed upwards, and why is delegated authority not being exercised?',
    unclear:'What information informs decisions, and how are the relevant authority boundaries established?',
    centralised:'What progress information reaches the senior level where decisions are concentrated?',
    unknown:'What information is used to review progress, and how is authority to respond exercised?'
   }
  };
  function groupKind(a,keys){const s=keys.map(k=>mechanisms.find(m=>m.id===k).options.find(o=>o.id===a[k]).status);return s.every(x=>x==='unknown')?'uncertain':s.every(x=>x==='support')?'supportive':'mixed';}
  function coreWork(a){
   const [body,q]=commitments[a.budget+'|'+a.ownership];
   const kind=groupKind(a,['authorship','budget','ownership']);
   let observation=authorship[a.authorship]+' '+body;
   let question=q;
   if(kind==='uncertain')observation='You could not confirm how the substance was developed, which allocation covers the work or how responsibility for components is assigned. These unknowns do not establish that the arrangements are absent.';
   else if(kind==='supportive')observation+=' These answers do not yet establish how well those commitments fit together.';
   if(['consulted','limited'].includes(a.authorship))question+=' How is delivery teams’ knowledge reflected in those commitments?';
   else if(['teams','joint'].includes(a.authorship)&&kind!=='supportive')question+=' Do those commitments reflect the work delivery teams helped develop?';
   return {id:'work-commitments',title:'How the work enters delivery commitments',mechanisms:['authorship','budget','ownership'],kind,observation,question};
  }
  function coreAction(a){
   const kind=groupKind(a,['reporting','deciding']);
   let observation=reporting[a.reporting]+' '+deciding[a.deciding];
   if(kind==='supportive')observation+=' Whether that information leads to an effective response remains to be examined.';
   if(kind==='uncertain')observation='You could not confirm either what progress information shows or how decision authority is exercised. This leaves the connection between reviewing progress and deciding on a response unestablished.';
   return {id:'information-action',title:'How progress monitoring informs decisions',mechanisms:['reporting','deciding'],kind,observation,question:actionQuestions[a.reporting][a.deciding]};
  }
  // Extra public questions require specific answer-level justification.
  // They are not findings that the pair is causally linked.
  function crossQuestions(a){
   const q=[];const add=(id,mechanisms,question)=>q.push({id,mechanisms,question});
   const escalates=['delegated','unclear','centralised'].includes(a.deciding);
   if(['unmapped','outside'].includes(a.budget)&&(escalates||a.deciding==='unknown')){
    const issue=a.budget==='outside'?'work outside funded commitments':'work whose coverage by funded commitments has not been established';
    const question=a.deciding==='unknown'?`Who is authorised to resolve the allocation of time for ${issue}?`:`For ${issue}, which decisions about allocating time can be made closer to delivery, and which need senior approval?`;
    add('funding-authority',['budget','deciding'],question);
   }
   const ownershipIssue=['overall','unassigned'].includes(a.ownership);
   if(a.ownership==='formal'&&(escalates||a.deciding==='unknown')){
    const question=a.deciding==='unknown'?'Do the people carrying formal commitments have authority to resolve issues affecting their work?':'How does the authority people exercise relate to the delivery commitments they formally carry?';
    add('responsibility-authority',['ownership','deciding'],question);
   }else if(ownershipIssue&&a.deciding!=='unknown'){
    const question=a.deciding==='appropriate'?'When an authorised decision is made, who is responsible for carrying out the resulting work?':'How are responsibility for the work and authority to resolve issues agreed with the people involved?';
    add('responsibility-authority',['ownership','deciding'],question);
   }else if(ownershipIssue&&a.deciding==='unknown'){
    add('responsibility-authority',['ownership','deciding'],'Who is expected to carry the work, and who is authorised to resolve issues affecting it?');
   }
   if(ownershipIssue&&['attention','outcomes','outputs','none'].includes(a.reporting)){
    const question=a.reporting==='attention'?'When progress information identifies an issue, who is responsible for the work needed in response?':a.reporting==='outcomes'?'How do the people carrying components of the work review what their contribution means for intended outcomes?':'How can the contribution of each component be reviewed when formal responsibility and outcome information both need attention?';
    add('responsibility-information',['ownership','reporting'],question);
   }else if(a.ownership==='formal'&&a.reporting==='none'){
    add('responsibility-information',['ownership','reporting'],'How do people review progress on their formal commitments when regular progress information is unavailable?');
   }
   return q;
  }
  function statusOf(id, answer) { return mechanisms.find(m => m.id === id).options.find(o => o.id === answer).status; }
  // A complete reading's connected text. Throws on a missing or invalid answer rather
  // than producing a misleading partial reading; derive() calls it only when complete.
  function relate(a) {
    for (const m of mechanisms) if (!m.options.some(o => o.id === a[m.id])) throw Error('Missing or invalid ' + m.id);
    const statuses = Object.fromEntries(ids.map(k => [k, statusOf(k, a[k])]));
    let groups = [coreWork(a), coreAction(a)];
    let links = crossQuestions(a);
    // Merge overlapping responsibility questions when useful reporting already makes the
    // response visible. Both source rules stay recorded in coveredRules.
    const ra = links.find(x => x.id === 'responsibility-authority');
    const ri = links.find(x => x.id === 'responsibility-information');
    if (ra && ri && a.reporting === 'attention') {
      links = links.filter(x => x !== ra && x !== ri);
      links.push({ id: 'responsibility-information-authority', mechanisms: ['ownership','reporting','deciding'], coveredRules: [ra.id, ri.id], question: 'When progress information identifies an issue, who is responsible for the response and what authority can they exercise?' });
    }
    if (ids.every(k => statuses[k] === 'unknown')) {
      groups = [{ id: 'all-unknown', title: 'What remains to be clarified', mechanisms: ids, kind: 'uncertain', observation: 'You could not confirm the arrangements across the five mechanisms. This leaves their connections unestablished, rather than showing that the organisation has gaps in all five.', question: 'Who or what could help you trace the work from its development into funded responsibilities, and establish how progress information informs decisions?' }];
      links = [];
    }
    return { version: 'launch-2', answers: { ...a }, statuses, groups, crossQuestions: links, limits: RELATION_LIMITS };
  }
  // Internal only: how each of the 211 pairwise answer combinations is treated.
  function assessPair(left,lo,right,ro){
   const pair=left+'-'+right;
   const core=['authorship-budget','authorship-ownership','budget-ownership'].includes(pair)?'work-commitments':pair==='reporting-deciding'?'information-action':null;
   const a={authorship:'joint',budget:'covered',ownership:'formal',reporting:'attention',deciding:'appropriate',[left]:lo,[right]:ro};
   const statuses=[left,right].map(k=>mechanisms.find(m=>m.id===k).options.find(o=>o.id===a[k]).status);
   const evidence=statuses.every(s=>s==='unknown')?'both_unknown':statuses.includes('unknown')?'mixed_known_unknown':statuses.every(s=>s==='support')?'both_supportive':'reported_concern_or_gap';
   if(core)return {pair,answers:[lo,ro],evidence,disposition:'included_in_core_reading',destination:core,reason:'These answer combinations are interpreted together without changing either individual status.'};
   const key={'budget-deciding':'funding-authority','ownership-deciding':'responsibility-authority','ownership-reporting':'responsibility-information'}[pair];
   if(key){const found=crossQuestions(a).find(x=>x.id===key);return {pair,answers:[lo,ro],evidence,disposition:found?'additional_question':'covered_by_core_readings',destination:found?'cross-questions':'individual-core-readings',question:found?.question||'',reason:found?'This combination raises a specific question about the interface; it does not establish a causal effect.':'Keep the reported facts in their core readings; no additional pair-specific claim is supported.'};}
   return {pair,answers:[lo,ro],evidence,disposition:'review_hypothesis_only',destination:'paid-review-design',reason:{'authorship-reporting':'The questions do not establish whose knowledge shapes reporting or whether reports test the assumptions used in development.','authorship-deciding':'Authority to make routine decisions does not establish who can reopen the substance of the strategy or plan.','budget-reporting':'The answers do not identify which funded components are represented in reports, their costing or outcome contributions.'}[pair]};
  }
  function derive(answers = {}) {
    const results = mechanisms.map(m => {
      const answer = m.options.find(o => o.id === answers[m.id]) || null;
      return { ...m, answer, answered: !!answer, status: answer?.status || 'unanswered', label: statusLabels[answer?.status || 'unanswered'], reading: answer?.reading || '', prompt: answer?.prompt || '' };
    });
    const counts = { support: 0, concern: 0, gap: 0, unknown: 0, unanswered: 0 };
    results.forEach(m => counts[m.status]++);
    const complete = counts.unanswered === 0;
    const answeredCount = 5 - counts.unanswered;
    const supportive = results.filter(m => m.status === 'support').map(m => m.name);
    const concerns = results.filter(m => ['concern','gap'].includes(m.status)).map(m => m.name);
    const uncertain = results.filter(m => m.status === 'unknown').map(m => m.name);
    const join = list => list.length < 2 ? (list[0] || '') : list.slice(0,-1).join(', ') + ' and ' + list[list.length-1];
    let summary;
    if (!complete) summary = 'Complete all five questions to see the signals in your answers and the relationships worth examining.';
    else if (counts.support === 5) summary = 'Your answers describe supporting arrangements across all five mechanisms. How well they work together remains to be examined.';
    else if (counts.unknown === 5) summary = 'You could not confirm the arrangements across the five mechanisms. The next step is to clarify how they work in practice; these answers do not establish organisational gaps or assess delivery.';
    else {
      const parts = [];
      if (supportive.length) parts.push(`You describe supporting arrangements in ${join(supportive)}.`);
      if (concerns.length) parts.push(`Your answers identify arrangements to examine in ${join(concerns)}. The readings distinguish the gaps you report from arrangements that need closer examination.`);
      if (uncertain.length) parts.push(`Information remains to be clarified in ${join(uncertain)}.`);
      parts.push('These are signals in your answers, not a diagnosis of how the whole system performs.');
      summary = parts.join(' ');
    }
    const rel = complete ? relate(answers) : null;
    return { mechanisms: results, groups: rel ? rel.groups : [], crossQuestions: rel ? rel.crossQuestions : [], limits: RELATION_LIMITS, summary, counts, complete, answeredCount };
  }
  const api = { contexts, context, reference, mechanisms, relationships, statusLabels, optionText, derive, relate, coreWork, coreAction, crossQuestions, assessPair, commitments, actionQuestions, version: 'launch-2' };
  root.MMT = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
