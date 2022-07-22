import React, { ReactNode } from 'react';
import { Trans } from '@lingui/macro';
import {
  Alert,
  Box,
  BoxProps,
  Divider,
  Link,
  SvgIcon,
  Typography,
  TypographyProps,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import Paper from '@mui/material/Paper';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { useReserveRatesHistory } from 'src/hooks/useReservesHistory';
import { ParentSize } from '@visx/responsive';
import { ApyChart } from '../reserve-overview/ApyChart';
import { InterestRateModelChart } from '../reserve-overview/InterestRateModelChart';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { ComputedReserveData } from 'src/hooks/app-data-provider/useAppDataProvider';
import { StableAPYTooltip } from 'src/components/infoTooltips/StableAPYTooltip';
import { VariableAPYTooltip } from 'src/components/infoTooltips/VariableAPYTooltip';
import { IncentivesButton } from 'src/components/incentives/IncentivesButton';
import { ReserveOverviewBox } from 'src/components/ReserveOverviewBox';
import { getEmodeMessage } from 'src/components/transactions/Emode/EmodeNaming';
import LightningBoltGradient from '/public/lightningBoltGradient.svg';
import { ROUTES } from 'src/components/primitives/Link';
import { MaxLTVTooltip } from 'src/components/infoTooltips/MaxLTVTooltip';
import { LiquidationThresholdTooltip } from 'src/components/infoTooltips/LiquidationThresholdTooltip';
import { LiquidationPenaltyTooltip } from 'src/components/infoTooltips/LiquidationPenaltyTooltip';
import { ReserveSubheader } from 'src/components/ReserveSubheader';
import { frozenProposalMap } from 'src/utils/marketsAndNetworksConfig';
import { TotalSuppliedTooltip } from 'src/components/infoTooltips/TotalSuppliedTooltip';
import { TotalBorrowedTooltip } from 'src/components/infoTooltips/TotalBorrowedTooltip';
import { CapsCircularStatus } from 'src/components/caps/CapsCircularStatus';
import { DebtCeilingStatus } from 'src/components/caps/DebtCeilingStatus';

export const PanelRow: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      position: 'relative',
      display: { xs: 'block', md: 'flex' },
      margin: '0 auto',
      ...props.sx,
    }}
  />
);
export const PanelTitle: React.FC<TypographyProps> = (props) => (
  <Typography
    {...props}
    variant="subheader1"
    sx={{ minWidth: { xs: '170px' }, mr: 4, mb: { xs: 6, md: 0 }, ...props.sx }}
  />
);

interface PanelColumnProps {
  children?: ReactNode;
}

export const PanelColumn = ({ children }: PanelColumnProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        flex: 1,
        overflow: 'hidden',
        py: 1,
      }}
    >
      {children}
    </Box>
  );
};

interface PanelItemProps {
  title: ReactNode;
}

export const PanelItem: React.FC<PanelItemProps> = ({ title, children }) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <Box
      sx={{
        position: 'relative',
        '&:not(:last-child)': {
          pr: 4,
          mr: 4,
        },
        ...(mdUp
          ? {
              '&:not(:last-child)::after': {
                content: '""',
                height: '32px',
                position: 'absolute',
                right: 4,
                top: 'calc(50% - 17px)',
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
              },
            }
          : {}),
      }}
    >
      <Typography color="text.secondary">{title}</Typography>
      <PanelColumn>{children}</PanelColumn>
    </Box>
  );
};

const ChartContainer: React.FC<BoxProps> = (props) => (
  <Box
    {...props}
    sx={{
      minWidth: 0,
      width: '100%',
      maxWidth: '100%',
      height: 300,
      marginLeft: 0,
      flexGrow: 1,
      ...props.sx,
    }}
  />
);

