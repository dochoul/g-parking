import { useState, useEffect, useCallback } from 'react';
import type { Application, Quarter } from '../types/application';
import { getApplications, getQuarters, deleteApplication, exportExcel } from '../api/applications';

export default function AdminPage() {
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('');
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuarters().then((data) => {
      setQuarters(data);
      const active = data.find((q) => q.isActive);
      if (active) {
        setSelectedQuarter(active.name);
      }
    });
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getApplications(selectedQuarter || undefined);
      setApplications(data);
    } catch {
      alert('신청 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedQuarter]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  async function handleDelete(id: number) {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await deleteApplication(id);
      setApplications((prev) => prev.filter((app) => app.id !== id));
    } catch {
      alert('삭제에 실패했습니다.');
    }
  }

  async function handleExport() {
    try {
      await exportExcel(selectedQuarter || undefined);
    } catch {
      alert('엑셀 다운로드에 실패했습니다.');
    }
  }

  return (
    <div className="page-container">
      <div className="admin-card">
        <h1 className="form-title">관리자 페이지</h1>
        <p className="form-subtitle">주차권 신청 현황을 관리합니다.</p>

        <div className="admin-toolbar">
          <div className="toolbar-left">
            <label className="form-label" htmlFor="quarter-select">분기 선택</label>
            <select
              id="quarter-select"
              className="form-input toolbar-select"
              value={selectedQuarter}
              onChange={(e) => setSelectedQuarter(e.target.value)}
            >
              <option value="">전체</option>
              {quarters.map((q) => (
                <option key={q.id} value={q.name}>{q.name}</option>
              ))}
            </select>
          </div>
          <div className="toolbar-right">
            <span className="application-count">
              총 {applications.length}건
            </span>
            <button className="export-button" onClick={handleExport}>
              엑셀 다운로드
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">신청 내역이 없습니다.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>분기</th>
                  <th>신청구분</th>
                  <th>성명</th>
                  <th>부서명</th>
                  <th>연락처</th>
                  <th>차량번호</th>
                  <th>차종</th>
                  <th>연료구분</th>
                  <th>주소</th>
                  <th>거리(km)</th>
                  <th>신청일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app, index) => (
                  <tr key={app.id}>
                    <td>{index + 1}</td>
                    <td>{app.quarter}</td>
                    <td>
                      <span className={`badge ${app.applicationType === '정기' ? 'badge-primary' : 'badge-secondary'}`}>
                        {app.applicationType}
                      </span>
                    </td>
                    <td>{app.name}</td>
                    <td>{app.department}</td>
                    <td>{app.contact}</td>
                    <td>{app.vehicleNumber}</td>
                    <td>{app.vehicleType}</td>
                    <td>
                      <span className={`badge ${app.fuelType === '친환경' ? 'badge-green' : 'badge-gray'}`}>
                        {app.fuelType}
                      </span>
                    </td>
                    <td className="address-cell">{app.address}</td>
                    <td>{app.distanceKm}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString('ko-KR')}</td>
                    <td>
                      <button
                        className="delete-button"
                        onClick={() => handleDelete(app.id)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
