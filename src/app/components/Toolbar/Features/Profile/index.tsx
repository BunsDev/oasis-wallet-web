import { useContext, ReactNode } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Trans, useTranslation } from 'react-i18next'
import { Box } from 'grommet/es6/components/Box'
import { Button } from 'grommet/es6/components/Button'
import { ResponsiveContext } from 'grommet/es6/contexts/ResponsiveContext'
import { User } from 'grommet-icons/es6/icons/User'
import { selectUnlockedStatus } from 'app/state/selectUnlockedStatus'
import { UpdatePassword } from './UpdatePassword'
import { layerOverlayMinHeight } from './../layer'

type ProfileEmptyStateProps = {
  children: ReactNode
}

const ProfileEmptyState = ({ children }: ProfileEmptyStateProps) => (
  <Box gap="medium" align="center" pad={{ top: 'large' }}>
    <User size="36px" color="currentColor" />
    <Box pad="large">{children}</Box>
  </Box>
)

interface ProfileProps {
  closeHandler: () => any
}

export const Profile = ({ closeHandler }: ProfileProps) => {
  const { t } = useTranslation()
  const isMobile = useContext(ResponsiveContext) === 'small'
  const unlockedStatus = useSelector(selectUnlockedStatus)
  const isAvailable = unlockedStatus === 'unlockedProfile'
  const navigate = useNavigate()

  if (!isAvailable) {
    return (
      <ProfileEmptyState>
        <Box style={{ display: 'block' }}>
          <Trans
            i18nKey="toolbar.profile.notAvailable"
            t={t}
            components={{
              OpenWalletButton: (
                <Button
                  color="link"
                  onClick={() => {
                    closeHandler()
                    navigate('/open-wallet')
                  }}
                />
              ),
            }}
            defaults="You can setup your profile while <OpenWalletButton>opening a wallet</OpenWalletButton>."
          />
        </Box>
      </ProfileEmptyState>
    )
  }

  return (
    <Box flex="grow" height={{ min: isMobile ? 'auto' : layerOverlayMinHeight }} pad={{ vertical: 'medium' }}>
      <UpdatePassword />
    </Box>
  )
}
