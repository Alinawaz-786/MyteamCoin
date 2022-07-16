import React, { useCallback } from 'react'
import { Currency, CurrencyAmount, Pair, Percent, Token, TokenAmount } from '@pancakeswap/sdk'
import { AddIcon, Button, InjectedModalProps, Text } from '@pancakeswap/uikit'
import { useTranslation } from 'contexts/Localization'
import TransactionConfirmationModal, {
  ConfirmationModalContent,
  TransactionErrorContent,
} from 'components/TransactionConfirmationModal'
import { AutoColumn } from 'components/Layout/Column'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { Field } from 'state/burn/actions'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/Logo'
import { ApprovalState } from 'hooks/useApproveCallback'
import { ZapErrorMessages } from '../../AddLiquidity/components/ZapErrorMessage'

interface ConfirmRemoveLiquidityModalProps {
  title: string
  customOnDismiss: () => void
  attemptingTxn: boolean
  pair?: Pair
  hash: string
  pendingText: string
  parsedAmounts: {
    [Field.LIQUIDITY_PERCENT]: Percent
    [Field.LIQUIDITY]?: TokenAmount
    [Field.CURRENCY_A]?: CurrencyAmount
    [Field.CURRENCY_B]?: CurrencyAmount
  }
  allowedSlippage: number
  onRemove: () => void
  liquidityErrorMessage: string
  approval: ApprovalState
  signatureData?: any
  tokenA: Token
  tokenB: Token
  currencyA: Currency | null | undefined
  currencyB: Currency | null | undefined
  isZap?: boolean
}

const ConfirmRemoveLiquidityModal: React.FC<InjectedModalProps & ConfirmRemoveLiquidityModalProps> = ({
  title,
  onDismiss,
  customOnDismiss,
  attemptingTxn,
  pair,
  hash,
  approval,
  signatureData,
  pendingText,
  parsedAmounts,
  allowedSlippage,
  onRemove,
  liquidityErrorMessage,
  tokenA,
  tokenB,
  currencyA,
  currencyB,
  isZap,
}) => {
  const { t } = useTranslation()

  const modalHeader = useCallback(() => {
    return (
      <AutoColumn gap="md">
        {parsedAmounts[Field.CURRENCY_A] && (
          <RowBetween align="flex-end">
            <Text fontSize="24px">{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6)}</Text>
            <RowFixed gap="4px">
              <CurrencyLogo currency={currencyA} size="24px" />
              <Text fontSize="24px" ml="10px">
                {currencyA?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
        )}
        {parsedAmounts[Field.CURRENCY_A] && parsedAmounts[Field.CURRENCY_B] && (
          <RowFixed>
            <AddIcon width="16px" />
          </RowFixed>
        )}
        {parsedAmounts[Field.CURRENCY_B] && (
          <RowBetween align="flex-end">
            <Text fontSize="24px">{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6)}</Text>
            <RowFixed gap="4px">
              <CurrencyLogo currency={currencyB} size="24px" />
              <Text fontSize="24px" ml="10px">
                {currencyB?.symbol}
              </Text>
            </RowFixed>
          </RowBetween>
        )}

        <Text small textAlign="left" pt="12px">
          {t('Output is estimated. If the price changes by more than %slippage%% your transaction will revert.', {
            slippage: allowedSlippage / 100,
          })}
        </Text>
      </AutoColumn>
    )
  }, [allowedSlippage, currencyA, currencyB, parsedAmounts, t])

  const modalBottom = useCallback(() => {
    return (
      <>
        <RowBetween>
          <Text>
            {t('%assetA%/%assetB% Burned', { assetA: currencyA?.symbol ?? '', assetB: currencyB?.symbol ?? '' })}
          </Text>
          <RowFixed>
            <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} margin />
            <Text>{parsedAmounts[Field.LIQUIDITY]?.toSignificant(6)}</Text>
          </RowFixed>
        </RowBetween>
        {pair && (
          <>
            <RowBetween>
              <Text>{t('Price')}</Text>
              <Text>
                1 {currencyA?.symbol} = {tokenA ? pair.priceOf(tokenA).toSignificant(6) : '-'} {currencyB?.symbol}
              </Text>
            </RowBetween>
            <RowBetween>
              <div />
              <Text>
                1 {currencyB?.symbol} = {tokenB ? pair.priceOf(tokenB).toSignificant(6) : '-'} {currencyA?.symbol}
              </Text>
            </RowBetween>
          </>
        )}
        <Button
          width="100%"
          mt="20px"
          disabled={!(approval === ApprovalState.APPROVED || signatureData !== null)}
          onClick={onRemove}
        >
          {t('Confirm')}
        </Button>
      </>
    )
  }, [currencyA, currencyB, parsedAmounts, approval, onRemove, pair, signatureData, tokenA, tokenB, t])

  const confirmationContent = useCallback(
    () =>
      liquidityErrorMessage ? (
        <>
          {isZap && <ZapErrorMessages isSingleToken />}
          <TransactionErrorContent onDismiss={onDismiss} message={liquidityErrorMessage} />
        </>
      ) : (
        <ConfirmationModalContent topContent={modalHeader} bottomContent={modalBottom} />
      ),
    [liquidityErrorMessage, isZap, onDismiss, modalHeader, modalBottom],
  )

  return (
    <TransactionConfirmationModal
      title={title}
      onDismiss={onDismiss}
      customOnDismiss={customOnDismiss}
      attemptingTxn={attemptingTxn}
      hash={hash}
      content={confirmationContent}
      pendingText={pendingText}
    />
  )
}

export default ConfirmRemoveLiquidityModal
