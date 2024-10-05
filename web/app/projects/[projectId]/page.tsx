'use client';
import { useBefundrProgramProject } from '@/components/befundrProgram/befundr-project-access';
import { useBefundrProgramUser } from '@/components/befundrProgram/befundr-user-access';
import Project from '@/components/project/project';
import { transformAccountToProject } from '@/utils/functions/projectsFunctions';
import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';

type Props = {
  params: {
    projectId: string;
  };
};

const page = (props: Props) => {
  //* GLOBAL STATE
  const { projectAccountFromAccountPublicKey: projectAccountFromPublicKey } =
    useBefundrProgramProject();

  //* LOCAL STATE
  // Use React Query to fetch project based on public key
  const {
    data: projectData,
    isLoading: isFetchingProject,
    refetch,
  } = projectAccountFromPublicKey(new PublicKey(props.params.projectId));

  const [projectToDisplay, setProjectToDisplay] = useState<Project | undefined>(
    undefined
  );

  // store a transformed data for UI
  useEffect(() => {
    if (projectData) {
      setProjectToDisplay(transformAccountToProject(projectData));
    }
  }, [projectData]);

  if (projectToDisplay)
    return (
      <Project
        project={projectToDisplay}
        projectId={props.params.projectId}
        refetchProject={refetch}
      />
    );
};

export default page;
