import { Inter } from 'next/font/google';
import Map from '@/components/Map';
import { GetStaticProps, NextPage } from 'next';
import WaveOverview from '@/data/models/wave_overview';
import axios from 'axios';
import Head from 'next/head';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  waveOverview: WaveOverview;
};

const Home: NextPage<Props> = ({ waveOverview }) => {
  return (
    <>
      <Head>
        <title>BMKG MARITIME MAP</title>
        <meta name="description" content="Maritime Map of BMKG" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`h-screen ${inter.className}`}>
        <Map waveOverview={waveOverview} />
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  let waveOverview: WaveOverview = {};
  const { data: _overview } = await axios.get(
    'https://maritim.bmkg.go.id/public_api/overview/gelombang.json'
  );

  Object.keys(_overview).forEach((key) => {
    if (_overview[key]?.today) {
      waveOverview[key] = _overview[key].today;
    }
  });

  return {
    props: {
      waveOverview,
    },
  };
};

export default Home;
