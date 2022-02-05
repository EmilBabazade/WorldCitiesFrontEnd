import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { City } from "../cities/city";
import { ApiResult, BaseService } from "./base.service";

@Injectable({
  providedIn: "root"
})
export class CityService extends BaseService<City> {
  constructor(
    protected readonly http: HttpClient,
    @Inject("BASE_URL") protected readonly baseUrl: string
  ) {
    super(http, baseUrl);
  }

  getData(
    pageIndex: number,
    pageSize: number,
    sortColumn: string,
    sortOrder: string,
    filterColumn: string | null,
    filterQuery: string | null): Observable<ApiResult<City>> {
    const url = `${this.baseUrl}api/Cities`;
    let params = new HttpParams()
      .set("pageIndex", pageIndex.toString())
      .set("pageSize", pageSize.toString())
      .set("sortColumn", sortColumn)
      .set("sortOrder", sortOrder);

    if(filterQuery && filterColumn) {
      params = params
        .set("filterColumn", filterColumn)
        .set("filterQuery", filterQuery);
    }

    return this.http.get<ApiResult<City>>(url, {params});
  }

  get(id: number): Observable<City> {
    const url = `${this.baseUrl}api/Cities/${id}`;
    return this.http.get<City>(url);
  }

  put(item: City): Observable<City> {
    const url = `${this.baseUrl}api/Cities/${item.id}`;
    return this.http.put<City>(url, item);
  }
  post(item: City): Observable<City> {
    const url = `${this.baseUrl}api/Cities/`;
    return this.http.post<City>(url, item);
  }
}
