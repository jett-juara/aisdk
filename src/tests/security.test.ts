// Placeholder security tests (not executed here)

describe('Security', () => {
  test('password requirements enforced (server schema)', () => {
    // TODO: call /api/auth/register with weak password and expect 400
  })

  test('account lockout after 5 failed attempts', () => {
    // TODO: perform 5 invalid logins to /api/auth/login and expect lockout 423
  })

  test('rate limiting triggers on repeated requests', () => {
    // TODO: hammer /api/auth/login from same IP and expect 429
  })

  test('session security – cookies are httpOnly', () => {
    // TODO: ensure sb-access-token is httpOnly and cannot be read by JS
  })
})

