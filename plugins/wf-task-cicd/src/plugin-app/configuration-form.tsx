// External (npm) dependencies
import React, { useState, useEffect } from 'react';
import { FieldMapper, FieldMapperRow, FieldMapperKey, FieldMapperValue } from '@qualtrics/plugin-ui-react';
import WorkflowsTaskClient from '@qualtrics/workflows-task-client'

// Internal dependencies
import { Field, getStaticFields, validateFieldValues } from './configuration-form-fields';
import { TaskDefinition } from './outbound-http-request-task-definition'

interface ConfigurationFormProps {
  client: WorkflowsTaskClient,
  toggleSaveButtonState: (isFormValid: boolean) => void,
  attachFormFieldsToTaskDefinition: (formFields: Field[]) => void,
  formFields?: Field[],
};

export function ConfigurationForm(props: ConfigurationFormProps) {

  /////////////////////////////////////////////
  /////////////   Props Mapping   /////////////
  /////////////////////////////////////////////
  const client = props.client;

  /////////////////////////////////////
  /////////////   Hooks   /////////////
  /////////////////////////////////////

  // The default form fields defined by the developer
  const [ staticFields, ] = useState(getStaticFields(client));

  // All of the visible fields that are displayed to users
  // Non-visible fields will be turned into visible fields when the user adds new fields
  const [ visibleFields, setVisibleFields ] = useState(loadVisibleFields);

  // Perform form validations and persist fields to taskDefinition
  useEffect(() => {
    handleVisibleFieldUpdates();
  }, [ visibleFields ]);

  /////////////////////////////////////////
  /////////////   Component   /////////////
  /////////////////////////////////////////

  return (
    <FieldMapper
      addFieldLabel={client.getText('addFieldDropdownLabel')}
      pipedTextItems={client.context.pipedText as any[]}
      onFieldValueChange={onFieldValueChange}
      onFieldRemove={onFieldRemove}
      onFieldAdd={onFieldAdd}
      onFieldKeyChange={onFieldKeyChange}
      availableFields={getAvailableFields()}
    >
      {visibleFields.map(field => {
        return(
          <FieldMapperRow
            selectedField={field}
            key={field.key}
          >
            <FieldMapperKey/>
            <FieldMapperValue
              inputValue={field.fieldValue}
              pipedTextItems={client.context.pipedText as any[]}
              tooltip={field.tooltip}
            />
          </FieldMapperRow>
        )
        }
      )}
    </FieldMapper>
  );

  /////////////////////////////////////////////
  /////////////   Hook Handlers   /////////////
  /////////////////////////////////////////////

  function handleVisibleFieldUpdates() {
    if(visibleFields.length === 0) {
      return;
    }

    // Form validation
    const canSaveForm = validateFieldValues(visibleFields);

    // Only persist to taskDefinition once form is valid
    if(canSaveForm) {
      props.attachFormFieldsToTaskDefinition(visibleFields);
    }

    // Toggle form save
    props.toggleSaveButtonState(canSaveForm);
  }

  function removeNonVisibleFields(visibleField: Field) {
    // Determines which fields to show by default in the UI
    return visibleField.isVisible;
  }

  function loadVisibleFields(): Field[] {
    // Saved Task
    if(client.isSavedTask()) {
      return (client.getConfig() as TaskDefinition).config.formFields;
    }
    // New Task
    return staticFields.filter(removeNonVisibleFields);
  }

  //////////////////////////////////////////////////
  /////////////   Component Handlers   /////////////
  //////////////////////////////////////////////////

  function onFieldAdd(field: Field) {
    const staticFieldIndex = getFieldIndexByKey(staticFields, field.key);

    if(staticFieldIndex === -1) {
      // Could add error handling here
      return;
    }

    const updatedVisibleFields = [ ...visibleFields ];
    updatedVisibleFields.push(field);
    setVisibleFields(updatedVisibleFields);
  }

  function onFieldRemove(field: Field) {
    const visibleFieldIndex = getFieldIndexByKey(visibleFields, field.key);

    if(visibleFieldIndex === -1) {
      // Could add error handling here
      return;
    }

    const updatedVisibleFields = [ ...visibleFields ];
    updatedVisibleFields.splice(visibleFieldIndex, 1);
    setVisibleFields(updatedVisibleFields);
  }

  function onFieldKeyChange(formerField: Field, newField: Field) {
    const formerFieldIndex = getFieldIndexByKey(visibleFields, formerField.key);
    const newFieldIndex = getFieldIndexByKey(staticFields, newField.key);
    if(formerFieldIndex === -1 || newFieldIndex === -1) {
      // Could add error handling here
      return;
    }
    const updatedVisibleFields = [ ...visibleFields ];
    updatedVisibleFields[formerFieldIndex] = newField;

    setVisibleFields(updatedVisibleFields);
  }

  function onFieldValueChange(field: Field, value: string) {
    const visibleFieldIndex = getFieldIndexByKey(visibleFields, field.key);

    if(visibleFieldIndex === -1) {
      // Could add error handling here
      return;
    }

    const updatedVisibleFields = [ ...visibleFields ];
    const updatedVisibleField = { ...visibleFields[visibleFieldIndex] };
    updatedVisibleField.fieldValue = value;
    updatedVisibleFields[visibleFieldIndex] = updatedVisibleField;

    setVisibleFields(updatedVisibleFields);
  }

  ////////////////////////////////////////////////
  /////////////   Helper Functions   /////////////
  ////////////////////////////////////////////////

  function getFieldIndexByKey(fields: Field[], key) {
    return fields.findIndex(field => {
      return field.key === key;
    });
  }

  function getAvailableFields() {
    return staticFields.filter(field => getFieldIndexByKey(visibleFields, field.key) === -1);
  }

}
