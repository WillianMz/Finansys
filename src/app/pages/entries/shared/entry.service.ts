import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { observable, throwError, Observable} from "rxjs";
import { map, catchError, flatMap} from "rxjs/operators";

import { Entry } from "./entry.model";
import { element } from '@angular/core/src/render3';
import { CategoryService } from '../../categories/shared/category.service';

@Injectable({
  providedIn: 'root'
})
export class EntryService {

  private apiPath: string = "api/entries";

  constructor(private http: HttpClient, private categoryService: CategoryService) { }


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
    //esta parte é somente por causa do banco de dados ser em memoria
    return this.categoryService.getById(entrada.categoryId).pipe(
      flatMap(category => {
        entrada.category = category;

        return this.http.post(this.apiPath, entrada).pipe(
          catchError(this.handleError),
          map(this.jsonDataToEntrie)
        )
      })
    )
    
    /*return this.http.post(this.apiPath, entrada).pipe(
      catchError(this.handleError),
      map(this.jsonDataToEntrie)
    )*/
  }

  update(entrada: Entry): Observable<Entry>{
    const url = `${this.apiPath}/${entrada.id}`;

    //esta parte é somente por causa do banco de dados ser em memoria
    return this.categoryService.getById(entrada.categoryId).pipe(
      flatMap(category => {
        entrada.category = category;

        return this.http.put("asdfasdf", entrada).pipe(
          catchError(this.handleError),
          map(() => entrada)
        )
      })
    )

    /*
    return this.http.put("asdfasdf", entrada).pipe(
      catchError(this.handleError),
      map(() => entrada)
    )*/
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
    const entries: Entry[] = [];
    //loop nos objetos do jsonData
    jsonData.forEach(element=>{
      const entry = Object.assign(new Entry, element);
      entries.push(entry);
    });
    return entries;
  }

  private jsonDataToEntrie(jsonData: any): Entry{
    return Object.assign(new Entry, jsonData);
  }

  private handleError(error: any): Observable<any>{
    console.log("Erro na requisição => ", error); 
    return throwError(error);
  }
}
