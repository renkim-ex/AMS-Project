// ── DOMContentLoaded: 모든 이벤트 바인딩 ──
document.addEventListener('DOMContentLoaded', function() {

  const GOOGLE_CLIENT_ID = '192727052852-0k55qupb1pirbp0up86d2mmqhjv5ra19.apps.googleusercontent.com';
  const ALLOWED_DOMAIN   = 'buzzvil.com';
  const ADMIN_ACCOUNT    = { id:'buzzasst', pw: atob('YnV6ejI2MDIwOSE='), name:'관리자', role:'admin' };
  let adminPw = ADMIN_ACCOUNT.pw; // 런타임 비밀번호 (변경 반영)

  let currentUser = null;
  const isAdmin = () => currentUser?.role === 'admin';

  // ── 관리자 로그인 ──
  document.getElementById('login-pw').addEventListener('keydown', e => { if (e.key === 'Enter') doAdminLogin(); });
  document.getElementById('btn-admin-login').addEventListener('click', doAdminLogin);

  function doAdminLogin() {
    const id  = document.getElementById('login-email').value.trim();
    const pw  = document.getElementById('login-pw').value;
    const err = document.getElementById('login-error');
    if (id === ADMIN_ACCOUNT.id && pw === adminPw) {
      err.classList.remove('show');
      startApp({ name:'관리자', email:'buzzasst', role:'admin', avatar:'B' });
    } else {
      err.classList.add('show');
    }
  }

  // ── Google 로그인 ──
  document.getElementById('btn-google-login').addEventListener('click', () => {
    google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile',
      callback: async (tokenResponse) => {
        const res  = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: 'Bearer ' + tokenResponse.access_token }
        });
        const info = await res.json();
        const err  = document.getElementById('google-error');
        if (!info.email || !info.email.endsWith('@' + ALLOWED_DOMAIN)) {
          err.classList.add('show');
          return;
        }
        err.classList.remove('show');
        const firstName = info.name?.split(' ')[0] || info.email.split('@')[0];
        startApp({
          name:   info.name || firstName,
          email:  info.email,
          role:   'viewer',
          avatar: firstName[0].toUpperCase(),
          picture: info.picture || null,
        });
      },
    }).requestAccessToken();
  });

  function startApp(user) {
    currentUser = user;
    const av = document.getElementById('sb-avatar');
    av.textContent = user.avatar;
    av.className   = 'sidebar-avatar ' + (isAdmin() ? 'avatar-admin' : 'avatar-viewer');
    if (user.picture) { av.style.backgroundImage=`url(${user.picture})`; av.style.backgroundSize='cover'; av.textContent=''; }
    document.getElementById('sb-name').textContent  = user.name;
    document.getElementById('sb-email').textContent = user.email;
    const rb = document.getElementById('sb-role-badge');
    rb.textContent = isAdmin() ? '관리자 (Admin)' : '뷰어 (Viewer)';
    rb.className   = 'sidebar-role-badge ' + (isAdmin() ? 'role-admin' : 'role-viewer');

    document.getElementById('viewer-banner').classList.toggle('show', !isAdmin());
    // 비밀번호 변경 버튼 — 관리자만 표시
    document.getElementById('btn-change-pw').style.display = isAdmin() ? '' : 'none';
    const navReg = document.getElementById('nav-register');
    if (isAdmin()) {
      navReg.classList.remove('viewer-disabled');
      document.getElementById('btn-topbar-register').style.display = '';
      document.getElementById('btn-table-register').style.display  = '';
      document.getElementById('btn-wo-add').style.display          = '';
    } else {
      navReg.classList.add('viewer-disabled');
      document.getElementById('btn-topbar-register').style.display = 'none';
      document.getElementById('btn-table-register').style.display  = 'none';
      document.getElementById('btn-wo-add').style.display          = 'none';
    }

    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').classList.add('visible');
    navigate('dashboard', document.querySelector('.nav-item'));
    renderDashboard();
    renderTable();
  }

  function doLogout() {
    currentUser = null;
    document.getElementById('app').classList.remove('visible');
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('login-email').value = '';
    document.getElementById('login-pw').value    = '';
    document.getElementById('login-error').classList.remove('show');
    document.getElementById('google-error').classList.remove('show');
  }

  function guard() {
    if (!isAdmin()) { showToast('관리자만 사용할 수 있는 기능입니다.', 'warn'); return false; }
    return true;
  }

  // ── 비밀번호 변경 ──.addEventListener('click', () => {
    ['pw-current','pw-new','pw-confirm'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('pw-error').classList.remove('show');
    document.getElementById('pwModal').classList.add('open');
  });
  document.getElementById('pw-modal-close').addEventListener('click', () => document.getElementById('pwModal').classList.remove('open'));
  document.getElementById('pw-cancel-btn').addEventListener('click', () => document.getElementById('pwModal').classList.remove('open'));
  document.getElementById('pw-save-btn').addEventListener('click', changePassword);
  document.getElementById('pw-confirm').addEventListener('keydown', e => { if (e.key === 'Enter') changePassword(); });

  function changePassword() {
    const current = document.getElementById('pw-current').value;
    const next    = document.getElementById('pw-new').value;
    const confirm = document.getElementById('pw-confirm').value;
    const err     = document.getElementById('pw-error');

    if (current !== adminPw) {
      err.textContent = '현재 비밀번호가 올바르지 않습니다.'; err.classList.add('show'); return;
    }
    if (next.length < 6) {
      err.textContent = '새 비밀번호는 6자 이상이어야 합니다.'; err.classList.add('show'); return;
    }
    if (next !== confirm) {
      err.textContent = '새 비밀번호가 일치하지 않습니다.'; err.classList.add('show'); return;
    }
    adminPw = next;
    document.getElementById('pwModal').classList.remove('open');
    showToast('비밀번호가 변경되었습니다.');
  }

  // ── Data ──
  let assets = [
    { id:'IT-2025-001', name:'MacBook Pro 14인치',  category:'IT장비',   maker:'Apple',          model:'MK183KH/A',    serial:'C02X1234ABCD', status:'운용 중',  location:'본사 3층 개발팀', manager:'김민준', date:'2025-03-10', price:2800000,  memo:'개발팀 주력 노트북' },
    { id:'IT-2025-002', name:'Dell 모니터 27인치',  category:'IT장비',   maker:'Dell',           model:'U2722D',       serial:'CN-0D1234',    status:'운용 중',  location:'본사 3층 개발팀', manager:'박서연', date:'2025-02-15', price:650000,   memo:'' },
    { id:'IT-2025-003', name:'HP LaserJet Pro',     category:'사무기기',  maker:'HP',             model:'M404dw',       serial:'PHBG123456',   status:'점검 중',  location:'본사 2층 총무팀', manager:'이수진', date:'2024-11-20', price:450000,   memo:'토너 교체 예정' },
    { id:'IT-2025-004', name:'아이패드 Pro 12.9',   category:'IT장비',   maker:'Apple',          model:'MHNK3KH/A',    serial:'DMPX9876WK',   status:'유휴',     location:'창고',            manager:'',       date:'2024-08-05', price:1500000,  memo:'구형 모델 대체' },
    { id:'EQ-2025-001', name:'CNC 밀링머신 #1',     category:'생산설비', maker:'화천기계',        model:'HI-V500',      serial:'HC2024-001',   status:'운용 중',  location:'공장 A동',        manager:'정대호', date:'2024-01-15', price:85000000, memo:'분기 점검 완료' },
    { id:'EQ-2025-002', name:'지게차 3.5톤',        category:'차량',     maker:'두산인프라코어',  model:'G35E-5',       serial:'DI202300123',  status:'운용 중',  location:'물류창고',        manager:'최성훈', date:'2023-07-20', price:32000000, memo:'' },
    { id:'FN-2025-001', name:'회의용 테이블 12인',  category:'가구',     maker:'퍼시스',         model:'OT-1200',      serial:'',             status:'운용 중',  location:'본사 5층 회의실', manager:'',       date:'2022-04-01', price:1200000,  memo:'' },
    { id:'IT-2025-005', name:'NAS 서버 DS920+',     category:'IT장비',   maker:'Synology',       model:'DS920+',       serial:'SYN2024XYZ',   status:'운용 중',  location:'서버실',          manager:'김민준', date:'2025-01-08', price:980000,   memo:'사내 파일 서버' },
    { id:'IT-2025-006', name:'무선 AP Cisco',       category:'IT장비',   maker:'Cisco',          model:'Catalyst 9120',serial:'FCW2345ABCD',  status:'폐기 예정',location:'창고',            manager:'',       date:'2019-06-12', price:320000,   memo:'노후 장비' },
  ];
  let maintenance = [
    { id:'WO-001', assetId:'IT-2025-003', assetName:'HP LaserJet Pro', type:'정기 점검', date:'2025-03-20', status:'진행 중', manager:'이수진', desc:'토너 잔량 확인 및 교체' },
    { id:'WO-002', assetId:'EQ-2025-001', assetName:'CNC 밀링머신 #1', type:'부품 교체', date:'2025-04-01', status:'예정',    manager:'정대호', desc:'스핀들 베어링 교체' },
    { id:'WO-003', assetId:'EQ-2025-002', assetName:'지게차 3.5톤',    type:'정기 점검', date:'2025-03-25', status:'예정',    manager:'최성훈', desc:'분기 정기 점검' },
  ];
  let activities = [
    { type:'green', text:'<strong>IT-2025-005 NAS DS920+</strong> 자산이 등록되었습니다',        time:'오늘 09:21' },
    { type:'amber', text:'<strong>IT-2025-003 HP LaserJet Pro</strong> 상태가 점검 중으로 변경', time:'오늘 08:55' },
    { type:'blue',  text:'<strong>IT-2025-004 아이패드 Pro</strong> 위치가 창고로 이전',          time:'어제 17:30' },
    { type:'red',   text:'<strong>IT-2025-006 Cisco AP</strong> 폐기 예정으로 분류',              time:'어제 14:10' },
    { type:'green', text:'<strong>EQ-2025-001 CNC 밀링머신</strong> 분기 점검 완료',              time:'3일 전' },
  ];
  let idCounter = 10, currentPage = 1;
  const PAGE_SIZE = 7;
  let editingId = null;

  // ── Nav 이벤트 바인딩 ──
  const pageTitles = { dashboard:'대시보드', assets:'자산 목록', register:'자산 등록', maintenance:'유지보수', reports:'보고서' };

  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page, item));
  });
  document.getElementById('btn-topbar-register').addEventListener('click', () => navigate('register', document.getElementById('nav-register')));
  document.querySelector('.logout-btn').addEventListener('click', doLogout);

  // ── 모달 버튼 ──
  document.getElementById('modalSaveBtn').addEventListener('click', saveModal);
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
  document.getElementById('btn-table-register').addEventListener('click', () => openModal('add'));
  document.getElementById('btn-wo-add').addEventListener('click', openMaintenanceModal);
  document.querySelector('[data-action="save-maintenance"]').addEventListener('click', saveMaintenance);
  document.querySelector('[data-action="close-maintenance"]').addEventListener('click', () => document.getElementById('maintenanceModal').classList.remove('open'));
  document.querySelector('[data-action="export-csv"]').addEventListener('click', exportCSV);
  document.getElementById('btn-reg-submit').addEventListener('click', registerAsset);
  document.getElementById('btn-reg-clear').addEventListener('click', clearRegForm);
  document.getElementById('searchInput').addEventListener('input', renderTable);
  document.getElementById('statusFilter').addEventListener('change', renderTable);
  document.getElementById('categoryFilter').addEventListener('change', renderTable);

  // ── Navigate ──
  function navigate(page, el) {
    if (page === 'register' && !isAdmin()) { showToast('관리자만 접근할 수 있는 페이지입니다.', 'warn'); return; }
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.getElementById('pageTitle').textContent = pageTitles[page] || page;
    if (el && !el.classList.contains('viewer-disabled')) el.classList.add('active');
    if (page === 'dashboard')   renderDashboard();
    if (page === 'assets')      renderTable();
    if (page === 'maintenance') renderMaintenance();
    if (page === 'reports')     renderReports();
  }

  // ── Dashboard ──
  function renderDashboard() {
    animCount('stat-total',  assets.length);
    animCount('stat-active', assets.filter(a => a.status === '운용 중').length);
    animCount('stat-maint',  assets.filter(a => a.status === '점검 중').length);
    animCount('stat-retire', assets.filter(a => a.status === '폐기 예정').length);
    document.getElementById('activity-list').innerHTML = activities.slice(0,5).map(a => `
      <div class="activity-item">
        <div class="activity-dot ${a.type}"></div>
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>`).join('');
    const cats = {}, clr = { IT장비:'#6c63ff', 사무기기:'#3ecf8e', 생산설비:'#f5a623', 차량:'#60a5fa', 가구:'#f87171' };
    assets.forEach(a => cats[a.category] = (cats[a.category] || 0) + 1);
    const mx = Math.max(...Object.values(cats));
    document.getElementById('dist-list').innerHTML = Object.entries(cats).sort((a,b) => b[1]-a[1]).map(([k,v]) => `
      <div class="dist-item"><div class="dist-label">${k}</div>
      <div class="dist-bar-wrap"><div class="dist-bar" style="width:${v/mx*100}%;background:${clr[k]||'#6c63ff'}"></div></div>
      <div class="dist-count">${v}</div></div>`).join('');
  }
  function animCount(id, t) {
    const el = document.getElementById(id); let c = 0;
    const s = setInterval(() => { c = Math.min(c + Math.ceil(t/20), t); el.textContent = c; if (c >= t) clearInterval(s); }, 30);
  }

  // ── Table ──
  function sBadge(s) {
    const m = { '운용 중':'green', '점검 중':'amber', '유휴':'blue', '폐기 예정':'red' };
    return `<span class="badge badge-${m[s]||'gray'}">${s}</span>`;
  }
  function renderTable() {
    const q  = (document.getElementById('searchInput')?.value || '').toLowerCase();
    const st = document.getElementById('statusFilter')?.value   || '';
    const ct = document.getElementById('categoryFilter')?.value || '';
    const fil = assets.filter(a =>
      (!q  || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q)) &&
      (!st || a.status   === st) && (!ct || a.category === ct));
    const total = fil.length, pages = Math.ceil(total / PAGE_SIZE) || 1;
    currentPage = Math.min(currentPage, pages);
    const slice = fil.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
    document.getElementById('pageInfo').textContent = `총 ${total}개 자산`;
    document.getElementById('assetTableBody').innerHTML = slice.map(a => `
      <tr data-id="${a.id}" class="asset-row">
        <td class="asset-id">${a.id}</td>
        <td><div class="asset-name">${a.name}<small>${a.maker} ${a.model}</small></div></td>
        <td>${a.category}</td><td>${sBadge(a.status)}</td>
        <td>${a.location||'-'}</td><td>${a.manager||'-'}</td>
        <td style="font-family:var(--mono);font-size:12px;">${a.date}</td>
        <td><button class="action-btn edit-btn" data-id="${a.id}" ${!isAdmin()?'disabled title="관리자만 수정 가능"':''}>수정</button></td>
      </tr>`).join('') || `<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--text3)">자산이 없습니다</td></tr>`;

    document.querySelectorAll('.asset-row').forEach(row => {
      row.addEventListener('click', e => { if (!e.target.classList.contains('edit-btn')) openDetail(row.dataset.id); });
    });
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); if (isAdmin()) openModal('edit', btn.dataset.id); });
    });

    const pb = document.getElementById('pageBtns'); pb.innerHTML = '';
    for (let i = 1; i <= pages; i++) {
      const b = document.createElement('button');
      b.className = 'page-btn' + (i === currentPage ? ' active' : '');
      b.textContent = i;
      b.addEventListener('click', () => { currentPage = i; renderTable(); });
      pb.appendChild(b);
    }
  }

  // ── Detail ──
  function openDetail(id) {
    const a = assets.find(x => x.id === id); if (!a) return;
    document.getElementById('detailBody').innerHTML = `
      <div class="detail-row"><div class="detail-key">자산번호</div><div class="detail-val" style="font-family:var(--mono)">${a.id}</div></div>
      <div class="detail-row"><div class="detail-key">자산명</div><div class="detail-val" style="font-weight:500">${a.name}</div></div>
      <div class="detail-row"><div class="detail-key">카테고리</div><div class="detail-val">${a.category}</div></div>
      <div class="detail-row"><div class="detail-key">제조사 / 모델</div><div class="detail-val">${a.maker} ${a.model}</div></div>
      <div class="detail-row"><div class="detail-key">시리얼번호</div><div class="detail-val" style="font-family:var(--mono)">${a.serial||'-'}</div></div>
      <div class="detail-row"><div class="detail-key">상태</div><div class="detail-val">${sBadge(a.status)}</div></div>
      <div class="detail-row"><div class="detail-key">위치</div><div class="detail-val">${a.location||'-'}</div></div>
      <div class="detail-row"><div class="detail-key">담당자</div><div class="detail-val">${a.manager||'-'}</div></div>
      <div class="detail-row"><div class="detail-key">취득일</div><div class="detail-val">${a.date}</div></div>
      <div class="detail-row"><div class="detail-key">취득 금액</div><div class="detail-val">${a.price ? Number(a.price).toLocaleString()+'원' : '-'}</div></div>
      <div class="detail-row"><div class="detail-key">메모</div><div class="detail-val">${a.memo||'-'}</div></div>`;
    const footer = document.getElementById('detailFooter');
    footer.innerHTML = isAdmin()
      ? `<button class="btn btn-danger" id="btn-del">삭제</button>
         <button class="btn btn-ghost" id="btn-det-close">닫기</button>
         <button class="btn btn-primary" id="btn-det-edit">수정</button>`
      : `<button class="btn btn-ghost" id="btn-det-close">닫기</button>`;
    document.getElementById('btn-det-close').addEventListener('click', closeDetail);
    if (isAdmin()) {
      document.getElementById('btn-del').addEventListener('click', () => deleteAsset(id));
      document.getElementById('btn-det-edit').addEventListener('click', () => { closeDetail(); openModal('edit', id); });
    }
    document.getElementById('detailModal').classList.add('open');
  }
  function closeDetail() { document.getElementById('detailModal').classList.remove('open'); }

  // ── Modal ──
  function openModal(mode, id) {
    if (!guard()) return;
    editingId = mode === 'edit' ? id : null;
    document.getElementById('modalTitle').textContent    = mode === 'edit' ? '자산 수정' : '자산 등록';
    document.getElementById('modalSaveBtn').textContent  = mode === 'edit' ? '저장' : '등록';
    const flds = ['m-name','m-maker','m-model','m-serial','m-location','m-manager','m-memo'];
    if (mode === 'edit' && id) {
      const a = assets.find(x => x.id === id);
      if (a) { document.getElementById('m-name').value=a.name; document.getElementById('m-category').value=a.category; document.getElementById('m-maker').value=a.maker; document.getElementById('m-model').value=a.model; document.getElementById('m-serial').value=a.serial; document.getElementById('m-status').value=a.status; document.getElementById('m-location').value=a.location; document.getElementById('m-manager').value=a.manager; document.getElementById('m-date').value=a.date; document.getElementById('m-price').value=a.price; document.getElementById('m-memo').value=a.memo; }
    } else {
      flds.forEach(f => document.getElementById(f).value = '');
      document.getElementById('m-category').value=''; document.getElementById('m-status').value='운용 중'; document.getElementById('m-date').value=''; document.getElementById('m-price').value='';
    }
    document.getElementById('assetModal').classList.add('open');
  }
  function closeModal() { document.getElementById('assetModal').classList.remove('open'); }

  function saveModal() {
    if (!guard()) return;
    const name = document.getElementById('m-name').value.trim();
    const cat  = document.getElementById('m-category').value;
    if (!name || !cat) { alert('자산명과 카테고리는 필수입니다.'); return; }
    const data = { name, category:cat, maker:document.getElementById('m-maker').value, model:document.getElementById('m-model').value, serial:document.getElementById('m-serial').value, status:document.getElementById('m-status').value, location:document.getElementById('m-location').value, manager:document.getElementById('m-manager').value, date:document.getElementById('m-date').value, price:document.getElementById('m-price').value, memo:document.getElementById('m-memo').value };
    if (editingId) {
      const idx = assets.findIndex(a => a.id === editingId);
      if (idx !== -1) assets[idx] = { ...assets[idx], ...data };
      activities.unshift({ type:'blue', text:`<strong>${editingId} ${name}</strong> 정보가 수정되었습니다`, time:'방금' });
      showToast('자산이 수정되었습니다.');
    } else {
      const pfx = cat==='IT장비'?'IT':cat==='생산설비'?'EQ':cat==='차량'?'VH':'EQ';
      const nid = `${pfx}-${new Date().getFullYear()}-${String(idCounter++).padStart(3,'0')}`;
      assets.push({ id:nid, ...data });
      activities.unshift({ type:'green', text:`<strong>${nid} ${name}</strong> 자산이 등록되었습니다`, time:'방금' });
      showToast(`${name} 자산이 등록되었습니다.`);
    }
    closeModal(); renderTable();
  }

  function deleteAsset(id) {
    if (!guard()) return;
    if (!confirm('이 자산을 삭제하시겠습니까?')) return;
    const a = assets.find(x => x.id === id);
    assets = assets.filter(x => x.id !== id);
    closeDetail(); renderTable();
    showToast(`${a?.name} 자산이 삭제되었습니다.`);
  }

  // ── Register ──
  function registerAsset() {
    if (!guard()) return;
    const name = document.getElementById('reg-name').value.trim();
    const cat  = document.getElementById('reg-category').value;
    if (!name || !cat) { alert('자산명과 카테고리는 필수입니다.'); return; }
    const data = { name, category:cat, maker:document.getElementById('reg-maker').value, model:document.getElementById('reg-model').value, serial:document.getElementById('reg-serial').value, status:document.getElementById('reg-status').value, location:document.getElementById('reg-location').value, manager:document.getElementById('reg-manager').value, date:document.getElementById('reg-date').value, price:document.getElementById('reg-price').value, memo:document.getElementById('reg-memo').value };
    const pfx = cat==='IT장비'?'IT':cat==='생산설비'?'EQ':cat==='차량'?'VH':'EQ';
    const nid = `${pfx}-${new Date().getFullYear()}-${String(idCounter++).padStart(3,'0')}`;
    assets.push({ id:nid, ...data });
    activities.unshift({ type:'green', text:`<strong>${nid} ${name}</strong> 자산이 등록되었습니다`, time:'방금' });
    showToast(`${name} 자산이 등록되었습니다. (${nid})`);
    clearRegForm();
    navigate('assets', document.querySelector('.nav-item[data-page="assets"]'));
  }
  function clearRegForm() {
    ['reg-name','reg-maker','reg-model','reg-serial','reg-location','reg-manager','reg-memo'].forEach(f => document.getElementById(f).value = '');
    document.getElementById('reg-category').value=''; document.getElementById('reg-status').value='운용 중'; document.getElementById('reg-date').value=''; document.getElementById('reg-price').value='';
  }

  // ── Maintenance ──
  function renderMaintenance() {
    document.getElementById('maintenanceBody').innerHTML = maintenance.map(m => `
      <tr><td class="asset-id">${m.id}</td><td>${m.assetName}</td><td>${m.type}</td>
      <td style="font-family:var(--mono);font-size:12px;">${m.date}</td>
      <td>${m.status==='진행 중'?'<span class="badge badge-amber">진행 중</span>':'<span class="badge badge-blue">예정</span>'}</td>
      <td>${m.manager}</td></tr>`).join('') || `<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--text3)">등록된 작업이 없습니다</td></tr>`;
  }
  function openMaintenanceModal() {
    if (!guard()) return;
    document.getElementById('mt-asset').innerHTML = assets.map(a => `<option value="${a.id}">${a.id} - ${a.name}</option>`).join('');
    ['mt-date','mt-manager','mt-desc'].forEach(f => document.getElementById(f).value = '');
    document.getElementById('maintenanceModal').classList.add('open');
  }
  function saveMaintenance() {
    if (!guard()) return;
    const sel = document.getElementById('mt-asset');
    const assetName = sel.options[sel.selectedIndex].text.split(' - ')[1];
    maintenance.push({ id:`WO-${String(maintenance.length+1).padStart(3,'0')}`, assetId:sel.value, assetName, type:document.getElementById('mt-type').value, date:document.getElementById('mt-date').value, status:'예정', manager:document.getElementById('mt-manager').value, desc:document.getElementById('mt-desc').value });
    document.getElementById('maintenanceModal').classList.remove('open');
    renderMaintenance(); showToast('유지보수 작업이 등록되었습니다.');
  }

  // ── Reports ──
  function renderReports() {
    const sm = {}; assets.forEach(a => sm[a.status] = (sm[a.status]||0)+1);
    const tv = assets.reduce((s,a) => s + (Number(a.price)||0), 0);
    document.getElementById('report-summary').innerHTML = `
      <div class="detail-row"><div class="detail-key">전체 자산 수</div><div class="detail-val" style="font-family:var(--mono);font-weight:600">${assets.length}개</div></div>
      ${Object.entries(sm).map(([k,v])=>`<div class="detail-row"><div class="detail-key">${k}</div><div class="detail-val">${v}개</div></div>`).join('')}
      <div class="detail-row"><div class="detail-key">자산 총 취득가</div><div class="detail-val" style="font-family:var(--mono);font-weight:600">${tv.toLocaleString()}원</div></div>
      <div class="detail-row"><div class="detail-key">유지보수 작업</div><div class="detail-val">${maintenance.length}건</div></div>`;
    const cats = {}, clr = { IT장비:'#6c63ff', 사무기기:'#3ecf8e', 생산설비:'#f5a623', 차량:'#60a5fa', 가구:'#f87171' };
    assets.forEach(a => cats[a.category] = (cats[a.category]||0)+1);
    const mx = Math.max(...Object.values(cats));
    document.getElementById('report-category').innerHTML = Object.entries(cats).sort((a,b)=>b[1]-a[1]).map(([k,v]) => `
      <div class="dist-item"><div class="dist-label">${k}</div>
      <div class="dist-bar-wrap"><div class="dist-bar" style="width:${v/mx*100}%;background:${clr[k]||'#6c63ff'}"></div></div>
      <div class="dist-count">${v}</div></div>`).join('');
  }

  function exportCSV() {
    const h = ['자산번호','자산명','카테고리','제조사','모델','시리얼번호','상태','위치','담당자','취득일','취득금액','메모'];
    const r = assets.map(a => [a.id,a.name,a.category,a.maker,a.model,a.serial,a.status,a.location,a.manager,a.date,a.price,a.memo].map(v=>`"${v||''}"`).join(','));
    const csv = '\uFEFF' + [h.join(','),...r].join('\n');
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a'); el.href=url; el.download='자산목록.csv'; el.click();
    showToast('CSV 파일이 다운로드되었습니다.');
  }

  // ── Toast ──
  function showToast(msg, type='success') {
    const t = document.getElementById('toast'), ic = document.getElementById('toast-icon');
    document.getElementById('toastMsg').textContent = msg;
    ic.className = 'toast-icon ' + (type==='warn' ? 'toast-warn' : 'toast-success');
    ic.textContent = type==='warn' ? '!' : '✓';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
  }

}); // end DOMContentLoaded
