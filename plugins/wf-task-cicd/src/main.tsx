// Webpack ingested imports
import '@qualtrics/base-styles/dist/base-styles.css';

// External (npm) dependencies
import React from 'react';
import ReactDOM from 'react-dom';
import WorkflowsTaskClient from '@qualtrics/workflows-task-client';
import { languageCodeAdapter, PluginUIProvider } from '@qualtrics/plugin-ui-react';
import pluginUITranslations from "@qualtrics/plugin-ui-react-translations";

// Internal dependencies
import { PluginApp } from './plugin-app/plugin-app';

(async () => {
  try {
    const workflowsTaskClient = await WorkflowsTaskClient.initialize();
    renderPlugin(workflowsTaskClient);
  } catch(error) {
    console.error(error);
    ReactDOM.render(<div>{error as Error}</div>, document.getElementById('app-root'));
  }
})();

function renderPlugin(workflowsTaskClient: WorkflowsTaskClient) {
  const context = workflowsTaskClient.context;
  document.getElementsByTagName('html')[0].lang = context.language;
  const languageCode = languageCodeAdapter(context.language);
  const config = {
    localizedText: pluginUITranslations[languageCode],
  };

  const Index = () => {
    return (
      <PluginUIProvider config={config}>
        <PluginApp client={workflowsTaskClient} />
      </PluginUIProvider>
    );
  };

  ReactDOM.render(<Index/>, document.getElementById('app-root'));
}
