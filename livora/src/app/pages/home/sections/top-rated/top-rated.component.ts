import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SvgIconComponent } from '@layout/svg-icon/svg-icon.component';
import { ProductService } from '@core/services/product.service';
import { isVariable } from '@core/utils/product.utils';
import { ProductCardComponent } from '@shared/components/product-card/product-card.component';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

/**
 * "Top Rated Product / Discover Our Newest Arrivals" – heading + intro paragraph side by side, the four featured
 * products (`ProductService.featured(4)`, home card look with the "-13%" tag) and the "View Our All Products." line.
 * Original: Elementor container d5f779d.
 */
@Component({
  selector: 'app-home-top-rated',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SvgIconComponent, SectionTitleComponent, ProductCardComponent],
  templateUrl: './top-rated.component.html',
  styleUrl: './top-rated.component.scss',
})
export class HomeTopRatedComponent {
  protected readonly products = inject(ProductService).featured(4);

  /**
   * The original prints the "-13%" tag only on simple products; variable products (price range by option) get none.
   * The card's `percent` badge would also tag those, so their tag is hidden through the `no-tag` class (see the SCSS).
   */
  protected readonly isVariable = isVariable;
}
