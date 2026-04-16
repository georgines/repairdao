import hardhat from './deploy/local.json';
import sepolia from './deploy/sepolia.json';

const network = process.env.NEXT_PUBLIC_NETWORK;

const config = network === 'sepolia' ? sepolia : hardhat;

export const contratos = config.contracts;