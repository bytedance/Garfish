import React, { useState, useEffect } from 'react';
import GarfishInstance from 'garfish';

export interface MicroCompInfo {
  name: string;
  version?: string;
  componentList?: string[];
  componentName?: string;
  url?: string;
  props?: any;
}

function MicroComp(microCompInfo: Omit<MicroCompInfo, 'componentList'>) {
  const { name, version, componentName, url, props } = microCompInfo;
  const [Comp, setComp] = useState('');

  useEffect(() => {
    if (!Comp) {
      GarfishInstance.loadComponent(name, {
        url,
        version,
      }).then((res) => {
        const ResComp = res.cjsModules.module.exports;
        if (typeof ResComp === 'function') {
          setComp(() => ResComp);
          return;
        }
        if (componentName) {
          setComp(
            () => ResComp[componentName]?.default || ResComp[componentName],
          );
          return;
        }
        setComp(() => ResComp?.default || ResComp);
      });
    }
  });

  return Comp ? <Comp {...props} /> : <></>;
}
export default MicroComp;
