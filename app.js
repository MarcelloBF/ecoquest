const app = document.querySelector("#app");

const USERS_KEY = "ecoquestUsuarios";
const SCORES_KEY = "ecoquestPontuacoes";
const CHAT_KEY = "ecoquestChat";
const CLASSROOMS_KEY = "ecoquestSalas";
const MISSIONS_KEY = "ecoquestMissoes";
const SUBMISSIONS_KEY = "ecoquestEnvios";

const defaultUsers = [
  { name: "Aluno Demo", user: "aluno", pass: "1234", role: "student", classCode: "ECO-8A" },
  { name: "Ana Clara Mendes", user: "professor", pass: "admin123", role: "teacher", school: "Escola Verde" }
];

const defaultClassrooms = [
  { name: "8 Ano - Sustentabilidade 2026", code: "ECO-8A", teacher: "Ana Clara Mendes" }
];

const defaultMissions = [
  {
    id: "missao-recicle-casa",
    title: "Recicle na sua casa",
    points: 50,
    due: "2026-05-20",
    classCode: "ECO-8A",
    instructions: "Separe um material reciclavel em casa, tire uma foto e escreva um texto curto contando o que voce fez."
  },
  {
    id: "missao-economize-agua",
    title: "Economize agua por um dia",
    points: 40,
    due: "2026-05-24",
    classCode: "ECO-8A",
    instructions: "Escolha uma atitude para economizar agua e conte em poucas linhas como foi."
  }
];

const games = [
  {
    id: "reciclagem",
    title: "Parque da Reciclagem",
    icon: "R",
    color: "blue",
    description: "Arraste cada residuo para a lixeira correta."
  },
  {
    id: "agua",
    title: "Corrida da Gotinha",
    icon: "A",
    color: "yellow",
    description: "Mova a gotinha, pegue agua limpa e fuja dos vazamentos."
  },
  {
    id: "jardim",
    title: "Jardim das Boas Atitudes",
    icon: "J",
    color: "green",
    description: "Arraste atitudes boas para o jardim e atitudes ruins para o alerta."
  },
  {
    id: "energia",
    title: "Casa Economica",
    icon: "E",
    color: "purple",
    description: "Desligue desperdicios e deixe a casa economizando energia."
  },
  {
    id: "memoria",
    title: "Memoria Sustentavel",
    icon: "M",
    color: "pink",
    description: "Encontre pares de atitudes que ajudam o planeta."
  }
];

const trashItems = [
  { label: "Jornal", type: "paper", hint: "Papel" },
  { label: "Garrafa PET", type: "plastic", hint: "Plastico" },
  { label: "Latinha", type: "metal", hint: "Metal" },
  { label: "Casca de banana", type: "organic", hint: "Organico" },
  { label: "Caixa", type: "paper", hint: "Papel" },
  { label: "Sacola", type: "plastic", hint: "Plastico" },
  { label: "Tampa", type: "metal", hint: "Metal" },
  { label: "Folhas", type: "organic", hint: "Organico" }
];

const gardenItems = [
  { label: "Plantar arvore", type: "good" },
  { label: "Economizar agua", type: "good" },
  { label: "Reutilizar papel", type: "good" },
  { label: "Jogar lixo no chao", type: "bad" },
  { label: "Deixar luz ligada", type: "bad" },
  { label: "Desperdicar comida", type: "bad" }
];

