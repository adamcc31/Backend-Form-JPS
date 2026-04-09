declare class FormOptionDto {
    value: string;
    label: string;
}
declare class FormFieldDto {
    id: string;
    label: string;
    type: string;
    required?: boolean;
    options?: FormOptionDto[];
}
export declare class FormSchemaDto {
    fields: FormFieldDto[];
}
export declare class CreateFormDto {
    organization_id: string;
    schema_config: FormSchemaDto;
    is_active?: boolean;
}
export {};
