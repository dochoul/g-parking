import https from 'https';

export interface HiworksUser {
  name: string;
  department: string;
  contact: string;
  email: string;
  userId: string;
}

/**
 * 하이웍스 cache-api에서 로그인된 사용자 정보를 가져온다.
 * 브라우저의 하이웍스 세션 쿠키를 그대로 전달하여 인증한다.
 */
export function fetchHiworksUser(sessionCookie: string): Promise<HiworksUser> {
  return new Promise((resolve, reject) => {
    const options: https.RequestOptions = {
      hostname: 'cache-api.gabiaoffice.hiworks.com',
      path: '/me',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie,
        'Accept': 'application/json',
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`Hiworks API responded with ${res.statusCode}`));
        }
        try {
          const json = JSON.parse(data);
          // 응답 구조에 맞게 매핑 (실제 API 응답에 따라 조정 필요)
          const user: HiworksUser = {
            name: json.name || json.user_name || '',
            department: json.department || json.dept_name || '',
            contact: json.mobile || json.phone || '',
            email: json.email || '',
            userId: json.user_id || json.id || '',
          };
          resolve(user);
        } catch {
          reject(new Error('Failed to parse Hiworks API response'));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Hiworks API request timed out'));
    });
    req.end();
  });
}
