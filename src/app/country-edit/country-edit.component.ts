import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { BaseFormComponent } from "../base.form.component";
import { Country } from "../countries/Country";

@Component({
  selector: "app-country-edit",
  templateUrl: "./country-edit.component.html",
  styleUrls: ["./country-edit.component.css"]
})
export class CountryEditComponent extends BaseFormComponent implements OnInit {
  // the view title
  title = "";

  // the form model
  form!: FormGroup;

  // the city object to edit or create
  country?: Country;

  // the country object id, as fetched from the active route:
  // It's NULL when we're adding a new country,
  // and not NULL when we're editing an existing one.
  id?: number;

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    @Inject("BASE_URL") private baseUrl: string
  ) {
    super();
    this.loadData();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["",
        Validators.required,
        this.isDupeField("name")
      ],
      iso2: ["",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]{2}$/)
        ],
        this.isDupeField("iso2")
      ],
      iso3: ["",
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z]{3}$/)
        ],
        this.isDupeField("iso3")
      ]
    });
    this.loadData();
  }

  isDupeField(fieldName: string): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{[key: string]: unknown} | null> => {
      const params = new HttpParams()
        .set("countryId", this.id ? this.id.toString(): "0")
        .set("fieldName", fieldName)
        .set("fieldValue", control.value);
      const url = this.baseUrl + "api/Countries/IsDupeField";
      return this.http.post<boolean>(url, null, {params}).pipe(
        map((result: unknown) => result ? {isDupeField: true} : null)
      );
    };
  }

  loadData() {
    // retrieve the ID from the 'id'
    this.id = Number(this.activatedRoute.snapshot.paramMap.get("id"));
    if(this.id) {
      // EDIT MODE
      // get the country from the server
      const url = this.baseUrl + "api/Countries/" + this.id;
      this.http.get<Country>(url).subscribe({
        next: result => {
          this.country = result;
          this.title = `Edit - ${this.country.name}`;

          // update the form with the country value
          if(this.form && this.country) {
            this.form.patchValue(this.country);
          } else {
            throw "backend go poo-poo";
          }
        },
        error: (err: unknown) => console.log(err)
      });
    } else {
      // ADD NEW MODE
      this.title = "Create a new Country";
    }
  }

  onSubmit() {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const country = this.id ? this.country! : <Country>{};
    country.name = this.form.get("name")?.value;
    country.iso2 = this.form.get("iso2")?.value;
    country.iso3 = this.form.get("iso3")?.value;

    if(this.id) {
      // EDIT mode
      const url = `${this.baseUrl}api/Countries/${this.country?.id}`;
      this.http
        .put<Country>(url, country)
        .subscribe({
          next: () => {
            console.log(`Country ${country.id} has been updated.`);
            // go back to countries view
            this.router.navigate(["/countries"]);
          },
          error: (err: unknown) => console.error(err)
        });
    } else {
      // CREATE mode
      const url = `${this.baseUrl}api/Countries`;
      this.http
        .post<Country>(url, country)
        .subscribe({
          next: (result: Country) => {
            console.log(`Country ${result.id} has been created`);
            // go back to countries view
            this.router.navigate(["/countries"]);
          },
          error: (err: unknown) => console.error(err)
        });
    }
  }

}
