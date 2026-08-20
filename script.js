// ═══════════════════════════════════════════════
//  STORAGE HELPERS
//  All users saved in localStorage as JSON array
// ═══════════════════════════════════════════════
function getUsers() {
  return JSON.parse(localStorage.getItem('sc_users') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('sc_users', JSON.stringify(users));
}

function getSession() {
  return JSON.parse(localStorage.getItem('sc_session') || 'null');
}

function saveSession(user) {
  localStorage.setItem('sc_session', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('sc_session');
}

// ═══════════════════════════════════════════════
//  ON PAGE LOAD — check if already logged in
// ═══════════════════════════════════════════════
window.onload = function () {
  const session = getSession();
  if (session) {
    showApp(session);
  } else {
    document.getElementById('authPage').style.display = 'flex';
    document.getElementById('appPage').style.display  = 'none';
  }
};

// ═══════════════════════════════════════════════
//  SHOW / HIDE PAGES
// ═══════════════════════════════════════════════
function showApp(user) {
  document.getElementById('authPage').style.display = 'none';
  document.getElementById('appPage').style.display  = 'block';

  // Set avatar initial + name in nav
  const initial = (user.name || user.username || 'U')[0].toUpperCase();
  document.getElementById('avatarCircle').textContent = initial;
  document.getElementById('navUserName').textContent  = user.name || user.username;
}

// ═══════════════════════════════════════════════
//  TAB SWITCH
// ═══════════════════════════════════════════════
function switchTab(tab) {
  document.getElementById('loginForm').style.display  = tab === 'login'  ? 'block' : 'none';
  document.getElementById('signupForm').style.display = tab === 'signup' ? 'block' : 'none';
  document.getElementById('tabLogin').classList.toggle('active',  tab === 'login');
  document.getElementById('tabSignup').classList.toggle('active', tab === 'signup');
  setMsg('', '');
}

// ═══════════════════════════════════════════════
//  MESSAGE HELPER
// ═══════════════════════════════════════════════
function setMsg(text, type) {
  const el = document.getElementById('authMsg');
  el.textContent  = text;
  el.className    = 'auth-msg ' + (type || '');
}

// ═══════════════════════════════════════════════
//  TOGGLE PASSWORD VISIBILITY
// ═══════════════════════════════════════════════
function togglePass(id, el) {
  const input = document.getElementById(id);
  input.type  = input.type === 'password' ? 'text' : 'password';
  el.style.opacity = input.type === 'text' ? '1' : '0.45';
}

// ═══════════════════════════════════════════════
//  SIGN UP
// ═══════════════════════════════════════════════
function doSignup() {
  const name     = document.getElementById('regName').value.trim();
  const username = document.getElementById('regUser').value.trim().toLowerCase();
  const email    = document.getElementById('regEmail').value.trim().toLowerCase();
  const pass     = document.getElementById('regPass').value;
  const confirm  = document.getElementById('regConfirm').value;

  if (!name || !username || !email || !pass || !confirm) {
    return setMsg('Please fill in all fields.', 'error');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return setMsg('Please enter a valid email address.', 'error');
  }
  if (pass.length < 6) {
    return setMsg('Password must be at least 6 characters.', 'error');
  }
  if (pass !== confirm) {
    return setMsg('Passwords do not match.', 'error');
  }

  const users = getUsers();

  if (users.find(u => u.username === username)) {
    return setMsg('Username already taken. Choose another.', 'error');
  }
  if (users.find(u => u.email === email)) {
    return setMsg('Email already registered. Try logging in.', 'error');
  }

  const newUser = { name, username, email, pass };
  users.push(newUser);
  saveUsers(users);

  setMsg('Account created! You can now log in. ✅', 'success');

  // Clear fields and switch to login
  document.getElementById('regName').value    = '';
  document.getElementById('regUser').value    = '';
  document.getElementById('regEmail').value   = '';
  document.getElementById('regPass').value    = '';
  document.getElementById('regConfirm').value = '';

  setTimeout(() => switchTab('login'), 1200);
}

// ═══════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════
function doLogin() {
  const identifier = document.getElementById('loginUser').value.trim().toLowerCase();
  const pass       = document.getElementById('loginPass').value;

  if (!identifier || !pass) {
    return setMsg('Please enter your username/email and password.', 'error');
  }

  const users = getUsers();
  const user  = users.find(u => (u.username === identifier || u.email === identifier) && u.pass === pass);

  if (!user) {
    return setMsg('Incorrect username/email or password.', 'error');
  }

  saveSession(user);
  setMsg('', '');
  showApp(user);
  showToast('Welcome back, ' + (user.name || user.username) + '! 👋');
}

// ═══════════════════════════════════════════════
//  FORGOT PASSWORD (shows password as reminder)
// ═══════════════════════════════════════════════
function forgotPassword() {
  const identifier = document.getElementById('loginUser').value.trim().toLowerCase();
  if (!identifier) {
    return setMsg('Enter your username or email above first.', 'error');
  }

  const users = getUsers();
  const user  = users.find(u => u.username === identifier || u.email === identifier);

  if (!user) {
    return setMsg('No account found with that username or email.', 'error');
  }

  setMsg('Your password is: ' + user.pass, 'success');
}

// ═══════════════════════════════════════════════
//  SOCIAL / DEMO LOGIN
//  Creates a demo session for the chosen provider
// ═══════════════════════════════════════════════
function demoLogin(provider) {
  const names = {
    google:    { name: 'Google User',    username: 'google_user'    },
    github:    { name: 'GitHub User',    username: 'github_user'    },
    microsoft: { name: 'Microsoft User', username: 'microsoft_user' }
  };
  const demoUser = { ...names[provider], email: provider + '@demo.com', pass: 'demo' };
  saveSession(demoUser);
  setMsg('', '');
  showApp(demoUser);
  showToast('Signed in with ' + provider.charAt(0).toUpperCase() + provider.slice(1) + ' (Demo) 🎉');
}

// ═══════════════════════════════════════════════
//  LOGOUT
// ═══════════════════════════════════════════════
function doLogout() {
  clearSession();
  document.getElementById('semesterContainer').innerHTML = '';
  document.getElementById('calcBtn').style.display       = 'none';
  document.getElementById('resultSection').style.display = 'none';
  document.getElementById('authPage').style.display      = 'flex';
  document.getElementById('appPage').style.display       = 'none';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
  setMsg('', '');
}

// ═══════════════════════════════════════════════
//  TOAST
// ═══════════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ═══════════════════════════════════════════════
//  GRADE SCALE (10-point)
//  90-100 → O  (10)   80-89 → A+ (9)
//  70-79  → A  (8)    60-69 → B+ (7)
//  50-59  → B  (6)    40-49 → C  (5)
//  < 40   → F  (0)  ← backlog
// ═══════════════════════════════════════════════
function getGradePoint(pct) {
  if (pct >= 90) return { grade: 'O',  cls: 'grade-O',  point: 10 };
  if (pct >= 80) return { grade: 'A+', cls: 'grade-Ap', point: 9  };
  if (pct >= 70) return { grade: 'A',  cls: 'grade-A',  point: 8  };
  if (pct >= 60) return { grade: 'B+', cls: 'grade-Bp', point: 7  };
  if (pct >= 50) return { grade: 'B',  cls: 'grade-B',  point: 6  };
  if (pct >= 40) return { grade: 'C',  cls: 'grade-C',  point: 5  };
  return               { grade: 'F',  cls: 'grade-F',  point: 0  };
}

// ═══════════════════════════════════════════════
//  GENERATE SEMESTER BLOCKS
// ═══════════════════════════════════════════════
let subjectCount = {};

function generateSemesters() {
  const n = parseInt(document.getElementById('numSemesters').value);
  if (!n) return showToast('Please select number of semesters.');

  subjectCount = {};
  const container = document.getElementById('semesterContainer');
  container.innerHTML = '';

  for (let s = 1; s <= n; s++) {
    subjectCount[s] = 5;
    const block = document.createElement('div');
    block.className = 'sem-block';
    block.id = 'sem-' + s;
    block.innerHTML =
      '<h3>Semester ' + s + '</h3>' +
      '<div class="subject-row">' +
        '<label>Subject Name</label>' +
        '<label>Max Marks</label>' +
        '<label>Marks Obtained</label>' +
        '<label>Credits</label>' +
      '</div>' +
      '<div id="subjects-' + s + '">' +
        buildSubjectRow(s, 1) +
        buildSubjectRow(s, 2) +
        buildSubjectRow(s, 3) +
        buildSubjectRow(s, 4) +
        buildSubjectRow(s, 5) +
      '</div>' +
      '<button class="add-sub-btn" onclick="addSubject(' + s + ')">+ Add Subject</button>';
    container.appendChild(block);
  }

  document.getElementById('calcBtn').style.display       = 'block';
  document.getElementById('resultSection').style.display = 'none';
  showToast('Score sheet ready for ' + n + ' semester(s) ✅');
}

function buildSubjectRow(sem, idx) {
  return '<div class="subject-row" id="sub-' + sem + '-' + idx + '">' +
    '<input type="text"   placeholder="Subject ' + idx + '" />' +
    '<input type="number" placeholder="100" min="1" value="100" />' +
    '<input type="number" placeholder="Marks" min="0" />' +
    '<input type="number" placeholder="Credits" min="1" max="6" value="3" />' +
  '</div>';
}

function addSubject(sem) {
  subjectCount[sem]++;
  document.getElementById('subjects-' + sem)
    .insertAdjacentHTML('beforeend', buildSubjectRow(sem, subjectCount[sem]));
}

// ═══════════════════════════════════════════════
//  CALCULATE GPA / CGPA / PLACEMENT
// ═══════════════════════════════════════════════
function calculate() {
  const name   = document.getElementById('studentName').value.trim();
  const rollNo = document.getElementById('rollNo').value.trim();
  const n      = parseInt(document.getElementById('numSemesters').value);

  if (!name)   return showToast('Please enter the student name.');
  if (!rollNo) return showToast('Please enter the roll number.');

  let totalWeighted = 0;
  let totalCredits  = 0;
  let totalBacklogs = 0;
  let semHTML       = '';
  let semCount      = 0;

  for (let s = 1; s <= n; s++) {
    const rows = document.querySelectorAll('#subjects-' + s + ' .subject-row');
    let semWeighted = 0;
    let semCredits  = 0;
    let tableRows   = '';
    let hasData     = false;

    rows.forEach(function(row) {
      const inputs   = row.querySelectorAll('input');
      const subName  = inputs[0].value.trim() || 'Subject';
      const maxMark  = parseFloat(inputs[1].value) || 100;
      const obtained = inputs[2].value.trim();
      const credits  = parseFloat(inputs[3].value) || 3;

      if (obtained === '') return;
      hasData = true;

      const marks   = parseFloat(obtained);
      const pct     = (marks / maxMark) * 100;
      const g       = getGradePoint(pct);
      const backlog = g.grade === 'F';

      if (backlog) totalBacklogs++;
      semWeighted += g.point * credits;
      semCredits  += credits;

      tableRows +=
        '<tr class="' + (backlog ? 'backlog-row' : '') + '">' +
          '<td>' + subName + '</td>' +
          '<td>' + marks + ' / ' + maxMark + '</td>' +
          '<td>' + pct.toFixed(1) + '%</td>' +
          '<td class="' + g.cls + '">' + g.grade + '</td>' +
          '<td>' + g.point + '</td>' +
          '<td>' + credits + '</td>' +
        '</tr>';
    });

    if (!hasData || semCredits === 0) continue;

    semCount++;
    const semGPA = semWeighted / semCredits;
    totalWeighted += semWeighted;
    totalCredits  += semCredits;

    semHTML +=
      '<div class="sem-result">' +
        '<div class="sem-result-header">' +
          '<span>Semester ' + s + '</span>' +
          '<span class="gpa-badge">GPA: ' + semGPA.toFixed(2) + '</span>' +
        '</div>' +
        '<table>' +
          '<thead><tr>' +
            '<th>Subject</th><th>Marks</th><th>Percentage</th>' +
            '<th>Grade</th><th>Grade Point</th><th>Credits</th>' +
          '</tr></thead>' +
          '<tbody>' + tableRows + '</tbody>' +
        '</table>' +
      '</div>';
  }

  if (totalCredits === 0) return showToast('Please enter marks for at least one subject.');

  const cgpa        = totalWeighted / totalCredits;
  const isEligible  = cgpa >= 7.0 && totalBacklogs === 0;
  const reasons     = [];
  if (cgpa < 7.0)        reasons.push('CGPA ' + cgpa.toFixed(2) + ' is below 7.0');
  if (totalBacklogs > 0) reasons.push(totalBacklogs + ' active backlog(s)');

  // Render
  document.getElementById('studentMeta').innerHTML =
    '<span>👤 <strong>' + name + '</strong></span>' +
    '<span>🎫 Roll No: <strong>' + rollNo + '</strong></span>' +
    '<span>📚 Semesters Entered: <strong>' + semCount + '</strong></span>' +
    '<span>⚠️ Backlogs: <strong>' + totalBacklogs + '</strong></span>';

  document.getElementById('semesterResults').innerHTML = semHTML;

  document.getElementById('cgpaBox').innerHTML =
    '<div class="cgpa-value">' + cgpa.toFixed(2) + '</div>' +
    '<p>Cumulative Grade Point Average (CGPA) out of 10.00</p>';

  document.getElementById('placementBox').className =
    'placement-box ' + (isEligible ? 'eligible' : 'not-eligible');

  document.getElementById('placementBox').innerHTML = isEligible
    ? '✅ Eligible for Placement<div class="reason">CGPA ' + cgpa.toFixed(2) + ' ≥ 7.0 &nbsp;|&nbsp; No backlogs — All criteria met!</div>'
    : '❌ Not Eligible for Placement<div class="reason">' + reasons.join(' &nbsp;|&nbsp; ') + '</div>';

  const result = document.getElementById('resultSection');
  result.style.display = 'block';
  result.scrollIntoView({ behavior: 'smooth' });
  showToast('Results calculated! 🎉');
}
