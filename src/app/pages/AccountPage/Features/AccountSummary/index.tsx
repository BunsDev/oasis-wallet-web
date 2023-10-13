import styled, { ThemeContext } from 'styled-components'
import { AddressBox, EditableAddressBox, EditableNameBox } from 'app/components/AddressBox'
import { AlertBox } from 'app/components/AlertBox'
import { AmountFormatter } from 'app/components/AmountFormatter'
import { AnchorLink } from 'app/components/AnchorLink'
import { Box } from 'grommet/es6/components/Box'
import { Text } from 'grommet/es6/components/Text'
import { ResponsiveContext } from 'grommet/es6/contexts/ResponsiveContext'
import { QRCodeCanvas } from 'qrcode.react'
import { useContext, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { walletActions } from 'app/state/wallet'
import { BalanceDetails } from 'app/state/account/types'
import { selectTicker } from 'app/state/network/selectors'
import { selectUnlockedStatus } from 'app/state/selectUnlockedStatus'
import { ManageableAccountEditModal } from 'app/components/Toolbar/Features/Account/ManageableAccountEditModal'
import { Wallet } from 'app/state/wallet/types'

const StyledDescriptionList = styled.dl`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin: ${({ theme }) => theme.global?.edgeSize?.xsmall} 0 0;
  padding: ${({ theme }) =>
    `${theme.global?.edgeSize?.small} ${theme.global?.edgeSize?.small} ${theme.global?.edgeSize?.xsmall}`};

  dt,
  dd {
    margin: 0;

    :first-of-type {
      font-weight: bold;
    }
  }

  @media only screen and (min-width: ${({ theme }) => `${theme.global?.breakpoints?.small?.value}px`}) {
    dt {
      width: 40%;
    }

    dd {
      width: 60%;
    }

    dt,
    dd {
      :not(:last-of-type) {
        margin-bottom: ${({ theme }) => theme.global?.edgeSize?.xsmall};
      }

      :first-of-type {
        font-size: ${({ theme }) => theme.text?.large?.size};
        line-height: ${({ theme }) => theme.text?.large?.height};
        margin-bottom: ${({ theme }) => theme.global?.edgeSize?.small};
      }
    }
  }

  @media only screen and (max-width: ${({ theme }) => `${theme.global?.breakpoints?.small?.value}px`}) {
    dt {
      width: 30%;
    }

    dd {
      width: 70%;
      text-align: right;
    }

    dt,
    dd {
      font-size: 16px;

      :not(:last-of-type) {
        margin-bottom: ${({ theme }) => theme.global?.edgeSize?.xxsmall};
      }

      :first-of-type {
        font-size: ${({ theme }) => theme.text?.medium?.size};
        line-height: ${({ theme }) => theme.text?.medium?.height};
        margin-bottom: ${({ theme }) => theme.global?.edgeSize?.xsmall};
      }
    }
  }
`

export interface AccountSummaryProps {
  address: string
  balance: BalanceDetails
  walletHasAccounts?: boolean
  wallet?: Wallet
}

export function AccountSummary({ address, balance, wallet, walletHasAccounts }: AccountSummaryProps) {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [layerVisibility, setLayerVisibility] = useState(false)
  const { dark } = useContext<any>(ThemeContext)
  const isMobile = useContext(ResponsiveContext) === 'small'
  const ticker = useSelector(selectTicker)
  const unlockedStatus = useSelector(selectUnlockedStatus)
  const unlockedProfile = unlockedStatus === 'unlockedProfile'
  const editHandler = (name: string) => {
    if (!wallet) {
      throw new Error('Wallet not provided')
    }
    dispatch(walletActions.setWalletName({ address: wallet.address, name }))
  }
  return (
    <>
      <Box margin={{ bottom: 'small' }}>
        {walletHasAccounts && wallet?.address === address && (
          <AlertBox status="ok-weak">{t('account.summary.yourAccount', 'This is your account.')}</AlertBox>
        )}
        {walletHasAccounts && wallet?.address !== address && (
          <AlertBox status="warning">
            {t('account.summary.notYourAccount', 'This is not your account.')}
          </AlertBox>
        )}
        {!walletHasAccounts && (
          <AlertBox status="warning">
            <Trans
              i18nKey="account.summary.noWalletIsOpen"
              t={t}
              components={{ HomeLink: <AnchorLink to="/" /> }}
              values={{ ticker }}
              defaults="To send, receive, stake and swap {{ticker}} tokens, <HomeLink>open your wallet</HomeLink>."
            />
          </AlertBox>
        )}
      </Box>
      <Box
        round="5px"
        border={{ color: 'background-front-border', size: '1px' }}
        background="background-front"
      >
        <Box pad="small" direction="row-responsive" flex justify="between">
          <Box width={{ max: isMobile ? '100%' : '75%' }}>
            {!unlockedProfile && <AddressBox address={address} separator />}
            {unlockedProfile && !wallet?.name && (
              <EditableAddressBox wallet={wallet} openEditModal={() => setLayerVisibility(true)} />
            )}
            {unlockedProfile && wallet?.name && (
              <EditableNameBox wallet={wallet} openEditModal={() => setLayerVisibility(true)} />
            )}
            <StyledDescriptionList data-testid="account-balance-summary">
              <dt>
                <Text size={isMobile ? 'medium' : 'large'}>
                  {t('account.summary.balance.total', 'Total')}
                </Text>
              </dt>
              <dd data-testid="account-balance-total">
                <AmountFormatter amount={balance.total} smallTicker={true} />
              </dd>

              <dt>{t('account.summary.balance.available', 'Available')}</dt>
              <dd>
                <AmountFormatter amount={balance.available} smallTicker={true} />
              </dd>

              <dt> {t('account.summary.balance.delegations', 'Staked')}</dt>
              <dd>
                <AmountFormatter amount={balance.delegations} smallTicker={true} />
              </dd>

              <dt>{t('account.summary.balance.debonding', 'Debonding')}</dt>
              <dd>
                <AmountFormatter amount={balance.debonding} smallTicker={true} />
              </dd>
            </StyledDescriptionList>
          </Box>

          {!isMobile && (
            <Box align="end">
              <QRCodeCanvas value={address} fgColor={dark ? '#e8e8e8' : '#333333'} bgColor="#00000000" />
            </Box>
          )}
        </Box>
      </Box>
      {layerVisibility && wallet && unlockedProfile && (
        <ManageableAccountEditModal
          animation
          closeHandler={() => setLayerVisibility(false)}
          editHandler={editHandler}
          wallet={wallet}
        />
      )}
    </>
  )
}
