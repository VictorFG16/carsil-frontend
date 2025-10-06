import { registerLocaleData } from '@angular/common';
import localeEsCO from '@angular/common/locales/es-CO';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { appConfig } from './app/app.config';
import { App } from './app/app';
registerLocaleData(localeEsCO);
bootstrapApplication(App, {
  providers: [
    ...appConfig.providers,
    provideCharts(withDefaultRegisterables())
  ]
}).catch((err) => console.error(err))

;
