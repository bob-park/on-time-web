import ky from 'ky';

const api = ky.extend({
  hooks: {
    afterResponse: [
      (request, options, response) => {
        // 401 Unauthorized 인 경우 로그인 페이지로 이동
        if (response.status === 401) {
          location.href = '/api/oauth2/authorization/keyflow-auth';
        }
      },
    ],
  },
});

export default api;
