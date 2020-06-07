import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import { observable, throwError, Observable} from "rxjs";
import { map, catchError, flatMap} from "rxjs/operators";

import { Category } from "./category.model";
import { element } from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private apiPath: string = "api/categories";

  constructor(private http: HttpClient) { }


  //metodos
  getlAll(): Observable<Category[]>{
    return this.http.get(this.apiPath).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategories)
    )
  }

  getById(id: number): Observable<Category>{
    const url = `${this.apiPath}/${id}`;

    return this.http.get(url).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategorie)
    )
  }

  create(categoria: Category): Observable<Category>{
    return this.http.post(this.apiPath, categoria).pipe(
      catchError(this.handleError),
      map(this.jsonDataToCategorie)
    )
  }

  update(categoria: Category): Observable<Category>{
    const url = `${this.apiPath}/${categoria.id}`;
    return this.http.put(url, categoria).pipe(
      catchError(this.handleError),
      map(() => categoria)
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
  private jsonDataToCategories(jsonData: any[]):Category[]{
    const categorias: Category[] = [];
    jsonData.forEach(element=> categorias.push(element as Category));
    return categorias;
  }

  private jsonDataToCategorie(jsonData: any): Category{
    return jsonData as Category;
  }

  private handleError(error: any): Observable<any>{
    console.log("Erro na requisição => ", error); 
    return throwError(error);
  }
}
