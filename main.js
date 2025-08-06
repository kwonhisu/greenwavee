// Firebase Firestore 사용
let firebaseAvailable = false;

// Firebase 연결 확인
async function testFirebaseConnection() {
  try {
    // Firebase가 로드될 때까지 대기
    let attempts = 0;
    const maxAttempts = 20; // 더 오래 대기
    
    while (attempts < maxAttempts) {
      if (window.firebaseAuth && window.firebaseDb && typeof window.firebaseDb.collection === 'function') {
        firebaseAvailable = true;
        console.log('Firebase 연결 성공');
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 300));
      attempts++;
      console.log(`Firebase 연결 시도 ${attempts}/${maxAttempts}`);
    }
    
    firebaseAvailable = false;
    console.log('Firebase 연결 실패 - localStorage 사용');
  } catch (error) {
    firebaseAvailable = false;
    console.log('Firebase 연결 오류:', error);
  }
}

// 페이지 로드 시 Firebase 연결 테스트
setTimeout(testFirebaseConnection, 1000); // 1초 후 시작

// ... greeeen/fb의 <script> 태그 안에 있는 모든 JS 코드 복사 ...
// (환경게임, 모달, 섹션 전환, 뉴스 데이터 등 전체) 

function showSection(sectionId) {
    const sections = ['home', 'games', 'news', 'about'];
    sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === sectionId) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        }
    });
}

// 페이지 로드 시 홈만 보이게
window.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    renderNewsList();
    
    // 로그인 폼 이벤트 리스너 추가
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 회원가입 폼 이벤트 리스너 추가
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // 터치 이벤트 추가
    addTouchSupport();
});

// 모달 열기/닫기
function openQuizModal() {
    document.getElementById('quizModal').classList.remove('hidden');
    startQuiz();
}
function closeQuizModal() {
    document.getElementById('quizModal').classList.add('hidden');
}
function openRecycleModal() {
    document.getElementById('recycleModal').classList.remove('hidden');
    showDragGameStartScreen();
}
function closeRecycleModal() {
    document.getElementById('recycleModal').classList.add('hidden');
    showDragGameStartScreen();
}
function showDragGameStartScreen() {
    document.getElementById('dragGameStartScreen').style.display = '';
    document.getElementById('dragGameMain').style.display = 'none';
    document.getElementById('dragGameResult').innerHTML = '';
}

// 에코 퀴즈 데이터
const quizQuestions = [
    {
        question: '지구 온난화의 주요 원인은?',
        options: ['이산화탄소 증가', '오존층 파괴', '태양 흑점', '지진'],
        answer: 0
    },
    {
        question: '플라스틱 쓰레기 문제의 가장 큰 원인은?',
        options: ['재활용 부족', '종이 사용 증가', '유리병 사용', '나무 심기'],
        answer: 0
    },
    {
        question: '분리수거 시 올바른 방법은?',
        options: ['이물질 제거 후 배출', '모두 한 통에 버리기', '종이와 플라스틱 섞기', '음식물과 같이 버리기'],
        answer: 0
    },
    {
        question: '다음 중 재생에너지가 아닌 것은?',
        options: ['태양광', '풍력', '석탄', '지열'],
        answer: 2
    },
    {
        question: '일회용품 사용을 줄이는 가장 좋은 방법은?',
        options: ['개인 텀블러 사용', '플라스틱 빨대 사용', '종이컵만 사용', '모두 일회용 사용'],
        answer: 0
    },
    {
        question: '탄소중립을 실천하는 방법은?',
        options: ['대중교통 이용', '에어컨 오래 틀기', '일회용품 사용', '자동차 혼자 타기'],
        answer: 0
    },
    {
        question: '음식물 쓰레기를 줄이는 방법은?',
        options: ['필요한 만큼만 구매', '많이 사서 버리기', '유통기한 무시', '남은 음식 버리기'],
        answer: 0
    },
    {
        question: '환경 보호를 위한 올바른 실천은?',
        options: ['분리배출', '길에 쓰레기 버리기', '낭비하기', '에너지 과소비'],
        answer: 0
    }
];
let quizIndex = 0;
let quizScore = 0;

function startQuiz() {
    quizIndex = 0;
    quizScore = 0;
    showQuizQuestion();
}

function showQuizQuestion() {
    const area = document.getElementById('quizArea');
    if (quizIndex >= quizQuestions.length) {
        area.innerHTML = `<div class='text-center'><h3 class='text-xl font-bold mb-2'>퀴즈 종료!</h3><p>점수: <span class='text-emerald-700 font-bold'>${quizScore} / ${quizQuestions.length}</span></p><button class='minimal-btn mt-4' onclick='startQuiz()'>다시하기</button></div>`;
        return;
    }
    const q = quizQuestions[quizIndex];
    let html = `<div class='flex items-center mb-2'><span class='text-xs font-bold text-emerald-700 mr-2'>${quizIndex+1}/${quizQuestions.length}</span><span class='mb-4 font-semibold text-lg'>${q.question}</span></div>`;
    html += '<div class="flex flex-col gap-3 mb-4">';
    q.options.forEach((opt, i) => {
        html += `<button class='minimal-btn' style='background:#e0f2f1;color:#064e3b;' onclick='checkQuizAnswer(${i})'>${opt}</button>`;
    });
    html += '</div>';
    html += `<div id='quizFeedback' class='text-md mt-2 min-h-[24px]'></div>`;
    area.innerHTML = html;
}

function checkQuizAnswer(selected) {
    const q = quizQuestions[quizIndex];
    const feedback = document.getElementById('quizFeedback');
    if (selected === q.answer) {
        quizScore++;
        feedback.innerHTML = '<span class="text-emerald-700 font-bold">정답입니다!</span>';
    } else {
        feedback.innerHTML = `<span class="text-rose-600 font-bold">오답입니다.</span> 정답: ${q.options[q.answer]}`;
    }
    setTimeout(() => {
        quizIndex++;
        if (quizIndex >= quizQuestions.length) {
            saveGameRecord('quiz', quizScore);
            showGameResults('quiz');
        } else {
            showQuizQuestion();
        }
    }, 900);
}

// 2048 환경 쓰레기 게임
const game2048Tiles = [
    { value: 2, label: '플라스틱컵', emoji: '🥤' },
    { value: 4, label: '플라스틱병', emoji: '🥛' },
    { value: 8, label: '플라스틱통', emoji: '🧴' },
    { value: 16, label: '플라스틱박스', emoji: '📦' },
    { value: 32, label: '플라스틱가방', emoji: '🛍️' },
    { value: 64, label: '플라스틱의자', emoji: '🪑' },
    { value: 128, label: '플라스틱쓰레기산', emoji: '🏔️' },
    { value: 256, label: '플라스틱섬', emoji: '🏝️' },
    { value: 512, label: '플라스틱행성', emoji: '🪐' },
    { value: 1024, label: '플라스틱별', emoji: '⭐' },
    { value: 2048, label: '플라스틱우주', emoji: '🌌' }
];
let game2048Grid = [];
let game2048Score = 0;
let game2048Over = false;

function openGame2048Modal() {
    document.getElementById('game2048Modal').classList.remove('hidden');
    startGame2048();
}
function closeGame2048Modal() {
    document.getElementById('game2048Modal').classList.add('hidden');
}
function startGame2048() {
    game2048Grid = Array(4).fill(0).map(() => Array(4).fill(0));
    game2048Score = 0;
    game2048Over = false;
    document.getElementById('game2048Result').innerHTML = '';
    addRandom2048Tile();
    addRandom2048Tile();
    renderGame2048();
}
function addRandom2048Tile() {
    const empty = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (!game2048Grid[r][c]) empty.push([r, c]);
    if (empty.length === 0) return;
    const [r, c] = empty[Math.floor(Math.random() * empty.length)];
    game2048Grid[r][c] = 2;
}
function renderGame2048() {
    const grid = document.getElementById('game2048Grid');
    grid.innerHTML = '';
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const v = game2048Grid[r][c];
            const div = document.createElement('div');
            let tile = game2048Tiles.find(t => t.value === v);
            div.className = 'game2048-tile' + (v ? ' game2048-tile-' + v : '');
            div.innerHTML = v && tile ? `${tile.emoji}` : '';
            grid.appendChild(div);
        }
    }
    document.getElementById('game2048Score').textContent = game2048Score;
}
function moveGame2048(dir) {
    if (game2048Over) return;
    let moved = false;
    let merged = Array(4).fill(0).map(() => Array(4).fill(false));
    function slide(row) {
        let arr = row.filter(x => x);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                game2048Score += arr[i];
                arr[i + 1] = 0;
            }
        }
        arr = arr.filter(x => x);
        while (arr.length < 4) arr.push(0);
        return arr;
    }
    if (dir === 'left') {
        for (let r = 0; r < 4; r++) {
            const before = [...game2048Grid[r]];
            game2048Grid[r] = slide(game2048Grid[r]);
            if (game2048Grid[r].join() !== before.join()) moved = true;
        }
    } else if (dir === 'right') {
        for (let r = 0; r < 4; r++) {
            const before = [...game2048Grid[r]];
            game2048Grid[r] = slide(game2048Grid[r].slice().reverse()).reverse();
            if (game2048Grid[r].join() !== before.join()) moved = true;
        }
    } else if (dir === 'up') {
        for (let c = 0; c < 4; c++) {
            let col = [game2048Grid[0][c], game2048Grid[1][c], game2048Grid[2][c], game2048Grid[3][c]];
            const before = [...col];
            col = slide(col);
            for (let r = 0; r < 4; r++) game2048Grid[r][c] = col[r];
            if (col.join() !== before.join()) moved = true;
        }
    } else if (dir === 'down') {
        for (let c = 0; c < 4; c++) {
            let col = [game2048Grid[0][c], game2048Grid[1][c], game2048Grid[2][c], game2048Grid[3][c]];
            const before = [...col];
            col = slide(col.slice().reverse()).reverse();
            for (let r = 0; r < 4; r++) game2048Grid[r][c] = col[r];
            if (col.join() !== before.join()) moved = true;
        }
    }
    if (moved) {
        addRandom2048Tile();
        renderGame2048();
        if (isGame2048Over()) {
            game2048Over = true;
            document.getElementById('game2048Result').innerHTML = `<div class='text-xl font-bold mb-2'>게임 종료!</div><div>점수: <span class='text-emerald-700 font-bold'>${game2048Score}</span></div>`;
        } else if (has2048Tile()) {
            document.getElementById('game2048Result').innerHTML = `<div class='text-xl font-bold mb-2'>축하합니다! 2048 달성!</div>`;
        } else {
            document.getElementById('game2048Result').innerHTML = '';
        }
    }
}
function isGame2048Over() {
    // 빈칸이 있으면 아직 게임 오버 아님
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (game2048Grid[r][c] === 0) return false;
    }
    // 인접한 칸에 같은 값이 있으면 아직 게임 오버 아님
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (r < 3 && game2048Grid[r][c] === game2048Grid[r+1][c]) return false;
        if (c < 3 && game2048Grid[r][c] === game2048Grid[r][c+1]) return false;
    }
    saveGameRecord('game2048', game2048Score);
    showGameResults('game2048');
    return true;
}
function has2048Tile() {
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (game2048Grid[r][c] === 2048) return true;
    }
    return false;
}
// 방향키 이벤트
window.addEventListener('keydown', e => {
    if (!document.getElementById('game2048Modal').classList.contains('hidden')) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
            moveGame2048(
                e.key === 'ArrowLeft' ? 'left' :
                e.key === 'ArrowRight' ? 'right' :
                e.key === 'ArrowUp' ? 'up' : 'down'
            );
        }
    }
});

