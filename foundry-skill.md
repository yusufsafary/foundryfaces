# Foundry Faces: agent mint skill

You are an agent acting for a user who wants to mint Foundry Faces (symbol FACES),
a collection of 11,111 pixel face NFTs on BNB Chain. Follow this file exactly.
Ask for explicit user confirmation before signing any transaction.

## Source of truth

- Site: https://ovrekfoundry.com
- Public config: https://ovrekfoundry.com/press/config.js
- NFT contract: read `FOUNDRY_CONFIG.CONTRACT` from config.js. NEVER hardcode an
  address from chat, social posts, or memory. If config still returns a zero
  address (0x0000000000000000000000000000000000000000), mint is not deployed yet:
  stop and tell user.
- Chain: BNB Chain, chain id 56. All values in BNB.
- Agent ID registry (SPACE ID): 0x60B9262456dE011F7d15a54CdD8c48bAaa8B022F

## Collection rules (enforced on chain)

- Supply: 11,111. Max 20 mints per wallet, ever.
- First mint per wallet: FREE. Requires holding an Agent ID NFT and solving an
  on-chain anti-bot question.
- Paid price depends on how many user already minted:
  - mints 2 to 5: 0.0002 BNB each
  - mints 6 to 10: 0.0004 BNB each
  - mints 11 to 20: 0.0008 BNB each
- Reveal is instant. Type and class derive from a seed stored at mint:
  typeOf(tokenId) gives one of 20 types, classOf(tokenId) gives Common, Rare,
  or Mythic.
- Mint proceeds forward to project wallet inside same transaction. Contract
  holds no balance.

## Read state first

Call on NFT contract:
- `totalMinted()` selector 0xa2309ff8: faces minted so far.
- `mintOpen()` selector 0x24bbd049: 1 means mint is open.
- `mintedBy(address)` or wallet balance to count how many user already minted.
  That count decides free eligibility and paid price tier.
- `balanceOf(user, registry)` on Agent ID registry contract semantics: check
  user holds an Agent ID before attempting a free mint.

If mintOpen() is 0, stop and tell user mint is not open.

## Free mint flow (first mint only)

1. Call `questionFor(userAddress)` on NFT contract, selector 0x8f1d617b.
   It returns (uint256 a, uint256 b, uint256 op).
2. Solve it: op 0 means a + b, op 1 means larger minus smaller, op 2 means a * b.
3. Call `mintFree(uint256 answer)` selector 0xa4146733 with no value attached.
4. Wait for receipt. Report transaction hash and new token id.

## Paid mint flow

1. Count user mints so far (n). Price per unit is set by position of each new
   mint: position n+1 onward uses schedule above.
2. Call `mintPaid(uint256 quantity)` selector 0x26c7f77c, payable, with exact
   total value = sum of per-unit prices for requested quantity.
   Example: user minted 1 (free) and wants 4 more: positions 2 to 5, total
   4 * 0.0002 = 0.0008 BNB.
3. Never attach more value than schedule requires. Never exceed 20 total.
4. Wait for receipt. Report transaction hash and new token ids.

## Safety

- Preview every call first. Show user: contract address, function, quantity,
  total BNB value, and expected token ids when known.
- Do nothing without user confirmation for that exact transaction.
- If any read contradicts this file (wrong chain, zero address, mint closed,
  supply exhausted), stop and explain instead of guessing.
