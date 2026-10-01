import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { PolicyBlock, PolicyPage, PolicyRun } from '@core/models';
import { ContentService } from '@core/services/content.service';
import { PageTitleService } from '@core/services/page-title.service';
import { HelpCardComponent } from '@shared/components/help-card/help-card.component';
import {
  PageHeaderComponent,
  PageHeaderCrumb,
} from '@shared/components/page-header/page-header.component';
import { TocCardComponent, TocItem } from '@shared/components/toc-card/toc-card.component';

/** A paragraph or a list, with its inline runs already resolved (`runs ?? [{ text }]`). */
type PolicyItem =
  | { type: 'paragraph'; runs: PolicyRun[] }
  | { type: 'list'; bullets: boolean; items: PolicyRun[][] };

/** What sits under one heading: an optional sub-heading ("a. Personal Information") and its paragraphs / lists. */
interface PolicyGroup {
  sub?: string;
  items: PolicyItem[];
}

interface PolicySectionView {
  id: string;
  heading: string;
  /** The paragraph / plain-lines list that shares the heading's block in the original (tighter spacing). */
  lead?: PolicyItem;
  groups: PolicyGroup[];
}

interface PolicyView {
  policy: PolicyPage;
  crumbs: PageHeaderCrumb[];
  toc: TocItem[];
  introduction: PolicyRun[][];
  sections: PolicySectionView[];
}

type ContentBlock = Exclude<PolicyBlock, { type: 'subheading' }>;

const toItem = (block: ContentBlock): PolicyItem =>
  block.type === 'paragraph'
    ? { type: 'paragraph', runs: block.runs ?? [{ text: block.text }] }
    : {
        type: 'list',
        bullets: block.bullets !== false,
        items: block.items.map((text, index) => block.itemRuns?.[index] ?? [{ text }]),
      };

/** "1. Email us …", "2. Our team …": numbered steps stand on their own instead of joining the heading's block. */
const isSteps = (block: ContentBlock): boolean =>
  block.type === 'list' && block.items.every((item) => /^\d+\.\s/.test(item));

/**
 * The original is built from Elementor containers: the heading and the paragraph (or plain lines) right below it form
 * one tight block, every sub-heading starts a new block, and everything else up to the next sub-heading is one block.
 * The flat `blocks` of the data are grouped the same way so the spacing rhythm can be reproduced.
 */
function buildSection(section: PolicyPage['sections'][number]): PolicySectionView {
  const [first, ...others] = section.blocks;
  const leads =
    first !== undefined &&
    first.type !== 'subheading' &&
    (first.type === 'paragraph' || (first.bullets === false && !isSteps(first)));

  const groups: PolicyGroup[] = [];
  for (const block of leads ? others : section.blocks) {
    if (block.type === 'subheading') {
      groups.push({ sub: block.text, items: [] });
      continue;
    }
    let group = groups.at(-1);
    if (!group) {
      group = { items: [] };
      groups.push(group);
    }
    group.items.push(toItem(block));
  }

  return {
    id: section.id,
    heading: section.heading,
    lead: leads ? toItem(first as ContentBlock) : undefined,
    groups,
  };
}

/**
 * Policy pages – `/policy/:slug` (privacy-policy · terms-conditions · cancellation-policy · delivery-policy ·
 * refunds-returns-policy). Sticky sidebar (table of contents + help card) and the text of the policy; an unknown slug
 * renders the 404 page (the URL is kept: `skipLocationChange`).
 */
@Component({
  selector: 'app-policy-page',
  imports: [HelpCardComponent, NgTemplateOutlet, PageHeaderComponent, RouterLink, TocCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './policy.component.html',
  styleUrl: './policy.component.scss',
})
export class PolicyComponent {
  /** `:slug` route parameter. */
  readonly slug = input<string>();

  private readonly content = inject(ContentService);
  private readonly router = inject(Router);
  private readonly pageTitle = inject(PageTitleService);

  protected readonly view = computed<PolicyView | undefined>(() => {
    const policy = this.content.policyBySlug(this.slug() ?? '');
    if (!policy) return undefined;

    return {
      policy,
      crumbs: [{ label: 'Home', link: '/' }, { label: policy.breadcrumb ?? policy.title }],
      toc: policy.sections.map((section) => ({
        label: section.tocLabel ?? section.heading,
        fragment: section.id,
      })),
      introduction: policy.intro.map((text, index) => policy.introRuns?.[index] ?? [{ text }]),
      sections: policy.sections.map(buildSection),
    };
  });

  constructor() {
    effect(() => {
      const view = this.view();
      if (view) {
        this.pageTitle.set(view.policy.breadcrumb ?? view.policy.title);
      } else {
        untracked(() => void this.router.navigateByUrl('/404', { skipLocationChange: true }));
      }
    });
  }
}
