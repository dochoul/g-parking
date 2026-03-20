import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../db/database';
import { getAllQuarters, createQuarter } from '../db/quarters';

const router = Router();

// GET /api/quarters - 분기 목록
router.get('/', (_req: Request, res: Response) => {
  try {
    const quarters = getAllQuarters().map((q) => ({
      id: q.id,
      name: q.name,
      startDate: q.start_date,
      endDate: q.end_date,
      isActive: !!q.is_active,
      createdAt: q.created_at,
    }));
    res.json(quarters);
  } catch (error) {
    console.error('Failed to fetch quarters:', error);
    res.status(500).json({ error: '분기 목록 조회에 실패했습니다.' });
  }
});

// POST /api/quarters - 분기 생성
const quarterValidation = [
  body('name').notEmpty().matches(/^\d{4}-Q[1-4]$/).withMessage('분기 형식이 올바르지 않습니다. (예: 2026-Q2)'),
];

router.post('/', quarterValidation, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const name = req.body.name;
  const start_date = req.body.start_date || req.body.startDate;
  const end_date = req.body.end_date || req.body.endDate;
  const is_active = req.body.is_active ?? req.body.isActive ?? false;

  if (!start_date || !end_date) {
    return res.status(400).json({ error: '시작일과 종료일을 입력해주세요.' });
  }

  try {
    const quarter = createQuarter(name, start_date, end_date, is_active ?? false);
    res.status(201).json(quarter);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: '이미 존재하는 분기입니다.' });
    }
    console.error('Failed to create quarter:', error);
    res.status(500).json({ error: '분기 생성에 실패했습니다.' });
  }
});

// PATCH /api/quarters/:id/activate - 분기 활성화
router.patch('/:id/activate', (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const { id } = req.params;

    const quarter = db.prepare('SELECT * FROM quarters WHERE id = ?').get(id);
    if (!quarter) {
      return res.status(404).json({ error: '분기를 찾을 수 없습니다.' });
    }

    db.prepare('UPDATE quarters SET is_active = 0 WHERE is_active = 1').run();
    db.prepare('UPDATE quarters SET is_active = 1 WHERE id = ?').run(id);

    const updated = db.prepare('SELECT * FROM quarters WHERE id = ?').get(id);
    res.json(updated);
  } catch (error) {
    console.error('Failed to activate quarter:', error);
    res.status(500).json({ error: '분기 활성화에 실패했습니다.' });
  }
});

export default router;
