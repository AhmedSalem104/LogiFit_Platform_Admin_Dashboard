import { environment } from './environment.prod';

describe('production environment', () => {
  it('does not include development authentication bypass settings', () => {
    expect(environment.production).toBeTrue();
    expect(Object.prototype.hasOwnProperty.call(environment, 'otpDevelopmentHint')).toBeFalse();
  });
});
