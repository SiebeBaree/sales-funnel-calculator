import type { NextConfig } from 'next';
import { withPlausibleProxy } from 'next-plausible';

const config: NextConfig = {
    poweredByHeader: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default withPlausibleProxy({
    customDomain: 'https://plausible.siebebaree.com',
})(config);
