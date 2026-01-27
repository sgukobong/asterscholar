import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Asterscholar',
        short_name: 'Asterscholar',
        description: 'AI Powered Primary Research Platform for Researchers',
        start_url: '/',
        display: 'standalone',
        background_color: '#FAF9F6',
        theme_color: '#FAF9F6',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
        ],
    }
}
