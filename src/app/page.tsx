import FunnelCalculator from '@/components/funnel-calculator';
import Link from 'next/link';

export default function Home() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
            <div className="container mx-auto">
                <h1 className="text-3xl font-bold text-center">Sales Funnel Calculator</h1>
                <h2 className="text-xl text-center mb-8">
                    Sponsored by{' '}
                    <Link href="https://enkryptify.com" target="_blank" className="text-blue-500 hover:underline">
                        Enkryptify
                    </Link>
                </h2>
                <FunnelCalculator />
            </div>
        </main>
    );
}
