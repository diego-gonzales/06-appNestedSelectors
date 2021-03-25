import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';

import { CountriesService } from '../../services/countries.service';
import { Country } from '../../interfaces/country.interface';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [
  ]
})
export class SelectorPageComponent implements OnInit {

  myFormcito: FormGroup = this.fb.group({
    region : [ '', Validators.required ],
    country: [ '', Validators.required ],
    border : [ '', Validators.required ]
  });

  regiones: string[] = [];
  countries: Country[] = [];
  // borders: string[] = []; // con esto solo slaia el codigo del pais en las opciones del select, pero lo mejoramos en el video 288
  borders: Country[] = [];

  loading: boolean = false;


  constructor( private fb: FormBuilder,
               private countriesService: CountriesService ) { }

  ngOnInit(): void {
    this.regiones = this.countriesService.regions;

    // Sin switchMap
    // this.myFormcito.get('region')?.valueChanges
    //     .subscribe( value => {
      //       this.countriesService.getCountriesByRegion(value)
      //           .subscribe( resp => this.countries = resp );
      //     })
      
    // Cuando cambie el valor de la region (valor del select)
    this.myFormcito.get('region')?.valueChanges
        .pipe(
          tap( (_) => {
            this.loading = true;
            // this.countries = []; // podria servir tambien, pero la peticion se hace muy rapido que ni se nota que desaparece
            this.myFormcito.get('country')?.reset('');
          }), // efecto secundario que resetea ese campo al cambiar de region
          switchMap( valueRegion => this.countriesService.getCountriesByRegion(valueRegion) )
        ).subscribe( resp => {
          this.loading = false;
          this.countries = resp;
        })

    // Cuando cambie el valor del pais (valor del select) (ver video 285, lo hace un poco distinto, lo valida en el servicio)
    this.myFormcito.get('country')?.valueChanges
      .pipe(
        tap( () => {
          this.borders = []; // esto lo pongo asi para ayudar al ngIf del 'border' y que se desaparezca cuando cambie el valor del pais
          this.loading = true;
          this.myFormcito.get('border')?.reset('');
        }),
        switchMap( valueCountry => valueCountry ? this.countriesService.getBordersByCountryCode(valueCountry) : of([]) ), // hecho por yo
        // este tap no lo hace en el video, lo hago porque el loading no desaparecia cuando selecciono un pais sin borders,
        // la razon es que ya no llega a ejecutarse el subscribe de abajo al no haber borders de un pais
        tap( () => this.loading = false),
        switchMap( bordersCodes => this.countriesService.getCountriesByBordersCode(bordersCodes) )
      ).subscribe( resp => {
        console.log(resp);
        this.loading = false;
        this.borders = resp;
      })
  };

  // Methods
  save() {
    console.log('hola')
  }

}
