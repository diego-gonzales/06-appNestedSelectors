import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { Country, CountryResponse } from '../interfaces/country.interface';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {

  private _regions: string[] = [ 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania' ];
  private _apiUrl: string = 'https://restcountries.eu/rest/v2';

  get regions(): string[] {
    return [...this._regions];
  };

  constructor( private http: HttpClient ) { }


  // Methods
  getCountriesByRegion( region: string ): Observable<Country[]> {
    return this.http.get<Country[]>(`${this._apiUrl}/region/${region}?fields=alpha3Code;name`);
  };

  getBordersByCountryCode( countryCode: string ): Observable<string[]> {
    return this.http.get<CountryResponse>(`${this._apiUrl}/alpha/${countryCode}`)
              .pipe(
                map( resp => resp.borders )
              )
  };


  //
  getCountryByCode( countryCode: string ): Observable<Country> {
    return this.http.get<Country>(`${this._apiUrl}/alpha/${countryCode}?fields=alpha3Code;name`);
  };

  getCountriesByBordersCode( bordersCodes: string[] ): Observable<Country[]> {
    if ( !bordersCodes ) { return of([]) };

    const requests: Observable<Country>[] = [];

    bordersCodes.forEach( borderCode => {
      const request = this.getCountryByCode(borderCode);
      requests.push(request);
    });

    return combineLatest( requests ); // manda el resultado de todas los peticiones de ese 'requests' array
  }
}
