import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ApplicationForm as ApplicationFormType, ApplicationType, FuelType, MeInfo } from '../types/application';
import { createApplication, getMeInfo, getAccountMeInfo, getDistance } from '../api/applications';

/** 현재 월 기준 신청 분기 계산. 신청 기간이 아니면 null 반환 */
function getCurrentQuarter(): string | null {
  const now = new Date();
  const month = now.getMonth() + 1; // 1~12
  const year = now.getFullYear();

  switch (month) {
    case 12: return `${year + 1}-Q1`;
    case 3:  return `${year}-Q2`;
    case 6:  return `${year}-Q3`;
    case 9:  return `${year}-Q4`;
    default: return null;
  }
}

export default function ApplicationForm() {
  const navigate = useNavigate();
  const currentQuarter = getCurrentQuarter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [meInfo, setMeInfo] = useState<MeInfo | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const [form, setForm] = useState<ApplicationFormType>({
    quarter: currentQuarter || '',
    applicationType: '정기',
    name: '',
    department: '',
    contact: '',
    vehicleNumber: '',
    vehicleType: '',
    fuelType: '일반',
    address: '',
    distanceKm: 0,
    privacyAgreed: false,
  });

  // 페이지 로드 시 하이웍스 로그인 상태 자동 확인
  useEffect(() => {
    getMeInfo()
      .then((info) => {
        setMeInfo(info);
        setForm((prev) => ({
          ...prev,
          name: info.name || prev.name,
        }));
      })
      .catch(() => {
        alert(
          '하이웍스에 로그인되어 있지 않습니다.\n' +
          'office.hiworks.com에 먼저 로그인해주세요.'
        );
      })
      .finally(() => {
        setIsLoadingUser(false);
      });

    // account-api에서 부서/주소/연락처 가져오기
    getAccountMeInfo()
      .then((accountInfo) => {
        setForm((prev) => ({
          ...prev,
          ...(accountInfo.nodes?.length > 0 && {
            department: accountInfo.nodes[0].full_name.split('|').join(' → '),
          }),
          ...(accountInfo.address && { address: accountInfo.address }),
          ...(accountInfo.cell && { contact: accountInfo.cell }),
        }));
        // 주소가 있으면 거리 자동 계산
        if (accountInfo.address) {
          setIsCalculatingDistance(true);
          getDistance(accountInfo.address)
            .then((km) => {
              setForm((prev) => ({ ...prev, distanceKm: km }));
            })
            .catch(() => {})
            .finally(() => setIsCalculatingDistance(false));
        }
      })
      .catch(() => {
        // 부서 정보를 가져오지 못해도 수동 입력 가능
      });
  }, []);


  function validate(): Record<string, string> {
    const newErrors: Record<string, string> = {};

    if (!form.quarter) newErrors.quarter = '분기를 선택해주세요.';
    if (!form.name.trim()) newErrors.name = '성명을 입력해주세요.';
    if (!form.department.trim()) newErrors.department = '부서명을 입력해주세요.';
    if (!form.contact.trim()) newErrors.contact = '연락처를 입력해주세요.';
    if (!form.vehicleNumber.trim()) newErrors.vehicleNumber = '차량번호를 입력해주세요.';
    if (!form.address.trim()) newErrors.address = '주소를 입력해주세요.';
    if (form.distanceKm <= 0) newErrors.distanceKm = '거리를 입력해주세요.';
    if (!form.privacyAgreed) newErrors.privacyAgreed = '개인정보 수집/이용에 동의해주세요.';

    return newErrors;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await createApplication({ ...form, vehicleType: form.fuelType });
      alert('주차권 신청이 완료되었습니다.');
      navigate('/my');
    } catch {
      alert('신청 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof ApplicationFormType>(key: K, value: ApplicationFormType[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  }

  if (!currentQuarter) {
    return (
      <div className="page-container">
        <div className="form-card">
          <h1 className="form-title">주차권 신청</h1>
          <p className="form-subtitle">현재는 주차권 신청 기간이 아닙니다.</p>
          <p className="field-hint">주차권 신청은 3월, 6월, 9월, 12월에만 가능합니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="form-card">
        <h1 className="form-title">주차권 신청</h1>
        <p className="form-subtitle">Gabia @ 주차권 신청 양식입니다.</p>

        {/* 하이웍스 로그인 상태 */}
        <div className="hiworks-login-section">
          {isLoadingUser ? (
            <p className="hiworks-hint">하이웍스 로그인 확인 중...</p>
          ) : meInfo ? (
            <div className="hiworks-user-info">
              <span className="hiworks-badge">하이웍스 인증 완료</span>
              <span>{meInfo.name}</span>
            </div>
          ) : (
            <div className="hiworks-not-logged-in">
              <p className="hiworks-warning">하이웍스에 로그인되어 있지 않습니다.</p>
              <p className="hiworks-hint">
                <a href="https://office.hiworks.com" target="_blank" rel="noopener noreferrer">
                  하이웍스 로그인
                </a>
                {' '}후 이 페이지를 새로고침해주세요.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* 분기 */}
          <div className="form-group">
            <label className="form-label">신청 분기</label>
            <input
              type="text"
              className="form-input"
              value={form.quarter}
              readOnly
            />
          </div>

          {/* 신청구분 */}
          <div className="form-group">
            <label className="form-label">신청구분 <span className="required">*</span></label>
            <div className="radio-group">
              {(['정기', '일주차'] as ApplicationType[]).map((type) => (
                <label key={type} className="radio-label">
                  <input
                    type="radio"
                    name="applicationType"
                    value={type}
                    checked={form.applicationType === type}
                    onChange={() => updateField('applicationType', type)}
                  />
                  <span>{type === '일주차' ? '일주차(웹할인)' : type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 성명 */}
          <div className="form-group">
            <label className="form-label">성명 <span className="required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'input-error' : ''}`}
              placeholder="성명을 입력해주세요"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              readOnly={!!meInfo?.name}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* 부서명 */}
          <div className="form-group">
            <label className="form-label">부서명 <span className="required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.department ? 'input-error' : ''}`}
              placeholder="부서명을 입력해주세요"
              value={form.department}
              onChange={(e) => updateField('department', e.target.value)}
            />
            {errors.department && <span className="error-text">{errors.department}</span>}
          </div>

          {/* 연락처 */}
          <div className="form-group">
            <label className="form-label">연락처 <span className="required">*</span></label>
            <input
              type="tel"
              className={`form-input ${errors.contact ? 'input-error' : ''}`}
              placeholder="010-0000-0000"
              value={form.contact}
              onChange={(e) => updateField('contact', e.target.value)}
            />
            {errors.contact && <span className="error-text">{errors.contact}</span>}
          </div>

          {/* 차량번호 */}
          <div className="form-group">
            <label className="form-label">차량번호 <span className="required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.vehicleNumber ? 'input-error' : ''}`}
              placeholder="12가 3456"
              value={form.vehicleNumber}
              onChange={(e) => updateField('vehicleNumber', e.target.value)}
            />
            {errors.vehicleNumber && <span className="error-text">{errors.vehicleNumber}</span>}
          </div>

          {/* 차종(연료구분) */}
          <div className="form-group">
            <label className="form-label">차종 <span className="required">*</span></label>
            <div className="radio-group">
              {(['일반', '친환경'] as FuelType[]).map((type) => (
                <label key={type} className="radio-label">
                  <input
                    type="radio"
                    name="fuelType"
                    value={type}
                    checked={form.fuelType === type}
                    onChange={() => updateField('fuelType', type)}
                  />
                  <span>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 주소 */}
          <div className="form-group">
            <label className="form-label">거주지 주소 <span className="required">*</span></label>
            <input
              type="text"
              className={`form-input ${errors.address ? 'input-error' : ''}`}
              placeholder="주소를 입력해주세요"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
            />
            <p className="field-hint">도착지: 과천시 과천대로7나길 34 가비아 앳</p>
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* 거리 */}
          <div className="form-group">
            <label className="form-label">거리 (km) <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                className={`form-input ${errors.distanceKm ? 'input-error' : ''}`}
                placeholder="카카오맵 최단거리 기준"
                value={form.distanceKm || ''}
                min={0}
                step={0.1}
                onChange={(e) => updateField('distanceKm', parseFloat(e.target.value) || 0)}
              />
              <button
                type="button"
                className="submit-button"
                style={{ whiteSpace: 'nowrap', padding: '0 16px', fontSize: '14px' }}
                disabled={!form.address.trim() || isCalculatingDistance}
                onClick={() => {
                  setIsCalculatingDistance(true);
                  getDistance(form.address)
                    .then((km) => updateField('distanceKm', km))
                    .catch(() => alert('거리 계산에 실패했습니다. 주소를 확인해주세요.'))
                    .finally(() => setIsCalculatingDistance(false));
                }}
              >
                {isCalculatingDistance ? '계산 중...' : '거리 계산'}
              </button>
            </div>
            <p className="field-hint">카카오맵 최단거리 기준으로 자동 계산됩니다.</p>
            {errors.distanceKm && <span className="error-text">{errors.distanceKm}</span>}
          </div>

          {/* 개인정보 동의 */}
          <div className="form-group">
            <div className="privacy-box">
              <h3>개인정보 수집/이용 동의</h3>
              <div className="privacy-content">
                <p><strong>수집항목:</strong> 성명, 부서명, 연락처, 차량번호, 차종(연료구분), 거주지 주소</p>
                <p><strong>수집목적:</strong> 정기주차권 등록, 일주차(웹할인) 서비스에 이용</p>
                <p><strong>보유기간:</strong> 정기주차 및 일주차(웹할인) 사용 종료 시까지</p>
              </div>
              <p className="privacy-notice">
                ※ 개인정보수집 동의를 거부할 권리가 있으며, 동의 거부 시 정기주차권 발급 또는 일주차(웹할인) 이용을 신청할 수 없습니다.
              </p>
              <label className={`checkbox-label ${errors.privacyAgreed ? 'checkbox-error' : ''}`}>
                <input
                  type="checkbox"
                  checked={form.privacyAgreed}
                  onChange={(e) => updateField('privacyAgreed', e.target.checked)}
                />
                <span>위 개인정보 수집/이용에 동의합니다.</span>
              </label>
              {errors.privacyAgreed && <span className="error-text">{errors.privacyAgreed}</span>}
            </div>
          </div>

          <button type="submit" className="submit-button" disabled={isSubmitting}>
            {isSubmitting ? '제출 중...' : '신청하기'}
          </button>
        </form>
      </div>
    </div>
  );
}
