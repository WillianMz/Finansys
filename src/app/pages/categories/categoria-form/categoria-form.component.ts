import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';

import { Category} from '../shared/category.model';
import { CategoryService} from '../shared/category.service';

import { switchMap} from 'rxjs/operators';
import toastr from 'toastr';
import { CastExpr } from '@angular/compiler';
import { Route } from '@angular/compiler/src/core';

@Component({
  selector: 'app-categoria-form',
  templateUrl: './categoria-form.component.html',
  styleUrls: ['./categoria-form.component.css']
})
export class CategoriaFormComponent implements OnInit, AfterContentChecked {

  //ação atual: new/edit
  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  //erros que ocorrem no servidor
  serverErrorMessages: string[] = null;
  //desabilita botao de enviar e habilta quando o servidor retornar
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(){
    //seta o titulo da pagina
    this.setPageTitle();
  }

  submitForm(){
    //formulario esta sendo enviado, desbloquear o botao
    this.submittingForm = true

    if(this.currentAction == 'new')
      this.createCategory();
    else
      this.updateCategory();
  }

  //METODOS PRIVADOS

  private setCurrentAction(){
    //verifica a ação que esta sendo executada. Novo/Editar
    if (this.route.snapshot.url[0].path == 'new')
      this.currentAction = 'new'
    else
      this.currentAction = 'edit'
  }

  private buildCategoryForm(){
    //constroi o form da categoria
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null]
    });
  }

  private loadCategory(){
    //caso a acao atual seja de edição
    if(this.currentAction == 'edit')
      this.route.paramMap.pipe(
        switchMap(params => 
          this.categoryService.getById(+params.get('id')))//+ transforma pra numero
      ).subscribe(
        (category) => 
        {
          this.category = category;
          //preenche os campos do formulario com dados retornados do servidor
          this.categoryForm.patchValue(category);
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
      )
  }

  private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = 'Cadastro de nova categoria'
    else{
      const categoryName = this.category.name || ""
      this.pageTitle = 'Editando categoria: ' + categoryName;
    }      
  }


  private createCategory(){
    //atribui ao objeto category os valores preenchidos no categoryForm
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.create(category).subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
    );    
  }

  private updateCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value);
    
    this.categoryService.update(category).subscribe(
      category => this.actionsForSuccess(category),
      error => this.actionsForError(error)
  );   
  }

  private actionsForSuccess(category: Category){
    toastr.success("Solicitação processada com sucesso!");

    //rediciona para outra rota e nao salva no historico do navegador
    //e não permite usar o botao voltar do navegador
    this.router.navigateByUrl("categories", {skipLocationChange: true}).then(
      () => this.router.navigate(["categories", category.id, "edit"])
    )
  }

  private actionsForError(error){
    toastr.error('Ocorreu um erro ao processar a sua solicitação');

    this.submittingForm = false;

    if(error.status === 422)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde"];
  }

}
