import { createTag } from '../common/tag-generator';

export class Navigation {
  private tagResult: HTMLElement;
  public onNextAction!: () => void;
  public onPreviousAction!: () => void;
  public getResultTag(): HTMLElement {
    return this.tagResult;
  }
  constructor() {
    this.tagResult = document.createElement('div');
    const btnPrevious = createTag(
      'button',
      this.tagResult,
      'previous',
      'previous-btn disabled',
      'previous',
    );
    btnPrevious.onclick = () => this.previousPage();
    const btnNext = createTag(
      'button',
      this.tagResult,
      'next',
      'next-btn disabled',
      'next',
    );
    btnNext.onclick = () => this.nextPage();
  }

  public previousPage(): void {
    this.onPreviousAction();
  }

  public nextPage(): void {
    this.onNextAction();
  }
}
