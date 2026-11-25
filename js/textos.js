// =====================================================================
// TEXTOS: tudo que muda com o idioma (PT / EN) e o que o terminal digita.
// - TERMINAL: o que cada terminal digita, por idioma e por seção.
// - EN: tradução dos textos do index.html. Cada elemento do HTML tem data-t="chave";
//   o texto em português é o que já está no HTML (guardado ao abrir) e este
//   objeto traz só o inglês. Para mudar uma tradução, mude aqui.
// =====================================================================
export const COR = {
  azul: '#2f5bea', verde: '#22b573', coral: '#ff5a3c', tinta: '#16161a',
  creme: '#fffdf7', amarelo: '#ffc93c', azulClaro: '#cfdcff', coralClaro: '#ffd6cc'
};
const P_SHELL = '<span class="p">pedro@dev</span>:~$ ';
const P_SQL = '<span class="p">portfolio=#</span> ';
const P_CONT = '<span class="p">portfolio-#</span> ';
export const sqlK = (t) => `<span class="k">${t}</span>`;   // palavra-chave SQL
export const sqlS = (t) => `<span class="s">${t}</span>`;   // texto entre aspas
export const sqlOk = (t) => `<span class="ok">${t}</span>`;
export const PROMPT_SQL = P_SQL;
export const PROMPT_CONT = P_CONT;


// áreas dos projetos: a contagem de cada uma é feita sozinha a partir do HTML (contarProjetos),
// então para incluir um projeto novo basta colocar o cartão no index.html com data-area="...".
const AREAS = [
  { id: 'dados', pt: 'dados', en: 'data', luz: COR.verde },
  { id: 'backend', pt: 'back-end', en: 'back-end', luz: COR.amarelo },
  { id: 'web', pt: 'web', en: 'web', luz: COR.coral },
  { id: 'ia', pt: 'ia', en: 'ai', luz: COR.azul },
  { id: 'infra', pt: 'infra', en: 'infra', luz: COR.azulClaro }
];
const txtArea = (nome, n) => ` ${nome.padEnd(9)} | ${String(n).padStart(4)}`;
const linhasArea = (l) => AREAS.map((a) => ({ tipo: 'out', txt: txtArea(a[l], 0), chave: 'a-' + a.id, luz: a.luz, area: a }));
export const nomeArea = (id, l) => (AREAS.find((a) => a.id === id) || { [l]: id })[l];

