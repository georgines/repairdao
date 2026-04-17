import { contratos } from "@/contracts";
import type { InterfaceAbi } from "ethers";

export const REPAIR_TOKEN_ABI = [
  { type: "function", name: "buy", stateMutability: "payable", inputs: [], outputs: [] },
  {
    type: "function",
    name: "mint",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  { type: "function", name: "burn", stateMutability: "nonpayable", inputs: [{ name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "setTokensPerEth", stateMutability: "nonpayable", inputs: [{ name: "newRate", type: "uint256" }], outputs: [] },
  { type: "function", name: "withdraw", stateMutability: "nonpayable", inputs: [], outputs: [] },
] as const satisfies InterfaceAbi;

export const REPAIR_BADGE_ABI = [
  { type: "function", name: "authorizeContract", stateMutability: "nonpayable", inputs: [{ name: "contractAddress", type: "address" }], outputs: [] },
  { type: "function", name: "mintBadge", stateMutability: "nonpayable", inputs: [{ name: "user", type: "address" }], outputs: [] },
  { type: "function", name: "burnBadge", stateMutability: "nonpayable", inputs: [{ name: "user", type: "address" }], outputs: [] },
  {
    type: "function",
    name: "updateBadge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "user", type: "address" },
      { name: "newLevel", type: "uint8" },
    ],
    outputs: [],
  },
  { type: "function", name: "getLevelName", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "levelName", type: "string" }] },
  { type: "function", name: "getBadgeLevel", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "level", type: "uint8" }] },
] as const satisfies InterfaceAbi;

export const REPAIR_DEPOSIT_ABI = [
  { type: "function", name: "authorizeContract", stateMutability: "nonpayable", inputs: [{ name: "contractAddress", type: "address" }], outputs: [] },
  { type: "function", name: "setRepairReputation", stateMutability: "nonpayable", inputs: [{ name: "reputationAddress", type: "address" }], outputs: [] },
  { type: "function", name: "getEthUsdPrice", stateMutability: "view", inputs: [], outputs: [{ name: "price", type: "int256" }] },
  {
    type: "function",
    name: "deposit",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "isTechnician", type: "bool" },
    ],
    outputs: [],
  },
  { type: "function", name: "getRewards", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "rewards", type: "uint256" }] },
  { type: "function", name: "withdrawRewards", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "withdrawDeposit", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "slash", stateMutability: "nonpayable", inputs: [{ name: "user", type: "address" }, { name: "percent", type: "uint256" }], outputs: [] },
  { type: "function", name: "updateRate", stateMutability: "nonpayable", inputs: [{ name: "user", type: "address" }, { name: "newRate", type: "uint256" }], outputs: [] },
  { type: "function", name: "isActive", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "active", type: "bool" }] },
  { type: "function", name: "setMinDeposit", stateMutability: "nonpayable", inputs: [{ name: "newMin", type: "uint256" }], outputs: [] },
  { type: "function", name: "setSlashPercent", stateMutability: "nonpayable", inputs: [{ name: "percent", type: "uint256" }], outputs: [] },
  {
    type: "function",
    name: "getDeposit",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "deposit",
        type: "tuple",
        components: [
          { name: "amount", type: "uint256" },
          { name: "depositedAt", type: "uint256" },
          { name: "lastClaimedAt", type: "uint256" },
          { name: "customRate", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "isTechnician", type: "bool" },
        ],
      },
    ],
  },
] as const satisfies InterfaceAbi;

