import { Directive, HostListener, Input, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[numericOnly]'
})
export class NumericOnlyDirective {

  @Input() allowDecimal: boolean = false;

  private tooltip: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  //  Validación al escribir
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Permitir teclas de control
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return;

    // Permitir navegación y edición
    if (
      ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'].includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return;
    }

    // Regex: números o decimal
    const regex = this.allowDecimal ? /^[0-9.]$/ : /^[0-9]$/;

    // Bloquea si no cumple
    if (!regex.test(event.key)) {
      event.preventDefault();
      this.showTooltip(this.allowDecimal ? 'Por favor, ingresa solo números o un decimal' : 'Por favor, ingresa solo números');
    } else {
      // Si es ".", validamos que no haya ya otro en el input
      if (event.key === '.' && this.allowDecimal && this.el.nativeElement.value.includes('.')) {
        event.preventDefault();
        this.showTooltip('Solo se permite un punto decimal');
      } else {
        this.hideTooltip();
      }
    }
  }

  // Validación al pegar
  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const pastedInput: string = event.clipboardData?.getData('text') || '';
    const regex = this.allowDecimal ? /^\d+(\.\d+)?$/ : /^\d+$/;

    if (!regex.test(pastedInput)) {
      event.preventDefault();
      this.showTooltip(this.allowDecimal ? 'Pegue solo valores numéricos o decimales' : 'Pegue solo valores numéricos');
    } else {
      this.hideTooltip();
    }
  }

  //  Mostrar tooltip encima del input
  private showTooltip(message: string) {
    this.hideTooltip();

    const hostEl = this.el.nativeElement;
    const parent = hostEl.parentNode;

    const tooltip = this.renderer.createElement('div') as HTMLElement;
    tooltip.innerText = message;
    this.renderer.addClass(tooltip, 'numeric-only-tooltip');

    // Posiciona relativo al padre para que el tooltip quede alineado
    this.renderer.setStyle(parent, 'position', 'relative');

    this.renderer.appendChild(parent, tooltip);
    this.tooltip = tooltip;

    setTimeout(() => this.hideTooltip(), 2000);
  }

  //    Ocultar tooltip
  private hideTooltip() {
    if (this.tooltip) {
      this.renderer.removeChild(this.el.nativeElement.parentNode, this.tooltip);
      this.tooltip = null;
    }
  }
}
