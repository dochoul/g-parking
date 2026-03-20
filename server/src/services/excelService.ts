import ExcelJS from 'exceljs';
import { Response } from 'express';

interface ApplicationRow {
  id: number;
  quarter: string;
  application_type: string;
  name: string;
  department: string;
  contact: string;
  vehicle_number: string;
  vehicle_type: string;
  fuel_type: string;
  address: string;
  distance_km: number;
  privacy_agreed: number;
  created_at: string;
  updated_at: string;
}

const COLUMNS = [
  { header: '신청구분', key: 'application_type', width: 12 },
  { header: '성명', key: 'name', width: 10 },
  { header: '부서명', key: 'department', width: 15 },
  { header: '연락처', key: 'contact', width: 15 },
  { header: '차량번호', key: 'vehicle_number', width: 14 },
  { header: '차종', key: 'vehicle_type', width: 12 },
  { header: '연료구분', key: 'fuel_type', width: 10 },
  { header: '주소', key: 'address', width: 40 },
  { header: '거리(km)', key: 'distance_km', width: 12 },
  { header: '개인정보동의', key: 'privacy_agreed_text', width: 14 },
  { header: '신청일', key: 'created_at', width: 20 },
];

function parseQuarterForFilename(quarter: string): string {
  // quarter format: "2026-Q2"
  const match = quarter.match(/^(\d{4})-Q(\d)$/);
  if (match) {
    return `주차권신청_${match[1]}년_${match[2]}분기.xlsx`;
  }
  return `주차권신청_${quarter}.xlsx`;
}

export async function generateExcel(applications: ApplicationRow[], quarter: string, res: Response): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Gabia Parking System';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('주차권 신청 목록');

  worksheet.columns = COLUMNS;

  // Header styling
  const headerRow = worksheet.getRow(1);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      size: 11,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true,
    };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Data rows
  for (const app of applications) {
    const row = worksheet.addRow({
      application_type: app.application_type,
      name: app.name,
      department: app.department,
      contact: app.contact,
      vehicle_number: app.vehicle_number,
      vehicle_type: app.vehicle_type,
      fuel_type: app.fuel_type,
      address: app.address,
      distance_km: app.distance_km,
      privacy_agreed_text: app.privacy_agreed ? '동의' : '미동의',
      created_at: app.created_at,
    });

    row.eachCell((cell) => {
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center',
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    // Left-align address column
    const addressCell = row.getCell('address');
    addressCell.alignment = { vertical: 'middle', horizontal: 'left' };
  }

  // Auto-adjust column widths based on content
  worksheet.columns.forEach((column) => {
    if (!column.values) return;
    let maxLength = column.width || 10;
    column.values.forEach((value) => {
      if (value) {
        const length = String(value).length + 2;
        if (length > maxLength) {
          maxLength = length;
        }
      }
    });
    column.width = maxLength;
  });

  const filename = parseQuarterForFilename(quarter);
  const encodedFilename = encodeURIComponent(filename);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodedFilename}`);

  await workbook.xlsx.write(res);
  res.end();
}
