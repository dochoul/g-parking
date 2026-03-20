import { useAuth } from '../contexts/AuthContext';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accountInfo, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="form-card">
          <p className="form-subtitle">하이웍스 로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="page-container">
        <div className="form-card">
          <h1 className="form-title">로그인 필요</h1>
          <p className="form-subtitle">이 페이지는 하이웍스 로그인이 필요합니다.</p>
          <p className="field-hint">
            하이웍스에 로그인한 후 이 페이지를 새로고침해주세요.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