const energyTasks = [
  { label: "Luz do quarto", waste: true },
  { label: "TV sem ninguem", waste: true },
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
  energyDone: [],
  memory: [],
  flipped: [],
  matched: [],
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
  if (!localStorage.getItem(CLASSROOMS_KEY)) save(CLASSROOMS_KEY, defaultClassrooms);
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
  return role === "teacher" ? "Professor" : "Aluno";
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
      <div class="top-actions">${name ? `<button class="ghost" onclick="logout()">Sair de ${name}</button>` : ""}${extra}</div>
    </div>
  `;
}

function renderAuth() {
  const isSignup = state.authMode === "signup";
  shell(`
    ${topbar()}
    <div class="hero">
      <section class="hero-copy">
        <h1>EcoQuest</h1>
        <p>A plataforma que transforma sustentabilidade em missoes praticas, jogos, pontos e acompanhamento para professores.</p>
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
        </div>
        ${isSignup ? `<label class="field">Nome completo<input id="nameInput" autocomplete="name" placeholder="Seu nome"></label>` : ""}
        ${isSignup && state.role === "student" ? `<label class="field">Codigo da sala<input id="classCodeInput" placeholder="ECO-8A" value="ECO-8A"></label>` : ""}
        ${isSignup && state.role === "teacher" ? `<label class="field">Escola<input id="schoolInput" placeholder="Nome da escola"></label>` : ""}
        <label class="field">Usuario<input id="userInput" autocomplete="username" placeholder="Digite seu usuario"></label>
        <label class="field">Senha<input id="passInput" type="password" autocomplete="current-password" placeholder="Digite sua senha"></label>
        <button class="btn" onclick="${isSignup ? "signup()" : "login()"}">${isSignup ? `Criar conta de ${roleName(state.role)}` : "Entrar"}</button>
        <p id="authMessage" class="error"></p>
        <div class="hint">Teste: aluno / 1234 ou professor / admin123. As contas novas ficam salvas neste navegador.</div>
      </section>
    </div>
  `);
}

function setAuthMode(mode) {
  state.authMode = mode;
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
    showAuthMessage("Usuario ou senha invalidos para esse tipo de conta.");
    return;
  }
  state.user = found;
  found.role === "teacher" ? renderTeacher() : renderStudent();
}

function signup() {
  const name = document.querySelector("#nameInput").value.trim();
  const user = document.querySelector("#userInput").value.trim();
  const pass = document.querySelector("#passInput").value.trim();
  const users = load(USERS_KEY, defaultUsers);

  if (!name || !user || !pass) {
    showAuthMessage("Preencha nome, usuario e senha.");
    return;
  }

  if (user.length < 3 || pass.length < 4) {
    showAuthMessage("Use usuario com 3 letras e senha com pelo menos 4 caracteres.");
    return;
  }

  if (users.some((item) => item.user === user)) {
    showAuthMessage("Esse usuario ja existe. Escolha outro.");
    return;
  }

  const classCodeInput = document.querySelector("#classCodeInput");
  const schoolInput = document.querySelector("#schoolInput");
  const newUser = state.role === "student"
    ? { name, user, pass, role: state.role, classCode: (classCodeInput && classCodeInput.value.trim().toUpperCase()) || "ECO-8A" }
    : { name, user, pass, role: state.role, school: (schoolInput && schoolInput.value.trim()) || "Escola Verde" };
  users.push(newUser);
  save(USERS_KEY, users);
  state.user = newUser;
  state.role === "teacher" ? renderTeacher() : renderStudent();
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
          <span class="eyebrow">Ola, ${state.user.name} - ${classroom ? classroom.name : "Sala ECO-8A"}</span>
          <h2>Complete missoes reais, jogue e suba no ranking da sala.</h2>
        </div>
        <div class="mascot-face"><span></span></div>
      </section>
      <div class="stats">
        <div class="stat-card"><strong>${total + approvedPoints}</strong><span>Pontos totais</span></div>
        <div class="stat-card"><strong>${finished}</strong><span>Jogos concluidos</span></div>
        <div class="stat-card"><strong>${missions.length}</strong><span>Missoes da professora</span></div>
      </div>
      <section class="panel">
        <h2>Missoes praticas da professora</h2>
        <div class="mission-grid">
          ${missions.map((mission) => renderStudentMissionCard(mission, submissions)).join("")}
        </div>
      </section>
      ${renderRanking()}
      <section>
        <h2>Jogos de aquecimento</h2>
        <div class="games">
          ${games.map((game) => `
            <article class="game-card">
              <span class="game-icon ${game.color}">${game.icon}</span>
              <h3>${game.title}</h3>
              <p>${game.description}</p>
              <button class="btn" onclick="startGame('${game.id}')">Comecar missao</button>
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
    pending: "Aguardando correcao",
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
        <label class="field">Texto curto da atividade<textarea id="missionText-${mission.id}" placeholder="Conte o que voce fez...">${submission ? submission.text : ""}</textarea></label>
        <label class="field">Foto da atividade<input id="missionPhoto-${mission.id}" type="file" accept="image/*"></label>
        <button class="btn" onclick="submitMission('${mission.id}')">${submission ? "Reenviar para correcao" : "Enviar missao"}</button>
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

function renderRanking() {
  const rows = buildRanking();
  return `
    <section class="panel">
      <h2>Ranking da sala</h2>
      <div class="ranking-list">
        ${rows.map((row, index) => `
          <div class="ranking-row">
            <strong>${index + 1}</strong>
            <span>${row.name}</span>
            <span>${row.points} pontos</span>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function buildRanking() {
  const users = load(USERS_KEY, defaultUsers).filter((user) => user.role === "student");
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
  state.energyDone = [];
  state.memory = [];
  state.flipped = [];
  state.matched = [];
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
      <h2>${game.title} concluido!</h2>
      <p>Voce ganhou <strong>${score} pontos</strong>. Cada boa escolha deixa o planeta mais feliz.</p>
      <button class="btn" onclick="renderStudent()">Voltar para as missoes</button>
    </section>
  `);
}

function feedbackHtml() {
  if (!state.feedback) return "";
  return `<div class="feedback ${state.feedbackType}">${state.feedback}</div>`;
}

function dragStart(event, index, group) {
  event.dataTransfer.setData("text/plain", JSON.stringify({ index, group }));
}

function allowDrop(event) {
  event.preventDefault();
}

function renderTrashGame() {
  const remaining = trashItems.filter((_, index) => !state.placedTrash.includes(index));
  shell(`
    ${topbar('<button class="ghost" onclick="renderStudent()">Voltar</button>')}
    <section class="panel play-area">
      <div class="progress"><span>Arraste os residuos</span><span>${state.tempScore} pontos</span></div>
      <div class="park-scene">
        <div class="park-sky"><span></span><span></span></div>
        <div class="park-title">
          <span class="eyebrow">Parque da Reciclagem</span>
          <h2>Limpe o parque: arraste cada lixo para a lixeira da mesma categoria.</h2>
          <p>Azul = papel, vermelho = plastico, amarelo = metal, marrom = organico.</p>
        </div>
        <div class="park-path">
          <div class="drag-shelf park-items">
            ${remaining.map((item) => {
              const realIndex = trashItems.indexOf(item);
              return `<div class="drag-card trash-card ${item.type}" draggable="true" ondragstart="dragStart(event, ${realIndex}, 'trash')"><span>${item.label}</span><small>${item.hint}</small></div>`;
            }).join("")}
          </div>
        </div>
        <div class="park-bins">
          <div class="park-bin paper" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'paper')"><strong>Papel</strong><span>jornais e caixas</span></div>
          <div class="park-bin plastic" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'plastic')"><strong>Plastico</strong><span>garrafas e sacolas</span></div>
          <div class="park-bin metal" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'metal')"><strong>Metal</strong><span>latas e tampas</span></div>
          <div class="park-bin organic" ondragover="allowDrop(event)" ondrop="dropTrash(event, 'organic')"><strong>Organico</strong><span>folhas e cascas</span></div>
        </div>
      </div>
      ${feedbackHtml()}
    </section>
  `);
}

function dropTrash(event, type) {
  event.preventDefault();
  const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
  if (payload.group !== "trash") return;
  const item = trashItems[payload.index];
  if (state.placedTrash.includes(payload.index)) return;

  if (item.type === type) {
    state.tempScore += 13;
    state.feedback = "Boa! Voce colocou no lugar certo.";
    state.feedbackType = "good";
  } else {
    state.feedback = `Quase! ${item.label} combina com ${item.hint}.`;
    state.feedbackType = "bad";
  }

  state.placedTrash.push(payload.index);
  if (state.placedTrash.length === trashItems.length) {
    renderTrashGame();
    setTimeout(() => saveScore("reciclagem", Math.min(100, state.tempScore)), 700);
  } else {
    renderTrashGame();
  }
}

function renderGardenGame() {
  const remaining = gardenItems.filter((_, index) => !state.placedGarden.includes(index));
  shell(`
    ${topbar('<button class="ghost" onclick="renderStudent()">Voltar</button>')}
    <section class="panel play-area">
      <div class="progress"><span>Organize as atitudes</span><span>${state.tempScore} pontos</span></div>
      <div class="story-board garden-board">
        <div class="big-character garden-character"></div>
        <div>
          <span class="eyebrow">Jardim das Boas Atitudes</span>
          <h2>Arraste atitudes boas para o jardim e ruins para o alerta.</h2>
          <p>O jardim cresce quando voce escolhe boas atitudes.</p>
        </div>
      </div>
      <div class="drag-shelf">
        ${remaining.map((item) => {
          const realIndex = gardenItems.indexOf(item);
          return `<div class="drag-card habit-card" draggable="true" ondragstart="dragStart(event, ${realIndex}, 'garden')"><span>${item.label}</span></div>`;
        }).join("")}
      </div>
      <div class="drop-grid two">
        <div class="drop-zone garden-good" ondragover="allowDrop(event)" ondrop="dropGarden(event, 'good')">Jardim</div>
        <div class="drop-zone garden-bad" ondragover="allowDrop(event)" ondrop="dropGarden(event, 'bad')">Alerta</div>
      </div>
      ${feedbackHtml()}
    </section>
  `);
}

function dropGarden(event, type) {
  event.preventDefault();
  const payload = JSON.parse(event.dataTransfer.getData("text/plain"));
  if (payload.group !== "garden") return;
  const item = gardenItems[payload.index];
  if (state.placedGarden.includes(payload.index)) return;

  if (item.type === type) {
    state.tempScore += 17;
    state.feedback = type === "good" ? "Perfeito! Essa atitude faz o jardim crescer." : "Isso mesmo! Essa atitude precisa de alerta.";
    state.feedbackType = "good";
  } else {
    state.feedback = "Ops! Pense se essa atitude ajuda ou prejudica o planeta.";
    state.feedbackType = "bad";
  }

  state.placedGarden.push(payload.index);
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
      <div class="progress"><span>Desperdicios desligados: ${doneCount} de ${wasteTotal}</span><span>${state.tempScore} pontos</span></div>
      <div class="story-board energy-board">
        <div class="big-character energy-character"></div>
        <div>
          <span class="eyebrow">Casa Economica</span>
          <h2>Encontre desperdicios de energia na casa.</h2>
          <p>Clique nos desperdicios para desligar. Se algo ja ajuda o planeta, pode deixar ligado.</p>
        </div>
      </div>
      <div class="house-grid">
        ${energyTasks.map((task, index) => `
          <button class="room-card ${state.energyDone.includes(index) ? "done" : ""}" onclick="toggleEnergy(${index})">
            <span class="room-light ${task.waste && !state.energyDone.includes(index) ? "on" : ""}"></span>
            <strong>${task.label}</strong>
            <small>${state.energyDone.includes(index) ? "Resolvido" : task.waste ? "Desperdicio" : "Boa atitude"}</small>
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
    state.feedback = "Boa! Voce desligou um desperdicio.";
    state.feedbackType = "good";
  } else {
    state.feedback = "Essa ja era uma boa atitude. Nao precisava mudar.";
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
      <div class="progress"><span>Pares encontrados: ${state.matched.length} de ${memoryPairs.length}</span><span>${state.tempScore} pontos</span></div>
      <div class="story-board memory-board">
        <div class="big-character memory-character"></div>
        <div>
          <span class="eyebrow">Memoria Sustentavel</span>
          <h2>Vire duas cartas e encontre atitudes iguais.</h2>
          <p>Use a memoria para completar o album do planeta.</p>
        </div>
      </div>
      <div class="memory-grid">
        ${state.memory.map((card, index) => {
          const open = state.flipped.includes(index) || state.matched.includes(card.text);
          return `<button class="tile memory-card ${open ? "open" : ""}" onclick="flipCard(${index})">${open ? card.text : "?"}</button>`;
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
        state.feedback = "Nao foi par. Tente outra combinacao.";
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
      <div class="story-board water-board">
        <div class="big-character drop-character"></div>
        <div>
          <span class="eyebrow">Corrida da Gotinha</span>
          <h2>Mova a gotinha ate as gotas azuis.</h2>
          <p>Use as setas do teclado ou os botoes. Pegue 8 gotas para concluir a missao.</p>
        </div>
      </div>
      <canvas id="waterCanvas" width="720" height="360" class="game-canvas"></canvas>
      <div class="move-controls">
        <button class="ghost" onclick="moveDrop(0, -1)">Cima</button>
        <button class="ghost" onclick="moveDrop(-1, 0)">Esquerda</button>
        <button class="ghost" onclick="moveDrop(1, 0)">Direita</button>
        <button class="ghost" onclick="moveDrop(0, 1)">Baixo</button>
      </div>
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
    }
  });
  state.water.bad.forEach((dot) => {
    if (dot.active && distance(player, dot) < player.r + dot.r) {
      dot.active = false;
      state.waterLives -= 1;
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

  if (hud) hud.textContent = `${state.waterScore} pontos - ${state.waterLives} vidas`;
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
  const scores = load(SCORES_KEY, []);
  const users = load(USERS_KEY, []);
  const classrooms = load(CLASSROOMS_KEY, defaultClassrooms);
  const missions = load(MISSIONS_KEY, defaultMissions);
  const submissions = load(SUBMISSIONS_KEY, []);
  const students = users.filter((user) => user.role === "student");
  const teachers = users.filter((user) => user.role === "teacher");
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
          <span class="eyebrow">Painel da professora Ana Clara</span>
          <h2>Crie salas, publique missoes, corrija envios e acompanhe impacto.</h2>
        </div>
      </section>
      <div class="stats">
        <div class="stat-card"><strong>${students.length}</strong><span>Alunos cadastrados</span></div>
        <div class="stat-card"><strong>${missions.length}</strong><span>Missoes criadas</span></div>
        <div class="stat-card"><strong>${submissions.filter((item) => item.status === "pending").length}</strong><span>Envios pendentes</span></div>
      </div>
      <section class="panel">
        <h2>Salas</h2>
        <div class="classroom-grid">
          ${classrooms.map((room) => `
            <div class="classroom-card">
              <strong>${room.name}</strong>
              <span>Codigo: ${room.code}</span>
              <small>${students.filter((student) => (student.classCode || "ECO-8A") === room.code).length} alunos</small>
            </div>
          `).join("")}
        </div>
        <div class="inline-form">
          <input id="newRoomName" placeholder="Nome da sala. Ex: 7 Ano - Sustentabilidade">
          <input id="newRoomCode" placeholder="Codigo. Ex: ECO-7A">
          <button class="btn" onclick="createClassroom()">Nova sala</button>
        </div>
      </section>
      <section class="panel">
        <h2>Criar missao pratica</h2>
        <div class="mission-form">
          <input id="missionTitle" placeholder="Titulo da missao">
          <input id="missionPoints" type="number" placeholder="Pontos">
          <input id="missionDue" type="date">
          <select id="missionClass">
            ${classrooms.map((room) => `<option value="${room.code}">${room.name}</option>`).join("")}
          </select>
          <textarea id="missionInstructions" placeholder="O que o aluno deve enviar? Ex: foto + texto curto"></textarea>
          <button class="btn" onclick="createMission()">Publicar missao</button>
        </div>
      </section>
      <section class="panel">
        <h2>Cadastrar aluno pelo professor</h2>
        <label class="field">Nome<input id="newName" placeholder="Nome do aluno"></label>
        <label class="field">Usuario<input id="newUser" placeholder="usuario"></label>
        <label class="field">Senha<input id="newPass" placeholder="senha"></label>
        <button class="btn" onclick="createStudent()">Cadastrar aluno</button>
        <p id="createMsg" class="error"></p>
      </section>
      <section class="panel">
        <h2>Grafico de pontuacao</h2>
        <div class="chart-wrap"><canvas id="scoreChart" width="900" height="300"></canvas></div>
      </section>
      ${renderRanking()}
      <section class="panel">
        <h2>Correcoes de missoes</h2>
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
                <button class="ghost" onclick="reviewSubmission('${submission.id}', 'correction')">Pedir correcao</button>
              </div>
            </article>
          `).join("") : `<div class="chat-empty">Nenhum envio ainda.</div>`}
        </div>
      </section>
      <section class="panel">
        <h2>Atividade dos alunos</h2>
        <div class="student-table">
          ${studentRows.length ? studentRows.map((row) => `
            <div class="student-row">
              <strong>${row.student.name}</strong>
              <span>${row.student.user}</span>
              <span>${row.finished} jogos</span>
              <span>${row.total} pontos</span>
              <span>${row.last ? `${row.last.game} em ${row.last.completedAtTime || row.last.completedAt}` : "Ainda sem jogos"}</span>
            </div>
          `).join("") : `<div class="student-row"><span>Nenhum aluno cadastrado.</span></div>`}
        </div>
      </section>
      <section>
        <h2>Historico de jogos concluidos</h2>
        <div class="leaderboard">
          ${scores.length ? scores.slice().reverse().map((score) => `
            <div class="leader-row">
              <strong>${score.student}</strong>
              <span>${score.game}</span>
              <span>${score.score} pontos - ${score.completedAt}</span>
            </div>
          `).join("") : `<div class="leader-row"><span>Nenhum jogo concluido ainda.</span></div>`}
        </div>
      </section>
    </div>
    ${renderChatbot("teacher")}
  `);
  drawChart(scores);
}

function renderChatPanel(viewer) {
  const messages = load(CHAT_KEY, []);
  const title = viewer === "teacher" ? "Chat com os alunos" : "Tire duvidas com a professora";
  const placeholder = viewer === "teacher" ? "Responder uma duvida da turma..." : "Escreva sua duvida para a professora...";
  return `
    <section class="panel chat-panel">
      <h2>${title}</h2>
      <div class="chat-box">
        ${messages.length ? messages.slice(-10).map((message) => `
          <div class="chat-message ${message.role === "teacher" ? "teacher" : "student"}">
            <strong>${message.from}</strong>
            <p>${message.text}</p>
            <small>${message.createdAt}</small>
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
  const title = viewer === "teacher" ? "Duvidas dos alunos" : "Ajuda da professora";
  const placeholder = viewer === "teacher" ? "Responder como professora..." : "Pergunte para a professora...";
  return `
    <aside class="chatbot-widget">
      <details open>
        <summary>${title}</summary>
        <div class="chatbot-body">
          <div class="chatbot-messages">
            ${messages.length ? messages.slice(-8).map((message) => `
              <div class="chatbot-bubble ${message.role === "teacher" ? "teacher" : "student"}">
                <strong>${message.from}</strong>
                <p>${message.text}</p>
                <small>${message.createdAt}</small>
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
    role: viewer === "teacher" ? "teacher" : "student",
    text: input.value.trim(),
    createdAt: nowLabel()
  });
  save(CHAT_KEY, messages);
  viewer === "teacher" ? renderTeacher() : renderStudent();
}

