import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router} from '@angular/router';

import { Entry} from '../shared/entry.model';
import { EntryService} from '../shared/entry.service';

import { switchMap} from 'rxjs/operators';
import toastr from 'toastr';
import { CastExpr } from '@angular/compiler';
import { Route } from '@angular/compiler/src/core';
import { text } from '@angular/core/src/render3';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  //ação atual: new/edit
  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  //erros que ocorrem no servidor
  serverErrorMessages: string[] = null;
  //desabilita botao de enviar e habilta quando o servidor retornar
  submittingForm: boolean = false;
  entry: Entry = new Entry();
  categories: Array<Category>;

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator: '',
    padFractionalZeros: true,
    normalizeZeros: true,
    radix: ','
  };

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
    dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
    dayNamesMin: ['Do','Se','Te','Qu','Qu','Se','Sa'],
    monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
    monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  };

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }

  ngAfterContentChecked(){
    //seta o titulo da pagina
    this.setPageTitle();
  }

  submitForm(){
    //formulario esta sendo enviado, desbloquear o botao
    this.submittingForm = true

    if(this.currentAction == 'new')
      this.createEntry();
    else
      this.updateEntry();
  }

  get typeOptions(): Array<any>{
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text: text,
          value: value
        } 
      }
    )
  }

  //METODOS PRIVADOS

  private setCurrentAction(){
    //verifica a ação que esta sendo executada. Novo/Editar
    if (this.route.snapshot.url[0].path == 'new')
      this.currentAction = 'new'
    else
      this.currentAction = 'edit'
  }

  private buildEntryForm(){
    //constroi o form da entry
    this.entryForm = this.formBuilder.group({
      id: [null],
      name: [null, [Validators.required, Validators.minLength(2)]],
      description: [null],
      type: ["expense", [Validators.required]],
      amount: [null, [Validators.required]],
      date: [null, [Validators.required]],
      paid: [true, [Validators.required]],
      categoryId: [null, [Validators.required]],
    });
  }

  private loadEntry(){
    //caso a acao atual seja de edição
    if(this.currentAction == 'edit')
      this.route.paramMap.pipe(
        switchMap(params => 
          this.entryService.getById(+params.get('id')))//+ transforma pra numero
      ).subscribe(
        (entry) => 
        {
          this.entry = entry;
          //preenche os campos do formulario com dados retornados do servidor
          this.entryForm.patchValue(entry);
        },
        (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
      )
  }

  private loadCategories(){
    this.categoryService.getlAll().subscribe(
      categories => this.categories = categories
    );
  }

  private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = 'Cadastro de nova lançamento'
    else{
      const entryName = this.entry.name || ""
      this.pageTitle = 'Editando lançamento: ' + entryName;
    }      
  }


  private createEntry(){
    //atribui ao objeto entry os valores preenchidos no entryForm
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);

    this.entryService.create(entry).subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
    );    
  }

  private updateEntry(){
    const entry: Entry = Object.assign(new Entry(), this.entryForm.value);
    
    this.entryService.update(entry).subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
  );   
  }

  private actionsForSuccess(entry: Entry){
    toastr.success("Solicitação processada com sucesso!");

    //rediciona para outra rota e nao salva no historico do navegador
    //e não permite usar o botao voltar do navegador
    this.router.navigateByUrl("entries", {skipLocationChange: true}).then(
      () => this.router.navigate(["entries", entry.id, "edit"])
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
