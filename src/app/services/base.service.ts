import { HttpClient } from "@angular/common/http";
import { Inject } from "@angular/core";
import { Observable } from "rxjs";

export abstract class BaseService<T> {
  constructor(
    protected readonly http: HttpClient,
    @Inject("BASE_URL") protected readonly baseUrl: string
  ) {}

  abstract getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string,
    filterQuery: string): Observable<ApiResult<T>>;

  abstract get(id: number): Observable<T>;
  abstract put(item: T): Observable<T>;
  abstract post(item: T): Observable<T>;
}

export interface ApiResult<T> {
  data: T[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  sortColumn: string;
  sortOrder: string;
  filterColumn: string;
  filterQuery: string;
}