// 달리기 환경 게임
let runnerGameInterval = null;
let runnerGameCharX = 130; // 캐릭터 x좌표(0~284)
let runnerGameScore = 0;
let runnerGameLives = 3;
let runnerGameActive = false;
let runnerGameObjects = [];
const runnerGameAreaW = 320, runnerGameAreaH = 320;
const runnerCharEmoji = '👶';
const runnerTrashEmojis = ['🥤','🗑️','🧴','🛍️','🍾'];
const runnerCharW = 36, runnerCharH = 36;
const runnerObjW = 32, runnerObjH = 32;
const runnerMoveSpeed = 7;

function openRunnerGameModal() {
    document.getElementById('runnerGameModal').classList.remove('hidden');
    startRunnerGame();
}
function closeRunnerGameModal() {
    document.getElementById('runnerGameModal').classList.add('hidden');
    stopRunnerGame();
}
function startRunnerGame() {
    runnerGameCharX = 130;
    runnerGameScore = 0;
    runnerGameLives = 3;
    runnerGameActive = true;
    runnerGameObjects = [];
    document.getElementById('runnerGameResult').innerHTML = '';
    updateRunnerGameUI();
    if (runnerGameInterval) clearInterval(runnerGameInterval);
    runnerGameInterval = setInterval(runnerGameTick, 20);
}
function stopRunnerGame() {
    runnerGameActive = false;
    if (runnerGameInterval) clearInterval(runnerGameInterval);
    saveGameRecord('runner', runnerGameScore);
    showGameResults('runner');
}
function updateRunnerGameUI() {
    document.getElementById('runnerGameScore').textContent = runnerGameScore;
    let hearts = '';
    for (let i = 0; i < 3; i++) hearts += i < runnerGameLives ? '♥' : '💔';
    document.getElementById('runnerGameLives').textContent = hearts;
    // 캐릭터
    const area = document.getElementById('runnerGameArea');
    area.innerHTML = '';
    const char = document.createElement('div');
    char.className = 'runner-char';
    char.style.position = 'absolute';
    char.style.left = runnerGameCharX + 'px';
    char.style.bottom = '0px';
    char.style.width = runnerCharW + 'px';
    char.style.height = runnerCharH + 'px';
    char.style.fontSize = '2rem';
    char.innerHTML = runnerCharEmoji;
    area.appendChild(char);
    // 오브젝트(쓰레기)
    for (const obj of runnerGameObjects) {
        const el = document.createElement('div');
        el.className = 'runner-trash runner-obj';
        el.style.position = 'absolute';
        el.style.left = obj.x + 'px';
        el.style.bottom = obj.y + 'px';
        el.style.width = runnerObjW + 'px';
        el.style.height = runnerObjH + 'px';
        el.style.fontSize = '1.7rem';
        el.innerHTML = obj.emoji;
        area.appendChild(el);
    }
}
function runnerGameTick() {
    if (!runnerGameActive) return;
    // 오브젝트(쓰레기) 아래로 이동
    for (const obj of runnerGameObjects) obj.y -= 4.2;
    // 충돌 체크
    for (let i = runnerGameObjects.length - 1; i >= 0; i--) {
        const obj = runnerGameObjects[i];
        // 캐릭터와 충돌
        if (Math.abs(obj.x - runnerGameCharX) < 28 && obj.y < runnerCharH) {
            runnerGameLives--;
            runnerGameObjects.splice(i, 1);
        } else if (obj.y < -runnerObjH) {
            runnerGameScore++;
            runnerGameObjects.splice(i, 1);
        }
    }
    // 새 오브젝트 생성(위에서 등장)
    if (Math.random() < 0.045) {
        runnerGameObjects.push({
            x: Math.floor(Math.random() * (runnerGameAreaW - runnerObjW)),
            y: runnerGameAreaH - runnerObjH,
            emoji: runnerTrashEmojis[Math.floor(Math.random() * runnerTrashEmojis.length)]
        });
    }
    updateRunnerGameUI();
    if (runnerGameLives <= 0) {
        runnerGameActive = false;
        document.getElementById('runnerGameResult').innerHTML = `<div class='text-xl font-bold mb-2'>게임 종료!</div><div>점수: <span class='text-emerald-700 font-bold'>${runnerGameScore}</span></div>`;
        clearInterval(runnerGameInterval);
    }
}
// 키보드 이벤트(좌우 이동)
window.addEventListener('keydown', e => {
    if (!document.getElementById('runnerGameModal').classList.contains('hidden')) {
        if (e.key === 'ArrowLeft') {
            runnerGameCharX -= runnerMoveSpeed;
            if (runnerGameCharX < 0) runnerGameCharX = 0;
            updateRunnerGameUI();
        } else if (e.key === 'ArrowRight') {
            runnerGameCharX += runnerMoveSpeed;
            if (runnerGameCharX > runnerGameAreaW - runnerCharW) runnerGameCharX = runnerGameAreaW - runnerCharW;
            updateRunnerGameUI();
        }
    }
});
// 모바일 가상 버튼 함수
function runnerMobileLeft() {
    runnerGameCharX -= runnerMoveSpeed;
    if (runnerGameCharX < 0) runnerGameCharX = 0;
    updateRunnerGameUI();
}
function runnerMobileRight() {
    runnerGameCharX += runnerMoveSpeed;
    if (runnerGameCharX > runnerGameAreaW - runnerCharW) runnerGameCharX = runnerGameAreaW - runnerCharW;
    updateRunnerGameUI();
}
function runnerMobileJump() { /* 점프 없음, 무시 */ }

function game2048Mobile(dir) {
    moveGame2048(dir);
}

