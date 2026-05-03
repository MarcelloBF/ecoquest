const app = document.querySelector("#app");

const USERS_KEY = "ecoquestUsuarios";
const SCORES_KEY = "ecoquestPontuacoes";
const CHAT_KEY = "ecoquestChat";
const CLASSROOMS_KEY = "ecoquestSalas";
const MISSIONS_KEY = "ecoquestMissoes";
const SUBMISSIONS_KEY = "ecoquestEnvios";

const defaultUsers = [
  { name: "Aluno Demo", user: "aluno", pass: "1234", role: "student", classCode: "ECO-8A" },
  { name: "Ana Clara Mendes", user: "professor", pass: "admin123", role: "teacher", school: "Escola Verde" },
  { name: "Diretor Geral", user: "diretor", pass: "diretor123", role: "director", school: "Escola Verde" }
];

const defaultClassrooms = [
  { name: "8 Ano - Sustentabilidade 2026", code: "ECO-8A", teacher: "Ana Clara Mendes", teacherUser: "professor" }
];

const defaultMissions = [
  {
    id: "missao-recicle-casa",
    title: "Recicle na sua casa",
    points: 50,
    due: "2026-05-20",
    classCode: "ECO-8A",
    instructions: "Separe um material reciclável em casa, tire uma foto e escreva um texto curto contando o que você fez."
  },
  {
    id: "missao-economize-agua",
    title: "Economize água por um dia",
    points: 40,
    due: "2026-05-24",
    classCode: "ECO-8A",
    instructions: "Escolha uma atitude para economizar água e conte em poucas linhas como foi."
  }
];

const games = [
  {
    id: "reciclagem",
    title: "Parque da Reciclagem",
    icon: "R",
    color: "blue",
    description: "Arraste ou toque nos resíduos e escolha a lixeira correta.",
    action: "Separar 8 itens",
    reward: "Até 100 pontos"
  },
  {
    id: "agua",
    title: "Corrida da Gotinha",
    icon: "A",
    color: "yellow",
    description: "Mova a gotinha pelas setas ou toque no caminho para coletar água limpa.",
    action: "Coletar 8 gotas",
    reward: "3 vidas"
  },
  {
    id: "jardim",
    title: "Jardim das Boas Atitudes",
    icon: "J",
    color: "green",
    description: "Toque ou arraste cada atitude para Jardim ou Alerta.",
    action: "Classificar 6 atitudes",
    reward: "Feedback na hora"
  },
  {
    id: "energia",
    title: "Casa Econômica",
    icon: "E",
    color: "purple",
    description: "Investigue os cômodos e desligue só o que está desperdiçando.",
    action: "Encontrar 4 desperdícios",
    reward: "Casa eficiente"
  },
  {
    id: "memoria",
    title: "Memória Sustentável",
    icon: "M",
    color: "pink",
    description: "Vire cartas, memorize posições e complete todos os pares.",
    action: "Formar 4 pares",
    reward: "Combo de memória"
  }
];

const trashItems = [
  { label: "Jornal", type: "paper", hint: "Papel" },
  { label: "Garrafa PET", type: "plastic", hint: "Plástico" },
  { label: "Latinha", type: "metal", hint: "Metal" },
  { label: "Casca de banana", type: "organic", hint: "Orgânico" },
  { label: "Caixa", type: "paper", hint: "Papel" },
  { label: "Sacola", type: "plastic", hint: "Plástico" },
  { label: "Tampa", type: "metal", hint: "Metal" },
  { label: "Folhas", type: "organic", hint: "Orgânico" }
];

const gardenItems = [
  { label: "Plantar árvore", type: "good" },
  { label: "Economizar água", type: "good" },
  { label: "Reutilizar papel", type: "good" },
  { label: "Jogar lixo no chao", type: "bad" },
  { label: "Deixar luz ligada", type: "bad" },
  { label: "Desperdicar comida", type: "bad" }
];

const energyTasks = [
  { label: "Luz do quarto", waste: true },
  { label: "TV sem ninguém", waste: true },
  { label: "Carregador na tomada", waste: true },
  { label: "Janela aberta", waste: false },
  { label: "Luz da cozinha", waste: true },
  { label: "Painel solar", waste: false }
];

const memoryPairs = ["Reciclar", "Fechar torneira", "Apagar luz", "Plantar"];

let state = {
  authMode: "login",
  role: "student",
  user: null,
  tempScore: 0,
  feedback: "",
  feedbackType: "",
  placedTrash: [],
  placedGarden: [],
  selectedTrash: null,
  selectedGarden: null,
  energyDone: [],
  memory: [],
  flipped: [],
  matched: [],
  memoryMoves: 0,
  waterScore: 0,
  waterLives: 3,
  waterRunning: false,
  waterTimer: null,
  waterKeysBound: false,
  water: null
};

