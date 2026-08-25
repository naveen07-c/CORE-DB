const U = (id, w = 800) => `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;

export const productImages = {
  1: {
    name: 'Wireless Headphones',
    main: U('photo-1505740420928-5e560c06d30e'),
    variants: {
      1: U('photo-1505740420928-5e560c06d30e'),
      2: U('photo-1546435770-a3e426bf472b'),
    },
  },
  2: {
    name: 'Smart Watch',
    main: U('photo-1523275335684-37898b6baf30'),
    variants: {
      3: U('photo-1523275335684-37898b6baf30'),
      4: U('photo-1546868871-7041f2a55e12'),
    },
  },
  3: {
    name: 'Running Shoes',
    main: U('photo-1542291026-7eec264c27ff'),
    variants: {
      5: U('photo-1542291026-7eec264c27ff'),
      6: U('photo-1608231387042-66d1773070a5'),
    },
  },
  4: {
    name: 'Database Systems',
    main: U('photo-1544716278-ca5e3f4abd8c'),
    variants: {
      7: U('photo-1544716278-ca5e3f4abd8c'),
    },
  },
  5: {
    name: 'Laptop Backpack',
    main: U('photo-1553062407-98eeb64c6a62'),
    variants: {
      8: U('photo-1553062407-98eeb64c6a62'),
    },
  },

  // ---------- Electronics ----------
  6: {
    name: 'Wireless Bluetooth Earbuds',
    main: U('photo-1590658268037-6bf12165a8df'),
    variants: {
      9: U('photo-1590658268037-6bf12165a8df'),
      10: U('photo-1572569511254-d8f925fe2cbb'),
    },
  },
  7: {
    name: '4K Ultra HD Action Camera',
    main: U('photo-1526170375885-4d8ecf77b99f'),
    variants: {
      11: U('photo-1526170375885-4d8ecf77b99f'),
      12: U('photo-1502920917128-1aa500764cbd'),
    },
  },
  8: {
    name: 'RGB Gaming Mouse',
    main: U('photo-1615663245857-ac93bb7c39e7'),
    variants: {
      13: U('photo-1615663245857-ac93bb7c39e7'),
      14: U('photo-1527814050087-3793815479db'),
    },
  },
  9: {
    name: 'Mechanical Gaming Keyboard',
    main: U('photo-1587829741301-dc798b83add3'),
    variants: {
      15: U('photo-1587829741301-dc798b83add3'),
      16: U('photo-1595225476474-87563907a212'),
    },
  },
  10: {
    name: 'Portable Bluetooth Speaker',
    main: U('photo-1545454675-3531b543be5d'),
    variants: {
      17: U('photo-1545454675-3531b543be5d'),
      18: U('photo-1608043152269-423dbba4e7e1'),
    },
  },
  11: {
    name: 'Power Bank 20000mAh',
    main: U('photo-1585338107529-13afc5f02586'),
    variants: {
      19: U('photo-1585338107529-13afc5f02586'),
    },
  },
  12: {
    name: '65W GaN Fast Charger',
    main: U('photo-1583863788434-e58a36330cf0'),
    variants: {
      20: U('photo-1583863788434-e58a36330cf0'),
    },
  },
  13: {
    name: '10.1" Android Tablet',
    main: U('photo-1544244015-0df4b3ffc6b0'),
    variants: {
      21: U('photo-1544244015-0df4b3ffc6b0'),
      22: U('photo-1561154464-82e9adf32764'),
    },
  },
  14: {
    name: 'Aluminum Laptop Stand',
    main: U('photo-1527443224154-c4a3942d3acf'),
    variants: {
      23: U('photo-1527443224154-c4a3942d3acf'),
    },
  },
  15: {
    name: 'Fitness Tracker Band',
    main: U('photo-1575311373937-040b8e1fd5b6'),
    variants: {
      24: U('photo-1575311373937-040b8e1fd5b6'),
    },
  },

  // ---------- Shoes ----------
  16: {
    name: 'Classic Casual Sneakers',
    main: U('photo-1560343090-f0409e92791a'),
    variants: {
      25: U('photo-1560343090-f0409e92791a'),
      26: U('photo-1595950653106-6c9ebd614d3a'),
    },
  },
  17: {
    name: 'Pro Basketball Shoes',
    main: U('photo-1606107557195-0e29a4b5b4aa'),
    variants: {
      28: U('photo-1606107557195-0e29a4b5b4aa'),
    },
  },
  18: {
    name: 'Genuine Leather Oxford Shoes',
    main: U('photo-1614252369475-531eba835eb1'),
    variants: {
      29: U('photo-1614252369475-531eba835eb1'),
    },
  },
  19: {
    name: 'All-Terrain Hiking Boots',
    main: U('photo-1520763905909-106b41faaca4'),
    variants: {
      30: U('photo-1520763905909-106b41faaca4'),
    },
  },
  20: {
    name: 'Canvas Slip-On Loafers',
    main: U('photo-1525966222134-fcfa99b8ae77'),
    variants: {
      31: U('photo-1525966222134-fcfa99b8ae77'),
    },
  },
  21: {
    name: 'Retro High-Top Sneakers',
    main: U('photo-1560769629-975ec94e6a86'),
    variants: {
      32: U('photo-1560769629-975ec94e6a86'),
      33: U('photo-1600185365483-26d7a4cc7519'),
    },
  },

  // ---------- Books ----------
  22: {
    name: 'Clean Code',
    main: U('photo-1512820790803-83ca734da794'),
    variants: {
      34: U('photo-1512820790803-83ca734da794'),
    },
  },
  23: {
    name: 'Introduction to Algorithms',
    main: U('photo-1495446815901-a7297e633e8d'),
    variants: {
      35: U('photo-1495446815901-a7297e633e8d'),
    },
  },
  24: {
    name: 'The Great Gatsby',
    main: U('photo-1544947950-fa07a98d237f'),
    variants: {
      36: U('photo-1544947950-fa07a98d237f'),
    },
  },
  25: {
    name: 'Atomic Habits',
    main: U('photo-1532012197267-da84d127e765'),
    variants: {
      37: U('photo-1532012197267-da84d127e765'),
      38: U('photo-1481627834876-b7833e8f5570'),
    },
  },
  26: {
    name: 'Hands-On Machine Learning Basics',
    main: U('photo-1519682337058-a94d519337bc'),
    variants: {
      39: U('photo-1519682337058-a94d519337bc'),
    },
  },

  // ---------- Accessories ----------
  27: {
    name: 'Genuine Leather Bifold Wallet',
    main: U('photo-1627123424574-724758594e93'),
    variants: {
      40: U('photo-1627123424574-724758594e93'),
    },
  },
  28: {
    name: 'Polarized UV400 Sunglasses',
    main: U('photo-1511499767150-a48a237f0083'),
    variants: {
      41: U('photo-1511499767150-a48a237f0083'),
      42: U('photo-1572635196237-14b3f281503f'),
    },
  },
  29: {
    name: 'Weekender Travel Duffel Bag',
    main: U('photo-1547949003-9792a18a2601'),
    variants: {
      43: U('photo-1547949003-9792a18a2601'),
    },
  },
  30: {
    name: 'Classic Analog Wrist Watch',
    main: U('photo-1524592094714-0f0654e20314'),
    variants: {
      44: U('photo-1524592094714-0f0654e20314'),
      45: U('photo-1522312346375-d1a52e2b99b3'),
    },
  },
  31: {
    name: 'Clear Shockproof Phone Case',
    main: U('photo-1592899677977-9c10ca588bbd'),
    variants: {
      46: U('photo-1592899677977-9c10ca588bbd'),
    },
  },
  32: {
    name: 'Adjustable Baseball Cap',
    main: U('photo-1588850561407-ed78c282e89b'),
    variants: {
      58: U('photo-1588850561407-ed78c282e89b'),
      59: U('photo-1521369909029-2afed882baee'),
    },
  },

  // ---------- Extended catalog ----------
  33: {
    name: 'Smart Wi-Fi LED Bulb',
    main: U('photo-1550985616-10810253b84d'),
    variants: { 60: U('photo-1550985616-10810253b84d'), 61: U('photo-1565814329452-e1efa11c5b89') },
  },
  34: {
    name: '15W Fast Wireless Charging Pad',
    main: U('photo-1586953208448-b95a79798f07'),
    variants: { 62: U('photo-1586953208448-b95a79798f07') },
  },
  35: {
    name: '7-in-1 USB-C Hub',
    main: U('photo-1593642632823-8f785ba67e45'),
    variants: { 63: U('photo-1593642632823-8f785ba67e45'), 64: U('photo-1593642702824-c38f21dd573a') },
  },
  36: {
    name: 'Full HD Streaming Webcam',
    main: U('photo-1587826080692-f439cd0b70da'),
    variants: { 65: U('photo-1587826080692-f439cd0b70da') },
  },
  37: {
    name: '6" Glare-Free E-Reader',
    main: U('photo-1592496431122-2349e0fbc666'),
    variants: { 66: U('photo-1592496431122-2349e0fbc666') },
  },
  38: {
    name: 'Bluetooth Neckband Earphones',
    main: U('photo-1487215078519-e21cc028cb29'),
    variants: { 67: U('photo-1487215078519-e21cc028cb29'), 68: U('photo-1572569511254-d8f925fe2cbb') },
  },
  39: {
    name: 'Smart Home Speaker Mini',
    main: U('photo-1512446816042-444d641267d4'),
    variants: { 69: U('photo-1512446816042-444d641267d4'), 70: U('photo-1543512214-318c7553f230') },
  },
  40: {
    name: 'Portable External SSD 1TB',
    main: U('photo-1621761183219-94e2b72b52e3'),
    variants: { 71: U('photo-1621761183219-94e2b72b52e3') },
  },
  41: {
    name: 'Kids School Shoes',
    main: U('photo-1460353581641-37baddab0fa2'),
    variants: { 72: U('photo-1460353581641-37baddab0fa2'), 73: U('photo-1533867617858-e7b97e060509') },
  },
  42: {
    name: 'Weightlifting Training Shoes',
    main: U('photo-1517836357463-d25dfeac3438'),
    variants: { 74: U('photo-1517836357463-d25dfeac3438') },
  },
  43: {
    name: 'Classic Ballet Flats',
    main: U('photo-1543163521-1bf539c55dd2'),
    variants: { 76: U('photo-1543163521-1bf539c55dd2'), 77: U('photo-1562273138-f46be4ebdf33') },
  },
  44: {
    name: 'Waterproof Rain Boots',
    main: U('photo-1543087903-1ac2ec7aa8c5'),
    variants: { 78: U('photo-1543087903-1ac2ec7aa8c5'), 79: U('photo-1603808033192-082d6919d3e1') },
  },
  45: {
    name: 'Sapiens',
    main: U('photo-1513475382585-d06e58bcb0e0'),
    variants: { 80: U('photo-1513475382585-d06e58bcb0e0'), 81: U('photo-1495446815901-a7297e633e8d') },
  },
  46: {
    name: 'Design Patterns',
    main: U('photo-1517842645767-c639042777db'),
    variants: { 82: U('photo-1517842645767-c639042777db') },
  },
  47: {
    name: 'The Alchemist',
    main: U('photo-1476275466078-4007374efbbe'),
    variants: { 83: U('photo-1476275466078-4007374efbbe') },
  },
  48: {
    name: 'Deep Work',
    main: U('photo-1456406644174-8ddd4cd52a06'),
    variants: { 84: U('photo-1456406644174-8ddd4cd52a06'), 85: U('photo-1532012197267-da84d127e765') },
  },
  49: {
    name: 'Reversible Leather Belt',
    main: U('photo-1624222247344-550fb60583dc'),
    variants: { 86: U('photo-1624222247344-550fb60583dc'), 87: U('photo-1621784563330-caee0b138a00') },
  },
  50: {
    name: 'Padded Laptop Sleeve 14"',
    main: U('photo-1584917865442-de89df76afd3'),
    variants: { 88: U('photo-1584917865442-de89df76afd3'), 89: U('photo-1553062407-98eeb64c6a62') },
  },
  51: {
    name: 'RFID Travel Passport Holder',
    main: U('photo-1544216717-3bbf52512659'),
    variants: { 90: U('photo-1544216717-3bbf52512659'), 91: U('photo-1436491865332-7a61a109cc05') },
  },
  52: {
    name: 'Non-Slip Yoga Mat 6mm',
    main: U('photo-1592432678016-e910b452f9a2'),
    variants: { 92: U('photo-1592432678016-e910b452f9a2'), 93: U('photo-1601925260368-ae2f83cf8b7f') },
  },
  53: {
    name: 'Insulated Steel Water Bottle 1L',
    main: U('photo-1602143407151-7111542de6e8'),
    variants: { 94: U('photo-1602143407151-7111542de6e8'), 95: U('photo-1616118132534-381148898bb4') },
  },
  54: {
    name: 'Ribbed Knit Beanie Cap',
    main: U('photo-1576871337622-98d48d1cf531'),
    variants: { 96: U('photo-1576871337622-98d48d1cf531'), 97: U('photo-1511367461989-f85a21fda167') },
  },
  55: {
    name: 'Bamboo Desk Organizer',
    main: U('photo-1494178270175-e96de2971df9'),
    variants: { 98: U('photo-1494178270175-e96de2971df9'), 99: U('photo-1497215728101-856f4ea42174') },
  },
  56: {
    name: 'Ceramic Coffee Mug Set of 2',
    main: U('photo-1514228742587-6b1558fcca3d'),
    variants: { 100: U('photo-1514228742587-6b1558fcca3d') },
  },
};

export const categoryImages = {
  1: U('photo-1498049794561-7780e7231661', 400),
  2: U('photo-1542291026-7eec264c27ff', 400),
  3: U('photo-1481627834876-b7833e8f5570', 400),
  4: U('photo-1553062407-98eeb64c6a62', 400),
};

const FALLBACK_IMAGE = U('photo-1560472354-b33ff0c44a43');

export { FALLBACK_IMAGE };

export function getProductImage(productId, variantId = null) {
  const product = productImages[productId];
  if (!product) return FALLBACK_IMAGE;

  if (variantId && product.variants[variantId]) {
    return product.variants[variantId];
  }
  return product.main;
}

export function getCategoryImage(categoryId) {
  return categoryImages[categoryId] || FALLBACK_IMAGE;
}
