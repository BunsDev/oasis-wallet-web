import { useState } from 'react'
import { Account } from './Account'
import { ManageableAccountEditModal } from './ManageableAccountEditModal'
import { Wallet } from '../../../../state/wallet/types'

export const ManageableAccount = ({
  editHandler,
  wallet,
  isActive,
  onClick,
}: {
  editHandler: (name: string) => void
  wallet: Wallet
  isActive: boolean
  onClick: (address: string) => void
}) => {
  const [layerVisibility, setLayerVisibility] = useState(false)

  return (
    <>
      <Account
        address={wallet.address}
        balance={wallet.balance}
        onClick={onClick}
        isActive={isActive}
        path={wallet.path}
        displayBalance={true}
        displayManageButton={{
          onClickManage: () => setLayerVisibility(true),
        }}
        name={wallet.name}
      />
      {layerVisibility && (
        <ManageableAccountEditModal
          closeHandler={() => setLayerVisibility(false)}
          editHandler={editHandler}
          wallet={wallet}
        />
      )}
    </>
  )
}
