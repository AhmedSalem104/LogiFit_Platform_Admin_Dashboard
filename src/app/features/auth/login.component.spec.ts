import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../core/auth/services/auth.service';
import { AuthResponse } from '../../core/auth/models/auth.models';

describe('Platform LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let auth: jasmine.SpyObj<AuthService>;

  const response = { accessToken: 'token' } as AuthResponse;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    auth.login.and.returnValue(of(response));
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('submits email and password directly to the platform login endpoint', () => {
    component.form.setValue({ email: 'admin@example.com', password: 'Password1!' });
    component.submit();

    expect(auth.login).toHaveBeenCalledWith({ email: 'admin@example.com', password: 'Password1!' });
  });

  it('does not expose an OTP step or development fixed code', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).not.toContain('OTP');
    expect(text).not.toContain('1234');
  });

  it('shows a safe error when password login fails', () => {
    auth.login.and.returnValue(throwError(() => ({ error: { message: 'Invalid credentials' } })));
    component.form.setValue({ email: 'admin@example.com', password: 'bad' });
    component.submit();

    expect(component.error()).toContain('Invalid credentials');
  });
});
