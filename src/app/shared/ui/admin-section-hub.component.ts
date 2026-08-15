import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from './page-header.component';
import { AuthService } from '../../core/auth/services/auth.service';
import { Permission } from '../../core/auth/models/auth.models';

export interface AdminHubCard {
  label: string;
  description: string;
  icon: string;
  route: string;
  permissions: Permission[];
}

export interface AdminHubDefinition {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  cards: AdminHubCard[];
}

@Component({
  selector: 'app-admin-section-hub',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  template: `
    <div class="lf-page">
      <app-page-header [title]="hub.title" [subtitle]="hub.subtitle" [icon]="hub.icon">
        <a routerLink="/dashboard" class="lf-btn lf-btn-secondary"><i class="pi pi-chart-bar"></i> لوحة المتابعة</a>
      </app-page-header>

      <section class="lf-card mb-6 flex items-start gap-3 border-r-4 border-r-primary-500 p-4">
        <i class="pi pi-sitemap mt-0.5 text-primary-600"></i>
        <div>
          <p class="m-0 text-sm font-bold text-slate-800">مركز موحد للوحدات المرتبطة</p>
          <p class="mb-0 mt-1 text-sm leading-6 text-slate-600">{{ hub.description }}</p>
        </div>
      </section>

      <section class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="الوحدات التابعة">
        @for (card of visibleCards(); track card.route) {
          <a [routerLink]="card.route" class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md">
            <div class="flex items-start justify-between gap-3">
              <span class="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600">
                <i [class]="card.icon" class="text-lg"></i>
              </span>
              <i class="pi pi-arrow-left text-slate-300 transition group-hover:-translate-x-1 group-hover:text-primary-500"></i>
            </div>
            <h2 class="mb-1 mt-4 text-base font-extrabold text-slate-800">{{ card.label }}</h2>
            <p class="m-0 min-h-12 text-sm leading-6 text-slate-500">{{ card.description }}</p>
            <span class="mt-4 inline-flex items-center gap-1 text-xs font-bold text-primary-700">فتح الوحدة <i class="pi pi-angle-left"></i></span>
          </a>
        }
      </section>

      @if (!visibleCards().length) {
        <section class="lf-card mt-5 p-8 text-center text-sm text-slate-500">لا توجد وحدات متاحة للصلاحيات الحالية.</section>
      }
    </div>
  `,
})
export class AdminSectionHubComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  readonly hub = this.route.snapshot.data['hub'] as AdminHubDefinition;
  readonly visibleCards = computed(() =>
    this.hub.cards.filter((card) => this.auth.hasAnyPermission(...card.permissions)),
  );
}
