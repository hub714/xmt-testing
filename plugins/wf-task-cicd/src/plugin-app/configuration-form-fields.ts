import { FieldMapperItem } from "@qualtrics/plugin-ui-react";


export type Field = FieldMapperItem<string> & {
  isVisible: boolean,
  fieldValue: string,
  tooltip?: string,
  validate?: (field: Field) => boolean
};

export function getStaticFields(client): Field[] {
  return [
    { label: client.getText('defaultFieldNameRespondentEmail'), fieldValue:'', required: true, isVisible: true, key: 'email', tooltip: client.getText('defaultFieldTooltipRespondentEmail'), validate: validateThatKeyAndValueAreStrings },
    { label: client.getText('defaultFieldNameRespondentFirstName'), fieldValue:'', required: true, isVisible: true, key: 'first-name', tooltip: client.getText('defaultFieldTooltipRespondentFirstName'), validate: validateThatKeyAndValueAreStrings },
    { label: client.getText('defaultFieldNameRespondentLastName'), fieldValue:'', required: true, isVisible: true, key: 'last-name', tooltip: client.getText('defaultFieldTooltipRespondentLastName'), validate: validateThatKeyAndValueAreStrings },
    { label: client.getText('defaultFieldNameRespondentLocation'), fieldValue:'', required: false, isVisible: true, key: 'location', tooltip: client.getText('defaultFieldTooltipRespondentLocation'), validate: validateThatKeyAndValueAreStrings },
    { label: client.getText('defaultFieldNameRespondentPhone'), fieldValue:'',  required: false, isVisible: false, key: 'phone', tooltip: client.getText('defaultFieldTooltipRespondentPhone'), validate: validateThatKeyAndValueAreStrings },
  ];
}

export function validateFieldValues(formFields: Field[]) {
  return formFields.every(formField => {
    let isFormFieldValid = true;

    // Invokes validation function if the field has one
    if(typeof formField.validate === 'function') {
      isFormFieldValid = formField.validate(formField);
    }
    return isFormFieldValid;
  });
}

// Example validation that the key and values for this field are of type string and are not empty
export function validateThatKeyAndValueAreStrings(formField: Field) {
  return (formField.fieldValue.trim().length > 0 && formField.label.trim().length > 0);
}
