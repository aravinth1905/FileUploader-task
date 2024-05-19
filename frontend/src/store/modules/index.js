import Vue from '../../../frontend/node_modules/vue/types';
import Vuex from 'vuex';

import shipment from './modules/shipments';

Vue.use(Vuex);

function enableNamespacedModule() {
  const modules = {
    shipment,
  };
   // add new modules here;
  const keys = Object.keys(modules);
  keys.forEach((module) => {
    modules[module].namespaced = true;
  });
  return modules;
}
const modules = enableNamespacedModule();
export default new Vuex.Store({ modules });