const newsData = [
  // 태평양 외딴섬까지 뒤덮은 플라스틱… “인류 생존 위협한다”
  {
    id: 'plastic-ocean',
    emoji: '🌊',
    title: '태평양 외딴섬까지 뒤덮은 플라스틱… “인류 생존 위협한다"',
    summary: '태평양 외딴 섬 해변이 플라스틱 쓰레기로 몸살을 앓고 있습니다. 밀려온 폐기물들은 전 세계적으로 심각해진 해양 오염 실태를 여실히 보여줍니다.',
    image: 'https://cdn.newspenguin.com/news/photo/202503/18948_55001_4830.jpg',
    date: '2024-06-12',
    content: `🌊 태평양 외딴섬까지 뒤덮은 플라스틱… “인류 생존 위협한다"

태평양의 외딴 섬 해변이 플라스틱 쓰레기로 몸살을 앓고 있다. 밀려온 폐기물들은 전 세계적으로 심각해진 해양 오염 실태를 여실히 보여준다.

최근 한 연구에 따르면 2019년 기준 전 세계 해수면에는 무려 171조 개 이상의 플라스틱 조각이 떠다니고 있는 것으로 조사됐다. 전문가들은 2040년까지 이 수치가 지금의 2.6배로 증가할 수 있다고 경고했다. 호주 해양오염 전문가 폴 하비는 "거의 상상조차 하기 힘든 수치"라고 평가했다.

📈 플라스틱 생산은 늘고, 관리 시스템은 뒷걸음
플라스틱 문제의 핵심은 생산 폭증과 관리 부재다.
1950년 150만 톤에 불과하던 플라스틱 생산량은 2023년 기준 4억 1천만 톤으로 폭증했다. 이 중 40% 이상이 1회용 포장재로 사용되며, **재활용률은 고작 14%**에 불과하다.

재활용 인프라가 부족한 국가에선 플라스틱이 제대로 처리되지 못한 채 강과 해안으로 흘러든다. 해양 플라스틱의 80%는 육상에서 유출되며, 나머지는 어망과 선박 등 해상 활동에서 비롯된다.

🐢 바닷새부터 인간까지… 생존을 위협하는 오염
플라스틱은 해양 생태계에 광범위한 피해를 준다.
바닷새, 거북, 해양 포유류 등이 플라스틱을 먹이로 착각해 섭취하는 일이 빈번하다. 실제로 전 세계 바닷새의 90% 이상이 위 속에 플라스틱을 가지고 있으며, 2050년에는 거의 모든 바닷새가 플라스틱을 먹게 될 것이라는 분석도 있다.

더 큰 문제는 미세플라스틱이다.
플라스틱이 잘게 쪼개져 만들어진 이 입자는 혈류를 타고 돌거나 장기를 통과할 수 있으며, 세포에 침투해 염증을 유발하고 기능을 교란할 가능성도 있다.
2022년에는 인간의 혈액에서도 미세플라스틱이 검출되며 학계에 충격을 안겼다. 한 연구에선 우리가 매주 신용카드 한 장 분량의 미세플라스틱을 섭취하고 있다는 사실도 밝혀졌다.

🛠 세계는 어떻게 대응하고 있나?
전 세계는 플라스틱 문제 해결을 위해 서서히 움직이고 있다.

2022년 유엔환경총회는 2024년까지 '플라스틱 오염 종식 협약'을 마련하기로 결의했고, 현재 협상이 진행 중이다.

전 세계 127개국이 비닐봉투 사용을 규제하고 있으며, 일부 국가는 일회용 플라스틱을 전면 금지하고 있다.

기업들도 친환경 포장재 개발과 재사용 시스템 도입 등 다양한 대안을 모색하고 있다.
해조류 기반 생분해 플라스틱, 버섯 균사체 포장재 등 혁신적인 친환경 소재에 대한 연구도 활발하다.
소비자들 또한 다회용기 사용, 불필요한 플라스틱 소비 줄이기 등 실천에 나서고 있다.

🚫 "수거만으론 안 된다… 생산 자체 줄여야"
비영리단체 '오션클린업' 등은 해양에 떠다니는 플라스틱을 수거하는 프로젝트를 진행하고 있다. 하지만 전문가들은 "정화 작업만으로는 부족하다"고 입을 모은다. 플라스틱 생산을 줄이고, 폐기물 관리 시스템을 근본적으로 개선하는 것이 해답이라는 지적이다.

⏰ 지금은 선택이 아닌 '생존'의 문제
해양 플라스틱 오염은 더 이상 단순한 환경 문제가 아닙니다.
우리 건강과 미래, 그리고 지구 생태계 전체를 위협하는 진짜 현실입니다.

지금 이 순간에도 바다는 조용히 SOS를 보내고 있습니다.
정부, 기업, 시민—모두의 작은 선택이 모여 바다를 다시 숨 쉬게 만들 수 있습니다.

🌱 지금, 우리가 바꿔야 할 때입니다.
지구를 위한 행동, 지금 바로 시작해보세요.



📰 원문 기사: https://www.newspenguin.com/news/
`,
  },
  // 탄소 배출, 얼마나 심각한가… 나사가 영상으로 공개했다
  {
    id: 'nasa-carbon',
    emoji: '🔥',
    title: '탄소 배출, 얼마나 심각한가… 나사가 영상으로 공개했다',
    summary: 'NASA가 지구의 탄소 배출과 흡수 현황을 시각화한 영상을 공개하며, 화석연료에 의한 기후 위기의 심각성을 경고했습니다.',
    image: 'https://cdn.newspenguin.com/news/photo/202306/14378_44974_3326.jpg',
    date: '2024-06-13',
    content: `🔥 탄소 배출, 얼마나 심각한가… 나사가 영상으로 공개했다

미국항공우주국(NASA)이 지구의 탄소 배출과 흡수 현황을 시각화한 영상을 공개하며, 화석연료에 의한 기후 위기의 심각성을 경고했다.

🌍 눈에 보이는 '탄소 흐름'… 지구가 들썩인다
NASA 산하 **과학시각화스튜디오(Scientific Visualization Studio)**는
2021년 동안 전 세계에서 탄소가 어디서, 어떻게 방출되고 흡수됐는지를 보여주는 시각 자료를 6월 16일(현지시간) 발표했다.

영상은 탄소 배출의 출처와 흡수 지점을 색상과 점으로 구분해 보여준다.

주황색: 화석연료 연소

빨간색: 산불 등 생태계 파괴

녹색/파란색: 육지/바다에서 배출

녹색점/파란점: 육지/바다에서 흡수

이러한 시각화는 단순한 정보 전달을 넘어, 기후 변화의 실제 진행 상황을 '눈으로 볼 수 있게' 만든다는 점에서 의미가 크다.

📈 "생태계도 탄소를 배출한다?”
영상에 따르면, 육지와 해양 생태계는 탄소를 흡수하는 역할을 하지만, 일정 시간대에는 오히려 배출원으로 작용하기도 한다.

예: 여름철엔 광합성 → 이산화탄소 흡수,
겨울철엔 일조량 부족 → 호흡을 통해 탄소 배출

이처럼 흡수원과 배출원이 동시에 존재하는 자연의 복잡한 탄소 순환을 모델링한 것은 이번 영상의 또 다른 특징이다.

🌎 지역별 탄소 배출 현황
▪ 북미
미국 동북부 도시권(워싱턴DC~보스턴) 중심으로
화석연료에 의한 탄소 배출이 집중

아마존 우림: 낮에는 흡수, 밤에는 배출
→ 생태계 순환의 민감성을 보여줌

▪ 유럽·중동·아프리카
유럽·사우디아라비아: 높은 화석연료 배출

중앙아프리카: 산불로 인한 탄소 배출
→ 단기 배출량은 적어도 생태계 손상 영향은 매우 큼

▪ 아시아·호주
중국, 한국, 일본: 높은 산업 활동과 화석연료 사용량

영상 후반: 북반구 탄소가 남반구 호주까지 확산

호주: 1인당 배출량 세계 최고 수준이지만
낮은 인구밀도로 전체 배출은 상대적으로 낮게 나타남

NASA는 "호주 국민을 한 도시에 몰아넣는다면 탄소 농도가 영상상 더 뚜렷하게 보일 것"이라고 언급했다.

🚨 기후재난, 더 이상 먼 미래의 이야기가 아니다
영상은 단지 아름답고 정교한 시각자료가 아니다.
지금 우리가 얼마나 위태로운 상황에 놓여 있는지를 직접 보여주는 경고다.

과학시각화스튜디오는 이렇게 말했다:

"우리는 NASA의 첨단 모델링 기술을 통해
탄소가 어떻게 이동하고, 어떤 영향을 미치는지
더 명확히 이해할 수 있게 되었습니다."

하지만 그 이해가 현실 변화로 이어지지 않는다면,
폭염·가뭄·홍수·태풍은 더 잦아지고,
야생동물의 서식지 파괴, 병원성 질병의 확산까지 초래될 수 있다.

🌱 지금 필요한 건 '감축'입니다
자연이 아무리 탄소를 흡수하더라도,
계속해서 화석연료를 태우는 한 문제는 절대 해결되지 않습니다.

탄소 감축의 열쇠는 '단계적인 화석연료 사용 중단'입니다.
지구의 온도를 낮추기 위한 실질적인 전환이 필요한 때입니다.

📽️ 원문 : https://www.newspenguin.com/news 
`,
  },
  // "탄소중립은 비용이 아니라 미래를 위한 투자입니다" – 오대균 前 UNFCCC 탄소시장감독기구 위원 인터뷰
  {
    id: 'carbon-neutral-interview',
    emoji: '🌍',
    title: '"탄소중립은 비용이 아니라 미래를 위한 투자입니다" – 오대균 前 UNFCCC 탄소시장감독기구 위원 인터뷰',
    summary: '오대균 전 UNFCCC 위원이 탄소중립은 더 이상 미룰 수 없는 경제 시스템의 대전환이며, 미래를 위한 투자임을 강조했습니다.',
    image: 'https://imgnews.pstatic.net/image/014/2025/06/24/0005367689_001_20250624204417857.jpg?type=w860',
    date: '2024-06-14',
    content: `🌍 "탄소중립은 비용이 아니라 미래를 위한 투자입니다"
– 오대균 前 UNFCCC 탄소시장감독기구 위원 인터뷰

"기후위기는 기상천외한 방법으로 해결되지 않습니다.
전환의 의지, 그리고 그것을 '투자'로 보는 인식의 전환이 필요합니다."

오대균 전 유엔기후변화협약(UNFCCC) 파리협정 탄소시장감독기구 위원은 탄소중립을 향한 노력은 더 이상 미룰 수 없는 경제 시스템의 대전환이라고 강조했다. 한국처럼 에너지·수출 의존도가 높은 국가일수록 탄소 비용 리스크에 더 취약하며, 지금은 '비용 회피'가 아니라 '미래를 위한 선택'으로 접근해야 한다고 말했다.

📉 "탄소 배출 많은 구조, 더는 지속 가능하지 않다"
오 전 위원은 현재 한국 경제구조가 **에너지 수입 의존도(90% 이상)**와 화석연료 기반 수출산업에 깊이 얽혀 있다고 분석했다.
기후위기 속에서 국제사회는 '탄소 감축'을 새로운 무역 기준으로 삼기 시작했고, **EU의 CBAM(탄소국경조정제)**는 그 출발점이라고 진단했다.

"지금처럼 탄소를 많이 배출하는 방식으로는 경쟁력이 없습니다.
배출량이 곧 비용이 되는 시대가 왔습니다."

🏭 기업은 '배출량 파악'부터… 정부도 적극 개입해야
기업들이 탄소중립을 '비용'이 아닌 '효율과 경쟁력 향상'의 기회로 인식해야 한다고 강조했다.
특히 "한국 기술자들은 같은 설비로도 더 효율적이고 낭비 없는 운영 역량을 갖고 있다"며, 감축 잠재력은 충분하다고 덧붙였다.

한편, 감축 책임을 민간에만 떠넘겨서는 안 되며, 정부는 시스템 전환과 함께 세제 지원·보상제도·기술 지원 등 적극적인 인센티브 체계를 마련해야 한다고 제안했다.

🌍 탄소 배출, 'Scope 3'까지 봐야 하는 시대
다층적 글로벌 규제가 본격화되는 상황에서,
기업들은 자신의 탄소배출량(Scope 1·2)뿐 아니라, 공급망(Scope 3) 배출까지 파악하고 관리해야 한다.

Scope 1: 직접 배출

Scope 2: 전기·열 사용 등 간접 배출

Scope 3: 공급망 전반의 간접 배출

오 전 위원은 "지금 기업들이 시급히 해야 할 일은 배출 실태를 정확히 진단하는 것"이라고 강조했다.

🏛️ 기후 거버넌스, 법과 부처로 실질 강화해야
한국 정부가 추진 중인 2035 NDC 상향이나 기후에너지부 신설에 대해서는 긍정적인 평가를 내렸다.

"법률과 주무부처 신설은 실질적 실행력을 높이는 기반입니다.
탄소중립은 선언이 아니라 이행이 중요합니다."

기후외교 측면에서도 "트럼프의 4년은 짧고, 기후위기는 임기가 없다"며, 미국의 정책 변화에만 의존하지 말고 개도국과 연대하며 새로운 모델을 만들어야 한다고 조언했다.

✅ "이제는 전환을 결심할 시간입니다"
오대균 전 위원은 마지막으로 이렇게 말했다.

"탄소중립은 어렵더라도 꼭 가야 할 길입니다.
지금은 '실현 가능성'을 따질 때가 아니라
'어떻게든 실현시킬 방법'을 찾아야 할 때입니다."

기후위기는 이미 시작되었고,
지금의 선택이 향후 수십 년간의 생존 조건을 결정할 것이라는 점을 잊어선 안 된다고 강조했다.

📎 기사 원문: https://n.news.naver.com/article/014/
#파리협정 #탄소중립 #기후위기 #경제전환 #오대균인터뷰 #기후행동 #CBAM #RE100 #NDC
`,
  },
  {
    id: 'climate-education',
    emoji: '🌡️',
    title: '"2023년, 지구 역사상 가장 더운 해"… 기후위기, 교육이 열쇠다',
    summary: '2023년 전 세계 평균기온이 사상 최고치를 경신하며, 기후위기 시대에 교육의 중요성이 더욱 부각되고 있습니다.',
    image: 'https://cdn.jejudomin.co.kr/news/photo/202409/304987_305085_3952.jpg',
    date: '2024-06-15',
    content: `🌡️ "2023년, 지구 역사상 가장 더운 해"… 기후위기, 교육이 열쇠다
[제주도민일보 최지희 기자]
2023년 7월, 전 세계 평균기온이 17.16도를 기록하며 사상 최고치를 경신했다.
폭염·가뭄·산불·홍수 등 전 지구적 이상기후가 빈발하고 있으며, 기후위기 시대가 현실이 되었다.

이러한 위기에 대응하기 위해서는 국가와 기업의 정책뿐 아니라, 시민 개개인의 자발적인 행동과 이를 가능하게 만드는 환경교육의 강화가 무엇보다 중요하다는 목소리가 커지고 있다.

🇰🇷 한국과 제주도의 기후대응 전략
한국 정부
- 2021년 '탄소중립·녹색성장 기본법' 제정
- 2050 탄소중립 목표
- 해상풍력·태양광 확대, CCS 기술, 전기차·수소차 보급 등 추진

제주도
- 2016년 '카본프리아일랜드 2030' 선언
- 지역 전체 탄소중립 목표
- 해양에너지 활용, 친환경 교통 확대 등 독자적 에너지 전환 모델 구축 중

🌍 주요국의 기후변화 대응 정책
미국: 파리협정 재가입, 2030년까지 온실가스 50~52% 감축 목표
독일: 2050년까지 온실가스 85% 감축, 석탄 발전소 완전 퇴출
대만: 재생에너지 비중 70% 목표, 태양광·풍력 집중 투자
싱가포르: 2019년부터 탄소세 도입, 2030년까지 점진적 인상 계획

🏢 기업도 기후 대응… ESG가 뉴노멀
애플: 2030년까지 제품·공급망 전반 탄소중립 선언
구글: 100% 재생에너지 기반 데이터센터 구축
LG전자: 멸종위기 동물 캠페인, 생물다양성 강조
공통점: ESG 경영으로 지속가능성과 사회적 책임 확대

📚 환경교육, 지속가능한 미래의 출발점
"기후변화 대응의 핵심은 교육입니다."
— 유네스코 스테파니아 지아니니 사무차장

기후위기는 정책만으로는 해결이 어렵다.
학생·시민·기업 모두의 인식과 실천을 이끌어낼 환경교육 강화가 절실하다.

🌱 해외 주요 환경교육 사례
① 에코스쿨 (Eco-School)
- 유럽 발, 현재 75개국 49,600여 학교 운영
- 학생 주도의 환경 점검, 프로젝트, 재활용 활동 등 실천 중심 교육

② 영국
- 기후 전담교사 배치
- 청소년 기후 대사제 운영
- 모든 학교에 필수 환경교육 도입

③ 미국
- 1970년 세계 최초 환경교육법 제정
- 디지털 기술과 VR 기반 몰입형 환경교육 확산
- 주 단위로 다양화된 기후 교육 제공

④ 이탈리아
- 세계 최초 공립학교 기후교육 의무화 국가
- 연간 33시간 기후수업, 지속가능발전목표(SDGs) 통합

⑤ 프랑스
- 초중고 교과에 환경·지속가능성 교육 통합
- 고등학생 대상 기후 자격증 시험 도입

⑥ 유엔 '지속가능발전교육(ESD)'
- 교육을 통한 사회·문화·경제 전반의 지속가능성 달성 목표
- 2030년까지 세계 시민 교육, 성평등, 평화 등도 포함된 교육 모델 확산 중

🧭 정책과 교육, 함께 갈 때 지속가능한 미래가 열린다
기후위기는 단지 환경문제가 아니다.
정치·경제·사회 전반을 위협하는 복합 위기다.
따라서 대응 방식 또한 다학제적이고 통합적이어야 한다.

정부의 정책, 학교의 교육, 지역과 기업의 실천이 하나로 연결될 때 비로소 기후위기에 맞설 수 있다.

📎 기사 원문 보기 | 제주도민일보 @https://www.jejudomin.co.kr/ 
#기후위기 #환경교육 #탄소중립 #지속가능발전 #에코스쿨 #제주도기후정책 #기후교육 #기후시민
`,
  },
  {
    id: 'intl-climate-cooperation',
    emoji: '🌍',
    title: "국제사회, 기후위기 대응 위해 '온실가스 감축' 협력 확대",
    summary: '국제사회가 온실가스 감축을 위해 유엔기후변화협약, 교토의정서, 파리협정 등 다양한 협력체계를 구축해왔습니다.',
    image: 'https://cdn.thescoop.co.kr/news/photo/202406/302357_206343_01.jpg',
    date: '2024-06-16',
    content: `🌍 국제사회, 기후위기 대응 위해 "온실가스 감축" 협력 확대\n– 유엔기후변화협약부터 파리협정, IPCC 특별보고서까지\n\n기후위기가 전 지구적으로 가속화되면서,\n국제사회는 인간 활동에 의한 온실가스 배출과 지구온난화의 심각성을 인식하고\n국제 협약과 협정을 통해 공동 대응의 틀을 마련해왔다.\n\n🗓️ 국제 기후협약 주요 흐름 한눈에 보기\n\n✅ 1992년: 유엔기후변화협약 (UNFCCC)\n- 국제 최초 기후변화 대응 기본협약\n- 선언적 성격, 법적 강제력 없음\n- 각국은 자국 실정에 맞게 온실가스 감축 정책 수립\n- 배출량·흡수량 통계 및 정책 이행 보고 의무\n\n📌 UNFCCC: United Nations Framework Convention on Climate Change\n\n✅ 1997년: 교토의정서 (Kyoto Protocol)\n- 온실가스 감축에 법적 구속력을 부여한 최초의 국제 협약\n- 선진국만 감축 의무 부담 (개발도상국은 제외)\n- 6대 온실가스 감축 대상 포함\n- 2005년 발효, 2020년 만료\n\n📌 특징: "역사적 배출 책임"에 근거해 선진국에만 감축 의무 부여\n\n✅ 2015년: 파리협정 (Paris Agreement)\n- 교토의정서 이후 새로운 보편적 기후체제 수립\n- 선진국·개도국 모든 국가가 자발적으로 참여\n- 지구 평균온도 상승 2℃ 이하로 억제,\n  가능하면 1.5℃ 이하로 제한 명시\n- 각국은 **NDC(국가 온실가스 감축목표)**를 자율 설정·제출\n\n📌 기후 대응의 전환점: "강제"에서 "참여와 감시" 체제로\n\n✅ 2018년: IPCC 1.5℃ 특별보고서\n- 파리협정의 1.5℃ 목표에 대한 과학적 근거 제시\n- 유엔기후변화협약 당사국회의 공식 요청에 따라 작성\n- 지구 평균 온도 상승을 1.5℃로 제한할 경우와 2℃일 경우의 차이점 분석\n- 기후위기 대응 시급성과 탄소중립 전환의 필요성 강조\n\n📌 IPCC: Intergovernmental Panel on Climate Change (기후변화에 관한 정부간 협의체)\n\n#기후위기 #온실가스감축 #국제협약 #UNFCCC #교토의정서 #파리협정 #IPCC #탄소중립 #기후협력\n`,
  },
  {
    id: 'climate-causes',
    emoji: '🌡️',
    title: '기후변화, 자연 현상인가 인류가 만든 위기인가',
    summary: '기후변화의 원인은 자연적 요인과 인위적 요인이 복합적으로 작용하지만, 최근의 급격한 변화는 인간 활동의 영향이 더 크다는 것이 과학계의 중론입니다.',
    image: 'https://www.gihoo.or.kr/netzero/img/contents_2024/factor_f_1.png',
    date: '2024-06-17',
    content: `🌡️ 기후변화, 자연 현상인가 인류가 만든 위기인가\n기후변화의 원인을 파헤치다\n\n[환경브리핑]\n폭염과 한파, 산불과 홍수가 일상처럼 반복되는 지금,\n기후변화는 단순한 환경 변화가 아닌 지구 시스템의 위기로 인식되고 있다.\n그렇다면 기후변화는 자연적인 현상일까, 아니면 인간이 초래한 결과일까?\n\n전문가들은 기후변화는 자연적 요인과 인위적 요인이 복합적으로 작용한 결과라고 설명한다.\n기후 시스템을 구성하는 요소들의 상호작용 속에서 자연적 변화가 일어나지만,\n현대의 빠른 기후 변화는 분명히 인간 활동에 의한 영향이 더 크다는 것이 과학계의 중론이다.\n\n🌍 자연도 변한다 – 기후변화의 자연적 요인\n▪ 지구시스템의 복잡한 상호작용\n기후는 대기권, 수권, 빙권, 지권, 생물권 등 지구의 구성 요소가 서로 영향을 주고받으며 변화한다.\n예를 들어 바다는 대기로 수증기와 열을 공급하고, 빙권은 태양빛을 반사해 복사열을 조절하며, 식생은 탄소순환을 통해 대기 조성에 영향을 준다.\n\n▪ 화산 폭발로 인한 일시적 냉각\n화산 분출물이 성층권까지 도달하면 태양빛을 차단해 지구의 온도를 일시적으로 낮추는 냉각 효과를 유발한다. 실제로 대규모 화산 폭발 후 지구 평균기온이 수개월간 하락한 사례들이 있다.\n\n▪ 태양 활동 변화\n태양의 흑점 수나 방사 에너지 변화도 기후에 영향을 준다.\n태양에서 오는 에너지량이 줄어들면 지구는 냉각되고, 늘어나면 온난화 현상이 가속화된다.\n\n▪ 수만 년 주기의 궤도 변화\n지구는 10만 년 주기로 공전 궤도가 타원형에서 원형으로 바뀌고,\n4만 년 주기로 자전축 기울기가 변화하며,\n2만6천 년 주기로 세차운동(자전축의 방향 변화)이 일어난다.\n이러한 궤도 변화는 장기적인 기후 변동, 즉 빙하기와 간빙기를 만들어낸다.\n\n🔥 인간이 만든 변화 – 기후변화의 인위적 요인\n▪ 폭발적으로 증가한 온실가스\n산업화 이후 이산화탄소, 메탄, 아산화질소 등 온실가스는 급격히 증가했다.\n1997년 교토의정서에서 국제사회는 이들 6대 온실가스를 관리 대상으로 지정했다.\n특히 이산화탄소는 산업화 전 280ppm에서 2019년 기준 410ppm으로 40% 이상 증가하며\n최근 200만 년 사이 가장 높은 수치를 기록했다.\n\n이러한 온실가스는 대기 중에서 복사열을 가두는 '담요 효과'를 일으켜\n지구 평균기온을 상승시키는 주요 원인으로 작용하고 있다.\n\n▪ 에어로졸, 작지만 강한 영향\n공장·자동차·산불 등에서 배출되는 **에어로졸(미세입자)**은 태양빛을 반사하거나 흡수해\n국지적 기온 변화를 유도한다.\n비록 대기 중에 며칠 머무는 단기 입자이지만, 산업지역을 중심으로\n집중적이고 불균형적인 기후 영향을 미칠 수 있다.\n\n▪ 산림 파괴와 토지 이용 변화\n아마존 열대우림의 경우, 지난 30년간 면적이 705만㎢에서 550만㎢로 축소되었다.\n벌목, 농업 확장, 도시화 등으로 산림이 파괴되면 이산화탄소 흡수원이 사라지고,\n산불 등을 통해 오히려 온실가스가 추가 배출된다.\n또한 토지 피복 변화는 지표면 반사율 변화로 이어져 국지적인 기후를 바꾸게 된다.\n\n✅ 자연과 인간이 함께 만든 위기… 그러나 '속도'가 다르다\n전문가들은 자연적 요인이 기후변화를 만들 수는 있지만,\n현재와 같이 급격한 온도 상승과 기후 이상현상은 명백히 인간의 활동이 기인한 것이라 보고 있다.\n즉, 인간이 변화를 가속화하고 심화시키고 있는 것이다.\n\n🧭 우리는 무엇을 해야 하는가?\n기후변화는 단순한 미래의 이야기가 아닌 지금 이 순간의 현실이다.\n자연의 순환을 이해하고, 인간의 활동을 되돌아보며\n탄소중립, 에너지 전환, 생태 보호, 환경교육 등을 통해\n기후위기에 맞선 실천이 필요한 시점이다.\n\n#기후변화 #기후위기 #자연적요인 #인위적요인 #온실가스 #에어로졸 #산림파괴 #탄소중립 #환경교육\n`,
  },
  {
    id: 'netzero-city',
    emoji: '🏙️',
    title: '"탄소중립, 도시에 답 있다" 탄소중립 선도도시 1기 출범… 정부·지자체·민간 공동 전환 본격화',
    summary: '도시는 에너지 소비와 온실가스 배출의 핵심 지점으로, 탄소중립 선도도시 1기 출범을 통해 정부·지자체·민간이 함께 도시 기반의 탄소중립 전환을 본격화합니다.',
    image: 'https://th.bing.com/th/id/R.74cdf1eb9d1f9c98353b16156243c7f4?rik=deCumQqm1wmgog&riu=http%3a%2f%2fimage1.lottetour.com%2fstatic%2ftrvtour%2f201902%2f570%2f61073ff8e1d922406553d079ec6190b2.jpg&ehk=8aQTOGsAevseIiqgkav36ILBC5BTgIKSvVe9Cjp3GsI%3d&risl=&pid=ImgRaw&r=0',
    date: '2024-06-18',
    content: `🏙️ "탄소중립, 도시에 답 있다"
탄소중립 선도도시 1기 출범… 정부·지자체·민간 공동 전환 본격화

기후위기 대응의 최전선은 어디일까요? 바로 우리가 살아가는 도시입니다.
도시는 지구 면적의 3%에 불과하지만, 에너지 소비의 75%, 온실가스 배출의 50~60%를 차지하는, 기후위기의 핵심 지점이기도 합니다.

이에 따라 환경부와 국토교통부는 2025년 3월, 전국 공모를 통해 충남 당진시, 제주특별자치도, 충남 보령시, 서울 노원구를 '탄소중립 선도도시 1기'로 선정했습니다. 정부, 지역, 민간이 함께 참여하는 탄소중립 도시 전환 모델이 본격 가동됩니다.

🔍 왜 도시인가?
폭염·집중호우·산불 같은 기후재난은 일상이 되고 있습니다.
이 모든 재난의 이면에는 도시 중심의 온실가스 배출이 있습니다.

유럽연합(EU), 일본 등은 이미 기후중립 도시 구축에 나섰고, 우리나라도 「탄소중립기본법」을 통해 도시 기반 탄소중립을 법제화하며 그 흐름에 합류했습니다.

✅ 누가, 어떻게 선정됐나?
선도도시는 온실가스 진단, 지역 여건, 시민 체감도, 실행 가능성 등을 종합적으로 평가해 선정되었으며, 특히 국민 평가단 50인의 의견도 반영되었습니다.

🌞 "탄소중립을 당기는 당찬 도시" 충남 당진시
2022년 전국 온실가스 배출량 1위를 기록한 당진시는
2030년까지 56% 감축을 목표로 '5G 전략'을 세웠습니다.
(Green Energy, Green Station, Green Recycle, Green Tech, Green Life)

염해지 태양광, 풍력·수소 연계 연료전지 발전, 환경기금 순환 시스템 등을 도입해
친환경 산업 전환과 지속가능한 도시경제를 동시에 실현하겠다는 계획입니다.

🌊 "2035년 Net-Zero 선언" 제주특별자치도
광역지자체 중 유일하게 선정된 제주도는
**2035년까지 온실가스 배출량 '제로(0)'**를 선언했습니다.

건물·교통 부문 온실가스 감축,
7GW 재생에너지 설비, 연간 6만 톤 그린수소 생산시설 구축 등
섬 전체를 청정에너지 순환 생태계로 전환하고자 합니다.

🔋 "화석에너지에서 청정에너지로" 충남 보령시
화력발전소 11기를 보유한 보령시는
기존 에너지 산업을 활용해 해상풍력, 태양광, 수소에너지 등으로 전환을 꾀하고 있습니다.

특히 탄소포집·저장(CCUS) 기술과 축산폐기물 기반 바이오가스 도입을 통해
2030년까지 327만 톤 감축, 연 365억 원의 주민 편익 창출을 목표로 합니다.

🏘️ "노후도시의 그린 리빌딩" 서울 노원구
서울시에서 노후주택 비율 1위를 기록 중인 노원구는
'Rebuild First'를 전략으로 내세우며
제로에너지건물(ZEB) 확대, EV 특화거리 조성, 녹색 일자리 활성화에 나섭니다.

도시형 태양광 설치와 재개발 지역 에너지 효율 향상 등을 추진해
환경과 경제가 조화를 이루는 미래형 도시로 도약할 계획입니다.

🤝 함께 만드는 탄소중립 미래
선정된 4개 도시는 올해 말까지 환경부·국토교통부와 함께
도시 맞춤형 탄소중립 기본계획을 수립합니다.
2030년까지 실질적인 온실가스 감축과 시민이 체감할 수 있는 성과를 만들어갈 예정입니다.

정부는 2025년 2기 탄소중립 선도도시 발표도 예고하며,
이번 1기 사업이 전국적 확산의 기준점이 될 것으로 기대를 모으고 있습니다.

🌏 도시가 변하면, 지구가 바뀐다
탄소중립은 선택이 아닌 생존의 조건입니다.
도시의 변화가 기후위기의 해답이 될 수 있습니다.
정부, 지자체, 시민 모두가 함께 만들어가는 Net-Zero CITY, 지금 시작합니다.

#탄소중립 #도시전환 #NetZero #선도도시 #기후위기 #지속가능도시 #그린뉴딜 #2035탄소제로 #에너지전환 #도시기후행동`
},
];



