import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { City } from "./city";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort, SortDirection } from "@angular/material/sort";
import { Subject } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { CityService } from "../services/city.service";
import { ApiResult } from "../services/base.service";

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
    private readonly cityService: CityService
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
    const sortColumn = this.sort
      ? this.sort.active
      : this.defaultSortColumn;

    const sortOrder = this.sort
      ? this.sort.direction
      : this.defaultSortOrder;

    const filterColumn = this.filterQuery
      ? this.defaultFilterColumn
      : null;

    const filterQuery = this.filterQuery
      ? this.filterQuery
      : null;

    this.cityService.getData(
      event.pageIndex,
      event.pageSize,
      sortColumn,
      sortOrder,
      filterColumn,
      filterQuery
    ).subscribe({
      next: (result: ApiResult<City>) => {
        if(this.paginator) {
          this.paginator.length = result.totalCount;
          this.paginator.pageIndex = result.pageIndex;
          this.paginator.pageSize = result.pageSize;
        } else {
          throw "paginator does not exist!";
        }
        this.cities = new MatTableDataSource<City>(result.data);
        this.hideTable = result.data.length === 0;
      },
      error: (err: unknown) => console.log(err)
    });
  }
}
