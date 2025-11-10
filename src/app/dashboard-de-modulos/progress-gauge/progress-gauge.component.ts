import {
  Component,
  Input,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-progress-gauge',
  templateUrl: './progress-gauge.component.html',
  styleUrls: ['./progress-gauge.component.css'],
})
export class ProgressGaugeComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @Input() progress: number = 0;
  @ViewChild('gaugeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: Chart | null = null;
  private initialized = false;
  private readonly maxDays = 5;

  public displayValue: number = 0;
  public chartDiasRestantes: number = 0;

  ngAfterViewInit() {
    this.initialized = true;
    this.tryCreateGauge();
  }

  ngOnChanges(_: SimpleChanges) {
    this.tryCreateGauge();
  }

  private tryCreateGauge() {
    if (
      this.initialized &&
      this.canvasRef?.nativeElement &&
      this.progress !== undefined
    ) {
      this.createGauge();
    }
  }

  private createGauge() {
    const canvas = this.canvasRef.nativeElement;

    if (this.chart) {
      this.chart.destroy();
    }

    const raw = Number(this.progress) || 0;
    this.displayValue = raw > this.maxDays ? raw : raw;
    const diasRestantesClamped = Math.max(0, Math.min(this.maxDays, raw));
    this.chartDiasRestantes = diasRestantesClamped;
    const diasUsados = this.maxDays - diasRestantesClamped;
    const isOverflow = raw > this.maxDays;
    const colorRestantes = isOverflow
      ? 'red'
      : this.getColor(diasRestantesClamped);

    const dataForChart = isOverflow
      ? [this.maxDays, 0]
      : [diasRestantesClamped, diasUsados];

    const bgColors = [colorRestantes, '#e0e0e0'];

    const disableTooltip = raw === 0;
    this.chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Días restantes', 'Días usados'],
        datasets: [
          {
            data: dataForChart,
            backgroundColor: bgColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: disableTooltip
            ? { enabled: false }
            : {
            callbacks: {
              label: function (context: any) {
                return `${context.label}: ${context.raw} días`;
              },
            },
          },
        },
      },
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  getColor(diasRestantes: number): string {
    if (diasRestantes > 7) return '#e21b1b';
    if (diasRestantes >= 1) return '#0b8a0b';
    if (diasRestantes >= 0.5) return '#f3c623';
    return '#e21b1b';
  }
}
