import React from 'react';
import { baseConsole } from '~/utils/commonUtil';

const ChildModule = () => {
  baseConsole();
  return <div class='module'>这是一个子module</div>;
};

export default ChildModule;
