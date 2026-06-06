import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { IMAGE_CONFIG } from '@angular/common';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { CookieService } from 'ngx-cookie-service';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    MessageService,
    CookieService,
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true, 
        disableImageLazyLoadWarning: true
      }
    },
     providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none' // Disables system-based dark mode
        }
      }
    })
  ]
};