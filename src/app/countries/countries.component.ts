import { HttpClient, HttpParams } from "@angular/common/http";
import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, SortDirection } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { Country } from "./Country";

@Component({
  selector: "app-countries",
  templateUrl: "./countries.component.html",
  styleUrls: ["./countries.component.css"]
})
export class CountriesComponent implements OnInit {
  public displayedColumns: string[] = ["id", "name", "iso2", "iso3", "totalCities"];
  countries: MatTableDataSource<Country> = new MatTableDataSource();
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
    private readonly http: HttpClient,
    @Inject("BASE_URL") private readonly baseUrl: string
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

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
    const url = this.baseUrl + "api/Countries";
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
          this.countries = new MatTableDataSource<Country>(result.data);
          this.hideTable = result.data.length === 0;
        },
        error: (err: any) => console.error(err)
      });
  }

}
