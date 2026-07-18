import { FleetData } from '@/types/fleet'

export const fleetData: FleetData = {
  hero: {
    label: 'Executive Selection',
    title: 'Explore the Fleet',
    description: 'Discerning performance.',
    totalVehicles: 128
  },
  
  filters: {
    priceRange: {
      min: 250,
      max: 2500,
      currentMin: 250,
      currentMax: 2500
    },
    vehicleTypes: [
      { id: 'sports', label: 'Sports', value: 'sports' },
      { id: 'suv', label: 'SUV', value: 'suv', checked: true },
      { id: 'electric', label: 'Electric', value: 'electric' },
      { id: 'vintage', label: 'Vintage', value: 'vintage' }
    ],
    brands: [
      { id: 'porsche', label: 'Porsche', value: 'porsche' },
      { id: 'aston-martin', label: 'Aston Martin', value: 'aston-martin' },
      { id: 'range-rover', label: 'Range Rover', value: 'range-rover', checked: true },
      { id: 'bentley', label: 'Bentley', value: 'bentley' }
    ],
    transmission: [
      { id: 'auto', label: 'Auto', value: 'auto' },
      { id: 'manual', label: 'Manual', value: 'manual' }
    ]
  },

  cars: [
    {
      id: '1',
      name: 'Porsche 911 Turbo S',
      brand: 'Porsche',
      category: 'Performance / Sports',
      price: 850,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUJ3zWYizS5xHxwswb_-iVzoEfRT3QBSnrXpvetrhWgFronDsHa-NK6HRDSuI3LYnMuqq9rH7h83WrHJ6TQGZCoUgclSoziHvtWOwVQEVJl3pXtR6cpVHE5G11DEDRjFsSGTwDK3MZ0UF3uGD7k5ChChJT8_KVzm8X6VVzFJY-vgtReBiuX3-CvXU868cx8SXaxzV_jrsf-OXagfFjq53PS1Pd-XanK0_ygZ6-Iv4-T9A2GyRpDyGZvuy8inFVFuswg4uNrvKWoZNT',
      specs: {
        power: '640 HP',
        acceleration: '2.7s',
        transmission: 'PDK'
      },
      status: 'available'
    },
    {
      id: '2',
      name: 'Range Rover SV',
      brand: 'Range Rover',
      category: 'Luxury / SUV',
      price: 450,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCx604xULLJcBegMh94TGCzdkA0diI8jLJQAPcgaBteM_140KH6dtl0hozzch5S83C-_we_B76Fuitk5Eh9mf4KRQNsg4iBt6RFUXdexV_3qJScxG7PuYw_Z9Qf7JfcPv2ufhKkP2kdBcc7mEeJgz_TpyYBU0pVzzFx1cQgY-mpNnqHjw7IkAj3-ouY4Hkx2HSeO6MY5dR40En-atz3YAYVnXUscGajaEL8WdL6sJYq5ChtDNqp72X_YmQ82vbdm2uaOsjlpYnnPvN',
      specs: {
        power: '523 HP',
        acceleration: '4.4s',
        transmission: 'Auto'
      },
      status: 'reserved'
    },
    {
      id: '3',
      name: 'Aston Martin DBS',
      brand: 'Aston Martin',
      category: 'Grand Tourer / Sports',
      price: 1200,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU7n_QrVcMiEcgDORp8R19BPy1lB1dWuxsbBhh3gIYeYHrjqWwgvoXRj-NvO0PbXdtiw50164xlJI-tMM0y7U8dglgyi6HSDZ2q-lEg3JlGuwASg3YGNgWm9OhaoHkQbAlqVk5U6RwNYRmrzZlNsYk0rpMjGwGaT3MJXWRsVLD9eeUL68sWD9pIUkeNLHYrCu4vQiWyW416LfkgBc7zW_VOMs4yhLKma9HehB_-7rLCMiHwBEgrkpv5c_Y9iM6NufSCTDtl88E4QoE',
      specs: {
        power: '715 HP',
        acceleration: '3.4s',
        transmission: 'Auto'
      },
      status: 'available'
    },
    {
      id: '4',
      name: "Jaguar E-Type '63",
      brand: 'Jaguar',
      category: 'Vintage / Heritage',
      price: 550,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQvAehh0lQ58ZkhlEUne35uIElRxBlfxT49gP9qNtARMeoPLNveUcUzxEcQpJQ7hzkG5Tqicz3osEsB0qYl8ie-ddJMySg6kDTOMbESL83CuPd2LTnyMbRXWzNNOuPWdvue6YpGc97nao5YtdwwwlWpvqge4UPiGmmpJxYyF49jrAMkPeITKnJX0A_JrqLNlRy2CsK8jzxG0YQcZ_55qHO1VsHAbTNKKPdXnnc4BjdCSzHcxjtLv550iJmbULG3Rz9zWKQ1DHpE6vG',
      specs: {
        power: '265 HP',
        acceleration: '7.0s',
        transmission: 'Manual'
      },
      status: 'available'
    },
    {
      id: '5',
      name: 'Tesla Model S Plaid',
      brand: 'Tesla',
      category: 'Electric / Sedan',
      price: 350,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnIX9vTSyfET3cN6Vzcvahudt2dyEsOM_1xT5PffAC7HrxKWBDMmtincYTIxtiqHYhbWLwQ2bTsp0dmWF52ACFvfuHRePmJNGc3hY8wskNlEwsKhlhywcKmksjHhi_QYJh173WBZ8JqVJ5yzrsL2LPjNb_VSjn-EiRKP9s2_4Tk7Q49WVCLXNq5skyLP8q9I40w8WZggxNNKsDkNihy9PTFa0t9Mi0xjFr6U1DnAnq1J2bt-EgCYPzZd-xFA_W5aDjq6zuRPrAc9re',
      specs: {
        power: '1020 HP',
        acceleration: '1.9s',
        transmission: 'Auto'
      },
      status: 'new-arrival'
    }
  ],

  footer: {
    brand: {
      name: 'UrbanDrive',
      description: 'Redefining executive travel with the world\'s most exclusive fleet of performance and luxury vehicles.'
    },
    sections: [
      {
        title: 'Fleet',
        links: [
          { label: 'Supercars', href: '/fleet/supercars' },
          { label: 'Luxury SUVs', href: '/fleet/luxury-suvs' },
          { label: 'Electric', href: '/fleet/electric' },
          { label: 'Heritage Classics', href: '/fleet/heritage-classics' }
        ]
      },
      {
        title: 'Company',
        links: [
          { label: 'About Us', href: '/about' },
          { label: 'Locations', href: '/locations' },
          { label: 'Membership', href: '/membership' },
          { label: 'Concierge', href: '/concierge' }
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', href: '/help' },
          { label: 'Booking Guide', href: '/booking-guide' },
          { label: 'Terms of Service', href: '/terms' },
          { label: 'Privacy Policy', href: '/privacy' }
        ]
      }
    ]
  }
}