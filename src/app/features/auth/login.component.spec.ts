import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { AuthResponse, OtpChallenge, OtpPurpose } from '../../core/auth/models/auth.models';
import { LoginComponent } from './login.component';

describe('Platform LoginComponent OTP flow', () => {
  let component: LoginComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const challenge: OtpChallenge = {
    challengeId: '631c0453-42a9-441f-a985-fcf9b67bf9f3',
    purpose: OtpPurpose.PlatformAdminLogin,
    expiresAtUtc: new Date(Date.now() + 300_000).toISOString(),
    resendAvailableAtUtc: new Date(Date.now() + 60_000).toISOString(),
    maskedPhoneNumber: '+20***678',
  };

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['requestLoginOtp', 'verifyLoginOtp']);
    auth.requestLoginOtp.and.returnValue(of(challenge));
    auth.verifyLoginOtp.and.returnValue(of({} as AuthResponse));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });
    component = TestBed.runInInjectionContext(() => new LoginComponent());
  });

  afterEach(() => component.ngOnDestroy());

  it('does not navigate or create a session after password verification alone', () => {
    component.form.setValue({ email: 'admin@logicfit.test', password: 'Password1' });

    component.submitCredentials();

    expect(component.challenge()).toEqual(challenge);
    expect(auth.verifyLoginOtp).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('issues the platform session only through the OTP verification endpoint', () => {
    component.form.setValue({ email: 'admin@logicfit.test', password: 'Password1' });
    component.submitCredentials();
    component.otpForm.setValue({ code: '1234' });

    component.verifyOtp();

    expect(auth.verifyLoginOtp).toHaveBeenCalledWith(
      challenge.challengeId, '1234', jasmine.any(String));
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('detects Caps Lock from a keyboard event', () => {
    component.detectCaps({
      getModifierState: (key: string) => key === 'CapsLock',
    } as unknown as KeyboardEvent);

    expect(component.capsLock()).toBeTrue();
  });

  it('ignores synthetic events that do not implement getModifierState', () => {
    component.capsLock.set(true);

    expect(() => component.detectCaps(new Event('keyup'))).not.toThrow();
    expect(component.capsLock()).toBeTrue();
  });
});
