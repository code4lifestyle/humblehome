import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionTitleComponent } from '@shared/components/section-title/section-title.component';

interface Step {
  number: string;
  title: string;
  text: string;
}

interface CollectionCard {
  title: string;
  text: string;
  link: string;
  label: string;
  image: string;
}

/**
 * Home story from the Humble Home content: the brand idea, the consultation path,
 * the seven-step process, and the three collection cards.
 */
@Component({
  selector: 'app-home-story',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, SectionTitleComponent],
  templateUrl: './story.component.html',
  styleUrl: './story.component.scss',
})
export class HomeStoryComponent {
  protected readonly path = [
    'Consult',
    'Measure',
    'Design',
    'Approve',
    'Create',
    'Install',
    'Enjoy',
  ];

  protected readonly steps: Step[] = [
    {
      number: '01',
      title: 'Consultation',
      text: 'Tell us what you have in mind. We discuss your style, requirements, budget, and space.',
    },
    {
      number: '02',
      title: 'Site Visit & Measurement',
      text: 'Our team visits your space, takes accurate measurements, and understands the requirements firsthand.',
    },
    {
      number: '03',
      title: 'Design & Selection',
      text: 'We help you choose the right design, materials, fabrics, finishes, colors, and details.',
    },
    {
      number: '04',
      title: 'Quotation & Approval',
      text: 'You receive a clear quotation based on your selected design and materials.',
    },
    {
      number: '05',
      title: 'Production',
      text: 'Once approved, your furniture, curtains, or marble pieces are carefully prepared to your specifications.',
    },
    {
      number: '06',
      title: 'Delivery & Installation',
      text: 'Our team delivers and installs your pieces, ensuring everything fits and finishes beautifully.',
    },
    {
      number: '07',
      title: 'Final Handover',
      text: "We make sure you're happy with the final result and that everything is completed as planned.",
    },
  ];

  protected readonly collections: CollectionCard[] = [
    {
      title: 'Furniture',
      text: 'Bespoke pieces designed specifically for your home.',
      link: '/furniture',
      label: 'Explore Furniture',
      image: 'assets/images/category-item-image-1.jpg',
    },
    {
      title: 'Curtains',
      text: 'Made-to-measure curtains that bring softness, privacy, and character to your interiors.',
      link: '/curtains',
      label: 'Explore Curtains',
      image: 'assets/images/product-image-23.jpg',
    },
    {
      title: 'Marble',
      text: 'Natural stone and marble pieces that add timeless elegance to your space.',
      link: '/marble',
      label: 'Explore Marble',
      image: 'assets/images/product-image-26.jpg',
    },
  ];
}
