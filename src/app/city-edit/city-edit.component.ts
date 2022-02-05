import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { City } from "../cities/city";
import { Country } from "../countries/Country";
import { map } from "rxjs/operators";
import { BaseFormComponent } from "../base.form.component";

@Component({
  selector: "app-city-edit",
  templateUrl: "./city-edit.component.html",
  styleUrls: ["./city-edit.component.css"]
})
export class CityEditComponent extends BaseFormComponent implements OnInit {
  title?: string;
  city?: City;
  form!: FormGroup;
  // the city object id, fetched from the active route
  // it's NULL when we are ading a new city
  id?: number;

  // array for the select
  countries: Country[] = [];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly http: HttpClient,
    @Inject("BASE_URL") private baseUrl: string
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      name: new FormControl("", Validators.required),
      lat: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)
      ]),
      lon: new FormControl("", [
        Validators.required,
        Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)
      ]),
      countryId: new FormControl("", Validators.required)
    }, null, this.isDupeCity());
    this.loadData();
  }

  onChange() {
    console.log(this.getControl("countryId")?.errors?.required);
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      const city = <City>{
        id: this.id ? this.id : 0,
        name: this.form.get("name")?.value,
        lat: this.form.get("lat")?.value,
        lon: this.form.get("lon")?.value,
        countryId: this.form.get("countryId")?.value
      };

      const url = this.baseUrl + "api/Cities/IsDupeCity";
      return this.http.post<boolean>(url, city).pipe(
        map((result: any) => result ? {isDupeCity : true} : null)
      );
    };
  }

  loadData() {
    this.loadCountries();

    this.id = Number(this.activatedRoute.snapshot.paramMap.get("id"));
    const url = `${this.baseUrl}api/Cities/${this.id}`;
    if(this.id) {
      // EDIT MODE
      this.http.get<City>(url).subscribe({
        next: (result: City) => {
          this.city = result;
          this.title = `Edit - ${this.city.name}`;
          this.form.setValue({
            name: this.city.name,
            lat: this.city.lat,
            lon: this.city.lon,
            countryId: this.city.countryId
          });
        },
        error: error => console.error(error)
      });
    } else {
      // ADD NEW MODE
      this.title = "Create a new City";
    }
  }

  loadCountries() {
    // fetch all the countries from the server
    const url = `${this.baseUrl}api/Countries`;
    const params = new HttpParams()
      .set("pageIndex", "0")
      .set("pageSize", "99999")
      .set("sortColumn", "name")
      .set("sortOrder", "asc");

    this.http.get<any>(url, {params}).subscribe({
      next: (res: any) => {
        this.countries = res.data;
      },
      error: (err: any) => console.error(err)
    });
  }

  onSubmit() {
    const city = this.id ? this.city : <City>{};
    if(!city) {
      throw "onSubmit(): city is undefined";
    }
    city.name = this.form.get("name")?.value;
    city.lat = this.form.get("lat")?.value;
    city.lon = this.form.get("lon")?.value;
    city.countryId = this.form.get("countryId")?.value;

    if(this.id) {
      //EDIT MODE
      if(!this.city) {
        throw "onSubmit(): this.city is undefined";
      }
      const url = `${this.baseUrl}api/Cities/${this.city.id}`;
      this.http
        .put<City>(url, city)
        .subscribe({
          next: (result: any) => {
            console.log(`City ${city.id} has been updated.`);
            this.router.navigate(["/cities"]);
          },
          error: error => console.log(error)
        });
    } else {
      //ADD NEW MODE
      const url = `${this.baseUrl}api/Cities`;
      this.http
        .post<City>(url, city)
        .subscribe({
          next: (result: City) => {
            console.log(`City ${result.id} has been created.`);
            // go back to cities view
            this.router.navigate(["/cities"]);
          },
          error: (err: any) => console.error(err)
        });
    }
  }

}
