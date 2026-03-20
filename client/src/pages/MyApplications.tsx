import { useQuery } from '@tanstack/react-query';
import { getApplications } from '../api/applications';
import { useAuth } from '../contexts/AuthContext';

export default function MyApplications() {
  const { accountInfo } = useAuth();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplications(),
    select: (all) => all.filter((app) => app.name === accountInfo?.name),
    enabled: !!accountInfo,
  });

  return (
    <div className="page-container">
      <div className="admin-card">
        <h1 className="form-title">내 신청 내역</h1>
        <p className="form-subtitle">
          {accountInfo ? `${accountInfo.name}님의 주차권 신청 내역입니다.` : '로그인 정보를 확인 중입니다.'}
        </p>

        {isLoading ? (
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
