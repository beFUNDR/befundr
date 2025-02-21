import { BN } from '@coral-xyz/anchor';
import { ProjectStatus } from "./project_status"
import { ProjectCategory } from './category_type';

// Some attributes are optional because they are set by the program at creation
export type Project = {
  owner?: string
  user?: string
  metadataUri: string
  goalAmount: BN
  raisedAmount?: BN
  createdTime: BN
  endTime: BN
  status?: ProjectStatus
  contributionCounter?: BN
  safetyDeposit: BN,
  category: ProjectCategory
}