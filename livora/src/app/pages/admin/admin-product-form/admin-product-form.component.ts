import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Product } from '@core/models';
import { ProductService } from '@core/services/product.service';
import { ToastService } from '@core/services/toast.service';
import { imageVariant } from '@core/utils/image.utils';
import { MAIN_CATEGORIES, isMainCategory } from '../admin-categories';
import { fileToDataUrl } from '../image-upload';
import { deleteStoredImages, uploadNewImages } from '../product-images';

const lines = (text: string): string[] =>
  text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const paragraphs = (text: string): string[] =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);

@Component({
  selector: 'app-admin-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss',
})
export class AdminProductFormComponent {
  private readonly products = inject(ProductService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  /** Route param of /admin/products/:id/edit. */
  readonly id = input<string>();
  /** `?category=` of /admin/products/new – preselects the store section. */
  readonly category = input<string>();

  protected readonly mainCategories = MAIN_CATEGORIES;
  protected readonly roomCategories = this.products
    .categories()
    .filter((c) => !isMainCategory(c.slug));

  protected readonly existing = computed<Product | undefined>(() => {
    const id = this.id();
    return id ? this.products.byId(Number(id)) : undefined;
  });
  protected readonly isEdit = computed(() => this.id() !== undefined);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    excerpt: ['', [Validators.required, Validators.maxLength(300)]],
    description: [''],
    features: [''],
  });

  protected readonly sections = signal<string[]>([]);
  protected readonly rooms = signal<string[]>([]);
  protected readonly images = signal<string[]>([]);
  protected readonly uploading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);

  protected readonly sectionError = computed(() => this.submitted() && this.sections().length === 0);
  protected readonly imageError = computed(() => this.submitted() && this.images().length === 0);

  constructor() {
    effect(() => {
      const product = this.existing();
      const preset = this.category();
      untracked(() => {
        if (product) {
          this.form.setValue({
            name: product.name,
            excerpt: product.excerpt,
            description: product.description.join('\n\n'),
            features: product.features.join('\n'),
          });
          this.sections.set(product.categories.filter(isMainCategory));
          this.rooms.set(product.categories.filter((c) => !isMainCategory(c)));
          this.images.set([...product.images]);
        } else if (!this.isEdit()) {
          this.sections.set(preset && isMainCategory(preset) ? [preset] : []);
        }
      });
    });
  }

  protected thumb(path: string): string {
    return imageVariant(path, '300x300');
  }

  protected invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected toggle(list: typeof this.sections, slug: string): void {
    list.update((all) => (all.includes(slug) ? all.filter((s) => s !== slug) : [...all, slug]));
  }

  protected async onFiles(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])].filter((f) => f.type.startsWith('image/'));
    input.value = '';
    if (!files.length) {
      return;
    }
    this.uploading.set(true);
    try {
      const urls = await Promise.all(files.map((f) => fileToDataUrl(f)));
      this.images.update((all) => [...all, ...urls]);
    } catch {
      this.toast.show('One of the images could not be read. Try a JPG or PNG file.', { type: 'error' });
    } finally {
      this.uploading.set(false);
    }
  }

  protected makeMain(index: number): void {
    this.images.update((all) => [all[index], ...all.filter((_, i) => i !== index)]);
  }

  protected removeImage(index: number): void {
    this.images.update((all) => all.filter((_, i) => i !== index));
  }

  protected async save(): Promise<void> {
    if (this.saving()) {
      return;
    }
    this.submitted.set(true);
    this.form.markAllAsTouched();
    const value = this.form.getRawValue();
    if (this.form.invalid || !this.sections().length || !this.images().length) {
      return;
    }

    const features = lines(value.features);
    const fields = {
      name: value.name.trim(),
      excerpt: value.excerpt.trim(),
      description: paragraphs(value.description).length ? paragraphs(value.description) : [value.excerpt.trim()],
      features,
      highlights: features.slice(0, 2),
      categories: [...this.sections(), ...this.rooms()],
    };

    this.saving.set(true);
    try {
      const current = this.existing();
      const images = await uploadNewImages(this.images());
      this.images.set(images);
      const saved = current
        ? await this.products.update({ ...current, ...fields, images })
        : await this.products.create({
            ...fields,
            images,
            price: 0,
            brand: 'humble-home',
            brands: ['humble-home'],
            rating: 0,
            reviewCount: 0,
            popularity: 0,
            createdAt: new Date().toISOString(),
          });
      if (current) {
        void deleteStoredImages(current.images.filter((src) => !images.includes(src)));
      }
      this.toast.show(`“${saved.name}” was ${current ? 'updated' : 'added'}.`, {
        action: { label: 'View', link: ['/product', saved.slug] },
      });
      this.router.navigate(['/admin'], { queryParams: { category: this.sections()[0] } });
    } catch (error) {
      this.toast.show((error as Error).message, { type: 'error', duration: 8000 });
    } finally {
      this.saving.set(false);
    }
  }
}
