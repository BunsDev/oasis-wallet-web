/**
 *
 * AccountSelector
 *
 */
import { walletActions } from 'app/state/wallet'
import { selectAddress, selectWallets } from 'app/state/wallet/selectors'
import { selectUnlockedStatus } from 'app/state/selectUnlockedStatus'
import { Box } from 'grommet/es6/components/Box'
import { Button } from 'grommet/es6/components/Button'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { ManageableAccount } from '../Account/ManageableAccount'
import { ScrollableContainer } from '../ScrollableContainer'

interface Props {
  closeHandler: () => any
}

export const AccountSelector = memo((props: Props) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const wallets = useSelector(selectWallets)
  const activeAddress = useSelector(selectAddress)
  const unlockedStatus = useSelector(selectUnlockedStatus)
  const unlockedProfile = unlockedStatus === 'unlockedProfile'
  const switchAccount = (address: string) => {
    dispatch(walletActions.selectWallet(address))
    props.closeHandler()
  }

  const accounts = Object.values(wallets).map(wallet => (
    <ManageableAccount
      editHandler={
        unlockedProfile
          ? (name: string) => {
              dispatch(walletActions.setWalletName({ address: wallet.address, name }))
            }
          : undefined
      }
      key={wallet.address}
      wallet={wallet}
      onClick={switchAccount}
      isActive={wallet.address === activeAddress}
    />
  ))

  return (
    <>
      <ScrollableContainer>{accounts}</ScrollableContainer>
      <Box align="end" pad={{ top: 'medium' }}>
        <Button primary label={t('toolbar.wallets.select', 'Select')} onClick={props.closeHandler} />
      </Box>
    </>
  )
})
