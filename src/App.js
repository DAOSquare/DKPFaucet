import {
  Flex,
  Center,
  Text,
  Button,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Link,
  Box,
  Select,
  Spacer,
} from "@chakra-ui/react";

import { useState, useEffect } from "react";

import {
  useEthers,
  shortenIfAddress,
  getChainName,
  ChainId,
  // ContractCall,
  useContractCall,
  useContractFunction,
} from "@usedapp/core";
import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "ethers";

import { abi } from "./abi";

export function ShadowButton({ ...props }) {
  const { account, deactivate, activateBrowserWallet } = useEthers();
  const [activateError, setActivateError] = useState("");

  const { error } = useEthers();
  useEffect(() => {
    if (error) {
      setActivateError(error.message);
    }
  }, [error]);

  const activate = async () => {
    setActivateError("");
    activateBrowserWallet();
  };

  return (
    <Button
      w="151px"
      h="46px"
      bg="linear-gradient(164deg, #FC8CAA 0%, #F776E0 100%)"
      boxShadow="13px 13px 15px 0px rgba(195, 209, 224, 0.53), -7px -7px 13px 0px #FFFFFF"
      borderRadius="23px"
      _hover={{
        bg: "linear-gradient(164deg, #FC8CAA 0%, #F776E0 100%)",
      }}
      _focus={{
        outline: "none",
      }}
      onClick={async () => {
        if (!account) {
          await activate();
        }
      }}
      {...props}
    >
      <Text
        fontSize="12px"
        fontFamily="HelveticaNeue-Bold, HelveticaNeue"
        fontWeight="bold"
        color="#FFFFFF"
        lineHeight="26px"
      >
        {props.children}
      </Text>
    </Button>
  );
}

const switchNetwork = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum?.request({
        id: "1",
        jsonrpc: "2.0",
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x64",
            chainName: "xDai",
            rpcUrls: ["https://dai.poa.network"],
            blockExplorerUrls: ["https://blockscout.com/poa/xdai"],
            nativeCurrency: {
              name: "xDai",
              symbol: "XDAI",
              decimals: 18,
            },
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }
};

function App() {
  const { account, chainId } = useEthers();
  const [recipientAddress, setRecipientAddress] = useState("");
  const [selectToken, setSelectToken] = useState("");
  const mintAmount = 30; // dkp1
  // dkp 2: 5000
  const amounts = { JTT: 3, ATT: 5 };

  console.log("chain id", chainId);
  console.log("chain name", getChainName(chainId));
  const tokenInterface = new Interface(abi);

  const JTTAddress = "0x956b85b551964D1767Cf7E64838cF33e7A52E6cB";
  const ATTAddress = "0x1AC46F3af786f6193F2bB5E6E8F8393C1620a7ac";

  const JTTContract = new Contract(JTTAddress, tokenInterface);
  const ATTContract = new Contract(ATTAddress, tokenInterface);

  const { state: JTTState, send: JTTSend } = useContractFunction(
    JTTContract,
    "mint"
  );

  const { state: ATTState, send: ATTSend } = useContractFunction(
    ATTContract,
    "mint"
  );

  useEffect(() => {
    console.log("token Amount:", amounts[selectToken]);
  }, [selectToken]);

  return (
    <Flex
      h="100vh"
      flexDirection="column"
      // justifyContent="center"
      alignItems="center"
    >
      <Flex w="full" justifyContent="space-between">
        <Spacer />
        <ShadowButton mt="4" mr="6" onClick={() => switchNetwork()}>
          Switch to xDai
        </ShadowButton>
      </Flex>
      <Flex
        h="full"
        w="full"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Stack w="50%" spacing="3" mb="6">
          <FormControl>
            <FormLabel>Select Claim token</FormLabel>
            <Select
              placeholder="Select option"
              onChange={(e) => setSelectToken(e.target.value)}
              value={selectToken}
            >
              <option value="JTT">JTT</option>
              <option value="ATT">ATT</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel>Recipient Address</FormLabel>
            <Input
              type="text"
              defaultValue={account}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Mint Amount</FormLabel>
            <Text>
              {selectToken === ""
                ? null
                : `You can mint ${amounts[selectToken]}  Token 7 days`}
            </Text>
          </FormControl>
        </Stack>
        <Box mb="6">
          {account ? (
            <ShadowButton
              onClick={async () => {
                const address =
                  recipientAddress === "" ? account : recipientAddress;
                if (selectToken === "JTT") {
                  console.log("mint JTT");
                  JTTSend(
                    address,
                    BigNumber.from(`${amounts[selectToken] * 1e18}`)
                  );
                }

                if (selectToken === "ATT") {
                  console.log("mint ATT");
                  ATTSend(
                    address,
                    BigNumber.from(`${amounts[selectToken] * 1e18}`)
                  );
                }
              }}
              // isLoading={
              //   // transaction.status != 'Mining'
              //   stat
              // }
              // disabled
            >
              Mint Tokens
            </ShadowButton>
          ) : (
            <ShadowButton>Connect</ShadowButton>
          )}
        </Box>
        <Text mb="6">
          {account ? `Your address: ${account}` : "Please connect"}
        </Text>
        <Link href="https://blockscout.com/xdai/mainnet/address/0x956b85b551964D1767Cf7E64838cF33e7A52E6cB/transactions">
          JTT Token Address: 0x956b85b551964D1767Cf7E64838cF33e7A52E6cB
        </Link>
        <Link href="https://blockscout.com/xdai/mainnet/address/0x1AC46F3af786f6193F2bB5E6E8F8393C1620a7ac/transactions">
          ATT Token Address: 0x1AC46F3af786f6193F2bB5E6E8F8393C1620a7ac
        </Link>
      </Flex>
    </Flex>
  );
}

export default App;
