import { Link, useLocation } from 'react-router-dom';
import { Group } from '@mantine/core';
import logoGabia from '../assets/logo-gabia.svg';
import classes from './Header.module.css';

const links = [
  { link: '/', label: '신청' },
  { link: '/my', label: '내 신청' },
  { link: '/admin', label: '관리자' },
];

export default function Header() {
  const { pathname } = useLocation();

  const items = links.map((item) => (
    <Link
      key={item.label}
      to={item.link}
      className={`${classes.link} ${pathname === item.link ? classes.linkActive : ''}`}
    >
      {item.label}
    </Link>
  ));

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Link to="/" className={classes.logo}>
          <img src={logoGabia} alt="Gabia" />
          주차권
        </Link>
        <Group gap={5}>
          {items}
        </Group>
      </div>
    </header>
  );
}