function renderNewsList() {
  const area = document.getElementById('newsListArea');
  area.innerHTML = `<div class='news-list'>${newsData.map(news => `
    <div class='news-card' onclick='openNewsDetail("${news.id}")'>
      <img class='news-thumb' src='${news.image}' alt='뉴스 이미지'>
      <div class='news-title'>${news.title}</div>
      <div class='news-summary'>${news.summary}</div>
      <div class='news-date'>${news.date}</div>
    </div>
  `).join('')}</div>`;
}
function openNewsDetail(id) {
  const news = newsData.find(n => n.id === id);
  if (!news) return;
  const modal = document.getElementById('newsDetailModal');
  // content 변환: 줄바꿈, **굵게**, 이모지+소제목 강조
  let htmlContent = news.content
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') // **굵게**
    .replace(/\n/g, '<br/>') // 줄바꿈
    .replace(/(🌊|📈|🐢|🛠|🚫|⏰|🌱)([^<\n]*)/g, '<span class="news-section-title">$1$2</span>'); // 이모지+소제목 강조
  modal.innerHTML = `
    <div class='news-detail'>
      <button onclick='closeNewsDetail()' style='position:absolute;top:1rem;right:1rem;font-size:1.3rem;'>&times;</button>
      <img class='news-thumb' src='${news.image}' alt='뉴스 이미지'>
      <div class='news-title mt-2 mb-1'>${news.title}</div>
      <div class='news-date mb-2'>${news.date}</div>
      <div class='news-summary mb-2'>${news.summary}</div>
      <div style='font-size:1rem;color:#333;'>${htmlContent}</div>
    </div>
  `;
  modal.classList.remove('hidden');
}
function closeNewsDetail() {
  document.getElementById('newsDetailModal').classList.add('hidden');
}

