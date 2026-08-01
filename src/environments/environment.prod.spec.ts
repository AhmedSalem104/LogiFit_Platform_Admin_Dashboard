import { environment } from './environment.prod';

describe('temporary hosted OTP configuration', () => {
  it('shows the reviewed temporary code while Issue #127 is active', () => {
    expect(environment.production).toBeTrue();
    expect(environment.otpDevelopmentHint).toContain('1234');
  });
});
