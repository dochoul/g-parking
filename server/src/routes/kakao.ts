import { Router, Request, Response } from 'express';
import https from 'https';

const router = Router();

const KAKAO_REST_API_KEY = '376712336ccfd46e37fd738cca2e94b2';


function kakaoGet(hostname: string, path: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname, path, method: 'GET', rejectUnauthorized: false, headers: { Authorization: `KakaoAK ${KAKAO_REST_API_KEY}` } },
      (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`Kakao API ${res.statusCode}: ${data}`));
          }
          resolve(data);
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Kakao API timeout')); });
    req.end();
  });
}

/** 주소 → 좌표 (주소 검색 → 실패 시 키워드 검색) */
async function geocode(address: string): Promise<{ lng: number; lat: number }> {
  const q = encodeURIComponent(address);
  const raw = await kakaoGet('dapi.kakao.com', `/v2/local/search/address.json?query=${q}`);
  const json = JSON.parse(raw);

  if (json.documents?.length > 0) {
    return { lng: parseFloat(json.documents[0].x), lat: parseFloat(json.documents[0].y) };
  }

  const rawKw = await kakaoGet('dapi.kakao.com', `/v2/local/search/keyword.json?query=${q}`);
  const kwJson = JSON.parse(rawKw);
  if (!kwJson.documents?.length) throw new Error('주소를 찾을 수 없습니다.');
  return { lng: parseFloat(kwJson.documents[0].x), lat: parseFloat(kwJson.documents[0].y) };
}

/**
 * GET /api/kakao/distance?address=주소
 * 사용자 주소 → 가비아 앳까지 자동차 최단거리(km)
 */
router.get('/distance', async (req: Request, res: Response) => {
  const { address } = req.query;
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: '주소를 입력해주세요.' });
  }

  try {
    // 1. 사용자 주소 → 좌표
    const origin = await geocode(address);

    // 2. 회사 좌표도 카카오 Geocoding으로 정확히 조회
    const dest = await geocode('경기도 과천시 과천대로7나길 34');

    // 3. Haversine 직선거리 + 도로 보정(x1.3)
    const R = 6371;
    const dLat = ((dest.lat - origin.lat) * Math.PI) / 180;
    const dLng = ((dest.lng - origin.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((origin.lat * Math.PI) / 180) *
        Math.cos((dest.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const distanceKm = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.3 * 10) / 10;

    res.json({ distanceKm });
  } catch (error: any) {
    console.error('Distance calc failed:', error.message);
    res.status(500).json({ error: error.message || '거리 계산에 실패했습니다.' });
  }
});

export default router;