// ... 분리수거 떨어지는 쓰레기 드래그&드롭 게임 신규 구현 ...
const dragBins = [
  { type: 'paper', emoji: '📄', name: '종이' },
  { type: 'plastic', emoji: '🧴', name: '플라스틱' },
  { type: 'glass', emoji: '🍾', name: '유리' }
];

const dragTrashItems = [
  // 종이류
  { type: 'paper', emoji: '📄', name: '종이' },
  // 플라스틱류
  { type: 'plastic', emoji: '🧴', name: '플라스틱' },
  // 유리류
  { type: 'glass', emoji: '🍾', name: '유리' }
];

let dragGameScore = 0, dragGameLives = 3, dragGameActive = false;
let fallingTrashItems = [];
let fallingInterval = null;
let gameSpeed = 1; // 게임 속도 (1부터 시작해서 점점 빨라짐)
let currentDraggedElement = null; // 현재 드래그 중인 요소 추적

function renderDragBins() {
  const area = document.getElementById('dragBinsArea');
  area.innerHTML = dragBins.map(bin => `
    <div class="drag-bin p-4 bg-white border-2 border-dashed border-neutral-300 rounded-lg text-center" 
         data-type="${bin.type}" 
         ondragover="dragOver(event)" 
         ondrop="dragDrop(event)">
      <div class="text-4xl mb-2">${bin.emoji}</div>
      <div class="text-sm font-semibold text-neutral-700">${bin.name}</div>
    </div>
  `).join('');
}

function renderFallingTrash() {
  const layer = document.getElementById('fallingTrashLayer');
  layer.innerHTML = '';
  
  fallingTrashItems.forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'falling-trash-item';
    el.style.position = 'absolute';
    el.style.left = item.x + 'px';
    el.style.top = item.y + 'px';
    el.style.width = '60px';
    el.style.height = '60px';
    el.style.fontSize = '2rem';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'move';
    el.style.draggable = 'true';
    el.style.zIndex = '10';
    el.dataset.type = item.type;
    el.dataset.index = index;
    el.innerHTML = item.emoji;
    
    // 드래그 이벤트 직접 바인딩
    el.addEventListener('dragstart', dragStart);
    
    layer.appendChild(el);
    item._el = el;
  });
}

function dragStart(event) {
  console.log('Drag start:', event.target.dataset.type);
  event.dataTransfer.setData('text/plain', event.target.dataset.type);
  event.target.style.opacity = '0.5';
  currentDraggedElement = event.target; // 현재 드래그 중인 요소 저장
  
  // 드래그 이미지 설정 (화면 깨짐 방지)
  const dragImage = event.target.cloneNode(true);
  dragImage.style.opacity = '0.8';
  event.dataTransfer.setDragImage(dragImage, 30, 30);
}

function dragOver(event) {
  event.preventDefault();
  event.currentTarget.style.borderColor = '#10b981';
  event.currentTarget.style.backgroundColor = '#f0fdf4';
}

