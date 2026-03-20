import { useState, useEffect } from 'react';
import type { Application, MeInfo } from '../types/application';
import { getApplications, getMeInfo } from '../api/applications';

export default function MyApplications() {
  const [meInfo, setMeInfo] = useState<MeInfo | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const info = await getMeInfo();
        setMeInfo(info);
        const all = await getApplications();
        setApplications(all.filter((app) => app.name === info.name));
      } catch {
        alert(
          '하이웍스에 로그인되어 있지 않습니다.\n' +
          'office.hiworks.com에 먼저 로그인해주세요.'
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page-container">
      <div className="admin-card">
        <h1 className="form-title">내 신청 내역</h1>
        <p className="form-subtitle">
          {meInfo ? `${meInfo.name}님의 주차권 신청 내역입니다.` : '로그인 정보를 확인 중입니다.'}
        </p>

        {loading ? (
          <div className="loading">불러오는 중...</div>
        ) : applications.length === 0 ? (
          <div className="empty-state">신청 내역이 없습니다.</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>분기</th>
                  <th>신청구분</th>
                  <th>차량번호</th>
                  <th>차종</th>
                  <th>주소</th>
                  <th>거리(km)</th>
                  <th>신청일</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.quarter}</td>
                    <td>
                      <span className={`badge ${app.applicationType === '정기' ? 'badge-primary' : 'badge-secondary'}`}>
                        {app.applicationType}
                      </span>
                    </td>
                    <td>{app.vehicleNumber}</td>
                    <td>
                      <span className={`badge ${app.fuelType === '친환경' ? 'badge-green' : 'badge-gray'}`}>
                        {app.fuelType}
                      </span>
                    </td>
                    <td className="address-cell">{app.address}</td>
                    <td>{app.distanceKm}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString('ko-KR')}</td>
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
