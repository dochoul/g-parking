import axios from 'axios';
import type { Application, ApplicationForm, Quarter, MeInfo, AccountMeInfo } from '../types/application';

const api = axios.create({
  baseURL: '/api',
});

/**
 * 하이웍스 cache-api 프록시 인스턴스
 * Vite 프록시를 통해 same-origin으로 요청 → 브라우저가 .hiworks.com 쿠키를 자동 전달
 * → 프록시가 쿠키 포함하여 cache-api.gabiaoffice.hiworks.com으로 전달
 */
const cacheApi = axios.create({
  baseURL: '/hiworks-api',
  withCredentials: true,
});

export async function getApplications(quarter?: string): Promise<Application[]> {
  const params = quarter ? { quarter } : {};
  const response = await api.get<Application[]>('/applications', { params });
  return response.data;
}

export async function createApplication(data: ApplicationForm): Promise<Application> {
  const response = await api.post<Application>('/applications', data);
  return response.data;
}

export async function deleteApplication(id: number): Promise<void> {
  await api.delete(`/applications/${id}`);
}

export async function exportExcel(quarter?: string): Promise<void> {
  const params = quarter ? { quarter } : {};
  const response = await api.get('/applications/export/excel', {
    params,
    responseType: 'blob',
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `주차권_신청_목록_${quarter || '전체'}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getQuarters(): Promise<Quarter[]> {
  const response = await api.get<Quarter[]>('/quarters');
  return response.data;
}

export async function createQuarter(data: Omit<Quarter, 'id' | 'createdAt'>): Promise<Quarter> {
  const response = await api.post<Quarter>('/quarters', data);
  return response.data;
}

/**
 * 하이웍스 cache-api /me 엔드포인트를 직접 호출하여 로그인된 사용자 정보를 가져온다.
 * *.hiworks.com 도메인에서 실행되어야 세션 쿠키가 자동 전달된다.
 */
export async function getMeInfo(): Promise<MeInfo> {
  const { data } = await cacheApi.get<{ data: MeInfo }>('/me');
  return data.data;
}

/**
 * 하이웍스 account-api /accounts/me 엔드포인트에서 부서 정보를 가져온다.
 */
const accountApi = axios.create({
  baseURL: '/account-api',
  withCredentials: true,
});

export async function getDistance(address: string): Promise<number> {
  const { data } = await api.get<{ distanceKm: number }>('/kakao/distance', { params: { address } });
  return data.distanceKm;
}

export async function getAccountMeInfo(): Promise<AccountMeInfo> {
  const { data } = await accountApi.get<{ data: AccountMeInfo }>('/accounts/me');
  return data.data ?? data as unknown as AccountMeInfo;
}
