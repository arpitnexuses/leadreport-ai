// NoSSRReportLoader.tsx
import dynamic from 'next/dynamic';

// Ensure the dynamic import resolves to the correct component
const NoSSRReportLoader = dynamic(() => import('./ReportLoader').then(mod => mod.ReportLoader), { ssr: false });

export default NoSSRReportLoader;