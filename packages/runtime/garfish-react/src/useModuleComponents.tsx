import React from 'react';
import MicroComp, { MicroCompInfo } from './components/MicroComp';

const useModuleComponents = (
  componentList: (Omit<MicroCompInfo, 'componentName' | 'props'> | string)[],
) => {
  return componentList.map((compInfo) => {
    if (typeof compInfo === 'string') {
      return (props: any) => <MicroComp name={compInfo} props={props} />;
    }
    const { componentList, ...rest } = compInfo;
    if (componentList) {
      return componentList.map((componentName) => {
        return (props: any) => (
          <MicroComp {...rest} componentName={componentName} props={props} />
        );
      });
    }

    return (props: any) => <MicroComp {...rest} props={props} />;
  });
};

export default useModuleComponents;
