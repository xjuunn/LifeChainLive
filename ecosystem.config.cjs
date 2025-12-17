module.exports = {
  apps: [
    {
      name: 'life-chain-live',
      script: '/www/wwwroot/LifeChainLive/.output/server/index.mjs',
      interpreter: '/root/.nvm/versions/node/v22.21.1/bin/node',
      watch: false,
      env: {
        NITRO_PORT: 5126,
        NITRO_HOST: '0.0.0.0',
        NODE_ENV: 'development',
        VITE_LIFE_URL: 'https://life.tires/api/'
      },
      env_production: {
        NITRO_PORT: 5126,
        NITRO_HOST: '0.0.0.0',
        NODE_ENV: 'production',
        VITE_LIFE_URL: 'https://life.tires/api/'
      }
    }
  ]
};
