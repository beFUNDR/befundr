'use client';
import React, { useState } from 'react';
import SecondaryButtonLabel from '../button/SecondaryButtonLabel';
import MainButtonLabel from '../button/MainButtonLabel';
import Link from 'next/link';
import MakeContributionPopup from '../popup/MakeContributionPopup';

type Props = {
  reward: Reward;
  projectStatus: ProjectStatus;
  projectId: string;
};

const RewardCardDetailled = (props: Props) => {
  const [isShowPopup, setIsShowPopup] = useState(false);

  return (
    <div className="flex justify-start items-start gap-6 w-full h-full ">
      {/* image */}
      <div className="bg-neutral-400 w-1/4 aspect-square"></div>
      {/* info */}
      <div className="flex flex-col items-start justify-between gap-2 w-full ">
        <p className="textStyle-headline">{props.reward.name}</p>
        <p className="textStyle-subheadline">{props.reward.price}$</p>
        {props.reward.maxSupply ? (
          <p className="textStyle-body">
            Limited supply : {props.reward.maxSupply}
            {props.reward.currentSupply >= props.reward.maxSupply && (
              <strong className="ml-4 !text-custom-red">Supply reached</strong>
            )}
          </p>
        ) : (
          <p className="textStyle-body">Illimited supply</p>
        )}
        <p className="textStyle-body">{props.reward.description}</p>
        <div className="grow"></div>
        <div className="flex justify-between items-center w-full mt-auto">
          <p className="textStyle-subheadline">
            {props.reward.currentSupply} contributors
          </p>
          {/* button if status fundraising */}
          {props.projectStatus === 'Fundraising' && (
            <div className="flex justify-end gap-4">
              <Link href={`/marketplace/${props.projectId}`}>
                <SecondaryButtonLabel label="Go to marketplace" />
              </Link>
              <button onClick={() => setIsShowPopup(true)}>
                <MainButtonLabel label="Contribute" />
              </button>
            </div>
          )}
          {/* button if status realizing */}
          {props.projectStatus === 'Realising' && (
            <Link href={`/marketplace/${props.projectId}`}>
              <MainButtonLabel label="Go to marketplace" />
            </Link>
          )}
        </div>
      </div>
      {isShowPopup && (
        <MakeContributionPopup
          reward={props.reward}
          handleClose={() => setIsShowPopup(false)}
        />
      )}
    </div>
  );
};

export default RewardCardDetailled;
