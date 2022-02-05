import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { City } from "./city";
import { HttpClient, HttpParams } from "@angular/common/http";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, SortDirection } from "@angular/material/sort";
import { Subject } from "rxjs";
import { identifierModuleUrl } from "@angular/compiler";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { query } from "@angular/animations";

@Component({
  selector: "app-cities",
  templateUrl: "./cities.component.html",
  styleUrls: ["./cities.component.css"]
})
export class CitiesComponent implements OnInit {
  public displayedColumns: string[] = ["id", "name", "lat", "lon", "countryName"];
  cities: MatTableDataSource<City> = new MatTableDataSource();
  hideTable = true;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  filterTextChanged = new Subject<string>();

  defaultPageIndex = 0 as const;
  defaultPageSize = 10 as const;
  defaultSortColumn = "name" as const;
  defaultSortOrder: SortDirection = "asc" as const;

  defaultFilterColumn = "name" as const;
  filterQuery: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject("BASE_URL") private baseUrl: string
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  // debounce filter text changes
  onFilterTextChanged(target: EventTarget | null) {
    if(!target) return;
    if(this.filterTextChanged.observers.length === 0) {
      this.filterTextChanged
        .pipe(debounceTime(1000), distinctUntilChanged())
        .subscribe(query => this.loadData(query));
    }
    const filterText = (target as HTMLInputElement).value;
    this.filterTextChanged.next(filterText);
  }

  loadData(query?: string) {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    if(query !== undefined) {
      this.filterQuery = query;
    }
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    const url = this.baseUrl + "api/Cities";
    let params = new HttpParams()
      .set("pageIndex", event.pageIndex.toString())
      .set("pageSize", event.pageSize.toString())
      .set("sortColumn", this.sort ? this.sort.active : this.defaultSortColumn)
      .set("sortOrder", this.sort ? this.sort.direction : this.defaultSortOrder);

    if(this.filterQuery) {
      params = params
        .set("filterColumn", this.defaultFilterColumn)
        .set("filterQuery", this.filterQuery);
    }

    this.http.get<any>(url, {params})
      .subscribe({
        next: (result: any) => {
          if(this.paginator) {
            this.paginator.length = result.totalCount;
            this.paginator.pageIndex = result.pageIndex;
            this.paginator.pageSize = result.pageSize;
          }
          this.cities = new MatTableDataSource<City>(result.data);
          this.hideTable = false;
        },
        error: (err: any) => console.error(err)
      });
  }
}
