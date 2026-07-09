import { createStore } from 'vuex';
import auth from './modules/auth';
import clients from './modules/clients';
import invoices from './modules/invoices';
import ui from './modules/ui';

export default createStore({
  modules: {
    auth,
    clients,
    invoices,
    ui,
  },
});
