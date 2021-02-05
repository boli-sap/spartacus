import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CmsComponentData } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CarouselComponentModel } from '../../cms.model';
import { ContentService } from '../../content.service';
@Component({
  selector: 'upscale-carousel',
  templateUrl: './carousel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselComponent {
  items$: Observable<Observable<string>[]> = this.component.data$.pipe(
    map((data) => data.contentIds),
    map((ids) => ids.map((id) => of(id))),
    tap(console.log)
  );

  constructor(
    protected component: CmsComponentData<CarouselComponentModel>,
    protected contentService: ContentService
  ) {}

  getContent(contentId: string): Observable<any> {
    return this.contentService.get(contentId);
  }
}
