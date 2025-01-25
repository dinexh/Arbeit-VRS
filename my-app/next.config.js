/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Suppress punycode warning
    config.ignoreWarnings = [
      { module: /node_modules\/punycode/ },
      { message: /\[DEP0040\]/ },
    ];
    
    // Add a rule to handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      'pdfjs-dist': isServer ? false : 'pdfjs-dist/build/pdf',
    };
    return config;
  },
};

module.exports = nextConfig; 