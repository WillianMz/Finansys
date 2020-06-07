import { Component, OnInit } from '@angular/core';

import { Category } from "../shared/category.model";
import { CategoryService } from "../shared/category.service";
import { element } from 'protractor';

@Component({
  selector: 'app-categoria-list',
  templateUrl: './categoria-list.component.html',
  styleUrls: ['./categoria-list.component.css']
})
export class CategoriaListComponent implements OnInit {

  categories: Category[] = [];

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    this.categoryService.getlAll().subscribe(
      categories => this.categories = categories,
      error => alert('Erro ao carregar a lista')
    )
  }

  deletCategory(category)
  {
    const mustDelete = confirm('Deseja ealmente excluír este item?');
    
    if(mustDelete)
    {   
      this.categoryService.delete(category.id).subscribe(
        () => this.categories = this.categories.filter(element => element != category),
        () => alert('Erro ao tentar excluír')
      )
    }
  }
}