// linhas: tipo 'cmd' (digitada letra a letra, com prompt), 'out' (resultado) ou 'com' (comentário).
// 'chave' liga a linha ao conteúdo (data-linha no HTML); 'luz' é a cor que a linha ganha quando o bloco pula.
export const TERMINAL = {
  pt: [
    [
      { tipo: 'cmd', pre: P_SHELL, txt: 'psql portfolio' },
      { tipo: 'out', txt: sqlOk('conectado ao banco "portfolio" ✓') },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} secao ${sqlK('FROM')} pedro;` },
      { tipo: 'out', txt: ' secao' },
      { tipo: 'out', txt: '--------------' },
      { tipo: 'out', txt: ' sobre', chave: 'm1', luz: COR.azul },
      { tipo: 'out', txt: ' formacao', chave: 'm2', luz: COR.verde },
      { tipo: 'out', txt: ' experiencia', chave: 'm3', luz: COR.coral },
      { tipo: 'out', txt: ' projetos', chave: 'm4', luz: COR.creme },
      { tipo: 'out', txt: ' skills', chave: 'm5', luz: COR.creme },
      { tipo: 'out', txt: ' certificados', chave: 'm6', luz: COR.azulClaro },
      { tipo: 'out', txt: ' contato', chave: 'm7', luz: COR.coralClaro },
      { tipo: 'out', txt: sqlOk('(7 linhas)') }
    ],
    [
      { tipo: 'com', txt: '-- 01 · sobre mim' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} * ${sqlK('FROM')} sobre;` },
      { tipo: 'out', txt: '-[ RECORD 1 ]----------------------' },
      { tipo: 'out', txt: 'nome      | Pedro Nunes Cruz', chave: 'nome', luz: COR.azul },
      { tipo: 'out', txt: 'curso     | Sistemas de Informação' },
      { tipo: 'out', txt: 'faculdade | PUC Minas' },
      { tipo: 'out', txt: 'formatura | 2028 (previsão)' },
      { tipo: 'out', txt: 'perfil    | desenvolvedor full stack' },
      { tipo: 'out', txt: 'citacao   | Provérbios 19:27', chave: 'citacao', luz: COR.amarelo },
      { tipo: 'out', txt: 'curriculo | Curriculo.pdf', chave: 'curriculo', luz: COR.coral },
      { tipo: 'out', txt: sqlOk('(1 linha)') }
    ],
    [
      { tipo: 'com', txt: '-- 02 · formação' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} curso, instituicao, ano` },
      { tipo: 'cmd', pre: P_CONT, txt: `  ${sqlK('FROM')} formacao ${sqlK('ORDER BY')} ano;` },
      { tipo: 'out', txt: ' curso            | instituicao | ano' },
      { tipo: 'out', txt: '------------------+-------------+-----' },
      { tipo: 'out', txt: ' Ensino Médio     | Sesi SENAI  | 2024', chave: 'em', luz: COR.amarelo },
      { tipo: 'out', txt: ' Sist. Informação | PUC Minas   | 2028', chave: 'si', luz: COR.verde },
      { tipo: 'out', txt: sqlOk('(2 linhas)') }
    ],
    [
      { tipo: 'com', txt: '-- 03 · experiência' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('INSERT INTO')} experiencia ${sqlK('VALUES')}` },
      { tipo: 'cmd', pre: P_CONT, txt: `  (${sqlS("'Mellore Alimentos'")}),`, chave: 'mellore', luz: COR.creme },
      { tipo: 'cmd', pre: P_CONT, txt: `  (${sqlS("'Fundação Dom Cabral'")});`, chave: 'fdc', luz: COR.coral },
      { tipo: 'out', txt: sqlOk('INSERT 0 2') }
    ],
    [
      { tipo: 'com', txt: '-- 04 · projetos' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} area, ${sqlK('COUNT')}(*) ${sqlK('FROM')} projetos` },
      { tipo: 'cmd', pre: P_CONT, txt: `  ${sqlK('GROUP BY')} area;` },
      { tipo: 'out', txt: ' area      | count' },
      { tipo: 'out', txt: '-----------+------' },
      ...linhasArea('pt'),
      { tipo: 'out', txt: sqlOk('(5 linhas)') }
    ],
    [
      { tipo: 'com', txt: '-- 05 · skills & tecnologias' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} area, ${sqlK('COUNT')}(*) ${sqlK('FROM')} skills` },
      { tipo: 'cmd', pre: P_CONT, txt: `  ${sqlK('GROUP BY')} area;` },
      { tipo: 'out', txt: ' area           | count' },
      { tipo: 'out', txt: '----------------+-------' },
      { tipo: 'out', txt: ' backend        |     8', chave: 'b0', luz: COR.azul },
      { tipo: 'out', txt: ' frontend       |     3', chave: 'b1', luz: COR.coral },
      { tipo: 'out', txt: ' ferramentas    |     6', chave: 'b2', luz: COR.verde },
      { tipo: 'out', txt: ' versionamento  |     1', chave: 'b3', luz: COR.amarelo },
      { tipo: 'out', txt: ' infraestrutura |     3', chave: 'b4', luz: COR.creme },
      { tipo: 'out', txt: sqlOk('(5 linhas)'), chave: 'lista', luz: COR.azulClaro }
    ],
    [
      { tipo: 'com', txt: '-- 06 · certificados & idiomas' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} * ${sqlK('FROM')} certificados;` },
      { tipo: 'out', txt: ' curso           | origem    | horas' },
      { tipo: 'out', txt: '-----------------+-----------+------' },
      { tipo: 'out', txt: ' Python (intro)  | Santander |    8h', chave: 'c1', luz: COR.amarelo },
      { tipo: 'out', txt: ' Eng. Dados e ML | TOTVS/DIO |   61h', chave: 'c2', luz: COR.azulClaro },
      { tipo: 'out', txt: ' Excel, BI e IA  | Alura     |  120h', chave: 'c3', luz: COR.coralClaro },
      { tipo: 'out', txt: sqlOk('(3 linhas)') },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('TABLE')} idiomas;` },
      { tipo: 'out', txt: ' português · inglês · espanhol', chave: 'idiomas', luz: COR.creme }
    ],
    [
      { tipo: 'com', txt: '-- 07 · contato' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} * ${sqlK('FROM')} contatos;`, chave: 'sel', luz: COR.amarelo },
      { tipo: 'out', txt: ' canal     | endereco' },
      { tipo: 'out', txt: '-----------+--------------------------' }
    ]
  ],
  en: [
    [
      { tipo: 'cmd', pre: P_SHELL, txt: 'psql portfolio' },
      { tipo: 'out', txt: sqlOk('connected to database "portfolio" ✓') },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} section ${sqlK('FROM')} pedro;` },
      { tipo: 'out', txt: ' section' },
      { tipo: 'out', txt: '--------------' },
      { tipo: 'out', txt: ' about', chave: 'm1', luz: COR.azul },
      { tipo: 'out', txt: ' education', chave: 'm2', luz: COR.verde },
      { tipo: 'out', txt: ' experience', chave: 'm3', luz: COR.coral },
      { tipo: 'out', txt: ' projects', chave: 'm4', luz: COR.creme },
      { tipo: 'out', txt: ' skills', chave: 'm5', luz: COR.creme },
      { tipo: 'out', txt: ' certificates', chave: 'm6', luz: COR.azulClaro },
      { tipo: 'out', txt: ' contact', chave: 'm7', luz: COR.coralClaro },
      { tipo: 'out', txt: sqlOk('(7 rows)') }
    ],
    [
      { tipo: 'com', txt: '-- 01 · about me' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} * ${sqlK('FROM')} about;` },
      { tipo: 'out', txt: '-[ RECORD 1 ]----------------------' },
      { tipo: 'out', txt: 'name      | Pedro Nunes Cruz', chave: 'nome', luz: COR.azul },
      { tipo: 'out', txt: 'degree    | Information Systems' },
      { tipo: 'out', txt: 'school    | PUC Minas' },
      { tipo: 'out', txt: 'graduates | 2028 (expected)' },
      { tipo: 'out', txt: 'profile   | full stack developer' },
      { tipo: 'out', txt: 'quote     | Proverbs 19:27', chave: 'citacao', luz: COR.amarelo },
      { tipo: 'out', txt: 'resume    | Curriculo.pdf', chave: 'curriculo', luz: COR.coral },
      { tipo: 'out', txt: sqlOk('(1 row)') }
    ],
    [
      { tipo: 'com', txt: '-- 02 · education' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} course, school, year` },
      { tipo: 'cmd', pre: P_CONT, txt: `  ${sqlK('FROM')} education ${sqlK('ORDER BY')} year;` },
      { tipo: 'out', txt: ' course          | school      | year' },
      { tipo: 'out', txt: '-----------------+-------------+------' },
      { tipo: 'out', txt: ' High School     | Sesi SENAI  | 2024', chave: 'em', luz: COR.amarelo },
      { tipo: 'out', txt: ' Info. Systems  | PUC Minas   | 2028', chave: 'si', luz: COR.verde },
      { tipo: 'out', txt: sqlOk('(2 rows)') }
    ],
    [
      { tipo: 'com', txt: '-- 03 · experience' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('INSERT INTO')} experience ${sqlK('VALUES')}` },
      { tipo: 'cmd', pre: P_CONT, txt: `  (${sqlS("'Mellore Alimentos'")}),`, chave: 'mellore', luz: COR.creme },
      { tipo: 'cmd', pre: P_CONT, txt: `  (${sqlS("'Fundação Dom Cabral'")});`, chave: 'fdc', luz: COR.coral },
      { tipo: 'out', txt: sqlOk('INSERT 0 2') }
    ],
    [
      { tipo: 'com', txt: '-- 04 · projects' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} area, ${sqlK('COUNT')}(*) ${sqlK('FROM')} projects` },
      { tipo: 'cmd', pre: P_CONT, txt: `  ${sqlK('GROUP BY')} area;` },
      { tipo: 'out', txt: ' area      | count' },
      { tipo: 'out', txt: '-----------+------' },
      ...linhasArea('en'),
      { tipo: 'out', txt: sqlOk('(5 rows)') }
    ],
    [
      { tipo: 'com', txt: '-- 05 · skills & technologies' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} area, ${sqlK('COUNT')}(*) ${sqlK('FROM')} skills` },
      { tipo: 'cmd', pre: P_CONT, txt: `  ${sqlK('GROUP BY')} area;` },
      { tipo: 'out', txt: ' area           | count' },
      { tipo: 'out', txt: '----------------+-------' },
      { tipo: 'out', txt: ' backend        |     8', chave: 'b0', luz: COR.azul },
      { tipo: 'out', txt: ' frontend       |     3', chave: 'b1', luz: COR.coral },
      { tipo: 'out', txt: ' tools          |     6', chave: 'b2', luz: COR.verde },
      { tipo: 'out', txt: ' version_ctrl   |     1', chave: 'b3', luz: COR.amarelo },
      { tipo: 'out', txt: ' infrastructure |     3', chave: 'b4', luz: COR.creme },
      { tipo: 'out', txt: sqlOk('(5 rows)'), chave: 'lista', luz: COR.azulClaro }
    ],
    [
      { tipo: 'com', txt: '-- 06 · certificates & languages' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} * ${sqlK('FROM')} certificates;` },
      { tipo: 'out', txt: ' course          | issuer    | hours' },
      { tipo: 'out', txt: '-----------------+-----------+------' },
      { tipo: 'out', txt: ' Python (intro)  | Santander |    8h', chave: 'c1', luz: COR.amarelo },
      { tipo: 'out', txt: ' Data Eng. & ML  | TOTVS/DIO |   61h', chave: 'c2', luz: COR.azulClaro },
      { tipo: 'out', txt: ' Excel, BI & AI  | Alura     |  120h', chave: 'c3', luz: COR.coralClaro },
      { tipo: 'out', txt: sqlOk('(3 rows)') },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('TABLE')} languages;` },
      { tipo: 'out', txt: ' portuguese · english · spanish', chave: 'idiomas', luz: COR.creme }
    ],
    [
      { tipo: 'com', txt: '-- 07 · contact' },
      { tipo: 'cmd', pre: P_SQL, txt: `${sqlK('SELECT')} * ${sqlK('FROM')} contacts;`, chave: 'sel', luz: COR.amarelo },
      { tipo: 'out', txt: ' channel   | address' },
      { tipo: 'out', txt: '-----------+--------------------------' }
    ]
  ]
};

// textos da interface que o JavaScript escreve (o resto está no HTML, com data-t)
// conta quantos projetos há em cada área (lê os cartões do index.html) e escreve no terminal
export function contarProjetos(cartoes) {
  const n = {};
  cartoes.forEach((c) => (c.dataset.area || '').split(' ').forEach((a) => { n[a] = (n[a] || 0) + 1; }));
  ['pt', 'en'].forEach((l) => TERMINAL[l][4].forEach((linha) => { if (linha.area) linha.txt = txtArea(linha.area[l], n[linha.area.id] || 0); }));
}

export const UI = {
  pt: { titulo: 'Pedro Nunes Cruz · Portfólio', desc: 'Portfólio de Pedro Nunes Cruz, estudante de Sistemas de Informação na PUC Minas e desenvolvedor full stack.' },
  en: { titulo: 'Pedro Nunes Cruz · Portfolio', desc: 'Portfolio of Pedro Nunes Cruz, Information Systems student at PUC Minas and full stack developer.' }
};

// ---------- inglês: chave (data-t / data-aria) → texto ----------
export const EN = {
  n1: 'About', n2: 'Education', n3: 'Experience', n4: 'Projects', n5: 'Skills', n6: 'Certificates', n7: 'Contact',
  navaria: 'Sections', langaria: 'Change language', menubtn: 'menu', fechar: 'Close', menucel: 'Section menu',
  a0: 'Home', a1: 'About me', a2: 'Education', a3: 'Professional experience', a4: 'My projects', a5: 'Skills and technologies', a6: 'Certificates and languages', a7: 'Contact',
  h1: 'My portfolio.', introet: 'hello, and welcome!', por: 'by Pedro Nunes Cruz',
  introp: 'Feel free to explore this space. Here you will find my projects, my studies and a little more about my academic and professional journey!',
  e1: '01 · about me', t1: 'About me.',
  sobre1: 'I am an <b>Information Systems</b> student at <b>PUC Minas</b>, expected to graduate in 2028. A full stack developer, always looking to grow my projects with a lot of dedication.',
  sobre2: 'I have always loved technology, and as I grew up that passion became my main field of study. Back in high school I already knew computers were my thing; what I did not expect was how vast this field would turn out to be. I enjoy understanding how processes work and how to extract value from them, which is how I developed a particular affinity for <b>databases</b>. Outside of studying, I am an outgoing person who enjoys a bit of everything, from going out to eat to something more relaxed, like staying home enjoying my games.',
  citacao: '“Son, if you stop learning, you will soon forget what you know.”', cite: 'Proverbs 19:27',
  curriculo: 'View résumé <small>(preview)</small>',
  cvtitulo: 'Résumé', cvbaixar: 'Download PDF', cvabrir: 'Open in new tab',
  e2: '02 · education', t2: 'Education.', concluido: 'completed', cursando: 'in progress · expected 2028',
  em: 'High School', em1: 'Completed high school, where my closer contact with technology and programming began.',
  si: 'Information Systems', si1: 'PUC Minas (Evening Program)',
  si2: 'Ongoing degree focused on software development, databases and data engineering, combining academic theory with day-to-day professional practice.',
  e3: '03 · professional experience', t3: 'Professional experience.',
  per1: 'Aug/2026 – present', atual: 'current', per2: 'Jan/2026 – May/2026', aprendiz: 'apprentice',
  fdc: 'Academic Operations Support Intern',
  fdc1: 'Development of academic process automations with Power Automate and Python, integrating SharePoint, Outlook, Planner and the TOTVS ERP in flows that are now in production. Data extraction and processing with SQL, creation of internal web tools in HTML and JavaScript, modeling and maintenance of Power BI dashboards, and use of generative AI to document and standardize team processes.',
  mel: 'Infrastructure Assistant / IT Support', mel0: 'Mellore Alimentos (Apprentice)',
  mel1: 'Hands-on work supporting and maintaining IT infrastructure, including basic network administration, Active Directory and corporate hardware.',
  e4: '04 · my projects', t4: 'My projects.', detalhes: 'View details', codigo: 'View source code', acessar: 'Open application',
  p1t: 'TDP and Setup Calculator',
  p1d: 'Terminal system built in <b>C#</b> applying Object-Oriented Programming (OOP), lists and loops. The program works as a calculator simulator, adding up component values and sizing the power supply needed in watts.',
  p2t: 'Personal Finance Management',
  p2d: 'Interactive dashboard built with <b>JavaScript</b> and <b>CSS</b>. The application stores its data in <b>LocalStorage</b> and has a custom onboarding flow.',
  p3t: 'Management System (CLI)',
  p3d: 'Command-line application built in <b>Python</b> and integrated with a relational <b>SQLite</b> database. Focused on back-end logic, table design, foreign keys and full CRUD operations using advanced SQL queries.',
  p4t: 'Active Monitoring & BI',
  p4d: 'Lab focused on <b>Business Intelligence</b>. Infrastructure metrics extracted from a Linux server through <b>Zabbix</b>, processed in a <b>MySQL</b> database and visualized in strategic <b>Power BI</b> dashboards.',
  p5t: 'ETL Pipeline with AI',
  p5d: 'Data Engineering project built with <b>Python</b> and <b>Pandas</b>. Focused on resilience: extracting data from local CSV files, integrating with the OpenAI API for intelligent marketing transformation and structuring the Load into JSON.',
  p6t: 'AI skill and agent for 3D websites', tagia: 'AI agents',
  p6d: 'Created a <b>skill</b> and an <b>AI agent</b> that teach and carry out the construction of immersive 3D websites, with a manual, code recipes, a starter kit and a testing routine. The agent itself built the first version of this portfolio.',
  afiltro: 'Filter projects by area', ftodos: 'All', fdados: 'Data', fia: 'AI', l5: '(5 rows)',
  ss1: 'Teamwork', ss2: 'Commitment', ss3: 'Responsibility', ss4: 'Fast learner', ss5: 'Adaptability', ss6: 'Problem solving', ss7: 'Eagerness to learn',
  mtec: 'Technologies', mlinks: 'Links',
  e5: '05 · skills & technologies', t5: 'Skills & technologies.',
  sferr: 'Tools I use', svers: 'Version control', sinfra: 'Infrastructure', slogica: 'Programming Logic', sia: 'Generative AI',
  e6: '06 · certificates & achievements', t6: 'Certificates & achievements.',
  sub6: 'Courses and tracks I completed to deepen my skills in data, programming and artificial intelligence.',
  cat1: 'programming', cat2: 'data & ML', cat3: 'BI & AI',
  c1: 'Introduction to Programming with Python', c2: 'Fundamentals of Data Engineering and Machine Learning', c3: 'Excel, Power BI & Generative AI',
  vercert: 'View certificate',
  idi: 'Languages.', lpt: 'Portuguese', len: 'English', les: 'Spanish', nat: 'Native · fluent', inter: 'Intermediate · reading, writing and speaking',
  e7: '07 · contact', t7: "Let's talk?",
  sub7: 'Whether to discuss a business opportunity, talk about code or just exchange ideas about technology. My networks are open!',
  msg: 'send a message', obrigado: 'Thanks for visiting!',
  rodape: 'Built with dedication and code. © 2026 Pedro Nunes Cruz. All rights reserved.'
};
