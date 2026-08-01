import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OtpStepUpDialogComponent } from './core/auth/components/otp-step-up-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OtpStepUpDialogComponent],
  template: '<router-outlet></router-outlet><app-otp-step-up-dialog />',
})
export class AppComponent {}