function dragDrop(event) {
  event.preventDefault();
  
  // 게임이 종료되었으면 처리하지 않음
  if (!dragGameActive) return;
  
  const draggedType = event.dataTransfer.getData('text/plain');
  const binType = event.currentTarget.dataset.type;
  
  console.log('Drag drop:', draggedType, 'to', binType);
  
  // 정답 판정
  if (draggedType === binType) {
    dragGameScore++;
    document.getElementById('dragGameResult').innerHTML = `<span class='text-emerald-700 font-bold'>정답! +1점</span>`;
    
    // 정답인 쓰레기를 하늘에서 제거
    if (currentDraggedElement) {
      const index = parseInt(currentDraggedElement.dataset.index);
      if (index >= 0 && index < fallingTrashItems.length) {
        fallingTrashItems.splice(index, 1);
        renderFallingTrash();
      }
      
      // 점수에 따라 게임 속도 증가
      if (dragGameScore % 5 === 0) {
        gameSpeed += 0.2;
        console.log('Speed increased to:', gameSpeed);
      }
    }
  } else {
    dragGameLives--;
    document.getElementById('dragGameResult').innerHTML = `<span class='text-rose-700 font-bold'>틀렸어요! -1하트</span>`;
  }
  
  // 드래그된 요소 원래 스타일로 복원
  if (currentDraggedElement) {
    currentDraggedElement.style.opacity = '1';
    currentDraggedElement = null; // 드래그 요소 초기화
  }
  
  // 쓰레기통 스타일 복원
  event.currentTarget.style.borderColor = '#d1d5db';
  event.currentTarget.style.backgroundColor = '#ffffff';
  
  updateDragGameUI();
  
  // 게임 종료 체크
  if (dragGameLives <= 0) {
    dragGameOver();
  }
}

function updateDragGameUI() {
  document.getElementById('dragGameScore').textContent = dragGameScore;
  let hearts = '';
  for (let i = 0; i < 3; i++) hearts += i < dragGameLives ? '♥' : '💔';
  document.getElementById('dragGameLives').textContent = hearts;
}

function showDragGameStartScreen() {
  document.getElementById('dragGameStartScreen').style.display = '';
  document.getElementById('dragGameMain').style.display = 'none';
  document.getElementById('dragGameResult').innerHTML = '';
}

function dragGameStart() {
  // 게임 상태 완전 초기화
  dragGameActive = false; // 먼저 비활성화
  if (fallingInterval) clearInterval(fallingInterval);
  
  showDragGameStartScreen();
  document.getElementById('dragGameStartScreen').style.display = 'none';
  document.getElementById('dragGameMain').style.display = '';
  
  // 게임 변수 초기화
  dragGameScore = 0;
  dragGameLives = 3;
  dragGameActive = true;
  gameSpeed = 1; // 게임 속도 초기화
  fallingTrashItems = [];
  
  // UI 초기화
  renderDragBins();
  renderFallingTrash();
  updateDragGameUI();
  
  // 결과 메시지 초기화
  document.getElementById('dragGameResult').innerHTML = '';
  
  // 떨어지는 쓰레기 생성 시작 (간격을 2초에서 1.5초로 단축)
  fallingInterval = setInterval(createFallingTrash, 1500);
}

function createFallingTrash() {
  if (!dragGameActive) return;
  
  const area = document.getElementById('fallingTrashArea');
  const areaRect = area.getBoundingClientRect();
  const areaWidth = areaRect.width;
  
  // 랜덤 쓰레기 선택
  const randomItem = dragTrashItems[Math.floor(Math.random() * dragTrashItems.length)];
  
  // 랜덤 x 위치 (60px 여백 고려)
  const x = Math.random() * (areaWidth - 60);
  
  fallingTrashItems.push({
    ...randomItem,
    x: x,
    y: -60,
    vy: 3 // 초기 떨어지는 속도를 2에서 3으로 증가
  });
  
  renderFallingTrash();
}

function updateFallingTrash() {
  if (!dragGameActive) return;
  
  for (let i = fallingTrashItems.length - 1; i >= 0; i--) {
    const item = fallingTrashItems[i];
    item.y += item.vy * gameSpeed; // 게임 속도 적용
    
    // 바닥에 닿으면 하트 감소
    if (item.y > 240) { // 300px 높이 - 60px 아이템 크기
      dragGameLives--;
      fallingTrashItems.splice(i, 1);
      updateDragGameUI();
      
      if (dragGameLives <= 0) {
        dragGameOver();
        return;
      }
    }
  }
  
  renderFallingTrash();
}

function dragGameOver() {
  dragGameActive = false;
  if (fallingInterval) clearInterval(fallingInterval);
  saveGameRecord('recycle', dragGameScore);
  showGameResults('recycle');
}

// 떨어지는 쓰레기 업데이트 루프
setInterval(updateFallingTrash, 50);

// 모바일 터치 이벤트 지원
let touchDraggedElement = null;
let touchProcessed = false;

function addTouchSupport() {
  // 기존 이벤트 리스너 제거 (중복 방지)
  document.removeEventListener('touchstart', handleTouchStart);
  document.removeEventListener('touchend', handleTouchEnd);
  
  // 새로운 이벤트 리스너 등록
  document.addEventListener('touchstart', handleTouchStart, { passive: false });
  document.addEventListener('touchend', handleTouchEnd, { passive: false });
}

function handleTouchStart(e) {
  if (!dragGameActive) return;
  
  if (e.target.classList.contains('falling-trash-item')) {
    e.preventDefault();
    touchDraggedElement = e.target;
    e.target.style.opacity = '0.5';
    currentDraggedElement = e.target;
    touchProcessed = false;
  }
}

function handleTouchEnd(e) {
  if (!dragGameActive || !touchDraggedElement || touchProcessed) return;
  
  const bin = e.target.closest('.drag-bin');
  if (bin) {
    e.preventDefault();
    touchProcessed = true;
    
    const draggedType = touchDraggedElement.dataset.type;
    const binType = bin.dataset.type;
    
    console.log('Touch drop:', draggedType, 'to', binType);
    
    // 정답 판정
    if (draggedType === binType) {
      dragGameScore++;
      document.getElementById('dragGameResult').innerHTML = `<span class='text-emerald-700 font-bold'>정답! +1점</span>`;
      
      // 정답인 쓰레기를 하늘에서 제거
      const index = parseInt(touchDraggedElement.dataset.index);
      if (index >= 0 && index < fallingTrashItems.length) {
        fallingTrashItems.splice(index, 1);
        renderFallingTrash();
      }
      
      // 점수에 따라 게임 속도 증가
      if (dragGameScore % 5 === 0) {
        gameSpeed += 0.2;
        console.log('Speed increased to:', gameSpeed);
      }
    } else {
      dragGameLives--;
      document.getElementById('dragGameResult').innerHTML = `<span class='text-rose-700 font-bold'>틀렸어요! -1하트</span>`;
    }
    
    updateDragGameUI();
    
    if (dragGameLives <= 0) {
      dragGameOver();
    }
    
    // 드래그 요소 정리
    touchDraggedElement.style.opacity = '1';
    touchDraggedElement = null;
    currentDraggedElement = null;
    
    // 터치 처리 플래그 초기화
    setTimeout(() => {
      touchProcessed = false;
    }, 200);
  }
}
// ... 

// 로그인 시스템 및 게임 결과 관리
let currentUser = null;

// 회원 데이터 관리 (localStorage)
function getUsers() {
  return JSON.parse(localStorage.getItem('users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// 회원가입 처리
async function handleSignup(event) {
  event.preventDefault();
  console.log('회원가입 함수 호출됨');
  
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value.trim();
  const nickname = document.getElementById('signupNickname').value.trim();
  
  console.log('입력된 데이터:', { email, nickname });
  
  if (!email || !password || !nickname) {
    alert('이메일, 비밀번호, 닉네임을 모두 입력하세요.');
    return;
  }
  
  if (password.length < 6) {
    alert('비밀번호는 6자 이상이어야 합니다.');
    return;
  }
  
  // Firebase 사용 가능 여부 재확인
  console.log('Firebase 상태 확인:', { firebaseAvailable, firebaseAuth: !!window.firebaseAuth });
  
  if (window.firebaseAuth && firebaseAvailable) {
    try {
      console.log('Firebase Auth 회원가입 시도:', { email, nickname });
      
      // Firebase Auth로 계정 생성
      const userCredential = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth 계정 생성 성공:', user.uid);
      
      // Firestore에 사용자 정보 저장
      const usersRef = window.firebaseDb.collection('users');
      const docRef = await usersRef.add({
        uid: user.uid,
        email: email,
        nickname: nickname,
        createdAt: new Date().toISOString()
      });
      
      console.log('Firestore 사용자 정보 저장 성공:', docRef.id);
      alert('회원가입이 완료되었습니다! 이제 로그인해주세요.');
      showLoginTab();
    } catch (error) {
      console.error('Firebase Auth signup error:', error);
      
      let errorMessage = '회원가입에 실패했습니다.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호가 너무 약합니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바르지 않은 이메일 형식입니다.';
      }
      
      alert(errorMessage);
    }
  } else {
    // localStorage fallback
    console.log('Firebase 사용 불가, localStorage 사용');
    handleSignupLocalStorage(email, password, nickname);
  }
}

// localStorage를 사용한 회원가입 처리
function handleSignupLocalStorage(email, password, nickname) {
  console.log('localStorage 회원가입 시작:', { email, nickname });
  
  let users = getUsers();
  console.log('기존 사용자 수:', users.length);
  
  // 이메일 중복 체크
  if (users.find(u => u.email === email)) {
    console.log('이메일 중복 발견');
    alert('이미 사용 중인 이메일입니다.\n다른 이메일을 사용해주세요.');
    return;
  }
  
  // 닉네임 중복 체크
  if (users.find(u => u.nickname === nickname)) {
    console.log('닉네임 중복 발견');
    alert('이미 사용 중인 닉네임입니다.\n다른 닉네임을 사용해주세요.');
    return;
  }
  
  // 새 사용자 추가
  const newUser = { 
    email,
    password, // 실제로는 해시화해야 하지만 간단히 저장
    nickname,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  console.log('새 사용자 추가됨:', newUser);
  console.log('총 사용자 수:', users.length);
  
  saveUsers(users);
  console.log('localStorage에 저장 완료');
  
  alert('회원가입이 완료되었습니다! 이제 로그인해주세요.');
  showLoginTab();
}

// 로그인 처리
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  
  if (!email || !password) {
    alert('이메일과 비밀번호를 모두 입력하세요.');
    return;
  }
  
  // Firebase 사용 가능 여부 재확인
  if (window.firebaseAuth && firebaseAvailable) {
    try {
      console.log('Firebase Auth 로그인 시도:', { email });
      
      // Firebase Auth로 로그인
      const userCredential = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      console.log('Firebase Auth 로그인 성공:', user.uid);
      
      // Firestore에서 사용자 정보 가져오기
      const usersRef = window.firebaseDb.collection('users');
      const userQuery = usersRef.where('uid', '==', user.uid);
      const userSnapshot = await userQuery.get();
      
      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();
        
        currentUser = { 
          uid: user.uid,
          email: user.email,
          nickname: userData.nickname
        };
        
        // 로그인 상태 저장
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        closeLoginModal();
        document.getElementById('userInfoBtn').textContent = currentUser.nickname;
        document.getElementById('userInfoBtn').classList.remove('hidden');
        document.getElementById('loginBtn').classList.add('hidden');
        showSection('home');
        
        // 모바일 버튼도 동기화
        syncMobileLoginButtons();
      } else {
        alert('사용자 정보를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('Firebase Auth login error:', error);
      
      let errorMessage = '로그인에 실패했습니다.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바르지 않은 이메일 형식입니다.';
      }
      
      alert(errorMessage);
    }
  } else {
    // localStorage fallback
    handleLoginLocalStorage(email, password);
  }
}

// localStorage를 사용한 로그인 처리
function handleLoginLocalStorage(email, password) {
  let users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    // 더 자세한 오류 메시지 제공
    const emailExists = users.find(u => u.email === email);
    
    if (!emailExists) {
      alert('등록되지 않은 계정입니다.\n회원가입을 먼저 해주세요.');
      showSignupTab();
    } else {
      alert('비밀번호가 올바르지 않습니다.');
    }
    return;
  }
  
  currentUser = { 
    email: user.email,
    nickname: user.nickname
  };
  
  // 로그인 상태 저장
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  closeLoginModal();
  document.getElementById('userInfoBtn').textContent = currentUser.nickname;
  document.getElementById('userInfoBtn').classList.remove('hidden');
  document.getElementById('loginBtn').classList.add('hidden');
  showSection('home');
  
  // 모바일 버튼도 동기화
  syncMobileLoginButtons();
}

// 로그인/회원가입 탭 전환
function showLoginTab() {
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginTabBtn').classList.add('bg-emerald-900', 'text-white');
  document.getElementById('signupTabBtn').classList.remove('bg-emerald-900', 'text-white');
  document.getElementById('loginTabBtn').classList.remove('bg-emerald-100', 'text-emerald-900');
  document.getElementById('signupTabBtn').classList.add('bg-emerald-100', 'text-emerald-900');
}
function showSignupTab() {
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupForm').classList.remove('hidden');
  document.getElementById('signupTabBtn').classList.add('bg-emerald-900', 'text-white');
  document.getElementById('loginTabBtn').classList.remove('bg-emerald-900', 'text-white');
  document.getElementById('signupTabBtn').classList.remove('bg-emerald-100', 'text-emerald-900');
  document.getElementById('loginTabBtn').classList.add('bg-emerald-100', 'text-emerald-900');
}

// 페이지 로드 시 이벤트 연결
window.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    renderNewsList();
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    addTouchSupport();
    
    // 모바일 로그인 버튼 동기화
    syncMobileLoginButtons();
    
    // 현재 로그인 상태 확인
    checkLoginStatus();
    
    // 테스트용 더미 데이터 추가 (개발 중에만 사용)
    // addDummyData();
});

