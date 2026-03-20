import { Router, Request, Response } from 'express';
import { fetchHiworksUser } from '../services/hiworksService';

const router = Router();

/**
 * POST /api/auth/hiworks
 * 클라이언트에서 전달받은 하이웍스 세션 쿠키로 사용자 정보를 조회한다.
 */
router.post('/hiworks', async (req: Request, res: Response) => {
  const { sessionCookie } = req.body;

  if (!sessionCookie) {
    return res.status(400).json({ error: '하이웍스 세션 쿠키가 필요합니다.' });
  }

  try {
    const user = await fetchHiworksUser(sessionCookie);
    res.json(user);
  } catch (error: any) {
    console.error('Hiworks auth failed:', error.message);
    res.status(401).json({ error: '하이웍스 인증에 실패했습니다. 하이웍스에 로그인 후 다시 시도해주세요.' });
  }
});

export default router;
