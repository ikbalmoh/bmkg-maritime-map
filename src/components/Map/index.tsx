import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: '100%' }}
      className="flex flex-col text-center justify-center"
    >
      Loading Map ...
    </div>
  ),
});

export default Map;
