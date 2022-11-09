import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { AlertBox } from 'app/components/AlertBox'
import { ErrorFormatter } from 'app/components/ErrorFormatter'
import { ModalHeader } from 'app/components/Header'
import { ImportAccountsStepFormatter } from 'app/components/ImportAccountsStepFormatter'
import { ResponsiveLayer } from 'app/components/ResponsiveLayer'
import { Account } from 'app/components/Toolbar/Features/AccountSelector'
import { importAccountsActions } from 'app/state/importaccounts'
import {
  selectImportAccounts,
  selectImportAccountsOnCurrentPage,
  selectImportAccountsPageNumber,
  selectSelectedAccounts,
} from 'app/state/importaccounts/selectors'
import { ImportAccountsListAccount, ImportAccountsStep } from 'app/state/importaccounts/types'
import { walletActions } from 'app/state/wallet'
import { Box, Button, ResponsiveContext, Spinner, Text } from 'grommet'
import { numberOfAccountPages } from 'app/state/importaccounts/saga'
import { WalletType } from 'app/state/wallet/types'

interface ImportAccountsSelectorSelectorProps {
  accounts: ImportAccountsListAccount[]
}

function ImportAccountsSelector({ accounts }: ImportAccountsSelectorSelectorProps) {
  const dispatch = useDispatch()
  const toggleAccount = (address: string) => dispatch(importAccountsActions.toggleAccount(address))

  return (
    <Box gap="small">
      {accounts.map(a => (
        <Account
          address={a.address}
          balance={a.balance ? a.balance.available : undefined} // TODO: get total balance
          type={a.type}
          onClick={toggleAccount}
          isActive={a.selected}
          displayCheckbox={true}
          displayIndex={true}
          details={a.path.join('/')}
          key={a.address}
        />
      ))}
    </Box>
  )
}

interface ImportAccountsSelectionModalProps {
  abort: () => void
  type: WalletType.Mnemonic | WalletType.Ledger
}

export function ImportAccountsSelectionModal(props: ImportAccountsSelectionModalProps) {
  const { t } = useTranslation()
  const size = useContext(ResponsiveContext)
  const importAccounts = useSelector(selectImportAccounts)
  const accounts = useSelector(selectImportAccountsOnCurrentPage)
  const pageNum = useSelector(selectImportAccountsPageNumber)
  const error = importAccounts.error
  const selectedAccounts = useSelector(selectSelectedAccounts)
  const dispatch = useDispatch()

  const openAccounts = () => {
    dispatch(
      props.type === WalletType.Ledger
        ? walletActions.openWalletsFromLedger()
        : walletActions.openWalletFromMnemonic(),
    )
  }

  const isBusyImporting = importAccounts.step !== ImportAccountsStep.Idle
  const cancelDisabled = isBusyImporting && !error
  const confirmDisabled = isBusyImporting || selectedAccounts.length === 0

  const canGoPrev = !isBusyImporting && !!pageNum && !error

  const onPrev = () => {
    dispatch(importAccountsActions.setPage(pageNum - 1))
  }

  const canGoNext = !isBusyImporting && pageNum !== numberOfAccountPages - 1 && !error

  const onNext = () => {
    dispatch(importAccountsActions.setPage(pageNum + 1))
    if (props.type === 'ledger') {
      dispatch(importAccountsActions.enumerateMoreAccountsFromLedger())
    }
  }

  let selectionLabel: string
  switch (selectedAccounts.length) {
    case 0:
      selectionLabel = t('openWallet.importAccounts.noAccountSelected', 'No account selected')
      break
    case 1:
      selectionLabel = t('openWallet.importAccounts.oneAccountSelected', 'One account selected')
      break
    default:
      selectionLabel = t(
        'openWallet.importAccounts.multipleAccountsSelected',
        '{{ number }} accounts selected',
        { number: selectedAccounts.length },
      )
  }

  return (
    <ResponsiveLayer onEsc={props.abort} onClickOutside={props.abort} modal background="background-front">
      <Box width="800px" pad="medium">
        <ModalHeader>{t('openWallet.importAccounts.selectWallets', 'Select accounts to open')}</ModalHeader>
        <Box>
          <ImportAccountsSelector accounts={accounts} />
        </Box>
        {![ImportAccountsStep.Idle, ImportAccountsStep.LoadingBalances].includes(importAccounts.step) && (
          <Box direction="row" gap="medium" alignContent="center" pad={{ top: 'small' }}>
            <Spinner size="medium" />
            <Box alignSelf="center">
              <Text size="xlarge">
                <ImportAccountsStepFormatter step={importAccounts.step} />
              </Text>
            </Box>
          </Box>
        )}
        {error && (
          <AlertBox color="status-error">
            <ErrorFormatter code={error.code} message={error.message} />
          </AlertBox>
        )}
        <Box direction="row" gap="small" justify="between" pad={{ top: 'medium' }}>
          <Button
            disabled={!canGoPrev}
            label={size === 'small' ? '<' : `< ${t('openWallet.importAccounts.prev', 'Prev')}`}
            size={'small'}
            a11yTitle={t('openWallet.importAccounts.prev', 'Prev')}
            onClick={onPrev}
          />
          <Box>
            Page {importAccounts.accountsSelectionPageNumber + 1} / {numberOfAccountPages}
          </Box>
          <Button
            disabled={!canGoNext}
            label={size === 'small' ? '>' : `${t('openWallet.importAccounts.next', 'Next')} >`}
            size={'small'}
            a11yTitle={t('openWallet.importAccounts.next', 'Next')}
            onClick={onNext}
          />
        </Box>
        <Box direction="row" gap="small" justify="between" pad={{ top: 'medium' }}>
          <Button
            secondary
            label={t('common.cancel', 'Cancel')}
            onClick={props.abort}
            disabled={cancelDisabled}
          />
          <Text textAlign={'center'}>{selectionLabel}</Text>
          <Button
            primary
            data-testid="ledger-open-accounts"
            label={t('openWallet.importAccounts.openWallets', 'Open')}
            onClick={openAccounts}
            disabled={confirmDisabled}
          />
        </Box>
      </Box>
    </ResponsiveLayer>
  )
}
