// External (npm) dependencies
import React from 'react';
import WorkflowsTaskClient from '@qualtrics/workflows-task-client'

interface IntroductorySectionProp {
  client: WorkflowsTaskClient
};

export function IntroductorySection(props: IntroductorySectionProp) {
  const client = props.client;

  return (
    <>
      <div className='section-heading'>
        {client.getText('introHeading')}
      </div>
      <div className='section-content'>
        {client.getText('introContent')}
      </div>
    </>
  );
}
