import { useAuth } from '../contexts/AuthContext';
import { Card } from '@mantine/core';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { accountInfo, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="page-container">
        <Card shadow="sm" padding="xl" radius="md" withBorder style={{ maxWidth: 640, margin: '0 auto' }}>
          <p className="form-subtitle">하이웍스 로그인 확인 중...</p>
        </Card>
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="page-container">
        <Card shadow="sm" padding="xl" radius="md" withBorder style={{ maxWidth: 640, margin: '0 auto' }}>
          <h1 className="form-title">로그인 필요</h1>
          <p className="form-subtitle">이 페이지는 하이웍스 로그인이 필요합니다.</p>
          <p className="field-hint">
            하이웍스에 로그인한 후 이 페이지를 새로고침해주세요.
          </p>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
