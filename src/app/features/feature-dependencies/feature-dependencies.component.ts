import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FeaturesService } from '../features/features.service';
import { PageHeaderComponent } from '../../shared/ui/page-header.component';

@Component({ selector: 'app-feature-dependencies', standalone: true, imports: [CommonModule, FormsModule, PageHeaderComponent], template: `
<app-page-header title="Feature Dependencies" subtitle="Manage required feature relationships" icon="pi pi-share-alt"></app-page-header>
<div class="lf-card grid gap-3 md:grid-cols-3 mb-4">
 <select class="lf-input" [(ngModel)]="featureId"><option value="">Feature</option><option *ngFor="let f of features()" [value]="f.id">{{f.code}}</option></select>
 <select class="lf-input" [(ngModel)]="dependsOnFeatureId"><option value="">Depends on</option><option *ngFor="let f of features()" [value]="f.id">{{f.code}}</option></select>
 <button class="p-button p-component" (click)="save()" [disabled]="!featureId || !dependsOnFeatureId">Add dependency</button>
</div>
<div class="lf-card"><div *ngFor="let d of dependencies()" class="py-2 border-b border-slate-100"><code>{{d.featureCode}}</code> → <code>{{d.dependsOnFeatureCode}}</code></div></div>` })
export class FeatureDependenciesComponent implements OnInit {
 private service = inject(FeaturesService); features = signal<any[]>([]); dependencies = signal<any[]>([]); featureId=''; dependsOnFeatureId='';
 ngOnInit(){ this.service.list().subscribe(x=>this.features.set(x)); this.load(); }
 load(){ this.service.dependencies().subscribe(x=>this.dependencies.set(x)); }
 save(){ this.service.addDependency({featureId:this.featureId, dependsOnFeatureId:this.dependsOnFeatureId}).subscribe(()=>{this.featureId='';this.dependsOnFeatureId='';this.load();}); }
}
