import { useContext, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import copy from 'copy-to-clipboard'
import { Box } from 'grommet/es6/components/Box'
import { Button } from 'grommet/es6/components/Button'
import { Form } from 'grommet/es6/components/Form'
import { Notification } from 'grommet/es6/components/Notification'
import { ResponsiveContext } from 'grommet/es6/contexts/ResponsiveContext'
import { Tab } from 'grommet/es6/components/Tab'
import { Tabs } from 'grommet/es6/components/Tabs'
import { Text } from 'grommet/es6/components/Text'
import { Copy } from 'grommet-icons/es6/icons/Copy'
import { useTranslation } from 'react-i18next'
import { NoTranslate } from 'app/components/NoTranslate'
import { PasswordField } from 'app/components/PasswordField'
import { persistActions } from 'app/state/persist'
import { selectEnteredWrongPassword, selectPasswordCheckPass } from 'app/state/persist/selectors'
import { selectUnlockedStatus } from 'app/state/selectUnlockedStatus'
import { preventSavingInputsToUserData } from 'app/lib/preventSavingInputsToUserData'
import { Wallet } from '../../../../state/wallet/types'
import { DerivationFormatter } from './DerivationFormatter'
import { AddressBox } from '../../../AddressBox'
import { layerOverlayMinHeight } from '../layer'
import { LayerContainer } from './../LayerContainer'
import { uintToBase64, hex2uint } from '../../../../lib/helpers'

interface ManageableAccountDetailsProps {
  wallet: Wallet
}

export const ManageableAccountDetails = ({ wallet }: ManageableAccountDetailsProps) => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const enteredWrongPassword = useSelector(selectEnteredWrongPassword)
  const passwordCheckPass = useSelector(selectPasswordCheckPass)
  const unlockedStatus = useSelector(selectUnlockedStatus)
  const needsPasswordVerification = unlockedStatus === 'unlockedProfile'
  const [layerVisibility, setLayerVisibility] = useState(false)
  const [password, setPassword] = useState('')
  const [acknowledge, setAcknowledge] = useState(false)
  const [notificationVisible, setNotificationVisible] = useState(false)
  const isMobile = useContext(ResponsiveContext) === 'small'
  const copyAddress = () => {
    const wasCopied = copy(uintToBase64(hex2uint(wallet.privateKey!)))
    if (wasCopied) {
      setNotificationVisible(true)
    }
  }
  const hideLayer = () => {
    if (needsPasswordVerification) {
      dispatch(persistActions.resetPasswordCheckPass())
      dispatch(persistActions.resetWrongPassword())
    } else {
      setAcknowledge(false)
    }
    setPassword('')
    setLayerVisibility(false)
  }
  const onSubmit = () => dispatch(persistActions.checkPasswordAsync({ currentPassword: password }))

  return (
    <>
      <Box>
        <AddressBox address={wallet.address} border />
        <Text size="small" margin={'small'}>
          <DerivationFormatter pathDisplay={wallet.pathDisplay} type={wallet.type} />
        </Text>
        <Button
          alignSelf="start"
          label={t('toolbar.settings.exportPrivateKey.title', 'Export Private Key')}
          disabled={!wallet.privateKey}
          onClick={() => setLayerVisibility(true)}
        />
      </Box>
      {layerVisibility && (
        <LayerContainer hideLayer={hideLayer}>
          <Tabs alignControls="start">
            <Tab title={t('toolbar.settings.exportPrivateKey.title', 'Export Private Key')}>
              <Box
                flex="grow"
                justify="between"
                height={{ min: isMobile ? 'auto' : layerOverlayMinHeight }}
                pad={{ vertical: 'medium' }}
              >
                <Box gap="medium">
                  <Box gap="medium">
                    <Text>
                      {t(
                        'toolbar.settings.exportPrivateKey.hint1',
                        'The private key consists of a string of characters. Anyone with access to your private key has direct access to the assets of that account.',
                      )}
                    </Text>
                    <Text>
                      {t(
                        'toolbar.settings.exportPrivateKey.hint2',
                        'Once the private key is lost, it cannot be retrieved. Please make sure to Backup the private key and keep it in a safe place.',
                      )}
                    </Text>
                  </Box>
                  {!needsPasswordVerification && !acknowledge && (
                    <Button
                      alignSelf="center"
                      primary
                      label={t(
                        'toolbar.settings.exportPrivateKey.confirm',
                        'I understand, reveal my private key',
                      )}
                      onClick={() => setAcknowledge(true)}
                    />
                  )}

                  {needsPasswordVerification && !passwordCheckPass && (
                    <Form onSubmit={onSubmit} {...preventSavingInputsToUserData}>
                      <PasswordField
                        placeholder={t(
                          'persist.loginToProfile.enterPasswordHere',
                          'Enter your password here',
                        )}
                        name="password"
                        inputElementId="password"
                        autoFocus
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                        error={
                          enteredWrongPassword
                            ? t('persist.loginToProfile.wrongPassword', 'Wrong password')
                            : false
                        }
                        showTip={t('persist.loginToProfile.showPassword', 'Show password')}
                        hideTip={t('persist.loginToProfile.hidePassword', 'Hide password')}
                        width="auto"
                      />
                      <Box direction="row" justify="end" margin={{ top: 'medium' }}>
                        <Button
                          primary
                          type="submit"
                          label={t(
                            'toolbar.settings.exportPrivateKey.confirm',
                            'I understand, reveal my private key',
                          )}
                        />
                      </Box>
                    </Form>
                  )}

                  {((!needsPasswordVerification && acknowledge) ||
                    (needsPasswordVerification && passwordCheckPass)) && (
                    <Box direction="row" gap="small">
                      <Box round="5px" border={{ color: 'brand' }} pad="small" style={{ display: 'block' }}>
                        <NoTranslate>{uintToBase64(hex2uint(wallet.privateKey!))}</NoTranslate>
                      </Box>
                      <Button
                        onClick={() => copyAddress()}
                        icon={<Copy size="18px" />}
                        data-testid="copy-address"
                      />
                    </Box>
                  )}
                </Box>
                <Box direction="row" justify="between" pad={{ top: 'large' }}>
                  <Button secondary label={t('toolbar.settings.cancel', 'Cancel')} onClick={hideLayer} />
                </Box>
              </Box>
            </Tab>
          </Tabs>
        </LayerContainer>
      )}
      {notificationVisible && (
        <Notification
          toast
          status={'normal'}
          title={t('toolbar.settings.exportPrivateKey.copied', 'Private key copied.')}
          onClose={() => setNotificationVisible(false)}
        />
      )}
    </>
  )
}