function sendChatMessage(viewer) {
  const input = document.querySelector("#chatInput");
  if (!input || !input.value.trim()) return;
  const messages = load(CHAT_KEY, []);
  messages.push({
    from: state.user.name,
    role: viewer === "teacher" ? "teacher" : "student",
    text: input.value.trim(),
    createdAt: nowLabel()
  });
  save(CHAT_KEY, messages);
  viewer === "teacher" ? renderTeacher() : renderStudent();
}

function createClassroom() {
  const name = document.querySelector("#newRoomName").value.trim();
  const code = document.querySelector("#newRoomCode").value.trim().toUpperCase();
  if (!name || !code) return;
  const classrooms = load(CLASSROOMS_KEY, defaultClassrooms);
  if (!classrooms.some((room) => room.code === code)) {
    classrooms.push({ name, code, teacher: state.user.name });
    save(CLASSROOMS_KEY, classrooms);
  }
  renderTeacher();
}

function createMission() {
  const title = document.querySelector("#missionTitle").value.trim();
  const points = Number(document.querySelector("#missionPoints").value || 50);
  const due = document.querySelector("#missionDue").value || today();
  const classCode = document.querySelector("#missionClass").value;
  const instructions = document.querySelector("#missionInstructions").value.trim();
  if (!title || !instructions) return;
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
      ? "Parabens! Missao aprovada."
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
  const users = load(USERS_KEY, defaultUsers);
  const msg = document.querySelector("#createMsg");
  if (!name || !user || !pass) {
    msg.textContent = "Preencha nome, usuario e senha.";
    return;
  }
  if (users.some((item) => item.user === user)) {
    msg.textContent = "Esse usuario ja existe.";
    return;
  }
  users.push({ name, user, pass, role: "student", classCode: "ECO-8A" });
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
renderAuth();
