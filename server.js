const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001; // greenwave와 다른 포트 사용

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 데이터 파일 경로
const DATA_FILE = path.join(__dirname, 'data', 'users.json');
const SCORES_FILE = path.join(__dirname, 'data', 'scores.json');

// 데이터 디렉토리 생성
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// 파일에서 데이터 읽기
async function readDataFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// 파일에 데이터 쓰기
async function writeDataFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// 서버 시작 시 데이터 디렉토리 생성
ensureDataDirectory();

// API 라우트

// 사용자 등록
app.post('/api/register', async (req, res) => {
  try {
    const { nickname, phone } = req.body;
    
    if (!nickname || !phone) {
      return res.status(400).json({ error: '닉네임과 전화번호를 모두 입력해주세요.' });
    }

    const users = await readDataFile(DATA_FILE);
    
    // 닉네임 중복 확인
    if (users.find(u => u.nickname === nickname)) {
      return res.status(400).json({ error: '이미 사용 중인 닉네임입니다.' });
    }

    // 전화번호 중복 확인
    if (users.find(u => u.phone === phone)) {
      return res.status(400).json({ error: '이미 등록된 전화번호입니다.' });
    }

    const newUser = {
      nickname,
      phone,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await writeDataFile(DATA_FILE, users);
    
    res.json({ 
      success: true, 
      message: '회원가입이 완료되었습니다!',
      user: { nickname, phone }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 사용자 로그인
app.post('/api/login', async (req, res) => {
  try {
    const { nickname, phone } = req.body;
    
    if (!nickname || !phone) {
      return res.status(400).json({ error: '닉네임과 전화번호를 모두 입력해주세요.' });
    }

    const users = await readDataFile(DATA_FILE);
    const user = users.find(u => u.nickname === nickname && u.phone === phone);
    
    if (!user) {
      return res.status(400).json({ error: '닉네임 또는 전화번호가 올바르지 않습니다.' });
    }

    res.json({ 
      success: true, 
      message: '로그인되었습니다!',
      user: { nickname: user.nickname, phone: user.phone }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 점수 저장
app.post('/api/scores', async (req, res) => {
  try {
    const { nickname, gameType, score } = req.body;
    
    if (!nickname || !gameType || score === undefined) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    const scores = await readDataFile(SCORES_FILE);
    
    if (!scores[nickname]) {
      scores[nickname] = {};
    }
    
    if (!scores[nickname][gameType]) {
      scores[nickname][gameType] = [];
    }
    
    scores[nickname][gameType].push({
      score,
      timestamp: new Date().toISOString()
    });

    await writeDataFile(SCORES_FILE, scores);
    
    res.json({ success: true, message: '점수가 저장되었습니다!' });
  } catch (error) {
    console.error('Save score error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 점수 조회
app.get('/api/scores/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params;
    const scores = await readDataFile(SCORES_FILE);
    
    res.json({ 
      success: true, 
      scores: scores[nickname] || {} 
    });
  } catch (error) {
    console.error('Get scores error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 전체 점수 조회 (랭킹용)
app.get('/api/scores', async (req, res) => {
  try {
    const scores = await readDataFile(SCORES_FILE);
    res.json({ 
      success: true, 
      scores: scores 
    });
  } catch (error) {
    console.error('Get all scores error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 점수 삭제
app.delete('/api/scores/:nickname', async (req, res) => {
  try {
    const { nickname } = req.params;
    const scores = await readDataFile(SCORES_FILE);
    
    if (scores[nickname]) {
      delete scores[nickname];
      await writeDataFile(SCORES_FILE, scores);
    }
    
    res.json({ success: true, message: '점수 기록이 삭제되었습니다.' });
  } catch (error) {
    console.error('Delete scores error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Greeeen 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`http://localhost:${PORT}`);
}); 
