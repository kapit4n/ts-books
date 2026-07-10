import React from 'react';
import { Hero } from '../components/sections/Hero';
import { Categories } from '../components/sections/Categories';
import { FeaturedBook } from '../components/sections/FeaturedBook';
import { ContinueReading } from '../components/sections/ContinueReading';
import { PopularBooks } from '../components/sections/PopularBooks';
import { RecentlyUpdated } from '../components/sections/RecentlyUpdated';
import { WhyTsBooks } from '../components/sections/WhyTsBooks';
import { featuredBook, continueReading, recentlyUpdated } from '../data/mockData';

export const Home: React.FC = () => {
  return (
    <div className="home">
      <Hero />
      <Categories />
      <FeaturedBook book={featuredBook} />
      <ContinueReading book={continueReading} />
      <PopularBooks />
      <RecentlyUpdated books={recentlyUpdated} />
      <WhyTsBooks />
    </div>
  );
};
