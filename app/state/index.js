// @flow
import { PropTypes } from 'react';
import { observable, extendObservable, action } from 'mobx';
import { isfunction } from 'lodash/fp';
import User from '../domain/User';
import login from './login';
import type { loginState } from './login';
import settings from './settings';
import type { settingsState } from './settings';
import sidebar from './sidebar';
import type { sidebarState } from './sidebar';
import activeWallet from './active-wallet';
import type { activeWalletState } from './active-wallet';

export type appState = {
  user: User,
  router: {
    location: {
      hash: string,
      key: string,
      pathname: string,
      query: string,
      search: string,
      state: string
    }
  },
  i18n: {
    locale: string,
  },
  login: loginState,
  isInitialized: bool,
  isApplicationLoading: () => boolean,
  settings: settingsState,
  sidebar: sidebarState,
  activeWallet: activeWalletState,
  isCreateWalletDialogOpen: bool,
  reset: () => null
};

const initialState = {
  user: new User(),
  router: { location: null },
  i18n: { locale: 'en-US' },
  isInitialized: false,
  isCreateWalletDialogOpen: false
};

export default (): appState => {
  const state = observable(initialState);

  extendObservable(
    state,
    {
      login: login(state),
      settings: settings(state),
      sidebar: sidebar(state),
      activeWallet: activeWallet(state),
      get isApplicationLoading() {
        return !state.isInitialized;
      },
      reset: action(() => {
        // Reset sub states
        for (const key of Object.keys(state)) {
          if (isfunction(state[key].reset)) state[key].reset();
        }
        // Reset root state
        for (const key of Object.keys(initialState)) {
          state[key] = initialState[key];
        }
        // TODO: refactor this (the separation of login/user feels akward)
        state.user = new User();
      })
    }
  );

  return state;
};

export const appStatePropType = PropTypes.shape({
  user: PropTypes.object,
  router: PropTypes.object,
  i18n: PropTypes.object,
  sidebar: PropTypes.object,
  settings: PropTypes.object,
  wallets: PropTypes.object
});