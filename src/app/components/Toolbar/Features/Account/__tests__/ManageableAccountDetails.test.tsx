import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { ThemeProvider } from 'styles/theme/ThemeProvider'
import { configureAppStore } from 'store/configureStore'
import { Wallet } from 'app/state/wallet/types'
import { PersistState } from 'app/state/persist/types'
import { persistActions } from 'app/state/persist'
import { ManageableAccountDetails } from '../ManageableAccountDetails'

const wallet = {
  address: 'oasis1qz0k5q8vjqvu4s4nwxyj406ylnflkc4vrcjghuwk',
  privateKey: 'private key',
} as Wallet
const state = {
  wallet: {
    selectedWallet: 'oasis1qz0k5q8vjqvu4s4nwxyj406ylnflkc4vrcjghuwk',
    wallets: {
      oasis1qz0k5q8vjqvu4s4nwxyj406ylnflkc4vrcjghuwk: wallet,
    },
  },
  persist: {
    hasPersistedProfiles: true,
    stringifiedEncryptionKey: 'unlockedProfile',
  } as PersistState,
}

const renderComponent = (store: any) =>
  render(
    <Provider store={store}>
      <ThemeProvider>
        <ManageableAccountDetails wallet={wallet} />
      </ThemeProvider>
    </Provider>,
  )

describe('<ManageableAccountDetails  />', () => {
  let store: ReturnType<typeof configureAppStore>

  it('should dispatch actions for persisted flow when closing layer', async () => {
    store = configureAppStore(state)
    const spy = jest.spyOn(store, 'dispatch')
    renderComponent(store)

    expect(spy).toHaveBeenNthCalledWith(1, {
      type: persistActions.resetPasswordCheckPass.type,
    })
    expect(spy).toHaveBeenNthCalledWith(2, {
      type: persistActions.resetWrongPassword.type,
    })

    await userEvent.click(screen.getByRole('button', { name: 'toolbar.settings.exportPrivateKey.title' }))
    expect(screen.getByText('toolbar.settings.exportPrivateKey.hint1')).toBeInTheDocument()
    expect(screen.getByText('toolbar.settings.exportPrivateKey.hint2')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('persist.loginToProfile.enterPasswordHere')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'toolbar.settings.cancel' }))

    expect(spy).toHaveBeenNthCalledWith(3, {
      type: persistActions.resetPasswordCheckPass.type,
    })
    expect(spy).toHaveBeenNthCalledWith(4, {
      type: persistActions.resetWrongPassword.type,
    })
  })
})
