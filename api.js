const { getStore, setStore } = require('@netlify/functions');

exports.handler = async (event, context) => {
  // CORS 헤더 설정
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const { path, httpMethod, body } = event;
    
    // API 경로 파싱
    const pathParts = path.replace('/.netlify/functions/api/', '').split('/');
    const endpoint = pathParts[0];
    const param = pathParts[1];

    // POST 요청 처리
    if (httpMethod === 'POST') {
      const data = JSON.parse(body || '{}');

      // 회원가입
      if (endpoint === 'register') {
        const { nickname, phone } = data;
        
        if (!nickname || !phone) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: '닉네임과 전화번호를 모두 입력해주세요.' })
          };
        }

        // 기존 사용자 목록 가져오기
        const users = await getStore('users') || [];
        
        // 중복 체크
        const existingUser = users.find(u => u.nickname === nickname || u.phone === phone);
        
        if (existingUser) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: '이미 등록된 닉네임 또는 전화번호입니다.' })
          };
        }

        const newUser = {
          nickname,
          phone,
          createdAt: new Date().toISOString()
        };

        users.push(newUser);
        await setStore('users', users);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: '회원가입이 완료되었습니다!',
            user: { nickname, phone }
          })
        };
      }

      // 로그인
      if (endpoint === 'login') {
        const { nickname, phone } = data;
        
        if (!nickname || !phone) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: '닉네임과 전화번호를 모두 입력해주세요.' })
          };
        }

        const users = await getStore('users') || [];
        const user = users.find(u => u.nickname === nickname && u.phone === phone);
        
        if (!user) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: '닉네임 또는 전화번호가 올바르지 않습니다.' })
          };
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            message: '로그인되었습니다!',
            user: { nickname: user.nickname, phone: user.phone }
          })
        };
      }

      // 점수 저장
      if (endpoint === 'scores') {
        const { nickname, gameType, score } = data;
        
        if (!nickname || !gameType || score === undefined) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: '필수 정보가 누락되었습니다.' })
          };
        }

        const scores = await getStore('scores') || [];
        
        const scoreRecord = {
          nickname,
          gameType,
          score,
          timestamp: new Date().toISOString()
        };

        scores.push(scoreRecord);
        await setStore('scores', scores);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: '점수가 저장되었습니다!' })
        };
      }
    }

    // GET 요청 처리
    if (httpMethod === 'GET') {
      const scores = await getStore('scores') || [];

      // 특정 사용자 점수 조회
      if (endpoint === 'scores' && param) {
        const userScores = scores.filter(s => s.nickname === param);
        
        // 게임별로 그룹화
        const groupedScores = {};
        userScores.forEach(score => {
          if (!groupedScores[score.gameType]) {
            groupedScores[score.gameType] = [];
          }
          groupedScores[score.gameType].push(score);
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            scores: groupedScores 
          })
        };
      }

      // 전체 점수 조회 (랭킹용)
      if (endpoint === 'scores') {
        // 게임별로 그룹화하고 상위 기록만 반환
        const groupedScores = {};
        scores.forEach(score => {
          if (!groupedScores[score.gameType]) {
            groupedScores[score.gameType] = [];
          }
          groupedScores[score.gameType].push(score);
        });

        // 각 게임별로 점수 순 정렬
        Object.keys(groupedScores).forEach(gameType => {
          groupedScores[gameType].sort((a, b) => b.score - a.score);
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            scores: groupedScores 
          })
        };
      }
    }

    // DELETE 요청 처리
    if (httpMethod === 'DELETE' && endpoint === 'scores' && param) {
      const scores = await getStore('scores') || [];
      const filteredScores = scores.filter(s => s.nickname !== param);
      await setStore('scores', filteredScores);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: '점수 기록이 삭제되었습니다.' })
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'API 엔드포인트를 찾을 수 없습니다.' })
    };

  } catch (error) {
    console.error('API Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: '서버 오류가 발생했습니다.' })
    };
  }
}; 
