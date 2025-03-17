import {GraphQLModule} from './graphql/graphql.module';
import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';
import {routes} from './app.routes';
import {provideHttpClient} from '@angular/common/http';
import {Apollo} from 'apollo-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    importProvidersFrom(GraphQLModule),
    Apollo
  ]
};
