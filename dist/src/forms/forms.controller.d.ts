import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
    create(createFormDto: CreateFormDto, user: any): Promise<DynamicForm>;
    findAll(organizationId?: string): Promise<DynamicForm[]>;
    findOne(id: string): Promise<DynamicForm>;
    update(id: string, updateFormDto: UpdateFormDto, user: any): Promise<DynamicForm>;
    remove(id: string, user: any): Promise<DynamicForm>;
}