function load(key, fallback) {
  const raw = localStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function ensureData() {
  if (!localStorage.getItem(USERS_KEY)) save(USERS_KEY, defaultUsers);
  else {
    const users = load(USERS_KEY, []);
    if (!users.some((user) => user.role === "director")) {
      users.push(defaultUsers.find((user) => user.role === "director"));
      save(USERS_KEY, users);
    }
  }
  if (!localStorage.getItem(CLASSROOMS_KEY)) save(CLASSROOMS_KEY, defaultClassrooms);
  else {
    const classrooms = load(CLASSROOMS_KEY, []);
    const updated = classrooms.map((room) => room.code === "ECO-8A" && !room.teacherUser ? { ...room, teacherUser: "professor" } : room);
    save(CLASSROOMS_KEY, updated);
  }
  if (!localStorage.getItem(MISSIONS_KEY)) save(MISSIONS_KEY, defaultMissions);
  if (!localStorage.getItem(SUBMISSIONS_KEY)) {
    save(SUBMISSIONS_KEY, [
      {
        id: "envio-demo-1",
        missionId: "missao-recicle-casa",
        missionTitle: "Recicle na sua casa",
        student: "Aluno Demo",
        user: "aluno",
        classCode: "ECO-8A",
        text: "Separei uma garrafa plastica e coloquei na lixeira vermelha.",
        photoName: "garrafa-reciclada.jpg",
        status: "pending",
        points: 50,
        createdAt: "2026-05-03 10:15",
        feedback: ""
      }
    ]);
  }
  if (!localStorage.getItem(CHAT_KEY)) {
    save(CHAT_KEY, [
      { from: "Aluno Demo", role: "student", text: "Professora, posso enviar uma foto da reciclagem feita em casa?", createdAt: "2026-05-03 10:20" },
      { from: "Ana Clara Mendes", role: "teacher", text: "Pode sim! Envie a foto e escreva um texto curto explicando sua atitude.", createdAt: "2026-05-03 10:22" }
    ]);
  }
  if (!localStorage.getItem(SCORES_KEY)) {
    save(SCORES_KEY, [
      { student: "Aluno Demo", game: "Parque da Reciclagem", score: 80, completedAt: "2026-05-03" },
      { student: "Aluno Demo", game: "Corrida da Gotinha", score: 90, completedAt: "2026-05-03" }
    ]);
  }
}

function shell(content) {
  app.innerHTML = `<section class="screen">${content}</section>`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function nowLabel() {
  const date = new Date();
  return `${date.toISOString().slice(0, 10)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function roleName(role) {
  if (role === "director") return "Diretor";
  return role === "teacher" ? "Professor" : "Aluno";
}

function openDashboardForRole(user = state.user) {
  if (!user) return renderAuth();
  if (user.role === "director") return renderDirector();
  return user.role === "teacher" ? renderTeacher() : renderStudent();
}

function teacherOwnsRoom(room, teacher = state.user) {
  return teacher && (room.teacherUser === teacher.user || (!room.teacherUser && room.teacher === teacher.name));
}

function getTeacherClassrooms(teacher = state.user) {
  return load(CLASSROOMS_KEY, defaultClassrooms).filter((room) => teacherOwnsRoom(room, teacher));
}

function generateClassroomCode(existingRooms = load(CLASSROOMS_KEY, defaultClassrooms)) {
  const usedCodes = new Set(existingRooms.map((room) => room.code));
  let code = "";
  do {
    const number = Math.floor(1000 + Math.random() * 9000);
    const letters = Array.from({ length: 2 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join("");
    code = `ECO-${letters}${number}`;
  } while (usedCodes.has(code));
  return code;
}

function applyAccessibility() {
  const theme = localStorage.getItem("ecoquestTema") || "theme-sky";
  const scale = localStorage.getItem("ecoquestFonte") || "normal";
  document.body.classList.remove("theme-sky", "theme-leaf", "theme-contrast", "font-large", "font-xlarge");
  document.body.classList.add(theme);
  if (scale !== "normal") document.body.classList.add(scale);
}

function cycleTheme() {
  const themes = ["theme-sky", "theme-leaf", "theme-contrast"];
  const current = localStorage.getItem("ecoquestTema") || "theme-sky";
  const next = themes[(themes.indexOf(current) + 1) % themes.length];
  localStorage.setItem("ecoquestTema", next);
  applyAccessibility();
}

function changeFontSize(direction) {
  const sizes = ["normal", "font-large", "font-xlarge"];
  const current = localStorage.getItem("ecoquestFonte") || "normal";
  const nextIndex = Math.max(0, Math.min(sizes.length - 1, sizes.indexOf(current) + direction));
  localStorage.setItem("ecoquestFonte", sizes[nextIndex]);
  applyAccessibility();
}

function logout() {
  stopWaterGame();
  state.user = null;
  state.authMode = "login";
  renderAuth();
}

function topbar(extra = "") {
  const name = state.user ? state.user.name : "";
  return `
    <div class="topbar">
      <div class="brand"><span class="logo">EQ</span><span>EcoQuest</span></div>
      <div class="top-actions">
        <button class="ghost compact" onclick="cycleTheme()">Fundo</button>
        <button class="ghost compact" onclick="changeFontSize(-1)">A-</button>
        <button class="ghost compact" onclick="changeFontSize(1)">A+</button>
        ${name ? `<button class="ghost" onclick="logout()">Sair de ${name}</button>` : ""}${extra}
      </div>
    </div>
  `;
}

function renderAuth() {
  const isSignup = state.authMode === "signup";
  if (isSignup && state.role === "director") state.role = "teacher";
  shell(`
    ${topbar()}
    <div class="hero">
      <section class="hero-copy">
        <h1>EcoQuest</h1>
        <p>A plataforma que transforma sustentabilidade em missões práticas, jogos, pontos e acompanhamento para professores.</p>
        <div class="scene" aria-hidden="true">
          <span class="sun"></span><span class="cloud"></span><span class="tree"></span><span class="earth"></span><span class="child"></span>
        </div>
      </section>
      <section class="panel auth-card">
        <div class="auth-tabs">
          <button class="${state.authMode === "login" ? "active" : ""}" onclick="setAuthMode('login')">Entrar</button>
          <button class="${state.authMode === "signup" ? "active" : ""}" onclick="setAuthMode('signup')">Criar conta</button>
        </div>
        <h2>${isSignup ? "Criar conta" : "Entrar"}</h2>
        <div class="role-tabs">
          <button class="${state.role === "student" ? "active" : ""}" onclick="setRole('student')">Aluno</button>
          <button class="${state.role === "teacher" ? "active" : ""}" onclick="setRole('teacher')">Professor</button>
          ${!isSignup ? `<button class="${state.role === "director" ? "active" : ""}" onclick="setRole('director')">Diretor</button>` : ""}
        </div>
        ${isSignup ? `<label class="field">Nome completo<input id="nameInput" autocomplete="name" placeholder="Seu nome"></label>` : ""}
        ${isSignup && state.role === "student" ? `<label class="field">Código da sala<input id="classCodeInput" placeholder="Peça o código para seu professor"></label>` : ""}
        ${isSignup && state.role === "teacher" ? `<label class="field">Escola<input id="schoolInput" placeholder="Nome da escola"></label>` : ""}
        <label class="field">Usuário<input id="userInput" autocomplete="username" placeholder="Digite seu usuário"></label>
        <label class="field">Senha<input id="passInput" type="password" autocomplete="current-password" placeholder="Digite sua senha"></label>
        <button class="btn" onclick="${isSignup ? "signup()" : "login()"}">${isSignup ? `Criar conta de ${roleName(state.role)}` : "Entrar"}</button>
        <p id="authMessage" class="error"></p>
        <div class="hint">Teste: aluno / 1234, professor / admin123 ou diretor / diretor123. As contas novas ficam salvas neste navegador.</div>
      </section>
    </div>
  `);
}

function setAuthMode(mode) {
  state.authMode = mode;
  if (mode === "signup" && state.role === "director") state.role = "teacher";
  renderAuth();
}

function setRole(role) {
  state.role = role;
  renderAuth();
}

function showAuthMessage(message) {
  const el = document.querySelector("#authMessage");
  if (el) el.textContent = message;
}

function login() {
  const user = document.querySelector("#userInput").value.trim();
  const pass = document.querySelector("#passInput").value.trim();
  const found = load(USERS_KEY, defaultUsers).find((item) => item.user === user && item.pass === pass && item.role === state.role);
  if (!found) {
    showAuthMessage("Usuário ou senha inválidos para esse tipo de conta.");
    return;
  }
  state.user = found;
  openDashboardForRole(found);
}

function signup() {
  const name = document.querySelector("#nameInput").value.trim();
  const user = document.querySelector("#userInput").value.trim();
  const pass = document.querySelector("#passInput").value.trim();
  const users = load(USERS_KEY, defaultUsers);

  if (!name || !user || !pass) {
    showAuthMessage("Preencha nome, usuário e senha.");
    return;
  }

  if (user.length < 3 || pass.length < 4) {
    showAuthMessage("Use usuário com 3 letras e senha com pelo menos 4 caracteres.");
    return;
  }

  if (users.some((item) => item.user === user)) {
    showAuthMessage("Esse usuário já existe. Escolha outro.");
    return;
  }

  const classCodeInput = document.querySelector("#classCodeInput");
  const schoolInput = document.querySelector("#schoolInput");
  const classCode = classCodeInput && classCodeInput.value.trim().toUpperCase();
  if (state.role === "student" && !load(CLASSROOMS_KEY, defaultClassrooms).some((room) => room.code === classCode)) {
    showAuthMessage("Código de sala não encontrado. Peça o código correto ao professor.");
    return;
  }
  const newUser = state.role === "student"
    ? { name, user, pass, role: state.role, classCode }
    : { name, user, pass, role: state.role, school: (schoolInput && schoolInput.value.trim()) || "Escola Verde" };
  users.push(newUser);
  save(USERS_KEY, users);
  state.user = newUser;
  openDashboardForRole(newUser);
}

function userScores() {
  return load(SCORES_KEY, []).filter((score) => score.student === state.user.name);
}

function renderStudent() {
  stopWaterGame();
  const scores = userScores();
  const submissions = load(SUBMISSIONS_KEY, []).filter((item) => item.user === state.user.user);
  const missions = getStudentMissions();
  const classroom = getStudentClassroom();
  const total = scores.reduce((sum, item) => sum + item.score, 0);
  const finished = new Set(scores.map((item) => item.game)).size;
  const approvedPoints = submissions.filter((item) => item.status === "approved").reduce((sum, item) => sum + Number(item.points || 0), 0);
  shell(`
    ${topbar()}
    <div class="dashboard">
      <section class="welcome-band">
        <div>
          <span class="eyebrow">Olá, ${state.user.name} - ${classroom ? classroom.name : "Sala ECO-8A"}</span>
          <h2>Complete missões reais, jogue e suba no ranking da sala.</h2>
        </div>
        <div class="mascot-face"><span></span></div>
      </section>
      <div class="stats">
        <div class="stat-card"><strong>${total + approvedPoints}</strong><span>Pontos totais</span></div>
        <div class="stat-card"><strong>${finished}</strong><span>Jogos concluídos</span></div>
        <div class="stat-card"><strong>${missions.length}</strong><span>Missões da professora</span></div>
      </div>
      <section class="panel">
        <h2>Missões práticas da professora</h2>
        <div class="mission-grid">
          ${missions.map((mission) => renderStudentMissionCard(mission, submissions)).join("")}
        </div>
      </section>
      ${renderRanking(state.user.classCode || "ECO-8A", classroom ? `Ranking da sala ${classroom.name}` : "Ranking da sua sala")}
      <section>
        <h2>Jogos de aquecimento</h2>
        <div class="games">
          ${games.map((game) => `
            <article class="game-card">
              <span class="game-icon ${game.color}">${game.icon}</span>
              <h3>${game.title}</h3>
              <p>${game.description}</p>
              <div class="game-meta">
                <span>${game.action}</span>
                <span>${game.reward}</span>
              </div>
              <button class="btn" onclick="startGame('${game.id}')">Começar missão</button>
            </article>
          `).join("")}
        </div>
      </section>
    </div>
    ${renderChatbot("student")}
  `);
}

function getStudentClassroom() {
  const classrooms = load(CLASSROOMS_KEY, defaultClassrooms);
  return classrooms.find((room) => room.code === (state.user.classCode || "ECO-8A"));
}

function getStudentMissions() {
  const classCode = state.user.classCode || "ECO-8A";
  return load(MISSIONS_KEY, defaultMissions).filter((mission) => mission.classCode === classCode);
}

function renderStudentMissionCard(mission, submissions) {
  const submission = submissions.find((item) => item.missionId === mission.id);
  const status = submission ? submission.status : "open";
  const statusText = {
    open: "Pendente",
    pending: "Aguardando correção",
    approved: "Aprovada",
    correction: "Precisa corrigir"
  }[status];
  return `
    <article class="mission-card ${status}">
      <div>
        <span class="eyebrow">${mission.points} pontos - prazo ${mission.due}</span>
        <h3>${mission.title}</h3>
        <p>${mission.instructions}</p>
        ${submission && submission.feedback ? `<small>Feedback: ${submission.feedback}</small>` : ""}
      </div>
      <strong class="status-pill">${statusText}</strong>
      ${status !== "approved" ? `
        <label class="field">Texto curto da atividade<textarea id="missionText-${mission.id}" placeholder="Conte o que você fez...">${submission ? submission.text : ""}</textarea></label>
        <label class="field">Foto da atividade<input id="missionPhoto-${mission.id}" type="file" accept="image/*"></label>
        <button class="btn" onclick="submitMission('${mission.id}')">${submission ? "Reenviar para correção" : "Enviar missão"}</button>
      ` : ""}
    </article>
  `;
}

function submitMission(missionId) {
  const mission = load(MISSIONS_KEY, defaultMissions).find((item) => item.id === missionId);
  const text = document.querySelector(`#missionText-${missionId}`).value.trim();
  const photo = document.querySelector(`#missionPhoto-${missionId}`);
  if (!text) {
    state.feedback = "Escreva um texto curto antes de enviar.";
    state.feedbackType = "bad";
    renderStudent();
    return;
  }

  const submissions = load(SUBMISSIONS_KEY, []);
  const existingIndex = submissions.findIndex((item) => item.missionId === missionId && item.user === state.user.user);
  const submission = {
    id: existingIndex >= 0 ? submissions[existingIndex].id : `envio-${Date.now()}`,
    missionId,
    missionTitle: mission.title,
    student: state.user.name,
    user: state.user.user,
    classCode: state.user.classCode || "ECO-8A",
    text,
    photoName: photo && photo.files && photo.files[0] ? photo.files[0].name : "foto-simulada.jpg",
    status: "pending",
    points: mission.points,
    createdAt: nowLabel(),
    feedback: ""
  };

  if (existingIndex >= 0) submissions[existingIndex] = submission;
  else submissions.push(submission);
  save(SUBMISSIONS_KEY, submissions);
  renderStudent();
}

function renderRanking(classCode, title = "Ranking da sala") {
  const rows = buildRanking(classCode);
  return `
    <section class="panel">
      <h2>${title}</h2>
      <div class="ranking-list">
        ${rows.length ? rows.map((row, index) => `
          <div class="ranking-row">
            <strong>${index + 1}</strong>
            <span>${row.name}</span>
            <span>${row.points} pontos</span>
          </div>
        `).join("") : `<div class="ranking-row empty"><span>Nenhum aluno nessa sala ainda.</span></div>`}
      </div>
    </section>
  `;
}

function renderClassroomRankings(classrooms) {
  return classrooms.map((room) => renderRanking(room.code, `Ranking - ${room.name}`)).join("");
}

function renderClassroomStudentAccounts(classrooms, studentRows) {
  return `
    <div class="accounts-by-room">
      ${classrooms.map((room) => {
        const rows = studentRows.filter((row) => (row.student.classCode || "ECO-8A") === room.code);
        return `
          <article class="room-accounts">
            <div class="room-accounts-head">
              <div>
                <span class="eyebrow">${room.code}</span>
                <h3>${room.name}</h3>
              </div>
              <span class="status-pill">${rows.length} alunos</span>
            </div>
            <div class="student-table accounts-table">
              ${rows.length ? rows.map((row) => `
                <div class="student-row account-row">
                  <strong>${row.student.name}</strong>
                  <span>Usuário: <b>${row.student.user}</b></span>
                  <span>Senha: <b>${row.student.pass}</b></span>
                  <span>${row.finished} jogos</span>
                  <span>${row.total} pontos</span>
                  <span>${row.last ? `${row.last.game} em ${row.last.completedAtTime || row.last.completedAt}` : "Ainda sem jogos"}</span>
                </div>
              `).join("") : `<div class="student-row empty"><span>Nenhum aluno cadastrado nessa sala.</span></div>`}
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderClassroomStudentActivity(classrooms, studentRows) {
  return `
    <div class="accounts-by-room">
      ${classrooms.length ? classrooms.map((room) => {
        const rows = studentRows.filter((row) => (row.student.classCode || "ECO-8A") === room.code);
        return `
          <article class="room-accounts">
            <div class="room-accounts-head">
              <div>
                <span class="eyebrow">${room.code}</span>
                <h3>${room.name}</h3>
              </div>
              <span class="status-pill">${rows.length} alunos</span>
            </div>
            <div class="student-table accounts-table">
              ${rows.length ? rows.map((row) => `
                <div class="student-row activity-row">
                  <strong>${row.student.name}</strong>
                  <span>${row.student.user}</span>
                  <span>${row.finished} jogos</span>
                  <span>${row.total} pontos</span>
                  <span>${row.last ? `${row.last.game} em ${row.last.completedAtTime || row.last.completedAt}` : "Ainda sem jogos"}</span>
                </div>
              `).join("") : `<div class="student-row empty"><span>Nenhum aluno cadastrado nessa sala.</span></div>`}
            </div>
          </article>
        `;
      }).join("") : `<div class="student-row empty"><span>Crie uma sala para começar a cadastrar alunos.</span></div>`}
    </div>
  `;
}

function buildRanking(classCode) {
  const users = load(USERS_KEY, defaultUsers).filter((user) => {
    const userClass = user.classCode || "ECO-8A";
    return user.role === "student" && (!classCode || userClass === classCode);
  });
  const scores = load(SCORES_KEY, []);
  const submissions = load(SUBMISSIONS_KEY, []);
  return users.map((user) => {
    const gamePoints = scores.filter((score) => score.user === user.user || score.student === user.name).reduce((sum, score) => sum + Number(score.score || 0), 0);
    const missionPoints = submissions.filter((item) => item.user === user.user && item.status === "approved").reduce((sum, item) => sum + Number(item.points || 0), 0);
    return { name: user.name, points: gamePoints + missionPoints };
  }).sort((a, b) => b.points - a.points);
}

function startGame(id) {
  stopWaterGame();
  state.tempScore = 0;
  state.feedback = "";
  state.feedbackType = "";
  state.placedTrash = [];
  state.placedGarden = [];
  state.selectedTrash = null;
  state.selectedGarden = null;
  state.energyDone = [];
  state.memory = [];
  state.flipped = [];
  state.matched = [];
  state.memoryMoves = 0;
  if (id === "reciclagem") renderTrashGame();
  if (id === "agua") renderWaterGame();
  if (id === "jardim") renderGardenGame();
  if (id === "energia") renderEnergyGame();
  if (id === "memoria") renderMemoryGame();
}

function saveScore(gameId, score) {
  const game = games.find((item) => item.id === gameId);
  const scores = load(SCORES_KEY, []);
  scores.push({ student: state.user.name, user: state.user.user, game: game.title, score, completedAt: today(), completedAtTime: nowLabel() });
  save(SCORES_KEY, scores);
  renderResult(game, score);
}

function renderResult(game, score) {
  stopWaterGame();
  shell(`
    ${topbar()}
    <section class="result-card">
      <div class="medal">OK</div>
      <h2>${game.title} concluído!</h2>
      <p>Você ganhou <strong>${score} pontos</strong>. Cada boa escolha deixa o planeta mais feliz.</p>
      <button class="btn" onclick="renderStudent()">Voltar para as missões</button>
    </section>
  `);
}

function feedbackHtml() {
  if (!state.feedback) return "";
  return `<div class="feedback ${state.feedbackType}">${state.feedback}</div>`;
}

function progressBar(done, total) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return `<div class="game-progress" aria-label="Progresso: ${percent}%"><span style="width: ${percent}%"></span></div>`;
}

function stepHint(text) {
  return `<div class="step-hint">${text}</div>`;
}

function dragStart(event, index, group) {
  event.dataTransfer.setData("text/plain", JSON.stringify({ index, group }));
}

function allowDrop(event) {
  event.preventDefault();
}

function renderTrashGame() {
  const remaining = trashItems.filter((_, index) => !state.placedTrash.includes(index));
  const nextItem = state.selectedTrash !== null ? trashItems[state.selectedTrash] : remaining[0];
  shell(`
    ${topbar('<button class="ghost" onclick="renderStudent()">Voltar</button>')}
    <section class="panel play-area">
      <div class="progress"><span>Resíduos separados: ${state.placedTrash.length} de ${trashItems.length}</span><span>${state.tempScore} pontos</span></div>
      ${progressBar(state.placedTrash.length, trashItems.length)}
      <div class="park-scene">
        <div class="park-sky"><span></span><span></span></div>
        <div class="park-title">
          <span class="eyebrow">Parque da Reciclagem</span>
          <h2>Escolha um resíduo e mande para a lixeira certa.</h2>
          <p>Você pode arrastar ou tocar no item e depois tocar na lixeira.</p>
        </div>
        ${stepHint(nextItem ? `Agora: ${nextItem.label}. Dica: ${nextItem.hint}.` : "Parque limpo!")}
        <div class="park-path">
          <div class="drag-shelf park-items">
            ${remaining.map((item) => {
              const realIndex = trashItems.indexOf(item);
              const selected = state.selectedTrash === realIndex ? "selected" : "";
              return `<button class="drag-card trash-card ${item.type} ${selected}" draggable="true" onclick="selectTrash(${realIndex})" ondragstart="dragStart(event, ${realIndex}, 'trash')"><span>${item.label}</span><small>${item.hint}</small></button>`;
            }).join("")}
          </div>
        </div>
        <div class="park-bins">
          <button class="park-bin paper" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'paper')" onclick="chooseTrashBin('paper')"><strong>Papel</strong><span>jornais e caixas</span></button>
          <button class="park-bin plastic" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'plastic')" onclick="chooseTrashBin('plastic')"><strong>Plástico</strong><span>garrafas e sacolas</span></button>
          <button class="park-bin metal" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'metal')" onclick="chooseTrashBin('metal')"><strong>Metal</strong><span>latas e tampas</span></button>
          <button class="park-bin organic" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'organic')" onclick="chooseTrashBin('organic')"><strong>Orgânico</strong><span>folhas e cascas</span></button>
        </div>
      </div>
      ${feedbackHtml()}
    </section>
  `);
}

function selectTrash(index) {
  if (state.placedTrash.includes(index)) return;
  state.selectedTrash = index;
  state.feedback = `Item escolhido: ${trashItems[index].label}. Agora toque na lixeira correta.`;
  state.feedbackType = "good";
  renderTrashGame();
}

function chooseTrashBin(type) {
  if (state.selectedTrash === null) {
    state.feedback = "Primeiro escolha um resíduo do parque.";
    state.feedbackType = "bad";
    renderTrashGame();
    return;
  }
  handleTrashChoice(state.selectedTrash, type);
}

function dropTrash(event, type) {
  event.preventDefault();
  const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
  if (payload.group !== "trash") return;
  handleTrashChoice(payload.index, type);
}

function handleTrashChoice(index, type) {
  const item = trashItems[index];
  if (state.placedTrash.includes(index)) return;

  if (item.type === type) {
    state.tempScore += 13;
    state.feedback = `Boa! ${item.label} foi para ${item.hint}.`;
    state.feedbackType = "good";
    state.placedTrash.push(index);
    state.selectedTrash = null;
  } else {
    state.feedback = `Quase! ${item.label} combina com ${item.hint}. Tente essa lixeira.`;
    state.feedbackType = "bad";
    state.selectedTrash = index;
  }

  if (state.placedTrash.length === trashItems.length) {
    renderTrashGame();
    setTimeout(() => saveScore("reciclagem", Math.min(100, state.tempScore)), 700);
  } else {
    renderTrashGame();
  }
}

function renderGardenGame() {
  const remaining = gardenItems.filter((_, index) => !state.placedGarden.includes(index));
  const nextItem = state.selectedGarden !== null ? gardenItems[state.selectedGarden] : remaining[0];
  shell(`
    ${topbar('<button class="ghost" onclick="renderStudent()">Voltar</button>')}
    <section class="panel play-area">
      <div class="progress"><span>Atitudes organizadas: ${state.placedGarden.length} de ${gardenItems.length}</span><span>${state.tempScore} pontos</span></div>
      ${progressBar(state.placedGarden.length, gardenItems.length)}
      <div class="story-board garden-board">
        <div class="big-character garden-character"></div>
        <div>
          <span class="eyebrow">Jardim das Boas Atitudes</span>
          <h2>Decida se cada atitude ajuda ou prejudica o planeta.</h2>
          <p>Toque em uma atitude e escolha Jardim ou Alerta. Se preferir, arraste.</p>
        </div>
      </div>
      ${stepHint(nextItem ? `Agora: ${nextItem.label}. Isso parece cuidado ou alerta?` : "Jardim completo!")}
      <div class="drag-shelf">
        ${remaining.map((item) => {
          const realIndex = gardenItems.indexOf(item);
          const selected = state.selectedGarden === realIndex ? "selected" : "";
          return `<button class="drag-card habit-card ${selected}" draggable="true" onclick="selectGarden(${realIndex})" ondragstart="dragStart(event, ${realIndex}, 'garden')"><span>${item.label}</span></button>`;
        }).join("")}
      </div>
      <div class="drop-grid two">
        <button class="drop-zone garden-good" ondragover="allowDrop(event)" ondrop="dropGarden(event, 'good')" onclick="chooseGardenZone('good')">Jardim<br><small>Ajuda o planeta</small></button>
        <button class="drop-zone garden-bad" ondragover="allowDrop(event)" ondrop="dropGarden(event, 'bad')" onclick="chooseGardenZone('bad')">Alerta<br><small>Prejudica o planeta</small></button>
      </div>
      ${feedbackHtml()}
    </section>
  `);
}

function selectGarden(index) {
  if (state.placedGarden.includes(index)) return;
  state.selectedGarden = index;
  state.feedback = `Atitude escolhida: ${gardenItems[index].label}. Agora escolha Jardim ou Alerta.`;
  state.feedbackType = "good";
  renderGardenGame();
}

function chooseGardenZone(type) {
  if (state.selectedGarden === null) {
    state.feedback = "Primeiro escolha uma atitude.";
    state.feedbackType = "bad";
    renderGardenGame();
    return;
  }
  handleGardenChoice(state.selectedGarden, type);
}

function dropGarden(event, type) {
  event.preventDefault();
  const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
  if (payload.group !== "garden") return;
  handleGardenChoice(payload.index, type);
}

function handleGardenChoice(index, type) {
  const item = gardenItems[index];
  if (state.placedGarden.includes(index)) return;

  if (item.type === type) {
    state.tempScore += 17;
    state.feedback = type === "good" ? "Perfeito! Essa atitude faz o jardim crescer." : "Isso mesmo! Essa atitude precisa de alerta.";
    state.feedbackType = "good";
    state.placedGarden.push(index);
    state.selectedGarden = null;
  } else {
    state.feedback = "Ops! Pense se essa atitude ajuda ou prejudica o planeta e tente de novo.";
    state.feedbackType = "bad";
    state.selectedGarden = index;
  }

  if (state.placedGarden.length === gardenItems.length) {
    renderGardenGame();
    setTimeout(() => saveScore("jardim", Math.min(100, state.tempScore)), 700);
  } else {
    renderGardenGame();
  }
}

function renderEnergyGame() {
  const wasteTotal = energyTasks.filter((task) => task.waste).length;
  const doneCount = state.energyDone.filter((index) => energyTasks[index].waste).length;
  shell(`
    ${topbar('<button class="ghost" onclick="renderStudent()">Voltar</button>')}
    <section class="panel play-area">
      <div class="progress"><span>Desperdícios desligados: ${doneCount} de ${wasteTotal}</span><span>${state.tempScore} pontos</span></div>
      ${progressBar(doneCount, wasteTotal)}
      <div class="story-board energy-board">
        <div class="big-character energy-character"></div>
        <div>
          <span class="eyebrow">Casa Econômica</span>
          <h2>Investigue a casa e desligue só os desperdícios.</h2>
          <p>Itens com brilho amarelo estão gastando energia. Os que já ajudam o planeta devem ficar como estão.</p>
        </div>
      </div>
      ${stepHint("Procure os cômodos acesos sem necessidade. Cada acerto apaga um brilho da casa.")}
      <div class="house-grid">
        ${energyTasks.map((task, index) => `
          <button class="room-card ${state.energyDone.includes(index) ? "done" : ""}" onclick="toggleEnergy(${index})">
            <span class="room-light ${task.waste && !state.energyDone.includes(index) ? "on" : ""}"></span>
            <strong>${task.label}</strong>
            <small>${state.energyDone.includes(index) ? "Resolvido" : task.waste ? "Toque para desligar" : "Já está ajudando"}</small>
          </button>
        `).join("")}
      </div>
      ${feedbackHtml()}
    </section>
  `);
}

function toggleEnergy(index) {
  const task = energyTasks[index];
  if (state.energyDone.includes(index)) return;

  if (task.waste) {
    state.energyDone.push(index);
    state.tempScore += 20;
    state.feedback = "Boa! Você desligou um desperdício.";
    state.feedbackType = "good";
  } else {
    state.feedback = "Essa já era uma boa atitude. Não precisava mudar.";
    state.feedbackType = "bad";
  }

  const wasteTotal = energyTasks.filter((item) => item.waste).length;
  const doneCount = state.energyDone.filter((itemIndex) => energyTasks[itemIndex].waste).length;
  if (doneCount === wasteTotal) {
    renderEnergyGame();
    setTimeout(() => saveScore("energia", Math.min(100, state.tempScore)), 700);
  } else {
    renderEnergyGame();
  }
}

function renderMemoryGame() {
  if (!state.memory.length) {
    state.memory = [...memoryPairs, ...memoryPairs]
      .map((text, index) => ({ text, id: `${text}-${index}` }))
      .sort(() => Math.random() - 0.5);
  }

  shell(`
    ${topbar('<button class="ghost" onclick="renderStudent()">Voltar</button>')}
    <section class="panel play-area">
      <div class="progress"><span>Pares encontrados: ${state.matched.length} de ${memoryPairs.length} - jogadas: ${state.memoryMoves}</span><span>${state.tempScore} pontos</span></div>
      ${progressBar(state.matched.length, memoryPairs.length)}
      <div class="story-board memory-board">
        <div class="big-character memory-character"></div>
        <div>
          <span class="eyebrow">Memória Sustentável</span>
          <h2>Vire duas cartas e encontre atitudes iguais.</h2>
          <p>As cartas ficam abertas quando formam par. Observe posições antes da próxima jogada.</p>
        </div>
      </div>
      ${stepHint(state.flipped.length === 1 ? `Carta escolhida: ${state.memory[state.flipped[0]].text}. Agora procure o par.` : "Escolha a primeira carta.")}
      <div class="memory-grid">
        ${state.memory.map((card, index) => {
          const open = state.flipped.includes(index) || state.matched.includes(card.text);
          const matched = state.matched.includes(card.text) ? "matched" : "";
          return `<button class="tile memory-card ${open ? "open" : ""} ${matched}" onclick="flipCard(${index})">${open ? card.text : index + 1}</button>`;
        }).join("")}
      </div>
      ${feedbackHtml()}
    </section>
  `);
}

function flipCard(index) {
  const card = state.memory[index];
  if (state.flipped.includes(index) || state.matched.includes(card.text) || state.flipped.length === 2) return;
  state.flipped.push(index);
  state.feedback = "";
  state.feedbackType = "";

  if (state.flipped.length === 2) {
    state.memoryMoves += 1;
    const [a, b] = state.flipped;
    if (state.memory[a].text === state.memory[b].text) {
      state.matched.push(state.memory[a].text);
      state.tempScore += 25;
      state.flipped = [];
      state.feedback = "Par encontrado!";
      state.feedbackType = "good";
      if (state.matched.length === memoryPairs.length) {
        renderMemoryGame();
        setTimeout(() => {
          state.memory = [];
          saveScore("memoria", Math.min(100, state.tempScore));
        }, 700);
        return;
      }
    } else {
      renderMemoryGame();
      setTimeout(() => {
        state.flipped = [];
        state.feedback = "Não foi par. Tente outra combinação.";
        state.feedbackType = "bad";
        renderMemoryGame();
      }, 750);
      return;
    }
  }

  renderMemoryGame();
}

function renderWaterGame() {
  shell(`
    ${topbar('<button class="ghost" onclick="renderStudent()">Voltar</button>')}
    <section class="panel play-area">
      <div class="progress"><span>Pegue gotas limpas e evite vazamentos</span><span id="waterHud">0 pontos - 3 vidas</span></div>
      <div class="game-progress" aria-label="Progresso da água"><span id="waterProgress" style="width: 0%"></span></div>
      <div class="story-board water-board">
        <div class="big-character drop-character"></div>
        <div>
          <span class="eyebrow">Corrida da Gotinha</span>
          <h2>Mova a gotinha até as gotas azuis.</h2>
          <p>Use as setas, os botões ou toque no cenário. A linha mostra a gota limpa mais próxima.</p>
        </div>
      </div>
      ${stepHint("Azul soma pontos. Rosa tira vidas. Pegue todas as 8 gotas limpas para vencer.")}
      <canvas id="waterCanvas" width="720" height="360" class="game-canvas"></canvas>
      <div class="move-controls">
        <button class="ghost move-up" onclick="moveDrop(0, -1)">Cima</button>
        <button class="ghost" onclick="moveDrop(-1, 0)">Esquerda</button>
        <button class="ghost" onclick="moveDrop(1, 0)">Direita</button>
        <button class="ghost move-down" onclick="moveDrop(0, 1)">Baixo</button>
      </div>
      <div class="water-legend"><span><b class="clean-dot"></b> água limpa</span><span><b class="bad-dot"></b> vazamento</span></div>
      <div id="waterFeedback" class="feedback good">Comece pela gota azul mais perto.</div>
    </section>
  `);
  startWaterCanvas();
}

function startWaterCanvas() {
  state.waterScore = 0;
  state.waterLives = 3;
  state.waterRunning = true;
  state.water = {
    player: { x: 70, y: 180, r: 18 },
    clean: randomDots(8, "#58c7ff"),
    bad: randomDots(6, "#ef476f")
  };
  bindWaterKeys();
  bindWaterCanvas();
  drawWater();
}

function stopWaterGame() {
  state.waterRunning = false;
  if (state.waterTimer) clearTimeout(state.waterTimer);
}

function bindWaterKeys() {
  if (state.waterKeysBound) return;
  state.waterKeysBound = true;
  window.addEventListener("keydown", (event) => {
    if (!state.waterRunning) return;
    if (event.key === "ArrowUp") moveDrop(0, -1);
    if (event.key === "ArrowDown") moveDrop(0, 1);
    if (event.key === "ArrowLeft") moveDrop(-1, 0);
    if (event.key === "ArrowRight") moveDrop(1, 0);
  });
}

function bindWaterCanvas() {
  const canvas = document.querySelector("#waterCanvas");
  if (!canvas) return;
  canvas.addEventListener("click", (event) => {
    if (!state.waterRunning || !state.water) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const targetX = (event.clientX - rect.left) * scaleX;
    const targetY = (event.clientY - rect.top) * scaleY;
    const player = state.water.player;
    moveDrop(Math.sign(targetX - player.x), Math.sign(targetY - player.y));
  });
}

function randomDots(count, color) {
  return Array.from({ length: count }, () => ({
    x: 90 + Math.random() * 570,
    y: 50 + Math.random() * 260,
    r: 14,
    color,
    active: true
  }));
}

function moveDrop(dx, dy) {
  if (!state.waterRunning || !state.water) return;
  const player = state.water.player;
  player.x = Math.max(24, Math.min(696, player.x + dx * 28));
  player.y = Math.max(24, Math.min(336, player.y + dy * 28));
  checkWaterCollisions();
  drawWater();
}

function checkWaterCollisions() {
  const player = state.water.player;
  state.water.clean.forEach((dot) => {
    if (dot.active && distance(player, dot) < player.r + dot.r) {
      dot.active = false;
      state.waterScore += 13;
      state.feedback = "Boa! Gota limpa coletada.";
      state.feedbackType = "good";
    }
  });
  state.water.bad.forEach((dot) => {
    if (dot.active && distance(player, dot) < player.r + dot.r) {
      dot.active = false;
      state.waterLives -= 1;
      state.feedback = "Cuidado! Vazamento tira uma vida.";
      state.feedbackType = "bad";
    }
  });

  if (state.water.clean.every((dot) => !dot.active)) {
    stopWaterGame();
    saveScore("agua", Math.min(100, state.waterScore));
  }

  if (state.waterLives <= 0) {
    stopWaterGame();
    saveScore("agua", Math.min(100, state.waterScore));
  }
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function drawWater() {
  const canvas = document.querySelector("#waterCanvas");
  const hud = document.querySelector("#waterHud");
  const bar = document.querySelector("#waterProgress");
  const feedback = document.querySelector("#waterFeedback");
  if (!canvas || !state.water) return;
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#e5f7ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#b8ecff";
  for (let x = 0; x < canvas.width; x += 80) {
    ctx.beginPath();
    ctx.arc(x, 360, 90, Math.PI, 0);
    ctx.fill();
  }

  const activeClean = state.water.clean.filter((dot) => dot.active);
  const nearest = activeClean
    .slice()
    .sort((a, b) => distance(state.water.player, a) - distance(state.water.player, b))[0];
  if (nearest) {
    ctx.strokeStyle = "rgba(43, 143, 216, 0.32)";
    ctx.lineWidth = 5;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(state.water.player.x, state.water.player.y);
    ctx.lineTo(nearest.x, nearest.y);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  state.water.clean.forEach((dot) => drawDot(ctx, dot, "G"));
  state.water.bad.forEach((dot) => drawDot(ctx, dot, "!"));

  const p = state.water.player;
  ctx.fillStyle = "#2b8fd8";
  ctx.beginPath();
  ctx.arc(p.x, p.y + 6, 18, 0, Math.PI * 2);
  ctx.moveTo(p.x, p.y - 28);
  ctx.lineTo(p.x - 16, p.y + 3);
  ctx.lineTo(p.x + 16, p.y + 3);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#243142";
  ctx.beginPath();
  ctx.arc(p.x - 6, p.y - 3, 3, 0, Math.PI * 2);
  ctx.arc(p.x + 7, p.y - 3, 3, 0, Math.PI * 2);
  ctx.fill();

  const collected = state.water.clean.filter((dot) => !dot.active).length;
  if (hud) hud.textContent = `${state.waterScore} pontos - ${state.waterLives} vidas - ${collected}/8 gotas`;
  if (bar) bar.style.width = `${Math.round((collected / state.water.clean.length) * 100)}%`;
  if (feedback && state.feedback) {
    feedback.className = `feedback ${state.feedbackType}`;
    feedback.textContent = state.feedback;
  }
}

function drawDot(ctx, dot, label) {
  if (!dot.active) return;
  ctx.fillStyle = dot.color;
  ctx.beginPath();
  ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, dot.x, dot.y);
}

function renderTeacher() {
  stopWaterGame();
  const users = load(USERS_KEY, []);
  const classrooms = getTeacherClassrooms();
  const classroomCodes = new Set(classrooms.map((room) => room.code));
  const allScores = load(SCORES_KEY, []);
  const missions = load(MISSIONS_KEY, defaultMissions).filter((mission) => classroomCodes.has(mission.classCode));
  const submissions = load(SUBMISSIONS_KEY, []).filter((submission) => classroomCodes.has(submission.classCode));
  const students = users.filter((user) => user.role === "student" && classroomCodes.has(user.classCode || "ECO-8A"));
  const scores = allScores.filter((score) => students.some((student) => score.user === student.user || score.student === student.name));
  const totalGames = scores.length;
  const average = totalGames ? Math.round(scores.reduce((sum, item) => sum + item.score, 0) / totalGames) : 0;
  const studentRows = students.map((student) => {
    const studentScores = scores.filter((score) => score.student === student.name || score.user === student.user);
    const total = studentScores.reduce((sum, score) => sum + score.score, 0);
    const last = studentScores.slice(-1)[0];
    return { student, total, finished: studentScores.length, last };
  });
  shell(`
    ${topbar()}
    <div class="dashboard">
      <section class="welcome-band teacher-band">
        <div>
          <span class="eyebrow">Painel de ${state.user.name}</span>
          <h2>Gerencie suas salas, publique missões e acompanhe seus alunos.</h2>
        </div>
      </section>
      <div class="stats">
        <div class="stat-card"><strong>${students.length}</strong><span>Alunos cadastrados</span></div>
        <div class="stat-card"><strong>${missions.length}</strong><span>Missões criadas</span></div>
        <div class="stat-card"><strong>${submissions.filter((item) => item.status === "pending").length}</strong><span>Envios pendentes</span></div>
      </div>
      <section class="panel">
        <h2>Salas</h2>
        <div class="classroom-grid">
          ${classrooms.map((room) => `
            <div class="classroom-card">
              <strong>${room.name}</strong>
              <span class="class-code-label">Código para alunos</span>
              <code class="class-code">${room.code}</code>
              <small>Envie esse código para os alunos entrarem na sala.</small>
              <small>${students.filter((student) => (student.classCode || "ECO-8A") === room.code).length} alunos</small>
            </div>
          `).join("")}
        </div>
        <div class="inline-form">
          <input id="newRoomName" placeholder="Nome da sala. Ex: 7 Ano - Sustentabilidade">
          <button class="btn" onclick="createClassroom()">Gerar sala</button>
        </div>
      </section>
      <section class="panel">
        <h2>Criar missão prática</h2>
        <div class="mission-form">
          <input id="missionTitle" placeholder="Título da missão">
          <input id="missionPoints" type="number" placeholder="Pontos">
          <input id="missionDue" type="date">
          <select id="missionClass">
            ${classrooms.map((room) => `<option value="${room.code}">${room.name}</option>`).join("")}
          </select>
          <textarea id="missionInstructions" placeholder="O que o aluno deve enviar? Ex: foto + texto curto"></textarea>
          <button class="btn" onclick="createMission()">Publicar missão</button>
        </div>
      </section>
      <section class="panel">
        <h2>Cadastrar aluno pelo professor</h2>
        <label class="field">Nome<input id="newName" placeholder="Nome do aluno"></label>
        <label class="field">Usuário<input id="newUser" placeholder="usuário"></label>
        <label class="field">Senha<input id="newPass" placeholder="senha"></label>
        <label class="field">Sala<select id="newStudentClass">${classrooms.map((room) => `<option value="${room.code}">${room.name} - ${room.code}</option>`).join("")}</select></label>
        <button class="btn" onclick="createStudent()">Cadastrar aluno</button>
        <p id="createMsg" class="error"></p>
      </section>
      <section class="panel">
        <h2>Gráfico de pontuação</h2>
        <div class="chart-wrap"><canvas id="scoreChart" width="900" height="300"></canvas></div>
      </section>
      ${renderClassroomRankings(classrooms)}
      <section class="panel">
        <h2>Correções de missões</h2>
        <div class="submission-list">
          ${submissions.length ? submissions.slice().reverse().map((submission) => `
            <article class="submission-card ${submission.status}">
              <div>
                <span class="eyebrow">${submission.status}</span>
                <h3>${submission.missionTitle}</h3>
                <p><strong>${submission.student}</strong> enviou: ${submission.text}</p>
                <small>Foto: ${submission.photoName} - ${submission.createdAt}</small>
                ${submission.feedback ? `<small>Feedback: ${submission.feedback}</small>` : ""}
              </div>
              <div class="review-actions">
                <input id="feedback-${submission.id}" placeholder="Feedback para o aluno">
                <button class="btn" onclick="reviewSubmission('${submission.id}', 'approved')">Aprovar</button>
                <button class="ghost" onclick="reviewSubmission('${submission.id}', 'correction')">Pedir correção</button>
              </div>
            </article>
          `).join("") : `<div class="chat-empty">Nenhum envio ainda.</div>`}
        </div>
      </section>
      <section class="panel">
        <h2>Atividade dos alunos por sala</h2>
        ${renderClassroomStudentActivity(classrooms, studentRows)}
      </section>
      <section>
        <h2>Histórico de jogos concluídos</h2>
        <div class="leaderboard">
          ${scores.length ? scores.slice().reverse().map((score) => `
            <div class="leader-row">
              <strong>${score.student}</strong>
              <span>${score.game}</span>
              <span>${score.score} pontos - ${score.completedAt}</span>
            </div>
          `).join("") : `<div class="leader-row"><span>Nenhum jogo concluído ainda.</span></div>`}
        </div>
      </section>
    </div>
    ${renderChatbot("teacher")}
  `);
  drawChart(scores);
}

function renderDirector() {
  stopWaterGame();
  const users = load(USERS_KEY, []);
  const classrooms = load(CLASSROOMS_KEY, defaultClassrooms);
  const missions = load(MISSIONS_KEY, defaultMissions);
  const submissions = load(SUBMISSIONS_KEY, []);
  const scores = load(SCORES_KEY, []);
  const teachers = users.filter((user) => user.role === "teacher");
  const students = users.filter((user) => user.role === "student");
  const studentRows = students.map((student) => {
    const studentScores = scores.filter((score) => score.student === student.name || score.user === student.user);
    const total = studentScores.reduce((sum, score) => sum + score.score, 0);
    const last = studentScores.slice(-1)[0];
    return { student, total, finished: studentScores.length, last };
  });

  shell(`
    ${topbar()}
    <div class="dashboard">
      <section class="welcome-band director-band">
        <div>
          <span class="eyebrow">Painel do diretor</span>
          <h2>Acesso completo às salas, professores, alunos e credenciais.</h2>
        </div>
      </section>
      <div class="stats">
        <div class="stat-card"><strong>${teachers.length}</strong><span>Professores</span></div>
        <div class="stat-card"><strong>${students.length}</strong><span>Alunos</span></div>
        <div class="stat-card"><strong>${classrooms.length}</strong><span>Salas cadastradas</span></div>
      </div>
      <section class="panel">
        <h2>Salas e professores responsáveis</h2>
        <div class="classroom-grid">
          ${classrooms.map((room) => `
            <div class="classroom-card">
              <strong>${room.name}</strong>
              <span class="class-code-label">Código da sala</span>
              <code class="class-code">${room.code}</code>
              <small>Professor: ${room.teacher || "Sem professor"}</small>
              <small>${students.filter((student) => (student.classCode || "ECO-8A") === room.code).length} alunos</small>
            </div>
          `).join("")}
        </div>
      </section>
      <section class="panel">
        <h2>Credenciais dos professores</h2>
        <div class="student-table accounts-table">
          ${teachers.length ? teachers.map((teacher) => `
            <div class="student-row director-account-row">
              <strong>${teacher.name}</strong>
              <span>Usuário: <b>${teacher.user}</b></span>
              <span>Senha: <b>${teacher.pass}</b></span>
              <span>${classrooms.filter((room) => teacherOwnsRoom(room, teacher)).length} salas</span>
              <span>${teacher.school || "Escola não informada"}</span>
            </div>
          `).join("") : `<div class="student-row empty"><span>Nenhum professor cadastrado.</span></div>`}
        </div>
      </section>
      <section class="panel">
        <h2>Credenciais dos alunos por sala</h2>
        ${renderClassroomStudentAccounts(classrooms, studentRows)}
      </section>
      ${renderClassroomRankings(classrooms)}
      <section class="panel">
        <h2>Indicadores gerais</h2>
        <div class="stats">
          <div class="stat-card"><strong>${missions.length}</strong><span>Missões criadas</span></div>
          <div class="stat-card"><strong>${submissions.filter((item) => item.status === "pending").length}</strong><span>Envios pendentes</span></div>
          <div class="stat-card"><strong>${scores.length}</strong><span>Jogos concluídos</span></div>
        </div>
      </section>
    </div>
    ${renderChatbot("director")}
  `);
}

function renderChatPanel(viewer) {
  const messages = load(CHAT_KEY, []);
  const title = viewer === "teacher" ? "Chat com os alunos" : viewer === "director" ? "Chat geral da escola" : "Tire dúvidas com a professora";
  const placeholder = viewer === "teacher" ? "Responder uma dúvida da turma..." : viewer === "director" ? "Enviar uma orientação geral..." : "Escreva sua dúvida para a professora...";
  return `
    <section class="panel chat-panel">
      <div class="chat-heading">
        <div>
          <span class="eyebrow">Bate-papo</span>
          <h2>${title}</h2>
        </div>
        <span class="chat-status">Online</span>
      </div>
      <div class="chat-box">
        ${messages.length ? messages.slice(-10).map((message) => `
          <div class="chat-message ${message.role === "director" ? "director" : message.role === "teacher" ? "teacher" : "student"}">
            <div class="chat-avatar">${message.role === "director" ? "D" : message.role === "teacher" ? "P" : "A"}</div>
            <div class="chat-content">
            <strong>${message.from}</strong>
            <p>${message.text}</p>
            <small>${message.createdAt}</small>
            </div>
          </div>
        `).join("") : `<div class="chat-empty">Nenhuma mensagem ainda.</div>`}
      </div>
      <div class="chat-form">
        <input id="chatInput" placeholder="${placeholder}">
        <button class="btn" onclick="sendChatMessage('${viewer}')">Enviar</button>
      </div>
    </section>
  `;
}

function renderChatbot(viewer) {
  const messages = load(CHAT_KEY, []);
  const title = viewer === "teacher" ? "Dúvidas dos alunos" : viewer === "director" ? "Chat da direção" : "Ajuda da professora";
  const placeholder = viewer === "teacher" ? "Responder como professora..." : viewer === "director" ? "Mensagem da direção..." : "Pergunte para a professora...";
  return `
    <aside class="chatbot-widget">
      <details open>
        <summary><span>${title}</span><small>Online</small></summary>
        <div class="chatbot-body">
          <div class="chatbot-messages">
            ${messages.length ? messages.slice(-8).map((message) => `
              <div class="chatbot-bubble ${message.role === "director" ? "director" : message.role === "teacher" ? "teacher" : "student"}">
                <div class="chat-avatar">${message.role === "director" ? "D" : message.role === "teacher" ? "P" : "A"}</div>
                <div class="chat-content">
                  <strong>${message.from}</strong>
                  <p>${message.text}</p>
                  <small>${message.createdAt}</small>
                </div>
              </div>
            `).join("") : `<div class="chat-empty">Nenhuma mensagem ainda.</div>`}
          </div>
          <div class="chatbot-form">
            <input id="chatbotInput" placeholder="${placeholder}">
            <button onclick="sendChatbotMessage('${viewer}')">Enviar</button>
          </div>
        </div>
      </details>
    </aside>
  `;
}

function sendChatbotMessage(viewer) {
  const input = document.querySelector("#chatbotInput");
  if (!input || !input.value.trim()) return;
  const messages = load(CHAT_KEY, []);
  messages.push({
    from: state.user.name,
    role: viewer,
    text: input.value.trim(),
    createdAt: nowLabel()
  });
  save(CHAT_KEY, messages);
  openDashboardForRole();
}

function sendChatMessage(viewer) {
  const input = document.querySelector("#chatInput");
  if (!input || !input.value.trim()) return;
  const messages = load(CHAT_KEY, []);
  messages.push({
    from: state.user.name,
    role: viewer,
    text: input.value.trim(),
    createdAt: nowLabel()
  });
  save(CHAT_KEY, messages);
  openDashboardForRole();
}

function createClassroom() {
  const name = document.querySelector("#newRoomName").value.trim();
  if (!name) return;
  const classrooms = load(CLASSROOMS_KEY, defaultClassrooms);
  const code = generateClassroomCode(classrooms);
  classrooms.push({ name, code, teacher: state.user.name, teacherUser: state.user.user, createdAt: today() });
  save(CLASSROOMS_KEY, classrooms);
  renderTeacher();
}

function createMission() {
  const title = document.querySelector("#missionTitle").value.trim();
  const points = Number(document.querySelector("#missionPoints").value || 50);
  const due = document.querySelector("#missionDue").value || today();
  const classCode = document.querySelector("#missionClass").value;
  const instructions = document.querySelector("#missionInstructions").value.trim();
  if (!title || !instructions || !classCode) return;
  const missions = load(MISSIONS_KEY, defaultMissions);
  missions.push({
    id: `missao-${Date.now()}`,
    title,
    points,
    due,
    classCode,
    instructions
  });
  save(MISSIONS_KEY, missions);
  renderTeacher();
}

function reviewSubmission(id, status) {
  const feedbackInput = document.querySelector(`#feedback-${id}`);
  const submissions = load(SUBMISSIONS_KEY, []);
  const submission = submissions.find((item) => item.id === id);
  if (!submission) return;
  submission.status = status;
  submission.feedback = feedbackInput && feedbackInput.value.trim()
    ? feedbackInput.value.trim()
    : status === "approved"
      ? "Parabéns! Missão aprovada."
      : "Revise sua atividade e envie novamente.";
  submission.reviewedAt = nowLabel();
  submission.reviewedBy = state.user.name;
  save(SUBMISSIONS_KEY, submissions);
  renderTeacher();
}

function createStudent() {
  const name = document.querySelector("#newName").value.trim();
  const user = document.querySelector("#newUser").value.trim();
  const pass = document.querySelector("#newPass").value.trim();
  const classCode = document.querySelector("#newStudentClass").value;
  const users = load(USERS_KEY, defaultUsers);
  const msg = document.querySelector("#createMsg");
  if (!name || !user || !pass || !classCode) {
    msg.textContent = "Preencha nome, usuário, senha e escolha uma sala.";
    return;
  }
  if (users.some((item) => item.user === user)) {
    msg.textContent = "Esse usuário já existe.";
    return;
  }
  users.push({ name, user, pass, role: "student", classCode });
  save(USERS_KEY, users);
  renderTeacher();
}

function drawChart(scores) {
  const canvas = document.querySelector("#scoreChart");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  const grouped = {};
  scores.forEach((score) => {
    grouped[score.student] = (grouped[score.student] || 0) + score.score;
  });
  const entries = Object.entries(grouped);
  if (!entries.length) {
    ctx.fillStyle = "#64748b";
    ctx.font = "20px Arial";
    ctx.fillText("Sem dados para exibir", 32, 55);
    return;
  }
  const max = Math.max(...entries.map(([, value]) => value), 100);
  const barWidth = Math.max(48, (width - 90) / entries.length - 24);
  entries.forEach(([student, value], index) => {
    const x = 55 + index * (barWidth + 24);
    const barHeight = Math.round((value / max) * 210);
    const y = height - 48 - barHeight;
    ctx.fillStyle = ["#2b8fd8", "#2fbf71", "#ffd166", "#7c5cff", "#ef476f"][index % 5];
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.fillStyle = "#243142";
    ctx.font = "bold 16px Arial";
    ctx.fillText(String(value), x, y - 10);
    ctx.font = "14px Arial";
    ctx.fillText(student.slice(0, 14), x, height - 22);
  });
}

ensureData();
applyAccessibility();
renderAuth();
