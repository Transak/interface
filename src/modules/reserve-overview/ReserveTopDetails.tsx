import { ExternalLinkIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { Box, Button, Skeleton, SvgIcon, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { getMarketInfoById, MarketLogo } from 'src/components/MarketSwitcher';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

import { TopInfoPanel } from '../../components/TopInfoPanel/TopInfoPanel';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import {
  ComputedReserveData,
  useAppDataContext,
} from '../../hooks/app-data-provider/useAppDataProvider';

import CubeIcon from '../../../public/icons/markets/cube-icon.svg';
import PieIcon from '../../../public/icons/markets/pie-icon.svg';
import UptrendIcon from '../../../public/icons/markets/uptrend-icon.svg';
import DollarIcon from '../../../public/icons/markets/dollar-icon.svg';
import { useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { CircleIcon } from 'src/components/CircleIcon';
import { AddTokenDropdown } from './AddTokenDropdown';

interface ReserveTopDetailsProps {
  underlyingAsset: string;
}

export const ReserveTopDetails = ({ underlyingAsset }: ReserveTopDetailsProps) => {
  const router = useRouter();
  const { reserves, loading } = useAppDataContext();
  const { currentMarket, currentNetworkConfig, currentChainId } = useProtocolDataContext();
  const { market, network } = getMarketInfoById(currentMarket);
  const { addERC20Token, switchNetwork, chainId: connectedChainId } = useWeb3Context();
  const [copyClicked, setCopyClicked] = useState<boolean>(false);

  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset
  ) as ComputedReserveData;

  const valueTypographyVariant = downToSM ? 'main16' : 'main21';
  const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

  const ReserveIcon = () => {
    return (
      <Box mr={3} sx={{ mr: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Skeleton variant="circular" width={40} height={40} sx={{ background: '#383D51' }} />
        ) : (
          <img
            src={`/icons/tokens/${poolReserve.iconSymbol.toLowerCase()}.svg`}
            width="40px"
            height="40px"
            alt=""
          />
        )}
      </Box>
    );
  };

  const iconStyling = {
    display: 'inline-flex',
    alignItems: 'center',
    color: '#A5A8B6',
    '&:hover': { color: '#F1F1F3' },
    cursor: 'pointer',
  };

  const ReserveName = () => {
    return loading ? (
      <Skeleton width={60} height={28} sx={{ background: '#383D51' }} />
    ) : (
      <Typography variant={valueTypographyVariant}>{poolReserve.name}</Typography>
    );
  };

  const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

  // Copy token address to clipboard and display check for 1000ms
  const copyClick = async () => {
    navigator.clipboard.writeText(poolReserve.underlyingAsset);
    setCopyClicked(true);
    await delay(1000);
    setCopyClicked(false);
  };

  return (
    <TopInfoPanel
      titleComponent={
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: downToSM ? 'flex-start' : 'center',
              alignSelf: downToSM ? 'flex-start' : 'center',
              mb: 4,
              minHeight: '40px',
              flexDirection: downToSM ? 'column' : 'row',
            }}
          >
            <Button
              variant="surface"
              size="medium"
              color="primary"
              startIcon={
                <SvgIcon sx={{ fontSize: '20px' }}>
                  <ArrowBackRoundedIcon />
                </SvgIcon>
              }
              onClick={() => {
                // https://github.com/vercel/next.js/discussions/34980
                if (history.state.idx !== 0) router.back();
                else router.push('/markets');
              }}
              sx={{ mr: 3, mb: downToSM ? '24px' : '0' }}
            >
              <Trans>Go Back</Trans>
            </Button>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <MarketLogo size={20} logo={network.networkLogoPath} />
              <Typography variant="subheader1" sx={{ color: 'common.white' }}>
                {market.marketTitle} <Trans>Market</Trans>
              </Typography>
              {market.v3 && (
                <Box
                  sx={{
                    color: '#fff',
                    px: 2,
                    mx: 2,
                    borderRadius: '12px',
                    background: (theme) => theme.palette.gradients.aaveGradient,
                  }}
                >
                  <Typography variant="subheader2">Version 3</Typography>
                </Box>
              )}
            </Box>
          </Box>

          {downToSM && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
              <ReserveIcon />
              <Box>
                {!loading && (
                  <Typography sx={{ color: '#A5A8B6' }} variant="caption">
                    {poolReserve.symbol}
                  </Typography>
                )}
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ReserveName />
                  {loading ? (
                    <Skeleton width={16} height={16} sx={{ ml: 1, background: '#383D51' }} />
                  ) : (
                    <Box sx={{ display: 'flex' }}>
                      <CircleIcon tooltipText="View token contract" downToSM={downToSM}>
                        <Link
                          href={currentNetworkConfig.explorerLinkBuilder({
                            address: poolReserve?.underlyingAsset,
                          })}
                          sx={iconStyling}
                        >
                          <SvgIcon sx={{ fontSize: '14px' }}>
                            <ExternalLinkIcon />
                          </SvgIcon>
                        </Link>
                      </CircleIcon>

                      <CircleIcon
                        tooltipText={copyClicked ? 'Copied' : 'Copy token contract address'}
                        downToSM={downToSM}
                      >
                        <Box onClick={() => copyClick()} sx={iconStyling}>
                          <SvgIcon sx={{ fontSize: '14px' }}>
                            {copyClicked ? <CheckIcon /> : <ContentCopyIcon />}
                          </SvgIcon>
                        </Box>
                      </CircleIcon>
                      <AddTokenDropdown
                        poolReserve={poolReserve}
                        downToSM={downToSM}
                        switchNetwork={switchNetwork}
                        addERC20Token={addERC20Token}
                        currentChainId={currentChainId}
                        connectedChainId={connectedChainId}
                      />
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      }
    >
      {!downToSM && (
        <TopInfoPanelItem
          title={!loading && <Trans>{poolReserve.symbol}</Trans>}
          withoutIconWrapper
          icon={<ReserveIcon />}
          loading={loading}
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <ReserveName />
            {loading ? (
              <Skeleton width={16} height={16} sx={{ ml: 1, background: '#383D51' }} />
            ) : (
              <Box sx={{ display: 'flex' }}>
                <CircleIcon tooltipText="View token contract" downToSM={downToSM}>
                  <Link
                    href={currentNetworkConfig.explorerLinkBuilder({
                      address: poolReserve?.underlyingAsset,
                    })}
                    sx={iconStyling}
                  >
                    <SvgIcon sx={{ fontSize: '14px' }}>
                      <ExternalLinkIcon />
                    </SvgIcon>
                  </Link>
                </CircleIcon>

                <CircleIcon
                  tooltipText={copyClicked ? 'Copied' : 'Copy token contract address'}
                  downToSM={downToSM}
                >
                  <Box onClick={() => copyClick()} sx={iconStyling}>
                    <SvgIcon sx={{ fontSize: '14px' }}>
                      {copyClicked ? <CheckIcon /> : <ContentCopyIcon />}
                    </SvgIcon>
                  </Box>
                </CircleIcon>
                <AddTokenDropdown
                  poolReserve={poolReserve}
                  downToSM={downToSM}
                  switchNetwork={switchNetwork}
                  addERC20Token={addERC20Token}
                  currentChainId={currentChainId}
                  connectedChainId={connectedChainId}
                />
              </Box>
            )}
          </Box>
        </TopInfoPanelItem>
      )}

      <TopInfoPanelItem icon={<CubeIcon />} title={<Trans>Reserve Size</Trans>} loading={loading}>
        <FormattedNumber
          value={poolReserve?.totalLiquidityUSD}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        icon={<PieIcon />}
        title={<Trans>Available liquidity</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={poolReserve?.availableLiquidityUSD}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        icon={<UptrendIcon />}
        title={<Trans>Utilization Rate</Trans>}
        loading={loading}
      >
        <FormattedNumber
          value={poolReserve?.borrowUsageRatio}
          percent
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem icon={<DollarIcon />} title={<Trans>Oracle price</Trans>} loading={loading}>
        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
          <FormattedNumber
            value={poolReserve?.priceInUSD}
            symbol="USD"
            variant={valueTypographyVariant}
            symbolsVariant={symbolsTypographyVariant}
            symbolsColor="#A5A8B6"
          />
          {loading ? (
            <Skeleton width={16} height={16} sx={{ ml: 1, background: '#383D51' }} />
          ) : (
            <CircleIcon tooltipText="View oracle contract" downToSM={downToSM}>
              <Link
                href={currentNetworkConfig.explorerLinkBuilder({
                  address: poolReserve?.priceOracle,
                })}
                sx={iconStyling}
              >
                <SvgIcon sx={{ fontSize: downToSM ? '12px' : '14px' }}>
                  <ExternalLinkIcon />
                </SvgIcon>
              </Link>
            </CircleIcon>
          )}
        </Box>
      </TopInfoPanelItem>
    </TopInfoPanel>
  );
};