// 현재 로그인 상태 확인
function checkLoginStatus() {
  const savedUser = localStorage.getItem('currentUser');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      // 사용자가 여전히 존재하는지 확인
      const users = getUsers();
      const userExists = users.find(u => 
        u.nickname === currentUser.nickname && u.phone === currentUser.phone
      );
      
      if (userExists) {
        // 로그인 상태 복원
        document.getElementById('userInfoBtn').textContent = currentUser.nickname;
        document.getElementById('userInfoBtn').classList.remove('hidden');
        document.getElementById('loginBtn').classList.add('hidden');
        syncMobileLoginButtons();
      } else {
        // 사용자가 삭제된 경우 로그아웃
        localStorage.removeItem('currentUser');
        currentUser = null;
      }
    } catch (error) {
      console.error('로그인 상태 복원 실패:', error);
      localStorage.removeItem('currentUser');
      currentUser = null;
    }
  }
}



// currentUser에서 name 관련 코드 모두 제거, 회원정보 모달 등도 nickname/phone만 사용

// 회원정보 모달 열기
function openUserInfoModal() {
  if (!currentUser) return;
  document.getElementById('userInfoModal').classList.remove('hidden');
  
  // 회원정보 표시
  document.getElementById('userInfoContent').innerHTML = `
    <div class='mb-4 p-3 bg-emerald-50 rounded-lg'>
      <div class='mb-2'><b>닉네임</b>: ${currentUser.nickname}</div>
      <div class='mb-2'><b>전화번호</b>: ${currentUser.phone.replace(/(\d{3})-?(\d{3,4})-?(\d{4})/, '$1-****-$3')}</div>
    </div>
  `;
  
  // 기본 탭: 분리수거
  renderUserGameRecords('recycle');
  
  // 탭 이벤트 바인딩
  document.querySelectorAll('.user-record-tab').forEach(btn => {
    btn.onclick = function() {
      document.querySelectorAll('.user-record-tab').forEach(b => b.classList.remove('bg-emerald-900', 'text-white'));
      this.classList.add('bg-emerald-900', 'text-white');
      renderUserGameRecords(this.dataset.game);
    };
  });
  
  // 첫 탭 활성화
  document.querySelector('.user-record-tab[data-game="recycle"]').classList.add('bg-emerald-900', 'text-white');
}
function closeUserInfoModal() {
  document.getElementById('userInfoModal').classList.add('hidden');
}





// 게임 결과 모달 닫기
function closeGameResultsModal() {
  document.getElementById('gameResultsModal').classList.add('hidden');
}

// --- 로그인/회원가입 모달 제어 ---
function openLoginModal() {
  document.getElementById('loginScreen').style.display = 'flex';
  showLoginTab();
}
function closeLoginModal() {
  document.getElementById('loginScreen').style.display = 'none';
}

// 로그아웃
function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  
  document.getElementById('userInfoBtn').classList.add('hidden');
  document.getElementById('loginBtn').classList.remove('hidden');
  closeUserInfoModal();
  
  // 모바일 버튼도 동기화
  syncMobileLoginButtons();
  
  alert('로그아웃되었습니다.');
}



// 게임 기록 관리 시스템
let gameRecords = {
  quiz: [],
  recycle: [],
  game2048: [],
  runner: []
};

// localStorage에서 게임 기록 불러오기
function loadGameRecords() {
  const saved = localStorage.getItem('gameRecords');
  if (saved) {
    gameRecords = JSON.parse(saved);
  }
}

// 게임 기록 저장하기
async function saveGameRecord(gameType, score) {
  if (!currentUser) return;
  
  const record = {
    nickname: currentUser.nickname,
    score: score,
    date: new Date().toISOString(),
    timestamp: Date.now()
  };
  
  // localStorage 저장 (캐시용)
  if (!gameRecords[gameType]) {
    gameRecords[gameType] = [];
  }
  
  gameRecords[gameType].push(record);
  gameRecords[gameType].sort((a, b) => b.score - a.score);
  
  if (gameRecords[gameType].length > 50) {
    gameRecords[gameType] = gameRecords[gameType].slice(0, 50);
  }
  
  localStorage.setItem('gameRecords', JSON.stringify(gameRecords));
  
  // Firebase 저장 (Firebase가 있을 때만)
  if (firebaseAvailable && window.firebaseDb) {
    try {
      console.log('Firebase 점수 저장 시도:', { nickname: currentUser.nickname, gameType, score });
      
      const scoresRef = window.firebaseDb.collection('scores');
      const docRef = await scoresRef.add({
        nickname: currentUser.nickname,
        gameType,
        score,
        timestamp: new Date().toISOString()
      });
      
      console.log('Firebase 점수 저장 성공:', docRef.id);
    } catch (error) {
      console.error('Firebase save score error:', error);
    }
  }
}

// 사용자별 게임 기록 가져오기
function getUserGameRecords(nickname, gameType) {
  return gameRecords[gameType].filter(record => record.nickname === nickname);
}

// 전체 게임 기록 가져오기 (상위 10개)
function getTopGameRecords(gameType, limit = 10) {
  if (!gameRecords[gameType]) return [];
  
  // 모든 기록을 점수 순으로 정렬
  const allRecords = [...gameRecords[gameType]].sort((a, b) => b.score - a.score);
  
  // 상위 기록만 반환
  return allRecords.slice(0, limit);
}

// 사용자의 최고 점수 가져오기
function getUserBestScore(nickname, gameType) {
  const userRecords = getUserGameRecords(nickname, gameType);
  return userRecords.length > 0 ? userRecords[0].score : 0;
}

// 게임 결과 모달 표시 개선
function showGameResults(gameType) {
  const modal = document.getElementById('gameResultsModal');
  const content = document.getElementById('gameResultsContent');
  const btnArea = document.getElementById('gameResultsBtnArea');
  
  const gameNames = {
    quiz: '에코 퀴즈',
    recycle: '분리수거 게임',
    game2048: '2048 환경 쓰레기',
    runner: '쓰레기를 피해라!'
  };
  
  const gameEmojis = {
    quiz: '🧠',
    recycle: '♻️',
    game2048: '🎮',
    runner: '🏃'
  };
  
  const topRecords = getTopGameRecords(gameType, 5);
  const userRecords = getUserGameRecords(currentUser.nickname, gameType);
  const userBest = userRecords.length > 0 ? userRecords[0] : null;
  const currentScore = getCurrentGameScore(gameType);
  
  let html = `<h3 class="text-xl font-bold mb-4">${gameEmojis[gameType]} ${gameNames[gameType]} 결과</h3>`;
  
  // 현재 게임 결과 표시
  if (currentScore !== null) {
    const scoreClass = currentScore >= 80 ? 'text-emerald-700' : currentScore >= 60 ? 'text-yellow-600' : 'text-rose-600';
    const scoreEmoji = currentScore >= 80 ? '🎉' : currentScore >= 60 ? '👍' : '💪';
    
    html += `
      <div class="mb-6 p-4 bg-emerald-50 rounded-lg text-center">
        <div class="text-3xl mb-2">${scoreEmoji}</div>
        <div class="text-2xl font-bold ${scoreClass} mb-2">${currentScore}점</div>
        <div class="text-sm text-gray-600">이번 게임 결과</div>
      </div>
    `;
  }
  
  // 상위 5명 표시
  html += '<div class="mb-6">';
  html += '<h4 class="font-semibold mb-3 text-gray-700">🏆 전체 순위</h4>';
  
  if (topRecords.length === 0) {
    html += '<div class="text-gray-500 text-center py-4 bg-gray-50 rounded">아직 기록이 없습니다.</div>';
  } else {
    for (let i = 0; i < topRecords.length; i++) {
      const record = topRecords[i];
      const medal = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'][i];
      const date = new Date(record.date).toLocaleDateString('ko-KR');
      const isCurrentUser = record.nickname === currentUser.nickname;
      const userClass = isCurrentUser ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-50';
      
      html += `
        <div class="flex justify-between items-center p-3 rounded mb-2 border ${userClass}">
          <div class="flex items-center">
            <span class="text-xl mr-3">${medal}</span>
            <div>
              <div class="font-semibold ${isCurrentUser ? 'text-emerald-700' : ''}">${record.nickname}${isCurrentUser ? ' (나)' : ''}</div>
              <div class="text-xs text-gray-500">${date}</div>
            </div>
          </div>
          <span class="font-bold text-emerald-700">${record.score}점</span>
        </div>
      `;
    }
  }
  html += '</div>';
  
  // 내 기록 통계
  if (userRecords.length > 0) {
    const bestScore = Math.max(...userRecords.map(r => r.score));
    const avgScore = Math.round(userRecords.reduce((sum, r) => sum + r.score, 0) / userRecords.length);
    const totalGames = userRecords.length;
    
    // 전체 순위에서 현재 사용자의 최고 기록 찾기
    const userBestRecord = userRecords.sort((a, b) => b.score - a.score)[0];
    const userRank = topRecords.findIndex(r => 
      r.nickname === currentUser.nickname && r.score === userBestRecord.score
    ) + 1;
    
    html += `
      <div class="border-t pt-4">
        <h4 class="font-bold mb-3 text-emerald-700">📊 내 기록 통계</h4>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <div class="text-center p-2 bg-yellow-50 rounded">
            <div class="text-lg font-bold text-yellow-700">${bestScore}</div>
            <div class="text-xs text-gray-600">최고 점수</div>
          </div>
          <div class="text-center p-2 bg-blue-50 rounded">
            <div class="text-lg font-bold text-blue-700">${avgScore}</div>
            <div class="text-xs text-gray-600">평균 점수</div>
          </div>
          <div class="text-center p-2 bg-green-50 rounded">
            <div class="text-lg font-bold text-green-700">${totalGames}</div>
            <div class="text-xs text-gray-600">총 게임 수</div>
          </div>
          <div class="text-center p-2 bg-purple-50 rounded">
            <div class="text-lg font-bold text-purple-700">${userRank > 0 ? userRank : '-'}</div>
            <div class="text-xs text-gray-600">전체 순위</div>
          </div>
        </div>
      </div>
    `;
  }
  
  content.innerHTML = html;
  modal.classList.remove('hidden');
  
  // 다시하기 버튼
  let restartLabel = '게임 다시하기';
  let restartFn = '';
  if (gameType === 'quiz') restartFn = 'startQuiz()';
  else if (gameType === 'recycle') restartFn = 'dragGameStart()';
  else if (gameType === 'game2048') restartFn = 'startGame2048()';
  else if (gameType === 'runner') restartFn = 'startRunnerGame()';
  
  btnArea.innerHTML = `<button class='minimal-btn mt-2 w-full' onclick='closeGameResultsModal();${restartFn}'>${restartLabel}</button>`;
}

