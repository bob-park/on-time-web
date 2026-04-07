import ky from 'ky';

const index = ky.extend({
  retry: {
    limit: 2,
    statusCodes: [408, 500, 502, 503, 504],
  },
  hooks: {
    afterResponse: [
      (request, options, response) => {
        // 401 Unauthorized 인 경우 로그인 페이지로 이동
        if (response.status === 401) {
          location.href = '/api/oauth2/authorization/keyflow-auth';
        }

        // 403 Forbidden 인 경우 forbidden 페이지로 이동
        if (response.status === 403) {
          location.href = '/forbidden';
        }
      },
    ],
  },
});

export default index;
