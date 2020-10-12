import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { observable, throwError, Observable} from "rxjs";
import { map, catchError, flatMap} from "rxjs/operators";

import { Entry } from "./entry.model";
import { element } from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiPath: string = "api/categories";

  constructor(private http: HttpClient) { }


  //metodos
  getlAll(): Observable<Entry[]>{
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntries)
    )
  }

  getById(id: number): Observable<Entry>{
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntrie)
    )
  }

  create(entrada: Entry): Observable<Entry>{
    return this.http.post(this.apiPath, entrada).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntrie)
    )
  }

  update(entrada: Entry): Observable<Entry>{
    const url = `${this.apiPath}/${entrada.id}`;
    return this.http.put("asdfasdf", entrada).pipe(
      catchError(this.handleError),
      map(() => entrada)
    )
  }

  delete(id: number): Observable<any>{
    const url = `${this.apiPath}/${id}`;
    return this.http.delete(url).pipe(
      catchError(this.handleError),
      map(() => null)
    )
  }


  //metodos privados
  private jsonDataToEntries(jsonData: any[]):Entry[]{
    const entradas: Entry[] = [];
    jsonData.forEach(element=> entradas.push(element as Entry));
    return entradas;
  }

  private jsonDataToEntrie(jsonData: any): Entry{
    return jsonData as Entry;
  }

  private handleError(error: any): Observable<any>{
    console.log("Erro na requisição => ", error); 
    return throwError(error);
  }
}