export const REPAIR_REPUTATION_ABI = [
  { type: "function", name: "authorizeContract", stateMutability: "nonpayable", inputs: [{ name: "contractAddress", type: "address" }], outputs: [] },
  { type: "function", name: "registerUser", stateMutability: "nonpayable", inputs: [{ name: "user", type: "address" }], outputs: [] },
  { type: "function", name: "rate", stateMutability: "nonpayable", inputs: [{ name: "rated", type: "address" }, { name: "rating", type: "uint8" }, { name: "serviceId", type: "uint256" }], outputs: [] },
  { type: "function", name: "rateFrom", stateMutability: "nonpayable", inputs: [{ name: "rater", type: "address" }, { name: "rated", type: "address" }, { name: "rating", type: "uint8" }, { name: "serviceId", type: "uint256" }], outputs: [] },
  { type: "function", name: "penalize", stateMutability: "nonpayable", inputs: [{ name: "user", type: "address" }], outputs: [] },
  { type: "function", name: "reward", stateMutability: "nonpayable", inputs: [{ name: "user", type: "address" }], outputs: [] },
  { type: "function", name: "getLevel", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "level", type: "uint8" }] },
  { type: "function", name: "getAverageRating", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "averageRating", type: "uint256" }] },
  {
    type: "function",
    name: "getReputation",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "reputation",
        type: "tuple",
        components: [
          { name: "level", type: "uint8" },
          { name: "totalPoints", type: "uint256" },
          { name: "positiveRatings", type: "uint256" },
          { name: "negativeRatings", type: "uint256" },
          { name: "totalRatings", type: "uint256" },
          { name: "ratingSum", type: "uint256" },
        ],
      },
    ],
  },
  { type: "function", name: "getUserRate", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ name: "rate", type: "uint256" }] },
] as const satisfies InterfaceAbi;

export const REPAIR_ESCROW_ABI = [
  { type: "function", name: "createOrder", stateMutability: "nonpayable", inputs: [{ name: "description", type: "string" }], outputs: [{ name: "orderId", type: "uint256" }] },
  { type: "function", name: "submitBudget", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [] },
  { type: "function", name: "openDispute", stateMutability: "nonpayable", inputs: [{ name: "orderId", type: "uint256" }, { name: "reason", type: "string" }], outputs: [] },
  {
    type: "function",
    name: "getOrder",
    stateMutability: "view",
    inputs: [{ name: "ordemId", type: "uint256" }],
    outputs: [
      {
        name: "order",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "estado", type: "uint8" },
          { name: "descricao", type: "string" },
          { name: "cliente", type: "address" },
          { name: "tecnico", type: "address" },
          { name: "valorOrcamento", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getDispute",
    stateMutability: "view",
    inputs: [{ name: "disputaId", type: "uint256" }],
    outputs: [
      {
        name: "dispute",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "estado", type: "uint8" },
          { name: "ordemId", type: "uint256" },
          { name: "motivo", type: "string" },
        ],
      },
    ],
  },
] as const satisfies InterfaceAbi;

export const REPAIR_GOVERNANCE_ABI = [
  { type: "function", name: "createProposal", stateMutability: "nonpayable", inputs: [{ name: "description", type: "string" }, { name: "durationDays", type: "uint256" }], outputs: [] },
  { type: "function", name: "vote", stateMutability: "nonpayable", inputs: [{ name: "proposalId", type: "uint256" }, { name: "support", type: "bool" }], outputs: [] },
  { type: "function", name: "executeProposal", stateMutability: "nonpayable", inputs: [{ name: "proposalId", type: "uint256" }], outputs: [] },
  {
    type: "function",
    name: "getProposal",
    stateMutability: "view",
    inputs: [{ name: "proposalId", type: "uint256" }],
    outputs: [
      {
        name: "proposal",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "proposer", type: "address" },
          { name: "description", type: "string" },
          { name: "votesFor", type: "uint256" },
          { name: "votesAgainst", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "executed", type: "bool" },
          { name: "approved", type: "bool" },
        ],
      },
    ],
  },
  { type: "function", name: "setQuorum", stateMutability: "nonpayable", inputs: [{ name: "newQuorum", type: "uint256" }], outputs: [] },
] as const satisfies InterfaceAbi;

export const REPAIRDAO_CONTRACTOS = {
  token: { address: contratos.RepairToken, abi: REPAIR_TOKEN_ABI },
  badge: { address: contratos.RepairBadge, abi: REPAIR_BADGE_ABI },
  deposit: { address: contratos.RepairDeposit, abi: REPAIR_DEPOSIT_ABI },
  reputation: { address: contratos.RepairReputation, abi: REPAIR_REPUTATION_ABI },
  escrow: { address: contratos.RepairEscrow, abi: REPAIR_ESCROW_ABI },
  governance: { address: contratos.RepairGovernance, abi: REPAIR_GOVERNANCE_ABI },
} as const;
