import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { findAnswer, GREETING, QUICK_REPLIES, WHATSAPP_URL, type ChatAction } from './chatbot-knowledge';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
  action?: ChatAction;
}

/**
 * Automatic chatbot widget, bottom-right on every non-admin page.
 * No backend, no cost, no accounts, no API keys: quick replies plus simple
 * keyword matching against the verified FAQ knowledge. When it cannot answer,
 * it hands over to WhatsApp instead of guessing. Sits above the existing
 * WhatsApp button; nothing else on the page is moved or changed.
 * Browser-only interaction (clicks/typing); the initial closed state renders
 * the same during prerendering, so it is safe for Angular SSR/prerender.
 */
@Component({
  selector: 'app-chatbot-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chatbot-widget.component.html',
  styleUrl: './chatbot-widget.component.scss',
})
export class ChatbotWidgetComponent {
  protected readonly isOpen = signal(false);
  protected readonly whatsappUrl = WHATSAPP_URL;
  protected readonly quickReplies = QUICK_REPLIES;
  protected readonly messages = signal<ChatMessage[]>([{ from: 'bot', text: GREETING }]);

  protected toggle(): void {
    this.isOpen.update((open) => !open);
  }

  protected close(): void {
    this.isOpen.set(false);
  }

  protected ask(value: string): void {
    this.send(value);
  }

  protected send(raw: string): void {
    const text = raw.trim();
    if (!text) {
      return;
    }
    const reply = findAnswer(text);
    this.messages.update((list) => [
      ...list,
      { from: 'user', text },
      { from: 'bot', text: reply.text, action: reply.action },
    ]);
  }
}
