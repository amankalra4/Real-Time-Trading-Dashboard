import React from 'react';
import TickerItem from './TickerItem';
import { CRYPTO_ITEMS } from '../utils/constants';

const Header = () => {
  return (
    <div className="flex w-full bg-gray-900 border-b border-gray-800 overflow-x-auto select-none">
      {CRYPTO_ITEMS.map(el => (
        <TickerItem key={el} symbol={el} />
      ))}
    </div>
  );
};

export default React.memo(Header);
