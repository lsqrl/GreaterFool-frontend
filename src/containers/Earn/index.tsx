// const mobileHiddenColumnClass = "hidden md:table-cell";
import { FC, useEffect, useState } from "react";

import classNames from "classnames";
import { Box, Image, Input, Link, InputGroup, Text, Stack } from "@chakra-ui/react";
import ABI from '../../contracts/greaterFool.abi'

import { Button, ButtonGroup } from '@chakra-ui/react';
import { useAccount, usePrepareContractWrite, useContractWrite, useContractRead, useWaitForTransaction, erc20ABI } from "wagmi";

import { GreaterFool, Discord } from '@/assets/svgs'; 

import { ethers } from "ethers";

const EarnContainer: FC = () => {

  const BigNumber = require('bignumber.js');

  const [isButtonBuyClicked, setButtonBuyClicked] = useState(false);
  const [isButtonRedeemClicked, setButtonRedeemClicked] = useState(false);

  const [buyAmount, setBuyAmount] = useState(BigInt(0));
  const [minGfoolOut, setMinGfoolOut] = useState(BigInt(0));
  const [redeemAmount, setRedeemAmount] = useState(BigInt(0));
  const [minOut, setMinOut] = useState(BigInt(0));

  const [underlyingTokenDecimals, setUnderlyingTokenDecimals] = useState<number | undefined>(undefined);
  const [gfoolTokenDecimals, setGfoolTokenDecimals] = useState<number | undefined>(undefined);

  const [previewBuyAmount, setPreviewBuyAmount] = useState<bigint | undefined>(undefined);
  const [previewRedeemAmount, setPreviewRedeemAmount] = useState<bigint | undefined>(undefined);

  const [signerUnderlyingAllowance, setSignerUnderlyingAllowance] = useState<bigint | undefined>(undefined);
  const [signerUnderlyingBalance, setSignerUnderlyingBalance] = useState<bigint | undefined>(undefined);
  const [signerTokenBalance, setSignerTokenBalance] = useState<bigint | undefined>(undefined);

  const [buyPrice, setBuyPrice] = useState<bigint | undefined>(undefined);
  const [sellPrice, setSellPrice] = useState<bigint | undefined>(undefined);

  const { isConnected, address: signerAddress } = useAccount();

  // const CONTRACT_ADDRESS = "0xA56e6a8C2e764613380B3756f5cb68b76a04f261"; // sepolia
  const CONTRACT_ADDRESS = "0x2EF87dEC86A78C490dfeE19D925f63AA85EEb85B" // arbitrum
  // const UNDERLYING_ADDRESS = "0xfbB10b48f10Aad0E2D69463E93a563965993cA54"; // sepolia 
  const UNDERLYING_ADDRESS = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8" // arbitrum USDC

  const { config : configBuy } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "buy",
    args: [buyAmount, minGfoolOut, signerAddress!],
  });

  const { config : configRedeem } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "redeem",
    args: [redeemAmount, minOut, signerAddress!, signerAddress!],
  });

  const { config : configApproveUnderlying } = usePrepareContractWrite({
    address: UNDERLYING_ADDRESS,
    abi: erc20ABI,
    functionName: "approve",
    args: [CONTRACT_ADDRESS, buyAmount],
  });

  const { data: buyData, write : buy, isLoading: isBuyLoading, isSuccess: isBuySuccess } = useContractWrite(configBuy);

  const { data: redeemData, write : redeem, isLoading: isRedeemLoading, isSuccess: isRedeemSuccess } = useContractWrite(configRedeem);

  const { data: approveUnderlyingData, write : approveUnderlying, isLoading: isApproveUnderlyingLoading, isSuccess: isApproveUnderlyingSuccess } = 
    useContractWrite(configApproveUnderlying);

  const { isSuccess : buySuccess } = useWaitForTransaction({
    hash: buyData?.hash,
  });

  const { isSuccess : redeemSuccess } = useWaitForTransaction({
    hash: redeemData?.hash,
  });

  const { isSuccess : approveUnderlyingSuccess } = useWaitForTransaction({
    hash: approveUnderlyingData?.hash,
  });


  const { data : buyPriceData, refetch : refetchBidPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi : ABI,
    functionName: "previewBuy",
    args: [ethers.parseUnits("1", underlyingTokenDecimals!)],
    watch: true
  });

  const { data : sellPriceData, refetch : refetchSellPrice } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi : ABI,
    functionName: "previewRedeem",
    args: [ethers.parseUnits("1", gfoolTokenDecimals!)],
    watch: true
  });

  const {data : previewBuyData, refetch : refetchPreviewBuy } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi : ABI,
    functionName: "previewBuy",
    args: [buyAmount],
    watch: true
  });

  const { data : previewRedeemData, refetch : refetchPreviewRedeem } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi : ABI,
    functionName: "previewRedeem",
    args: [redeemAmount],
    watch: true
  });

  const { data : signerUnderlyingAllowanceData, refetch : refetchSignerUnderlyingAllowance } = useContractRead({
    address: UNDERLYING_ADDRESS,
    abi : erc20ABI,
    functionName: "allowance",
    args: [signerAddress!, CONTRACT_ADDRESS],
    watch: true
  });

  const { data : signerUnderlyingBalanceData, refetch : refetchSignerUnderlyingBalance } = useContractRead({
    address: UNDERLYING_ADDRESS,
    abi : erc20ABI,
    functionName: "balanceOf",
    args: [signerAddress!],
    watch: true
  });

  const { data : signerTokenBalanceData, refetch : refetchSignerTokenBalance } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi : ABI,
    functionName: "balanceOf",
    args: [signerAddress!],
    watch: true
  });

  const {data : underlyingTokenDecimalsData, refetch : refetchUnderlyingTokenDecimals} = useContractRead({
    address: UNDERLYING_ADDRESS,
    abi : erc20ABI,
    functionName: "decimals",
    watch: true
  });

  const {data : gfoolTokenDecimalsData, refetch : refetchGfoolTokenDecimals} = useContractRead({
    address: CONTRACT_ADDRESS,
    abi : ABI,
    functionName: "decimals",
    watch: true
  });


  const isBuyButtonDisabled = isBuyLoading || !isConnected || signerUnderlyingBalance! < buyAmount || buyAmount === BigInt(0);
  const isRedeemButtonDisabled = isRedeemLoading || !isConnected || signerTokenBalance! < redeemAmount || redeemAmount === BigInt(0);

  useEffect(() => {
    setBuyPrice(buyPriceData && gfoolTokenDecimals && underlyingTokenDecimals ? 
        BigInt(10**(gfoolTokenDecimals! + underlyingTokenDecimals!)) / (buyPriceData[0] - buyPriceData[1]) : BigInt(0));
    console.log("sellPriceData", sellPriceData);  
    setSellPrice(sellPriceData? sellPriceData[0] : BigInt(0));
    setMinGfoolOut(previewBuyData ? (previewBuyData[0] - previewBuyData[1]) * BigInt(95) / BigInt(100) : BigInt(0));
    setMinOut(previewRedeemData?.[0] ? previewRedeemData[0] * BigInt(95) / BigInt(100) : BigInt(0));
    setMinOut(minOut);
    setSignerUnderlyingAllowance(signerUnderlyingAllowanceData);
    setSignerUnderlyingBalance(signerUnderlyingBalanceData);
    setSignerTokenBalance(signerTokenBalanceData);
    setPreviewBuyAmount(previewBuyData ? previewBuyData[0] - previewBuyData[1] : BigInt(0));
    setPreviewRedeemAmount(previewRedeemData?.[0]);
    setUnderlyingTokenDecimals(underlyingTokenDecimalsData);
    setGfoolTokenDecimals(gfoolTokenDecimalsData);
  }, [buyPriceData,
      sellPriceData,
      previewBuyData, 
      previewRedeemData, 
      signerUnderlyingAllowanceData, 
      signerUnderlyingBalanceData, 
      signerTokenBalanceData]);

  return (
    <Box className={classNames([
      "flex flex-col", 
      "items-center justify-center w-full min-h-screen", 
      "w-2/4 h-1/2",
      "p-3 mx-auto font-sans gap-30",
      "font-mono"
      ])}
      marginTop="-100px"><Box 
      width={{ base: "1000px", md: "1500px" }} 
    >
      <GreaterFool />
    </Box>
        
        <Box maxW={{ base: "90%", md: "300px" }} mt={-2} mb={80} position="relative">
        {isButtonBuyClicked &&
        <Text 
          width="100%"
          textAlign="center" 
          marginTop="2"
          whiteSpace="nowrap">GFOOL buy price: {Number(ethers.formatUnits(buyPrice ? buyPrice : 0, underlyingTokenDecimals!))} USDC</Text> }
        {isButtonRedeemClicked &&
        <Text
          width="100%"
          textAlign="center"
          marginTop="2"
          whiteSpace="nowrap">GFOOL redeem price: {Number(ethers.formatUnits(sellPrice ? sellPrice : 0, underlyingTokenDecimals!)).toFixed(6)} USDC</Text> }
        <ButtonGroup isAttached variant="outline" marginBottom={2}>
          <Button
            backgroundColor={isButtonBuyClicked ? "darkgreen" : "gray"}
            _hover={{ backgroundColor: isButtonBuyClicked ? "darkgreen" : "gray" }}
            onClick={() => {setButtonBuyClicked(true); setButtonRedeemClicked(false)}}
          >Buy</Button>
          <Button
            backgroundColor={isButtonRedeemClicked ? "darkred" : "gray"}
            _hover={{ backgroundColor: isButtonRedeemClicked ? "darkdarkred" : "gray" }}
            onClick={() => {setButtonRedeemClicked(true); setButtonBuyClicked(false)}}
          >Redeem</Button>
        </ButtonGroup>

        <InputGroup>
          <div className={
            isButtonBuyClicked ? "input-with-usdc-wrapper" : "input-with-gfool-wrapper"}>
            <Input placeholder="0.00" type="number" paddingRight="50px" 
              backgroundColor="#f0f0f0" color="black"
              onChange={(e) => {
                const stringValue = e.target.value;
                const trimmedValue = stringValue.endsWith(".") ? stringValue.slice(0, -1) : stringValue;
                if(trimmedValue.length > 0) {
                  setBuyAmount(ethers.parseUnits(trimmedValue, underlyingTokenDecimals!)); 
                  setRedeemAmount(ethers.parseUnits(trimmedValue, gfoolTokenDecimals!))
                } 
              }}
            />
          </div>
        </InputGroup>
          {(isButtonBuyClicked || isButtonRedeemClicked) && (
            <Button 
              width="100%" 
              marginTop="2"
              backgroundColor={isBuyButtonDisabled ? "gray" : "darkgreen"}
              _hover={{ backgroundColor: isBuyButtonDisabled ? "gray" : "green" }}
              isDisabled={(isButtonBuyClicked && isBuyButtonDisabled) || (isButtonRedeemClicked && isRedeemButtonDisabled)}
              onClick={() => isButtonBuyClicked ? signerUnderlyingAllowance! < buyAmount ? approveUnderlying?.() : buy?.() : redeem?.()}
            >
              {isButtonBuyClicked ? signerUnderlyingBalance! < buyAmount ? `Insufficient USDC balance` :
                (signerUnderlyingAllowance! < buyAmount ? "Approve USDC"  : "Buy") : 
                isRedeemButtonDisabled ? "Insufficient GFOOL balance" : "Redeem"}
            </Button>)}
            {(isButtonBuyClicked || isButtonRedeemClicked) && (
              <Text 
                width="100%"
                textAlign="center" 
                marginTop="2"
                whiteSpace="nowrap"
              >
                {isButtonBuyClicked ? "You receive " : "You redeem "} 
                {isButtonBuyClicked ? Number(ethers.formatUnits(previewBuyAmount ? previewBuyAmount : 0, gfoolTokenDecimals!)) : 
                  Number(ethers.formatUnits(redeemAmount,gfoolTokenDecimals!))} GFOOL tokens
              </Text>
              )}
              
            {(isButtonBuyClicked || isButtonRedeemClicked) && (
              <Text 
                width="100%"
                textAlign="center" 
                marginTop="2"
                whiteSpace="nowrap"
              >
                {isButtonBuyClicked ? "You spend " : "You get "} 
                {isButtonBuyClicked ? Number(ethers.formatUnits(buyAmount ? buyAmount : 0 ,underlyingTokenDecimals!)) : 
                  Number(ethers.formatUnits(previewRedeemAmount ? previewRedeemAmount : 0 ,underlyingTokenDecimals!))} USDC
              </Text>
              )}
        </Box>
        <Box as="footer" width="100%" position={{ base: "fixed", md: "fixed" }} bottom="0" p="4" bg="rgb(14, 142, 227)">
        <Stack direction={{ base: "column", md: "row" }} spacing="3" align="center">
          <Text textAlign="center">Follow us on{" "}
            <Link href="https://discord.com" isExternal color="yellow.500">
              Discord
            </Link>
            ,{" "}
            <Link href="https://discord.com" isExternal color="yellow.500">
              Telegram
            </Link>
            {" "}and{" "}
            <Link href="https://discord.com" isExternal color="yellow.500">
              X (Twitter)
            </Link>
          </Text>
        </Stack>
        </Box>
    </Box>
  );
};

export default EarnContainer;
