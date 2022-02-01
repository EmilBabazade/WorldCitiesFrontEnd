import { HttpClient, HttpParams } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Country } from './Country';

@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.css']
})
export class CountriesComponent implements OnInit {
  public displayedColumns: string[] = ['id', 'name', 'iso2', 'iso3']
  countries: MatTableDataSource<Country> = new MatTableDataSource();
  hideTable = true;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  defaultPageIndex = 0 as const;
  defaultPageSize = 10 as const;
  defaultSortColumn = 'name' as const;
  defaultSortOrder: SortDirection = 'asc' as const;

  defaultFilterColumn = 'name' as const;
  filterQuery: string | null = null;

  constructor(
    private http: HttpClient,
    @Inject('BASE_URL') private baseUrl: string
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(target: EventTarget | null = null) {
    const pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;
    if(target) {
      const query = (target as HTMLInputElement).value;
      this.filterQuery = query;
    }
    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    const url = this.baseUrl + 'api/Countries';
    let params = new HttpParams()
      .set('pageIndex', event.pageIndex.toString())
      .set('pageSize', event.pageSize.toString())
      .set('sortColumn', this.sort ? this.sort.active : this.defaultSortColumn)
      .set('sortOrder', this.sort ? this.sort.direction : this.defaultSortOrder);

    if(this.filterQuery) {
      params = params
        .set('filterColumn', this.defaultFilterColumn)
        .set('filterQuery', this.filterQuery);
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
          console.log(this.countries)
          this.hideTable = false;
        },
        error: (err: any) => console.error(err)
      })
  }

}
