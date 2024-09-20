'use client';
import ProjectMarketplace from '@/components/marketplace/projectMarketplace';
import { projects } from '@/data/localdata';
import { getProjectById } from '@/utils/functions/projectsFunctions';
import React, { useEffect, useState } from 'react';

type Props = {
  params: {
    projectId: string;
  };
};

const page = (props: Props) => {
  //* LOCAL STATE
  const [projectToDisplay, setProjectToDisplay] = useState<Project | undefined>(
    undefined
  );

  useEffect(() => {
    setProjectToDisplay(getProjectById(projects, props.params.projectId));
  }, [props.params.projectId]);

  if (projectToDisplay)
    return <ProjectMarketplace project={projectToDisplay} />;
};

export default page;
