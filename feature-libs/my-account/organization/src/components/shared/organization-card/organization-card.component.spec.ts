import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { I18nTestingModule } from '@spartacus/core';
import { ViewComponent } from '@spartacus/storefront';
import { IconTestingModule } from 'projects/storefrontlib/src/cms-components/misc/icon/testing/icon-testing.module';
import { SplitViewTestingModule } from 'projects/storefrontlib/src/shared/components/split-view/testing/spit-view-testing.module';
import { of } from 'rxjs';
import { OrganizationItemService } from '../organization-item.service';
import { OrganizationMessageTestingModule } from '../organization-message/organization-message.testing.module';
import { OrganizationCardComponent } from './organization-card.component';
import createSpy = jasmine.createSpy;

const mockItem = { foo: 'bar' };

class MockOrganizationItemService {
  key$ = of('key');
  current$ = of(mockItem);
  launchDetails = createSpy('launchDetails');
}

describe('OrganizationCardComponent', () => {
  let component: OrganizationCardComponent<any>;
  let fixture: ComponentFixture<OrganizationCardComponent<any>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SplitViewTestingModule,
        IconTestingModule,
        I18nTestingModule,
        RouterTestingModule,
        OrganizationMessageTestingModule,
      ],
      declarations: [OrganizationCardComponent],
      providers: [
        {
          provide: OrganizationItemService,
          useClass: MockOrganizationItemService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationCardComponent);
    component = fixture.componentInstance;
    component.i18nRoot = 'organization.budget';
    // no change detection here because angular will not detect changes
    // when inputs changed directly.
    // See https://github.com/angular/angular/issues/12313
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should resolve current item', () => {
    let result;
    component.item$.subscribe((item) => (result = item)).unsubscribe();
    expect(result).toEqual(mockItem);
  });

  it('should close the view ', () => {
    const ev = {
      stopPropagation: () => {},
    };
    const view = {
      toggle: (_force?: boolean) => {},
    };
    spyOn(view, 'toggle');
    component.closeView(view as ViewComponent, ev as MouseEvent);
    expect(view.toggle).toHaveBeenCalledWith(true);
  });

  describe('UI', () => {
    describe('default inputs', () => {
      beforeEach(() => {
        fixture.detectChanges();
      });
      it('should have localized h3 title', () => {
        const el: HTMLElement = fixture.debugElement.query(By.css('.title h3'))
          .nativeElement;
        expect(el.innerText).toContain('organization.budget.title');
      });

      it('should have localized h4 subtitle', () => {
        const el: HTMLElement = fixture.debugElement.query(By.css('.title h4'))
          .nativeElement;
        expect(el.innerText).toContain('organization.budget.subtitle');
      });

      it('should have back button by default', () => {
        const el: HTMLElement = fixture.debugElement.query(By.css('a.close'))
          .nativeElement;
        expect(el).toBeDefined();
      });
    });

    describe('custom inputs', () => {
      it('should not have back button', () => {
        component.previous = false;
        fixture.detectChanges();
        const el = fixture.debugElement.query(By.css('a.close'));
        expect(el).toBeFalsy();
      });

      it('should have back button with localized text', () => {
        component.previous = 'organization.assign';
        fixture.detectChanges();
        const el: HTMLElement = fixture.debugElement.query(By.css('a.close'))
          .nativeElement;
        expect(el.innerText).toContain('organization.assign');
      });
    });
  });
});