type ReserveConfigurationProps = {
  reserve: ComputedReserveData;
  supplyCapUsage: number;
  borrowCapUsage: number;
  debtCeilingUsage: number;
};

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({
  reserve,
  supplyCapUsage,
  borrowCapUsage,
  debtCeilingUsage,
}) => {
  const { currentNetworkConfig, currentMarketData } = useProtocolDataContext();
  const renderCharts = !!currentNetworkConfig.ratesHistoryApiUrl;
  const { data, error } = useReserveRatesHistory(
    reserve
      ? `${reserve.underlyingAsset}${currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}`
      : ''
  ); // TODO: might make sense to move this to gql as well

  return (
    <Paper sx={{ py: '16px', px: '24px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          mb: reserve.isFrozen ? '0px' : '36px',
        }}
      >
        <Typography variant="h3">
          <Trans>Reserve status &#38; configuration</Trans>
        </Typography>
      </Box>

      {reserve.isFrozen && (
        <Box>
          <Alert sx={{ mt: '16px', mb: '40px' }} severity="error">
            <Trans>
              {reserve.symbol} is frozen due to an Aave Protocol Governance decision.{' '}
              <Link
                href={
                  frozenProposalMap[reserve.symbol]
                    ? frozenProposalMap[reserve.symbol]
                    : 'https://app.aave.com/governance'
                }
                sx={{ textDecoration: 'underline' }}
              >
                <Trans>More details</Trans>
              </Link>
            </Trans>
          </Alert>
        </Box>
      )}

      <PanelRow>
        <PanelTitle>Supply Info</PanelTitle>
        <Box sx={{ minWidth: 0, maxWidth: '100%', width: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {reserve.supplyCap && reserve.supplyCap !== '0' && (
              <CapsCircularStatus value={supplyCapUsage} />
            )}
            <PanelItem
              title={
                <Box display="flex" alignItems="center">
                  <Trans>Total supplied</Trans>
                  {reserve.supplyCap && reserve.supplyCap !== '0' && <TotalSuppliedTooltip />}
                </Box>
              }
            >
              {reserve.supplyCap && reserve.supplyCap !== '0' ? (
                <>
                  <Box>
                    <FormattedNumber value={reserve.totalLiquidity} variant="main16" compact />
                    <Typography
                      component="span"
                      color="text.primary"
                      variant="secondary16"
                      sx={{ display: 'inline-block', mx: 1 }}
                    >
                      <Trans>of</Trans>
                    </Typography>
                    <FormattedNumber value={reserve.supplyCap} variant="main16" />
                  </Box>
                  <Box>
                    <ReserveSubheader value={reserve.totalLiquidityUSD} />
                    <Typography
                      component="span"
                      color="text.secondary"
                      variant="secondary12"
                      sx={{ display: 'inline-block', mx: 1 }}
                    >
                      <Trans>of</Trans>
                    </Typography>
                    <ReserveSubheader value={reserve.supplyCapUSD} />
                  </Box>
                </>
              ) : (
                <>
                  <FormattedNumber value={reserve.totalLiquidity} variant="main16" compact />
                  <ReserveSubheader value={reserve.totalLiquidityUSD} />
                </>
              )}
            </PanelItem>

            <PanelItem title={<Trans>APY</Trans>}>
              <FormattedNumber value={reserve.supplyAPY} percent variant="main16" />
              <IncentivesButton
                symbol={reserve.symbol}
                incentives={reserve.aIncentivesData}
                displayBlank={true}
              />
            </PanelItem>
            {reserve.unbacked && reserve.unbacked !== '0' && (
              <PanelItem title={<Trans>Unbacked</Trans>}>
                <FormattedNumber value={reserve.unbacked} variant="main16" symbol={reserve.name} />
                <ReserveSubheader value={reserve.unbackedUSD} />
              </PanelItem>
            )}
          </Box>
          {renderCharts && !error && reserve.borrowingEnabled && (
            <ChartContainer sx={{ mt: 4, pb: 8 }}>
              <ParentSize>
                {(parent) => (
                  <ApyChart
                    width={parent.width}
                    height={parent.height}
                    data={data}
                    fields={[{ name: 'liquidityRate', color: '#2EBAC6', text: 'Supply APR' }]}
                  />
                )}
              </ParentSize>
            </ChartContainer>
          )}
          <div>
            {reserve.isIsolated ? (
              <Box sx={{ pt: '42px', pb: '12px' }}>
                <Typography variant="secondary14" color="text.secondary" paddingBottom={'12px'}>
                  <Trans>Collateral usage</Trans>
                </Typography>
                <Alert severity="warning">
                  <Typography variant="subheader1">
                    <Trans>Asset can only be used as collateral in isolation mode only.</Trans>
                  </Typography>
                  <Typography variant="caption">
                    In Isolation mode you cannot supply other assets as collateral for borrowing.
                    Assets used as collateral in Isolation mode can only be borrowed to a specific
                    debt ceiling.{' '}
                    <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">
                      Learn more
                    </Link>
                  </Typography>
                </Alert>
              </Box>
            ) : reserve.usageAsCollateralEnabled ? (
              <Box
                sx={{ display: 'inline-flex', alignItems: 'center', pt: '42px', pb: '12px' }}
                paddingTop={'42px'}
              >
                <Typography variant="secondary14" color="text.secondary">
                  <Trans>Collateral usage</Trans>
                </Typography>
                <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 2 }} />
                <Typography variant="subheader1" sx={{ color: '#46BC4B' }}>
                  <Trans>Can be collateral</Trans>
                </Typography>
              </Box>
            ) : (
              <Box sx={{ pt: '42px', pb: '12px' }}>
                <Typography variant="secondary14" color="text.secondary">
                  <Trans>Collateral usage</Trans>
                </Typography>
                <Alert sx={{ my: '12px' }} severity="warning">
                  <Trans>Asset cannot be used as collateral.</Trans>
                </Alert>
              </Box>
            )}
          </div>
          {reserve.usageAsCollateralEnabled && (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
              }}
            >
              <ReserveOverviewBox
                title={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
              >
                <FormattedNumber
                  value={reserve.formattedBaseLTVasCollateral}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>

              <ReserveOverviewBox
                title={
                  <LiquidationThresholdTooltip
                    variant="description"
                    text={<Trans>Liquidation threshold</Trans>}
                  />
                }
              >
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationThreshold}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>

              <ReserveOverviewBox
                title={
                  <LiquidationPenaltyTooltip
                    variant="description"
                    text={<Trans>Liquidation penalty</Trans>}
                  />
                }
              >
                <FormattedNumber
                  value={reserve.formattedReserveLiquidationBonus}
                  percent
                  variant="secondary14"
                  visibleDecimals={2}
                />
              </ReserveOverviewBox>

              {reserve.isIsolated && (
                <ReserveOverviewBox fullWidth>
                  <DebtCeilingStatus
                    debt={reserve.isolationModeTotalDebt}
                    ceiling={reserve.debtCeiling}
                    usage={debtCeilingUsage}
                  />
                </ReserveOverviewBox>
              )}
            </Box>
          )}
        </Box>
      </PanelRow>

      {reserve.borrowingEnabled && (
        <>
          <Divider sx={{ my: '40px' }} />
          <PanelRow>
            <PanelTitle>Borrow info</PanelTitle>
            <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                {reserve.borrowCap && reserve.borrowCap !== '0' && (
                  <CapsCircularStatus value={borrowCapUsage} />
                )}
                <PanelItem
                  title={
                    <Box display="flex" alignItems="center">
                      <Trans>Total borrowed</Trans>
                      {reserve.borrowCap && reserve.borrowCap !== '0' && <TotalBorrowedTooltip />}
                    </Box>
                  }
                >
                  {reserve.borrowCap && reserve.borrowCap !== '0' ? (
                    <>
                      <Box>
                        <FormattedNumber value={reserve.totalDebt} variant="main16" />
                        <Typography
                          component="span"
                          color="text.primary"
                          variant="secondary16"
                          sx={{ display: 'inline-block', mx: 1 }}
                        >
                          <Trans>of</Trans>
                        </Typography>
                        <FormattedNumber value={reserve.borrowCap} variant="main16" />
                      </Box>
                      <Box>
                        <ReserveSubheader value={reserve.totalDebtUSD} />
                        <Typography
                          component="span"
                          color="text.primary"
                          variant="secondary16"
                          sx={{ display: 'inline-block', mx: 1 }}
                        >
                          <Trans>of</Trans>
                        </Typography>
                        <ReserveSubheader value={reserve.borrowCapUSD} />
                      </Box>
                    </>
                  ) : (
                    <>
                      <FormattedNumber value={reserve.totalDebt} variant="main16" />
                      <ReserveSubheader value={reserve.totalDebtUSD} />
                    </>
                  )}
                </PanelItem>
                <PanelItem
                  title={
                    <VariableAPYTooltip
                      text={<Trans>APY, variable</Trans>}
                      key="APY_res_variable_type"
                      variant="description"
                    />
                  }
                >
                  <FormattedNumber value={reserve.variableBorrowAPY} percent variant="main16" />
                  <IncentivesButton
                    symbol={reserve.symbol}
                    incentives={reserve.vIncentivesData}
                    displayBlank={true}
                  />
                </PanelItem>
                {reserve.stableBorrowRateEnabled && (
                  <PanelItem
                    title={
                      <StableAPYTooltip
                        text={<Trans>APY, stable</Trans>}
                        key="APY_res_stable_type"
                        variant="description"
                      />
                    }
                  >
                    <FormattedNumber value={reserve.stableBorrowAPY} percent variant="main16" />
                    <IncentivesButton
                      symbol={reserve.symbol}
                      incentives={reserve.sIncentivesData}
                      displayBlank={true}
                    />
                  </PanelItem>
                )}
                {reserve.borrowCapUSD && reserve.borrowCapUSD !== '0' && (
                  <PanelItem title={<Trans>Borrow cap</Trans>}>
                    <FormattedNumber value={reserve.borrowCap} variant="main16" />
                    <ReserveSubheader value={reserve.borrowCapUSD} />
                  </PanelItem>
                )}
              </Box>
              {renderCharts && !error && (
                <ChartContainer sx={{ mt: 8 }}>
                  <ParentSize>
                    {(parent) => (
                      <ApyChart
                        width={parent.width}
                        height={parent.height}
                        data={data}
                        fields={[
                          ...(reserve.stableBorrowRateEnabled
                            ? ([
                                {
                                  name: 'stableBorrowRate',
                                  color: '#0062D2',
                                  text: 'Borrow APR, stable',
                                },
                              ] as const)
                            : []),
                          {
                            name: 'variableBorrowRate',
                            color: '#B6509E',
                            text: 'Borrow APR, variable',
                          },
                        ]}
                      />
                    )}
                  </ParentSize>
                </ChartContainer>
              )}
            </Box>
          </PanelRow>
        </>
      )}

      {reserve.eModeCategoryId !== 0 && (
        <>
          <Divider sx={{ my: '40px' }} />
          <PanelRow>
            <PanelTitle>E-Mode info</PanelTitle>
            <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: '100%', width: '100%' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <Typography variant="secondary14" color="text.secondary">
                  <Trans>E-Mode Category</Trans>
                </Typography>
                <SvgIcon sx={{ fontSize: '14px', mr: 0.5, ml: 2 }}>
                  <LightningBoltGradient />
                </SvgIcon>
                <Typography variant="subheader1">
                  {getEmodeMessage(reserve.eModeCategoryId, currentNetworkConfig.baseAssetSymbol)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  pt: '12px',
                }}
              >
                <ReserveOverviewBox
                  title={<MaxLTVTooltip variant="description" text={<Trans>Max LTV</Trans>} />}
                >
                  <FormattedNumber
                    value={reserve.formattedEModeLtv}
                    percent
                    variant="secondary14"
                    visibleDecimals={2}
                  />
                </ReserveOverviewBox>
                <ReserveOverviewBox
                  title={
                    <LiquidationThresholdTooltip
                      variant="description"
                      text={<Trans>Liquidation threshold</Trans>}
                    />
                  }
                >
                  <FormattedNumber
                    value={reserve.formattedEModeLiquidationThreshold}
                    percent
                    variant="secondary14"
                    visibleDecimals={2}
                  />
                </ReserveOverviewBox>
                <ReserveOverviewBox
                  title={
                    <LiquidationPenaltyTooltip
                      variant="description"
                      text={<Trans>Liquidation penalty</Trans>}
                    />
                  }
                >
                  <FormattedNumber
                    value={reserve.formattedEModeLiquidationBonus}
                    percent
                    variant="secondary14"
                    visibleDecimals={2}
                  />
                </ReserveOverviewBox>
              </Box>
              <Typography variant="caption" color="text.secondary" paddingTop="24px">
                <Trans>
                  E-Mode increases your LTV for a selected category of assets, meaning that when
                  E-mode is enabled, you will have higher borrowing power over assets of the same
                  E-mode category which are defined by Aave Governance. You can enter E-Mode from
                  your{' '}
                  <Link
                    href={ROUTES.dashboard}
                    sx={{ textDecoration: 'underline' }}
                    variant="caption"
                    color="text.secondary"
                  >
                    Dashboard
                  </Link>
                  . To learn more about E-Mode and applied restrictions in{' '}
                  <Link
                    href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
                    sx={{ textDecoration: 'underline' }}
                    variant="caption"
                    color="text.secondary"
                  >
                    FAQ
                  </Link>{' '}
                  or{' '}
                  <Link
                    href="https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf"
                    sx={{ textDecoration: 'underline' }}
                    variant="caption"
                    color="text.secondary"
                  >
                    Aave V3 Technical Paper
                  </Link>
                  .
                </Trans>
              </Typography>
            </Box>
          </PanelRow>
        </>
      )}

      {reserve.borrowingEnabled && (
        <>
          <Divider sx={{ my: '40px' }} />

          <PanelRow>
            <PanelTitle>Interest rate model</PanelTitle>
            <ChartContainer>
              <ParentSize>
                {(parent) => (
                  <InterestRateModelChart
                    width={parent.width}
                    height={parent.height}
                    reserve={{
                      baseStableBorrowRate: reserve.baseStableBorrowRate,
                      baseVariableBorrowRate: reserve.baseVariableBorrowRate,
                      optimalUsageRatio: reserve.optimalUsageRatio,
                      stableRateSlope1: reserve.stableRateSlope1,
                      stableRateSlope2: reserve.stableRateSlope2,
                      utilizationRate: reserve.borrowUsageRatio,
                      variableRateSlope1: reserve.variableRateSlope1,
                      variableRateSlope2: reserve.variableRateSlope2,
                      stableBorrowRateEnabled: reserve.stableBorrowRateEnabled,
                    }}
                  />
                )}
              </ParentSize>
            </ChartContainer>
          </PanelRow>
        </>
      )}
    </Paper>
  );
};
