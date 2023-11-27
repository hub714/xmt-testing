// Webpack ingested imports
import './plugin-app.scss';

// External (npm) dependencies
import React, { useState, useEffect } from 'react';
import cloneDeep from 'lodash.clonedeep';
import WorkflowsTaskClient from '@qualtrics/workflows-task-client'


// Internal dependencies
import { ConfigurationForm } from './configuration-form';
import { IntroductorySection } from './introductory-section';
import { getDefaultTaskDefinition, formatConnection, formatFormData, TaskDefinition } from './outbound-http-request-task-definition';

interface PluginProp{
  client: WorkflowsTaskClient,
}

export function PluginApp(props: PluginProp) {

  /////////////////////////////////////////////
  /////////////   Props Mapping   /////////////
  /////////////////////////////////////////////

  const client = props.client;

  /////////////////////////////////////
  /////////////   Hooks   /////////////
  /////////////////////////////////////

  interface LoadInitialSaveTaskState {
    isFormValid: boolean,
  }

  const [ canSaveTask, setCanSaveTask ] = useState<LoadInitialSaveTaskState>(loadInitialSaveTaskState);
  const [ taskDefinition, setTaskDefinition ] = useState<TaskDefinition>(loadTaskDefinition);

  // Handle logic for enabling the save button
  useEffect(() => {
    updateSaveButtonState();
  }, [ canSaveTask ]);

  // Save Button Handler
  useEffect(() => {
    client.onSave(saveTaskDefinition);
    // Overwrite handler only when the taskDefinition changes
  }, [ taskDefinition ]);

  /////////////////////////////////////////
  /////////////   Component   /////////////
  /////////////////////////////////////////

  return (
    <div className='plugin-app'>
      <IntroductorySection
        client={client}
      />
      <hr />
      <ConfigurationForm
        client={client}
        toggleSaveButtonState={toggleSaveButtonState}
        attachFormFieldsToTaskDefinition={attachFormFieldsToTaskDefinition}
      />
    </div>
  );

  /////////////////////////////////////////////
  /////////////   Hook Handlers   /////////////
  /////////////////////////////////////////////

  function loadInitialSaveTaskState() {
    const saveTaskState = {
      isFormValid: false
    };

    if(client.isSavedTask()) {
      saveTaskState.isFormValid = true;
    }

    return saveTaskState;
  }

  function loadTaskDefinition() {
    if(client.isSavedTask()) {
      return client.getConfig() as TaskDefinition;
    }
    return getDefaultTaskDefinition();
  }

  function updateSaveButtonState() {
    if(canSaveTask.isFormValid) {
      client.enableSaveButton();
    } else {
      client.disableSaveButton();
    }
  }

  /////////////////////////////////////////////////////
  /////////////   Client Event Handlers   /////////////
  /////////////////////////////////////////////////////

  function saveTaskDefinition() {
    const updatedTaskDefinition: TaskDefinition = cloneDeep(taskDefinition);

    // Step 1 - Conditionally attach a connection - see 'Setting Up Authentication' guide in docs for more details
    const credentialId: string = client.getAvailableConnections().credentialId;
    if(credentialId) {
      updatedTaskDefinition.connection = formatConnection(credentialId);
    }

    // Step 2 - Merge dynamic user-configured form key-value pairs with static default request body parameters
    updatedTaskDefinition.body = Object.assign({}, updatedTaskDefinition.body, formatFormData(updatedTaskDefinition.config.formFields));

    // Step 3 - Update the taskDefinition
    setTaskDefinition(updatedTaskDefinition);

    // Step 4 - Return the task definition object for persistence into backend
    return updatedTaskDefinition;
  }

  //////////////////////////////////////////////////
  /////////////   Component Handlers   /////////////
  //////////////////////////////////////////////////

  function attachFormFieldsToTaskDefinition(formFields) {
    const updatedTaskDefinition = cloneDeep(taskDefinition);
    updatedTaskDefinition.config.formFields = formFields;
    setTaskDefinition(updatedTaskDefinition);
  }

  function toggleSaveButtonState(isFormValid) {
    const updatedCanSaveTask = { ...canSaveTask };
    updatedCanSaveTask.isFormValid = isFormValid;
    setCanSaveTask(updatedCanSaveTask);
  }
}