// 현재 게임 점수 가져오기
function getCurrentGameScore(gameType) {
  switch(gameType) {
    case 'quiz':
      return quizScore;
    case 'recycle':
      return dragGameScore;
    case 'game2048':
      return game2048Score;
    case 'runner':
      return runnerGameScore;
    default:
      return null;
  }
}

// 게임 종료 시 기록 저장 함수들 수정
function checkQuizAnswer(selected) {
    const q = quizQuestions[quizIndex];
    const feedback = document.getElementById('quizFeedback');
    if (selected === q.answer) {
        quizScore++;
        feedback.innerHTML = '<span class="text-emerald-700 font-bold">정답입니다!</span>';
    } else {
        feedback.innerHTML = `<span class="text-rose-600 font-bold">오답입니다.</span> 정답: ${q.options[q.answer]}`;
    }
    setTimeout(() => {
        quizIndex++;
        if (quizIndex >= quizQuestions.length) {
            saveGameRecord('quiz', quizScore);
            showGameResults('quiz');
        } else {
            showQuizQuestion();
        }
    }, 900);
}

function isGame2048Over() {
    // 빈칸이 있으면 아직 게임 오버 아님
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (game2048Grid[r][c] === 0) return false;
    }
    // 인접한 칸에 같은 값이 있으면 아직 게임 오버 아님
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        if (r < 3 && game2048Grid[r][c] === game2048Grid[r+1][c]) return false;
        if (c < 3 && game2048Grid[r][c] === game2048Grid[r][c+1]) return false;
    }
    saveGameRecord('game2048', game2048Score);
    showGameResults('game2048');
    return true;
}

function stopRunnerGame() {
    runnerGameActive = false;
    if (runnerGameInterval) clearInterval(runnerGameInterval);
    saveGameRecord('runner', runnerGameScore);
    showGameResults('runner');
}

function dragGameOver() {
    // 게임 완전 종료
    dragGameActive = false;
    
    // 인터벌 정리
    if (fallingInterval) {
        clearInterval(fallingInterval);
        fallingInterval = null;
    }
    
    // 떨어지는 쓰레기 모두 제거
    fallingTrashItems = [];
    renderFallingTrash();
    
    // 결과 메시지 표시
    document.getElementById('dragGameResult').innerHTML = `<span class='text-rose-700 font-bold'>게임 종료! 최종 점수: ${dragGameScore}점</span>`;
    
    // 점수 저장 및 결과 표시
    saveGameRecord('recycle', dragGameScore);
    showGameResults('recycle');
}

// 회원정보 모달에서 게임 기록 표시 개선
function renderUserGameRecords(gameType) {
  const area = document.getElementById('userGameRecordsArea');
  const records = getUserGameRecords(currentUser.nickname, gameType);
  
  const gameNames = {
    quiz: '에코 퀴즈',
    recycle: '분리수거 게임',
    game2048: '2048 환경 쓰레기',
    runner: '쓰레기를 피해라!'
  };
  
  const gameEmojis = {
    quiz: '🧠',
    recycle: '♻️',
    game2048: '🎮',
    runner: '🏃'
  };
  
  let html = `<div class="mb-4">
    <h4 class="font-bold text-lg mb-2">${gameEmojis[gameType]} ${gameNames[gameType]} 기록</h4>
  `;
  
  if (records.length === 0) {
    html += '<div class="text-gray-500 text-center py-6 bg-gray-50 rounded-lg">아직 기록이 없습니다.<br/>게임을 플레이해보세요!</div>';
  } else {
    // 통계 정보 추가
    const bestScore = Math.max(...records.map(r => r.score));
    const avgScore = Math.round(records.reduce((sum, r) => sum + r.score, 0) / records.length);
    const totalGames = records.length;
    const recentGames = records.slice(0, 5).length;
    
    html += `
      <div class="grid grid-cols-2 gap-3 mb-4 p-3 bg-emerald-50 rounded-lg">
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-700">${bestScore}</div>
          <div class="text-xs text-gray-600">최고 점수</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-700">${avgScore}</div>
          <div class="text-xs text-gray-600">평균 점수</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-700">${totalGames}</div>
          <div class="text-xs text-gray-600">총 게임 수</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-emerald-700">${recentGames}</div>
          <div class="text-xs text-gray-600">최근 기록</div>
        </div>
      </div>
    `;
    
    // 최근 기록 목록
    html += '<div class="max-h-48 overflow-y-auto border rounded-lg">';
    html += '<div class="bg-gray-100 p-2 text-sm font-semibold text-gray-700 border-b">최근 기록</div>';
    
    records.slice(0, 10).forEach((record, index) => {
      const date = new Date(record.date).toLocaleDateString('ko-KR');
      const time = new Date(record.date).toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      // 점수에 따른 배지
      let badge = '';
      if (record.score === bestScore) {
        badge = '<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded ml-2">🏆 최고</span>';
      } else if (record.score >= avgScore) {
        badge = '<span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded ml-2">👍 좋음</span>';
      }
      
      html += `
        <div class="flex justify-between items-center p-3 border-b border-gray-100 hover:bg-gray-50">
          <div class="flex items-center">
            <span class="text-sm font-semibold mr-3 text-gray-600">${index + 1}</span>
            <div>
              <div class="text-sm font-semibold">${record.score}점${badge}</div>
              <div class="text-xs text-gray-500">${date} ${time}</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-400">${getTimeAgo(record.date)}</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // 전체 순위 정보
    const topRecords = getTopGameRecords(gameType, 10);
    const userRank = topRecords.findIndex(r => r.nickname === currentUser.nickname) + 1;
    
    if (userRank > 0) {
      html += `
        <div class="mt-3 p-2 bg-blue-50 rounded-lg text-center">
          <div class="text-sm text-blue-700">
            전체 순위: <span class="font-bold">${userRank}위</span> / ${topRecords.length}명
          </div>
        </div>
      `;
    }
  }
  
  html += '</div>';
  area.innerHTML = html;
}

// 시간 경과 표시 함수
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return '방금 전';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}시간 전`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}일 전`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}주 전`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}개월 전`;
}

// 페이지 로드 시 초기화
window.addEventListener('DOMContentLoaded', () => {
    loadGameRecords();
    showSection('home');
    renderNewsList();
    
    // 로그인/회원가입 이벤트 리스너
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    
    // 로그인 버튼 이벤트
    document.getElementById('loginBtn').onclick = openLoginModal;
    
    // 모바일 버튼 동기화
    syncMobileLoginButtons();
    
    // 터치 지원 추가
    addTouchSupport();
    
    // 모바일 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenu && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            hideMobileMenu();
        }
    });
});

// 모바일 메뉴 토글 기능
function toggleMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.toggle('hidden');
}

function hideMobileMenu() {
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenu.classList.add('hidden');
}

// 모바일 로그인 버튼 동기화
function syncMobileLoginButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnMobile = document.getElementById('loginBtnMobile');
  const userInfoBtn = document.getElementById('userInfoBtn');
  const userInfoBtnMobile = document.getElementById('userInfoBtnMobile');
  
  if (loginBtn && loginBtnMobile) {
    loginBtnMobile.onclick = () => loginBtn.click();
  }
  
  if (userInfoBtn && userInfoBtnMobile) {
    userInfoBtnMobile.textContent = userInfoBtn.textContent;
    userInfoBtnMobile.classList.toggle('hidden', userInfoBtn.classList.contains('hidden'));
  }
}

// 로그인 성공 시 모바일 버튼도 업데이트
function handleLogin(event) {
  event.preventDefault();
  const nickname = document.getElementById('loginNickname').value.trim();
  const phone = document.getElementById('loginPhone').value.trim();
  if (!nickname || !phone) {
    alert('닉네임과 전화번호를 모두 입력하세요.');
    return;
  }
  let users = getUsers();
  const user = users.find(u => u.nickname === nickname && u.phone === phone);
  if (!user) {
    alert('닉네임 또는 전화번호가 올바르지 않습니다.');
    return;
  }
  currentUser = { nickname, phone };
  closeLoginModal();
  document.getElementById('userInfoBtn').textContent = currentUser.nickname;
  document.getElementById('userInfoBtn').classList.remove('hidden');
  document.getElementById('loginBtn').classList.add('hidden');
  
  // 모바일 버튼도 업데이트
  const userInfoBtnMobile = document.getElementById('userInfoBtnMobile');
  const loginBtnMobile = document.getElementById('loginBtnMobile');
  if (userInfoBtnMobile) {
    userInfoBtnMobile.textContent = currentUser.nickname;
    userInfoBtnMobile.classList.remove('hidden');
  }
  if (loginBtnMobile) {
    loginBtnMobile.classList.add('hidden');
  }
  
  showSection('home');
}
