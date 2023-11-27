import { Field } from "./configuration-form-fields";

export {
  formatConnection,
  formatFormData,
  getDefaultTaskDefinition,
  TaskDefinition
};

type TaskDefinition = {
  url: string,
  method: string,
  headers,
  body,
  config,
  connection?: TaskConnection
} & Record<string, unknown>;

type TaskConnection = {
  id: string,
  paramFormat: string,
  paramName: string,
  paramTemplate: string,
}

function formatConnection(credentialId: string): TaskConnection {
  // Defaults to basic auth, other auth schemes or formats can be used as described in the SDK documentation
  return {
    id: credentialId,
    paramFormat: 'header',
    paramName: 'Authorization',
    paramTemplate: 'Basic %s'
  };
}

function formatFormData(formFields: Field[]): Record<string, string> {
  const formattedFormData: Record<string, string> = {};

  formFields.forEach(formField => {
    if(Object.prototype.hasOwnProperty.call(formField, 'fieldValue') && formField.fieldValue) {
      formattedFormData[formField.label] = formField.fieldValue;
    }
  });

  return formattedFormData;
}

function getDefaultTaskDefinition(): TaskDefinition {
  // Fill this out with your default/static api values
  return {
    url: 'https://jsonplaceholder.typicode.com/users',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      staticProperty: 'someHardcodedValue'
    },
    // The config property can be used to store user selections when the save button is clicked, and those selections can then be retrieved and loaded if/when the user clicks on a saved task
    config: {}
  };
}
