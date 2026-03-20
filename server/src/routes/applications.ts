import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import { getDatabase } from '../db/database';
import { generateExcel } from '../services/excelService';

const router = Router();

// Validation rules for application submission (camelCase from client)
const applicationValidation = [
  body('quarter').notEmpty().withMessage('분기를 선택해주세요.'),
  body('applicationType').notEmpty().withMessage('신청구분을 선택해주세요.'),
  body('name').notEmpty().trim().withMessage('성명을 입력해주세요.'),
  body('department').notEmpty().trim().withMessage('부서명을 입력해주세요.'),
  body('contact').notEmpty().trim().withMessage('연락처를 입력해주세요.'),
  body('vehicleNumber').notEmpty().trim().withMessage('차량번호를 입력해주세요.'),
  body('vehicleType').notEmpty().trim().withMessage('차종을 입력해주세요.'),
  body('fuelType').notEmpty().trim().withMessage('연료구분을 선택해주세요.'),
  body('address').notEmpty().trim().withMessage('주소를 입력해주세요.'),
  body('distanceKm').isFloat({ min: 0 }).withMessage('거리(km)를 올바르게 입력해주세요.'),
  body('privacyAgreed').isBoolean().withMessage('개인정보 동의 여부를 선택해주세요.'),
];

// POST /api/applications - 신청서 제출
router.post('/', applicationValidation, (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const db = getDatabase();
  const {
    quarter,
    applicationType,
    name,
    department,
    contact,
    vehicleNumber,
    vehicleType,
    fuelType,
    address,
    distanceKm,
    privacyAgreed,
  } = req.body;

  try {
    // 현재 월 기준 신청 가능 분기 검증
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let expectedQuarter: string | null = null;
    switch (month) {
      case 12: expectedQuarter = `${year + 1}-Q1`; break;
      case 3:  expectedQuarter = `${year}-Q2`; break;
      case 6:  expectedQuarter = `${year}-Q3`; break;
      case 9:  expectedQuarter = `${year}-Q4`; break;
    }
    if (!expectedQuarter || quarter !== expectedQuarter) {
      return res.status(400).json({ error: '현재 신청 가능한 분기가 아닙니다.' });
    }

    const stmt = db.prepare(`
      INSERT INTO applications (quarter, application_type, name, department, contact, vehicle_number, vehicle_type, fuel_type, address, distance_km, privacy_agreed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      quarter,
      applicationType,
      name,
      department,
      contact,
      vehicleNumber,
      vehicleType,
      fuelType,
      address,
      distanceKm,
      privacyAgreed ? 1 : 0
    );

    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(application);
  } catch (error) {
    console.error('Failed to create application:', error);
    res.status(500).json({ error: '신청서 저장에 실패했습니다.' });
  }
});

// GET /api/applications - 목록 조회
router.get('/', (req: Request, res: Response) => {
  const db = getDatabase();
  const { quarter } = req.query;

  try {
    let applications;
    if (quarter) {
      applications = db.prepare('SELECT * FROM applications WHERE quarter = ? ORDER BY created_at DESC').all(quarter);
    } else {
      applications = db.prepare('SELECT * FROM applications ORDER BY created_at DESC').all();
    }
    res.json(applications);
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({ error: '목록 조회에 실패했습니다.' });
  }
});

// GET /api/applications/export - 엑셀 다운로드 (must be before /:id)
router.get('/export', async (req: Request, res: Response) => {
  const db = getDatabase();
  const { quarter } = req.query;

  if (!quarter || typeof quarter !== 'string') {
    return res.status(400).json({ error: '분기(quarter) 파라미터가 필요합니다.' });
  }

  try {
    const applications = db.prepare(
      'SELECT * FROM applications WHERE quarter = ? ORDER BY created_at ASC'
    ).all(quarter) as any[];

    await generateExcel(applications, quarter, res);
  } catch (error) {
    console.error('Failed to export Excel:', error);
    res.status(500).json({ error: '엑셀 다운로드에 실패했습니다.' });
  }
});

// GET /api/applications/:id - 상세 조회
router.get('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
    if (!application) {
      return res.status(404).json({ error: '신청서를 찾을 수 없습니다.' });
    }
    res.json(application);
  } catch (error) {
    console.error('Failed to fetch application:', error);
    res.status(500).json({ error: '상세 조회에 실패했습니다.' });
  }
});

// DELETE /api/applications/:id - 삭제
router.delete('/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    const result = db.prepare('DELETE FROM applications WHERE id = ?').run(id);
    if (result.changes === 0) {
      return res.status(404).json({ error: '신청서를 찾을 수 없습니다.' });
    }
    res.json({ message: '삭제되었습니다.' });
  } catch (error) {
    console.error('Failed to delete application:', error);
    res.status(500).json({ error: '삭제에 실패했습니다.' });
  }
});

export default router;
