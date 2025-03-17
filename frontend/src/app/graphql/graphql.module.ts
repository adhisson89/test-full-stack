import {NgModule} from '@angular/core';
import {Apollo, APOLLO_OPTIONS} from 'apollo-angular';
import {HttpLink} from 'apollo-angular/http';
import {HttpClientModule} from '@angular/common/http';
import {ApolloLink, InMemoryCache} from '@apollo/client/core';
import {setContext} from '@apollo/client/link/context';

@NgModule({
  imports: [HttpClientModule],
  exports: [],
  providers: [
    Apollo,
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => {
        const basic = setContext(() => ({
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          }
        }));

        const auth = setContext(() => {
          const token = localStorage.getItem('token');
          if (!token) return {};

          return {
            headers: {
              Authorization: `Bearer ${token}`
            }
          };
        });

        const link = ApolloLink.from([
          basic,
          auth,
          httpLink.create({uri: 'http://localhost:3000/graphql'})
        ]);

        return {
          link,
          cache: new InMemoryCache()
        };
      },
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule {
}
