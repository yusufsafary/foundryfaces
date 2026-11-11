/* Foundry Faces: public site configuration.
   Agents and this page read contract data from here only. */
window.FOUNDRY_CONFIG = {
  CONTRACT: "0x8653B09bDaD22c99915910962167F132E514331F", // Foundry Faces NFT (FACES), deployed 2026-11-11
  TOKEN: "0xB3696718E4716f248846AAB962EF2db19AAe76eC", // $OVF token, deployed 2026-11-12
  CLAIM: "0x4E777f71d1E46065F2073845B0a92b8DDF9b60a3", // FoundryClaim ($OVF holder claim), claims opened 2026-11-12
  CLAIM_FEE_WEI: "243902439024390", // flat claim fee in BNB wei, forwarded to project wallet per claim
  AGENT_ID_REGISTRY: "0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F", // SPACE ID Agent ID registry
  PROJECT_WALLET: "0xEf138eA3E6C21dCaDe0A2C1fC38BaAe94f8f9E5E",
  CHAIN_ID: 56,
  SUPPLY: 11111,
  MAX_PER_WALLET: 20,
  RPCS: [
    "https://bsc-rpc.publicnode.com",
    "https://bsc-dataseed.bnbchain.org",
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.binance.org"
  ]
};
