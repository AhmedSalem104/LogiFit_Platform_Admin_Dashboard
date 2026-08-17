import { Injectable, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { ADMIN_ASSISTANT_GUIDES, AssistantAction, AssistantGuide } from './admin-assistant.catalog';

export interface AssistantSearchResult {
  title: string;
  description: string;
  icon: string;
  label: string;
  action: AssistantAction;
}

export type AssistantView = 'guide' | 'search';

/** Custom event used only to open an existing page form. It never performs a mutation by itself. */
export const ADMIN_ASSISTANT_COMMAND_EVENT = 'logicfit:assistant-command';

@Injectable({ providedIn: 'root' })
export class AdminAssistantService {
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);

  readonly isOpen = signal(false);
  readonly query = signal('');
  readonly view = signal<AssistantView>('guide');
  readonly currentPath = signal(this.cleanPath(this.router.url));

  readonly currentGuide = computed(() =>
    ADMIN_ASSISTANT_GUIDES.find((guide) => this.currentPath() === guide.route) ?? ADMIN_ASSISTANT_GUIDES[0],
  );

  readonly availableGuides = computed(() =>
    ADMIN_ASSISTANT_GUIDES.filter((guide) => this.isAllowed(guide.permissions)),
  );

  readonly searchResults = computed(() => {
    const term = normalize(this.query());
    const candidates: AssistantSearchResult[] = [];

    for (const guide of this.availableGuides()) {
      const pageAction: AssistantAction = {
        id: `page:${guide.route}`,
        title: guide.title,
        description: guide.summary,
        icon: guide.icon,
        keywords: guide.keywords,
        route: guide.route,
        permissions: guide.permissions,
        kind: 'navigate',
      };
      candidates.push({ title: guide.title, description: guide.summary, icon: guide.icon, label: 'صفحة', action: pageAction });
      for (const action of guide.quickActions) {
        if (this.isAllowed(action.permissions)) {
          candidates.push({ title: action.title, description: action.description, icon: action.icon, label: 'إجراء سريع', action });
        }
      }
    }

    const distinct = candidates.filter((candidate, index, all) =>
      all.findIndex((other) => other.action.id === candidate.action.id) === index,
    );
    if (!term) return distinct.slice(0, 12);

    return distinct
      .map((candidate) => ({ candidate, score: this.searchScore(candidate, term) }))
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score || left.candidate.title.localeCompare(right.candidate.title, 'ar'))
      .slice(0, 12)
      .map(({ candidate }) => candidate);
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentPath.set(this.cleanPath(event.urlAfterRedirects));
        this.query.set('');
      });
  }

  openGuide(): void {
    this.view.set('guide');
    this.isOpen.set(true);
    this.query.set('');
  }

  openSearch(): void {
    this.view.set('search');
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.query.set('');
  }

  setQuery(value: string): void {
    this.query.set(value ?? '');
  }

  setView(view: AssistantView): void {
    this.view.set(view);
  }

  isAllowed(permissions: readonly string[]): boolean {
    return this.auth.hasAnyPermission(...permissions as Parameters<AuthService['hasAnyPermission']>);
  }

  run(action: AssistantAction): void {
    // Never execute route/invoke values supplied by an arbitrary caller. The
    // search UI currently creates actions from the static catalog, but keeping
    // this boundary canonical also protects future integrations from prompt or
    // command injection and open-redirect style navigation.
    const safeAction = this.resolveCatalogAction(action);
    if (!safeAction || !this.isAllowed(safeAction.permissions)) return;

    if (safeAction.kind === 'refresh') {
      // A full reload deliberately uses the same authenticated session and is safe for read-only refresh actions.
      window.location.reload();
      return;
    }

    void this.router.navigateByUrl(safeAction.route).then(() => {
      this.close();
      if (safeAction.kind === 'invoke' && safeAction.invoke) {
        window.setTimeout(() => {
          window.dispatchEvent(new CustomEvent(ADMIN_ASSISTANT_COMMAND_EVENT, { detail: { command: safeAction.invoke } }));
        }, 80);
      }
    });
  }

  private resolveCatalogAction(action: AssistantAction | null | undefined): AssistantAction | null {
    if (!action?.id) return null;

    for (const guide of ADMIN_ASSISTANT_GUIDES) {
      if (action.id === `page:${guide.route}`) {
        return {
          id: `page:${guide.route}`,
          title: guide.title,
          description: guide.summary,
          icon: guide.icon,
          keywords: [...guide.keywords],
          route: guide.route,
          permissions: [...guide.permissions],
          kind: 'navigate',
        };
      }

      const quickAction = guide.quickActions.find((candidate) => candidate.id === action.id);
      if (quickAction) return { ...quickAction, keywords: [...quickAction.keywords], permissions: [...quickAction.permissions] };
    }

    return null;
  }

  private searchScore(result: AssistantSearchResult, term: string): number {
    const haystack = normalize([
      result.title,
      result.description,
      result.label,
      ...result.action.keywords,
    ].join(' '));
    if (haystack === term) return 100;
    if (normalize(result.title) === term) return 95;
    if (normalize(result.title).startsWith(term)) return 85;
    if (haystack.includes(term)) return 65;
    return term.split(' ').filter(Boolean).reduce((score, word) => score + (haystack.includes(word) ? 12 : 0), 0);
  }

  private cleanPath(url: string): string {
    const path = url.split('?')[0].split('#')[0] || '/dashboard';
    return path.startsWith('/') ? path : `/${path}`;
  }
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase('ar')
    .normalize('NFD')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}
